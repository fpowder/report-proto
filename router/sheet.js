import express from 'express';

import { apiInstance } from '../GoogleAPIs.js';
import { reqParams } from '../spreadsheetConf/requests.js';
import {
  spreadsheetId,
  sheetId,
  sheetTitle,
  startRowIndex,
  endRowIndex,
  startColumnIndex,
  endColumnIndex,
  rowOffset,
  graphRowOffset,
  startGraphRowIndex,
  endGraphRowIndex,
  gap,
  cnt,
} from '../spreadsheetConf/properties.js';
import { createBatchReq, createValuesReq } from '../spreadsheetConf/request.js';

const sheetRouter = express.Router();
sheetRouter.get('/cell/center', async (req, res) => {
  // 1.시스템 점검(상태): 자동수집 정보 영역 텍스트 가운데 정렬 영역 지정
  const systemRange = {
    sheetId,
    startRowIndex: 4,
    endRowIndex: 7,
    startColumnIndex: 1,
    endColumnIndex: 12,
  };

  // 2.개소별 현황 병합된 셀 부분 텍스트 수평 및 수직 가운데 정렬 영역 지정
  const insRange = {
    sheetId,
    startRowIndex: startRowIndex,
    endRowIndex: startRowIndex + rowOffset * cnt + 1 + graphRowOffset * cnt + 3,
    startColumnIndex: 1,
    endColumnIndex: 2,
  };

  const request = {
    spreadsheetId,
    resource: {
      requests: [
        // 1.시스템 점검(상태) 영역 가운데 정렬 설정
        {
          repeatCell: {
            range: systemRange,
            cell: {
              userEnteredFormat: {
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(horizontalAlignment)',
          },
        },
        // 2.개소별 현황 병합된 셀 영역 요청
        {
          repeatCell: {
            range: insRange,
            cell: {
              userEnteredFormat: {
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE',
              },
            },
            fields: 'userEnteredFormat(horizontalAlignment, verticalAlignment)',
          },
        },
      ],
    },
  }; // request

  try {
    const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);
    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      message: "can't centered cell",
      err: err,
    });
  }
});

sheetRouter.get('/set/frame', async (req, res) => {
  if (!req.query.positionOrder) {
    res.status(400).send({
      message: 'positionOrder param needed.',
    });
    return;
  }

  const positionOrder = parseInt(req.query.positionOrder);

  const categoryFrameReq = reqParams.categoryFrame(positionOrder);
  const graphFrameReq = reqParams.graphFrame(positionOrder);
  const dataFrameReq = reqParams.dataFrame(positionOrder);

  const request = {
    spreadsheetId,
    resource: {
      requests: categoryFrameReq.concat(graphFrameReq).concat(dataFrameReq),
    },
  };

  try {
    const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);
    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't centered cell",
      err: err,
    });
  }
});

sheetRouter.get('/set/ins/text', async (req, res) => {
  if (!req.query.positionOrder) {
    res.status(400).send({
      message: 'positionOrder param needed.',
    });
    return;
  }

  const positionOrder = parseInt(req.query.positionOrder);
  const categoryTextReq = reqParams.categoryValues(positionOrder);

  const request = {
    spreadsheetId,
    resource: {
      data: categoryTextReq,
      valueInputOption: 'RAW',
    },
  };
  try {
    const response = await apiInstance.sheets.spreadsheets.values.batchUpdate(
      request
    );
    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't insert ins text",
      err: err,
    });
  }
});

sheetRouter.get('/set/center', async (req, res) => {
  const request = {
    spreadsheetId,
    resource: {
      requests: reqParams.centerAlign(),
    },
  };
  try {
    const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);
    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't center align to range",
      err: err,
    });
  }
});

sheetRouter.get('/set/time/range', async (req, res) => {
  if (!req.query.positionOrder) {
    res.status(400).send({
      message: 'positionOrder param must be included.',
    });
    return;
  }

  const positionOrder = parseInt(req.query.positionOrder);
  const timeRangeReq = reqParams.timeRange(positionOrder);

  const frameReq = timeRangeReq.frame;
  const valuesReq = timeRangeReq.values;

  const frameRequest = {
    spreadsheetId,
    resource: {
      requests: frameReq,
    },
  };

  const valuesRequest = {
    spreadsheetId,
    resource: {
      data: valuesReq,
      valueInputOption: 'RAW',
    },
  };

  try {
    const frameRes = await apiInstance.sheets.spreadsheets.batchUpdate(
      frameRequest
    );
    const valueRes = await apiInstance.sheets.spreadsheets.values.batchUpdate(
      valuesRequest
    );
    res.status(200).send({
      frameRes: frameRes.data,
      valueRes: valueRes.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't set time range on position",
      err: err,
    });
  }
});

sheetRouter.get('/set/graph/text', async (req, res) => {
  if (!req.query.positionOrder) {
    res.status(400).send({
      message: 'postionOrder param must be incluede.',
    });
    return;
  }

  const positionOrder = parseInt(req.query.positionOrder);
  const graphCategoryTextReq = reqParams.graphCategoryValues(positionOrder);

  const request = {
    spreadsheetId,
    resource: {
      data: graphCategoryTextReq,
      valueInputOption: 'RAW',
    },
  };

  try {
    const response = await apiInstance.sheets.spreadsheets.values.batchUpdate(
      request
    );
    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't set graph category text",
    });
  }
});

sheetRouter.get('/set/title', async (req, res) => {
  const titleReqs = reqParams.title;
  const frameReq = titleReqs.frame;
  const valueReq = titleReqs.value;

  const frameRequest = {
    spreadsheetId,
    resource: {
      requests: frameReq,
    },
  };

  const valueRequest = {
    spreadsheetId,
    resource: {
      data: valueReq,
      valueInputOption: 'RAW',
    },
  };

  try {
    const frameSetRes = await apiInstance.sheets.spreadsheets.batchUpdate(
      frameRequest
    );
    const valueSetRes =
      await apiInstance.sheets.spreadsheets.values.batchUpdate(valueRequest);

    res.status(200).send({
      frameSetRes: frameSetRes.data,
      valueSetRes: valueSetRes.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't set title",
      err: err,
    });
  }
});

sheetRouter.get('/set/term', async (req, res) => {
  const termReqs = reqParams.term;
  const frameReq = termReqs.frame;
  const valueReq = termReqs.value;

  const frameRequest = {
    spreadsheetId,
    resource: {
      requests: frameReq,
    },
  };

  const valueRequest = {
    spreadsheetId,
    resource: {
      data: valueReq,
      valueInputOption: 'RAW',
    },
  };

  try {
    const frameSetRes = await apiInstance.sheets.spreadsheets.batchUpdate(
      frameRequest
    );
    const valueSetRes =
      await apiInstance.sheets.spreadsheets.values.batchUpdate(valueRequest);

    res.status(200).send({
      frameSetRes: frameSetRes.data,
      valueSetRes: valueSetRes.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't set term frame and value",
      err: err``,
    });
  }
});

sheetRouter.get('/set/menu', async (req, res) => {
  const menuReqs = reqParams.menu;
  const frameReq = menuReqs.frame;
  const valueReq = menuReqs.value;

  const frameRequest = {
    spreadsheetId,
    resource: {
      requests: frameReq,
    },
  };

  const valueRequest = {
    spreadsheetId,
    resource: {
      data: valueReq,
      valueInputOption: 'RAW',
    },
  };

  try {
    const frameSetRes = await apiInstance.sheets.spreadsheets.batchUpdate(
      frameRequest
    );
    const valueSetRes =
      await apiInstance.sheets.spreadsheets.values.batchUpdate(valueRequest);

    res.status(200).send({
      frameSetRes: frameSetRes.data,
      valueSetRes: valueSetRes.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't set menu frame and values",
      err: err,
    });
  }
});

sheetRouter.get('/set/collection', async (req, res) => {
  const sysCollectionReqs = reqParams.systemCollection;
  const frameReq = sysCollectionReqs.frame;
  const valueReq = sysCollectionReqs.value;

  const frameRequest = {
    spreadsheetId,
    resource: {
      requests: frameReq,
    },
  };

  const valueRequest = {
    spreadsheetId,
    resource: {
      data: valueReq,
      valueInputOption: 'RAW',
    },
  };

  try {
    const frameSetRes = await apiInstance.sheets.spreadsheets.batchUpdate(
      frameRequest
    );
    const valueSetRes =
      await apiInstance.sheets.spreadsheets.values.batchUpdate(valueRequest);

    res.status(200).send({
      frameSetRes: frameSetRes.data,
      valueSetRes: valueSetRes.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't set menu frame and values",
      err: err,
    });
  }
});

// http://localhost:3000/sheet/cell/adjust?dimension=columns&pixelSize=120&startIndex=2&endIndex=3
sheetRouter.get('/cell/adjust', async (req, res) => {
  const query = req.query;
  if (
    !query.dimension ||
    !query.pixelSize ||
    !query.startIndex ||
    !query.endIndex
  ) {
    res.status(400).send({
      message: 'parameter is missing',
    });
    return;
  }

  const dimension = await query.dimension.toUpperCase();
  if (!(dimension === 'ROWS' || dimension === 'COLUMNS')) {
    res.status(400).send({
      message: 'dimension parameter must be ROWS or COLUMNS',
    });
    return;
  }

  const request = {
    spreadsheetId,
    resource: {
      requests: 
        reqParams.adjustCell(
          dimension,
          parseInt(query.pixelSize),
          parseInt(query.startIndex),
          parseInt(query.endIndex)
        ),
    },
  };

  try {
    const adjustCellRes = await apiInstance.sheets.spreadsheets.batchUpdate(
      request
    );

    res.status(200).send({
      message: adjustCellRes.data,
    });
  } catch (err) {
    res.status(400).send({
      message: `can't adjust cell resize ${dimension}`,
      err: err,
    });
  }
});

sheetRouter.get('/insert/week/total', async (req, res) => {
  const weekTotalReqs = await reqParams.weekTotalData();
  const request = {
    spreadsheetId,
    resource: {
      data: weekTotalReqs,
      valueInputOption: 'RAW',
    },
  };

  try {
    const response = await apiInstance.sheets.spreadsheets.values.batchUpdate(
      request
    );

    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(400).send({
      message: `can't set week total data cells`,
      err: err,
    });
  }
});

sheetRouter.get('/insert/week/ins', async (req, res) => {

  if(!req.query.positionOrder) {
    res.status(400).send({
      message: `positionOrder param must be included`
    });
    return;
  }

  if(!req.query.insNo) {
    res.status(400).send({
      message: `insNo param must be included`
    });
    return;
  }

  const positionOrder = parseInt(req.query.positionOrder);
  const insNo = parseInt(req.query.insNo) ;

  try {
    const weekTotalReqs = await reqParams.weekInsData(insNo, positionOrder);
    const request = {
      spreadsheetId,
      resource: {
        data: weekTotalReqs,
        valueInputOption: 'RAW',
      },
    };

    const response = await apiInstance.sheets.spreadsheets.values.batchUpdate(request);

    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(400).send({
      message: `can't set week total data cells`,
      err: err,
    });
  }
});

sheetRouter.get('/set/data/align/right', async (req, res) => {
  try {
    if (!req.query.positionOrder) {
      res.status(400).send({
        message: `positionOrder param must be included`,
      });
      return;
    }
    const positionOrder = parseInt(req.query.positionOrder);
    const requests = reqParams.dataAlignRight(positionOrder);
    const request = {
      spreadsheetId,
      resource: {
        requests,
      },
    };

    const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);
    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(500).send({
      message: `can't alignt rignt on data cells`,
      err: err,
    });
  }
});

sheetRouter.post('/frame-data', async(req, res) => {

  try {
    
    let batchData = [];
    let valueData = [];
    // set title
    batchData.push(...reqParams.title.frame);
    valueData.push(...reqParams.title.value);

    // set menu
    batchData.push(...reqParams.menu.frame);
    valueData.push(...reqParams.menu.value);

    // set term
    batchData.push(...reqParams.term.frame);
    valueData.push(...reqParams.term.value);

    // set collection 1.시스템 점검(상태) 내용 
    batchData.push(...reqParams.systemCollection.frame);
    valueData.push(...reqParams.systemCollection.value);

    // cell 너비 조정 
    batchData.push(...reqParams.adjustCell('COLUMNS', 140, 2, 3));

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
    valueData.push(...(await reqParams.weekTotalData()));
    // 개소별 데이터 1 ~ 13
    for (let insNo = 1; insNo <= cnt; insNo++){
      const positionOrder = insNo;
      valueData.push(...(await reqParams.weekInsData(positionOrder, insNo)));
    }

    await apiInstance.sheets.spreadsheets.batchUpdate(createBatchReq(batchData));
    await apiInstance.sheets.spreadsheets.values.batchUpdate(createValuesReq(valueData));

    res.status(200).send({
      message: 'frame set complete'
    });

  } catch(err) {
    res.status(400).send({
      message: `can't create report frame and data`,
      err: err
    });
  }

});

export default sheetRouter;
