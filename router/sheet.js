import express from 'express';

import { format, getYear, isMatch } from 'date-fns';

import { apiInstance } from '../GoogleAPIs.js';
import { reqParams } from '../spreadsheetConf/requests.js';
import { cnt, sheet } from '../spreadsheetConf/properties.js';
import { createBatchReq, createValuesReq } from '../spreadsheetConf/utils.js';
import { getWeekStartEndDate2, getWeekStartEndDate } from '../common/utils.js';
import { area } from '../config/app.js';

import path from 'path';
import fs from 'fs';

import { logger } from '../logger.js';

const __dirname = path.resolve();

const timeZone = 'Asia/Seoul';
const datePattern = 'yyyy-MM-dd HH:mm:ss';
const innerCellPattern = 'yyyy. MM. dd.';
const filenamePattern = 'yyyy.MM.dd';

const sheetRouter = express.Router();
sheetRouter.post('/by-term', async(req, res) => {
  if (!(req.body.start || req.body.end)) {
    res.status(400).send({
      message: `start and paramr must be included`,
    });
    return;
  }
  if (
    !(
      isMatch(req.body.start, datePattern) || isMatch(req.body.end, datePattern)
    )
  ) {
    res.status(400).send({
      message: `start or end param date pattern is not ${datePattern}`,
    });
    return;
  }

  // pattern yyyy-MM-dd HH:mm:ss
  const sow = req.body.start; // startOfWeek
  const eow = req.body.end; // endOfWeek

  // change to pattern for filename
  const sowFilename = format(new Date(sow), filenamePattern, {
    timeZone: timeZone,
  });
  const eowFilename = format(new Date(eow), filenamePattern, {
    timeZone: timeZone,
  });

  const year = getYear(new Date(sow));
  const month = format(new Date(sow), 'M');

  const filename = `${area}_${sowFilename}~${eowFilename}`;

  if (!fs.existsSync(path.resolve(__dirname, `./xlsx/${year}`))) {
    fs.mkdirSync(path.resolve(__dirname, `./xlsx/${year}`));
  }

  if (!fs.existsSync(path.resolve(__dirname, `./xlsx/${year}/${month}`))) {
    fs.mkdirSync(path.resolve(__dirname, `./xlsx/${year}/${month}`));
  }

  const newSheet = await apiInstance.sheets.spreadsheets.create({
    fields: 'spreadsheetId',
    resource: {
      properties: {
        title: filename,
      },
    },
  });

  sheet.setSpreadsheetId(newSheet.data.spreadsheetId);
  // console.log(sheet.getSpreadsheetId());
  // change sheettitle to 'report' update
  await apiInstance.sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheet.getSpreadsheetId(),
    resource: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheet.sheetId,
              title: sheet.sheetTitle,
            },
            fields: 'title',
          },
        },
      ],
    },
  });

  let batchData = [];
  let valueData = [];
  // set title
  batchData.push(...reqParams.title.frame);
  valueData.push(...reqParams.title.value);

  // set menu
  batchData.push(...reqParams.menu.frame);
  valueData.push(...reqParams.menu.value);

  // set term
  const startEndDate = {
    sow: format(new Date(sow), innerCellPattern, { timeZone }),
    eow: format(new Date(eow), innerCellPattern, { timeZone }),
  };
  batchData.push(...reqParams.term(startEndDate).frame);
  valueData.push(...reqParams.term(startEndDate).value);

  // set collection 1.시스템 점검(상태) 내용
  batchData.push(...reqParams.systemCollection.frame);
  valueData.push(...reqParams.systemCollection.value);

  // cell 너비 조정
  batchData.push(...reqParams.adjustCell('COLUMNS', 151, 2, 3));
  batchData.push(...reqParams.adjustCell('COLUMNS', 130, 3, 4));

  // 데이터, 그래프, 카테고리셀 프레임설정(테두리 등)
  for (let positionOrder = 0; positionOrder <= cnt; positionOrder++) {
    batchData.push(...reqParams.categoryFrame(positionOrder));
    batchData.push(...reqParams.graphFrame(positionOrder));
    batchData.push(...reqParams.dataFrame(positionOrder));
  }

  // 개소 이름 및 시간 영역 설정
  for (let positionOrder = 0; positionOrder <= cnt; positionOrder++) {
    valueData.push(...reqParams.categoryValues(positionOrder));
    valueData.push(...reqParams.graphCategoryValues(positionOrder));

    const timeRangeReqs = reqParams.timeRange(positionOrder);
    valueData.push(...timeRangeReqs.values);
    batchData.push(...timeRangeReqs.frame);
  }

  // 병합된 개소이름 셀 가운데 및 수직 정렬
  batchData.push(...reqParams.centerAlign);

  await apiInstance.sheets.spreadsheets.batchUpdate(createBatchReq(batchData));
  await apiInstance.sheets.spreadsheets.values.batchUpdate(
    createValuesReq(valueData)
  );

  batchData = [];
  valueData = [];

  // 데이터 영역 오른쪽 정렬
  for (let positionOrder = 0; positionOrder <= cnt; positionOrder++) {
    batchData.push(...reqParams.dataAlignRight(positionOrder));
  }

  // data insert
  // 주간 종합 데이터
  valueData.push(...(await reqParams.weekTotalDataByTerm(sow, eow)));
  // 개소별 데이터 1 ~ 13
  for (let insNo = 1; insNo <= cnt; insNo++) {
    const positionOrder = insNo;
    valueData.push(
      ...(await reqParams.weekInsDataByTerm(insNo, positionOrder, sow, eow))
    );
  }

  await apiInstance.sheets.spreadsheets.batchUpdate(createBatchReq(batchData));
  await apiInstance.sheets.spreadsheets.values.batchUpdate(
    createValuesReq(valueData)
  );

  // batchData and valueData initialize
  batchData = [];
  valueData = [];
  // line chart insert
  for (let insNo = 1; insNo <= cnt; insNo++) {
    const positionOrder = insNo;
    batchData.push(...reqParams.lineChart(positionOrder));
  }
  await apiInstance.sheets.spreadsheets.batchUpdate(createBatchReq(batchData));

  const file = await apiInstance.drives.files.export(
    {
      fileId: sheet.spreadsheetId,
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    {
      responseType: 'stream',
    }
  );

  const stream = file.data;
  stream
    .pipe(
      fs.createWriteStream(
        `${__dirname}/xlsx/${year}/${month}/${filename}.xlsx`
      )
    )
    .on('finish', () => {
      logger.info('xlsx file write stream complete');
      res.status(200).send({
        message: 'Create xlsx on drive and download to directory complete!',
      });
    })
    .on('error', (err) => {
      logger.error(err);
    });
});

sheetRouter.get('/frame-data', async(req, res) => {
  try {
    const date = new Date();

    // new spread sheet create and set spreadsheetId, sheetTitle, sheetId
    const weekStartEndDate2 = getWeekStartEndDate2(date, 1);
    const fileName = `금천구 교통안전 알림이 주간(${weekStartEndDate2.sow}~${weekStartEndDate2.eow})`;
    // const fileName = 'test';
    const newSheet = await apiInstance.sheets.spreadsheets.create({
      fields: 'spreadsheetId',
      resource: {
        properties: {
          title: fileName,
        },
      },
    });

    sheet.setSpreadsheetId(newSheet.data.spreadsheetId);
    // console.log(sheet.getSpreadsheetId());
    // change sheettitle to 'report' update
    await apiInstance.sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheet.getSpreadsheetId(),
      resource: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheet.sheetId,
                title: sheet.sheetTitle,
              },
              fields: 'title',
            },
          },
        ],
      },
    });
    
    let batchData = [];
    let valueData = [];
    // set title
    batchData.push(...reqParams.title.frame);
    valueData.push(...reqParams.title.value);

    // set menu
    batchData.push(...reqParams.menu.frame);
    valueData.push(...reqParams.menu.value);

    // set term
    const startEndDate = getWeekStartEndDate(date);
    batchData.push(...reqParams.term(startEndDate).frame);
    valueData.push(...reqParams.term(startEndDate).value);

    // set collection 1.시스템 점검(상태) 내용 
    batchData.push(...reqParams.systemCollection.frame);
    valueData.push(...reqParams.systemCollection.value);

    // cell 너비 조정 
    batchData.push(...reqParams.adjustCell('COLUMNS', 151, 2, 3));
    batchData.push(...reqParams.adjustCell('COLUMNS', 130, 3, 4));

    // 데이터, 그래프, 카테고리셀 프레임설정(테두리 등)
    for (let positionOrder = 0; positionOrder <= cnt; positionOrder++) {
      batchData.push(...reqParams.categoryFrame(positionOrder));
      batchData.push(...reqParams.graphFrame(positionOrder));
      batchData.push(...reqParams.dataFrame(positionOrder));
    }

    // 개소 이름 및 시간 영역 설정
    for (let positionOrder = 0; positionOrder <= cnt; positionOrder++) {
      
      valueData.push(...reqParams.categoryValues(positionOrder));
      valueData.push(...reqParams.graphCategoryValues(positionOrder));

      const timeRangeReqs = reqParams.timeRange(positionOrder);
      valueData.push(...timeRangeReqs.values);
      batchData.push(...timeRangeReqs.frame);
    }

    // 병합된 개소이름 셀 가운데 및 수직 정렬
    batchData.push(...reqParams.centerAlign);

    await apiInstance.sheets.spreadsheets.batchUpdate(createBatchReq(batchData));
    await apiInstance.sheets.spreadsheets.values.batchUpdate(createValuesReq(valueData));

    batchData = [];
    valueData = [];

    // 데이터 영역 오른쪽 정렬 
    for (let positionOrder = 0; positionOrder <= cnt; positionOrder++) {
      batchData.push(...reqParams.dataAlignRight(positionOrder));
    }

    // data insert
    // 주간 종합 데이터
    valueData.push(...(await reqParams.weekTotalData(date)));
    // 개소별 데이터 1 ~ 13
    for (let insNo = 1; insNo <= cnt; insNo++){
      const positionOrder = insNo;
      valueData.push(...(await reqParams.weekInsData(insNo, positionOrder, date)));
    }

    await apiInstance.sheets.spreadsheets.batchUpdate(createBatchReq(batchData));
    await apiInstance.sheets.spreadsheets.values.batchUpdate(createValuesReq(valueData));

    // batchData and valueData initialize
    batchData = []; valueData = [];
    // line chart insert
    for(let insNo = 1; insNo <= cnt; insNo++) {
      const positionOrder = insNo;
      batchData.push(...reqParams.lineChart(positionOrder));
    }
    await apiInstance.sheets.spreadsheets.batchUpdate(createBatchReq(batchData));
   
    const file = await apiInstance.drives.files.export({
      fileId: sheet.spreadsheetId,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }, {
      responseType: 'stream'
    });

    const stream = file.data;
    stream
      .pipe(fs.createWriteStream(`${__dirname}/xlsx/${fileName}.xlsx`))
      .on('finish', () => {
        console.log('xlsx file write stream complete');
        res.status(200).download(`${__dirname}/xlsx/${fileName}.xlsx`);
      })
      .on('error', (err) => {
        console.log(err);
      });
         
    // res.status(200).send({
    //   message: 'frame set complete'
    // });

  } catch(err) {
    res.status(400).send({
      message: `can't create report frame and data`,
      err: err
    });
  }

});

export default sheetRouter;
