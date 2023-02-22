import { area } from '../config/app.js';
import { scheduleJob } from 'node-schedule';
import { getWeekStartEndDate, getWeekStartEndDate2 } from '../common/utils.js';
import { apiInstance } from '../GoogleAPIs.js';
import { reqParams } from '../spreadsheetConf/requests.js';
import { cnt, sheet } from '../spreadsheetConf/properties.js';
import { createBatchReq, createValuesReq } from '../spreadsheetConf/utils.js';

import fs from 'fs';
import path from 'path';

import { logger } from '../logger.js';

const __dirname = path.resolve();

export const weeklyReportCreateJob = () => {
    // 매주 월요일 00시 05분
    // scheduleJob(`5 0 * * 1`, async() => {
    scheduleJob(`07 * * * *`, async() => {

        // for set filename and directory name
        const weekStartEnd = getWeekStartEndDate();
        // const start = weekStartEnd.sow;
        // const end = weekStartEnd.eow;
        const year = weekStartEnd.year;
        const month = weekStartEnd.month;

        const weekStartEnd2 = getWeekStartEndDate2();
        const filename = `${area}_${weekStartEnd2.sow}~${weekStartEnd2.eow}`;

        if(!fs.existsSync(path.resolve(__dirname, `./xlsx/${year}`))) {
          fs.mkdirSync(path.resolve(__dirname, `./xlsx/${year}`));
        }

        if(!fs.existsSync(path.resolve(__dirname, `./xlsx/${year}/${month}`))) {
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
        const startEndDate = getWeekStartEndDate();
        batchData.push(...reqParams.setTerm(startEndDate).frame);
        valueData.push(...reqParams.setTerm(startEndDate).value);

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

        await apiInstance.sheets.spreadsheets.batchUpdate(
          createBatchReq(batchData)
        );
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
        valueData.push(...(await reqParams.weekTotalData()));
        // 개소별 데이터 1 ~ 13
        for (let insNo = 1; insNo <= cnt; insNo++) {
          const positionOrder = insNo;
          valueData.push(
            ...(await reqParams.weekInsData(insNo, positionOrder))
          );
        }

        await apiInstance.sheets.spreadsheets.batchUpdate(
          createBatchReq(batchData)
        );
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
        await apiInstance.sheets.spreadsheets.batchUpdate(
          createBatchReq(batchData)
        );

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
            .pipe(fs.createWriteStream(`${__dirname}/xlsx/${year}/${month}/${filename}.xlsx`))
            .on('finish', () => {
                logger.info('xlsx file write stream complete');
            })
            .on('error', (err) => {
                logger.error(err);
            });

    });
}