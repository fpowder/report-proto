import express from 'express';

import { apiInstance } from '../GoogleAPIs.js';
import { reqParams } from '../spreadsheetConf/requests.js';
import { cnt } from '../spreadsheetConf/properties.js';
import { createBatchReq, createValuesReq } from '../spreadsheetConf/utils.js';

const sheetRouter = express.Router();

sheetRouter.post('/frame-data', async(req, res) => {
  try {
    
    let batchData = [];
    let valueData = [];
    // set title
    // batchData.push(...reqParams.title.frame);
    // valueData.push(...reqParams.title.value);

    // // set menu
    // batchData.push(...reqParams.menu.frame);
    // valueData.push(...reqParams.menu.value);

    // // set term
    // batchData.push(...reqParams.term.frame);
    // valueData.push(...reqParams.term.value);

    // // set collection 1.시스템 점검(상태) 내용 
    // batchData.push(...reqParams.systemCollection.frame);
    // valueData.push(...reqParams.systemCollection.value);

    // // cell 너비 조정 
    // batchData.push(...reqParams.adjustCell('COLUMNS', 147, 2, 3));
    // batchData.push(...reqParams.adjustCell('COLUMNS', 125, 3, 4));

    // // 데이터, 그래프, 카테고리셀 프레임설정(테두리 등)
    // for (let positionOrder = 0; positionOrder <= cnt; positionOrder++) {
    //   batchData.push(...reqParams.categoryFrame(positionOrder));
    //   batchData.push(...reqParams.graphFrame(positionOrder));
    //   batchData.push(...reqParams.dataFrame(positionOrder));
    // }

    // // 개소 이름 및 시간 영역 설정
    // for (let positionOrder = 0; positionOrder <= cnt; positionOrder++) {
      
    //   valueData.push(...reqParams.categoryValues(positionOrder));
    //   valueData.push(...reqParams.graphCategoryValues(positionOrder));

    //   const timeRangeReqs = reqParams.timeRange(positionOrder);
    //   valueData.push(...timeRangeReqs.values);
    //   batchData.push(...timeRangeReqs.frame);
    // }

    // // 병합된 개소이름 셀 가운데 및 수직 정렬
    // batchData.push(...reqParams.centerAlign);

    // await apiInstance.sheets.spreadsheets.batchUpdate(createBatchReq(batchData));
    // await apiInstance.sheets.spreadsheets.values.batchUpdate(createValuesReq(valueData));

    // batchData = [];
    // valueData = [];

    // // 데이터 영역 오른쪽 정렬 
    // for (let positionOrder = 0; positionOrder <= cnt; positionOrder++) {
    //   batchData.push(...reqParams.dataAlignRight(positionOrder));
    // }

    // data insert
    // 주간 종합 데이터
    // valueData.push(...(await reqParams.weekTotalData()));
    // // 개소별 데이터 1 ~ 13
    // for (let insNo = 1; insNo <= cnt; insNo++){
    //   const positionOrder = insNo;
    //   valueData.push(...(await reqParams.weekInsData(insNo, positionOrder)));
    // }

    // await apiInstance.sheets.spreadsheets.batchUpdate(createBatchReq(batchData));
    // await apiInstance.sheets.spreadsheets.values.batchUpdate(createValuesReq(valueData));


    // batchData and valueData initialize
    batchData = []; valueData = [];
    // line chart insert
    for(let insNo = 1; insNo <= cnt; insNo++) {
      const positionOrder = insNo;
      batchData.push(...reqParams.lineChart(positionOrder));
    }
    await apiInstance.sheets.spreadsheets.batchUpdate(createBatchReq(batchData));

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
