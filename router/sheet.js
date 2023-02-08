import express from 'express';
import promisePool from '../config/mariaDBConn.js';
import { apiInstance } from '../GoogleAPIs.js';

const sheetRouter = express.Router();

const spreadsheetId = '1IyI7QM7QL0fyyoieunbgXuiHS0KXdA9JkQXBhTOiTFE';
const sheetTitle = 'report';
const sheetId = 0;

const cnt = 14; // 개소 갯수 + 1(통합 데이터셀을 위한 셀 추가)

const startRowIndex = 9;
const endRowIndex = startRowIndex + 4;
const startColumnIndex = 1;
const endColumnIndex = 2;
const rowOffset = 12;

const startGraphRowIndex = startRowIndex + rowOffset * cnt + 1;
const endGraphRowIndex = startGraphRowIndex + 3;
const graphRowOffset = 15;

// border style
const top = {
  style: 'SOLID',
  width: 1,
  color: {
    red: 0, blue: 0, green: 0,
  },
};

const bottom = {
  style: 'SOLID',
  width: 1,
  color: {
    red: 0, blue: 0, green: 0,
  },
};

const left = {
  style: 'SOLID',
  width: 1,
  color: {
    red: 0, blue: 0, green: 0,
  },
};

const right = {
  style: 'SOLID',
  width: 1,
  color: {
    red: 0, blue: 0, green: 0,
  },
};

const innerHorizontal = {
  style: 'SOLID',
  width: 1,
  color: {
    red: 0, blue: 0, green: 0,
  },
};

const innerVertical = {
  style: 'SOLID',
  width: 1,
  color: {
    red: 0,
    blue: 0,
    green: 0,
  },
};
             

sheetRouter.get('/create', async (req, res) => {
  const resource = {
    properties: {
      title: 'gch-report-test',
    },
  };
  try {
    const spreadsheet = await apiInstance.sheets.spreadsheets.create({
      resource,
      fields: 'spreadsheetId',
    });
    console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
    res.status(200).send({
      message: 'creat sheet complete!',
      spreadSheetId: spreadsheet.data.spreadsheetId,
    });
  } catch (err) {
    res.status(400).send({
      message: 'create sheet failed',
      errMessage: err,
    });
    throw err;
  }
});

/** sheet cell merge test
 *  spreadsheetId: 1IyI7QM7QL0fyyoieunbgXuiHS0KXdA9JkQXBhTOiTFE
 */
sheetRouter.get('/io', async (req, res) => {
  try {
    const getResult = await apiInstance.sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });
    console.log('getResult');
    console.log(getResult.data.sheets);

    const request = {
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            mergeCells: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 2,
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
              mergeType: 'MERGE_ALL',
            },
          },
          {
            mergeCells: {
              range: {
                sheetId: 0,
                startRowIndex: 2,
                endRowIndex: 6,
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
              mergeType: 'MERGE_COLUMNS',
            },
          },
        ],
      },
    };

    const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);
    console.log('response.data');
    console.log(response.data);

    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(400).send({
      message: 'shreadsheet io failed',
      errMessage: err,
    });
  }
});

sheetRouter.get('/set/title', async (req, res) => {
  /**
    // 3. write value
    {
        range: '시트1!B2:L2',
        majorDimesion: 'ROWS',
        values: [['보행자 알림이 보고서']]
    }
*/

  const values = [['보행자 알림이 보고서']];

  const data = [
    {
      range: `${sheetTitle}!B2:L2`,
      majorDimension: 'ROWS',
      values,
    },
  ];

  const resource = {
    data,
    valueInputOption: 'RAW',
  };

  try {
    const request = {
      spreadsheetId,
      resource,
    };
    const response = await apiInstance.sheets.spreadsheets.values.batchUpdate(
      request
    );

    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't edit spreadsheet",
      err: err,
    });
  }
});

sheetRouter.get('/cell/center-border-test', async (req, res) => {
  const range = {
    sheetId: 0,
    startRowIndex: 1,
    endRowIndex: 2,
    startColumnIndex: 1,
    endColumnIndex: 12,
  };

  const request = {
    spreadsheetId,
    resource: {
      requests: [
        {
          repeatCell: {
            range,
            cell: {
              userEnteredFormat: {
                horizontalAlignment: 'CENTER',
                textFormat: {
                  bold: true,
                },
              },
            },
            fields: 'userEnteredFormat(textFormat, horizontalAlignment)',
          },
        },
      ],
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

sheetRouter.get('/frame-test', async (req, res) => {
  const range = {
    sheetId: 0,
    startRowIndex: 1,
    endRowIndex: 2,
    startColumnIndex: 1,
    endColumnIndex: 12,
  };

  try {
    const request = {
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          // 1. mergecells
          {
            mergeCells: {
              range,
              mergeType: 'MERGE_ALL',
            },
          },
          // 2. set solid border
          {
            updateBorders: {
              range,
              top,
              bottom,
              left,
              right,
              innerHorizontal
            },
          },
          // updateSheetPropertiesRequest
          /**
           * change sheet name
           */
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                title: sheetTitle,
              },
              fields: 'title',
            },
          },
          // updateSpreadSheetProperties
          /**
           * change spreadsheet file name
           */
          // {
          //   updateSpreadsheetProperties: {
          //     properties: {
          //       title: 'gch-report',
          //     },
          //     fields: '*'
          //  }
          // }
        ],
      },
    }; // request

    const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);

    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't edit spreadsheet",
      err: err,
    });
  }
});

/**
   * get sheet sheetId
   * response.data.sheets example
   * [
      {
        properties: {
          sheetId: 0,
          title: '시트1',
          index: 0,
          sheetType: 'GRID',
          gridProperties: [Object]
        },
        merges: [ [Object], [Object], [Object], [Object], [Object], [Object] ],
        charts: [ [Object], [Object] ]
      },
      {
        properties: {
          sheetId: 2081104347,
          title: '시트1의 사본',
          index: 1,
          sheetType: 'GRID',
          gridProperties: [Object]
        },
        merges: [ [Object], [Object], [Object] ],
        charts: [ [Object], [Object] ]
      }
    ]
   * 
*/
sheetRouter.get('/info', async (req, res) => {
  try {
    const getResult = await apiInstance.sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });
    console.log('getResult');
    console.log(getResult.data.sheets);

    res.status(200).send({
      spreadsheet_info: response.data.sheets,
    });
  } catch (err) {
    res.status(400).send({
      message: 'shreadsheet io failed',
      errMessage: err,
    });
  }
});

sheetRouter.get('/set/frame', async (req, res) => {
  const requests = [];

  // title cell merge
  requests.push({
    mergeCells: {
      range: {
        sheetId,
        startRowIndex: 1,
        endRowIndex: 2,
        startColumnIndex: 1,
        endColumnIndex: 12,
      },
      mergeType: 'MERGE_ALL',
    },
  });

  // 개소별 현황 테이블을 위한 cell merge (합계 cell 포함)
  for (let i = 0; i < cnt; i++) {
    requests.push({
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: startRowIndex + i * rowOffset,
          endRowIndex: endRowIndex + i * rowOffset,
          startColumnIndex,
          endColumnIndex,
        },
        mergeType: 'MERGE_ALL',
      },
    });
  }

  // 개소별 통계 그래프용 cell merge (포함)
  for (let i = 0; i < cnt; i++) {
    requests.push({
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: startGraphRowIndex + i * graphRowOffset,
          endRowIndex: endGraphRowIndex + i * graphRowOffset,
          startColumnIndex,
          endColumnIndex,
        },
        mergeType: 'MERGE_ALL',
      },
    });
  }

  const request = {
    spreadsheetId: spreadsheetId,
    resource: {
      requests: requests,
    },
  };

  try {
    const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);

    res.status(200).send({
      message: response.data,
    });
  } catch (err) {
    res.status(400).send({
      message: "can't edit spreadsheet",
      err: err,
    });
  }
});

sheetRouter.get('/set/border', async(req, res) => {
  // 시스템 점검(상태): 자동수집 할 수 있는 정보 영역
  const systemRange = {
    sheetId,
    startRowIndex: 4,
    endRowIndex: 7,
    startColumnIndex: 1,
    endColumnIndex: 12
  };

  // 개소별 현황 시간별 메뉴 영역
  // const eachTimeRange = {
  //   sheetId,
  //   startRowIndex: 9,
  //   endRowIndex: 10,
  //   startColumnIndex: 1,
  //   endColumnIndex: 12,
  // };

  // 각각 셀 병합된 합계, 개소1, 개소2, ....통행량 카테고리 및 합계영역 , 시간별 영역 포함
  const mergeRanges = [];
  for (let i = 0; i < cnt; i++) {
    mergeRanges.push({
      sheetId,
      startRowIndex: startRowIndex + i * rowOffset,
      endRowIndex: endRowIndex + i * rowOffset,
      startColumnIndex: 1,
      endColumnIndex: 1 + 3,
    });
  }

  // 그래프 영역
  for (let i = 0; i < cnt; i++) {
    mergeRanges.push({
      sheetId,
      startRowIndex: startGraphRowIndex + i * graphRowOffset,
      endRowIndex: endGraphRowIndex + i * graphRowOffset,
      startColumnIndex: 1,
      endColumnIndex: 1 + 2,
    });
  }

  // 시간별 보행자 및 차량 통행량 불법 주정차 데이터가 들어가는 영역
  const dataRange = {
    sheetId,
    startRowIndex,
    endRowIndex: endRowIndex + cnt * rowOffset - 4,
    startColumnIndex: 4,
    endColumnIndex: 4 + 8
  }

  // requests
  const requests = [];
  requests.push({
    updateBorders: {
      range: systemRange,
      top, bottom, left, right, innerHorizontal, innerVertical
    }
  });

  requests.push({
    updateBorders: {
      range: dataRange,
      top, bottom, left, right, innerHorizontal, innerVertical
    }
  });

  // requests.push({
  //   updateBorders: {
  //     range: eachTimeRange,
  //     top, bottom, left, right, innerHorizontal, innerVertical
  //   },
  // });

  for(let each of mergeRanges) {
    requests.push({
      updateBorders: {
        range: each,
        top, bottom, left, right, innerHorizontal, innerVertical
      }
    });
  }

  const request = {
    spreadsheetId,
    resource: {
      requests
    }
  }

  try {
    const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);

    res.status(200).send({
      message: response.data,
    });

  } catch(err) {
    res.status(400).send({
      message: "can't edit spreadsheet",
      err: err,
    });
  }

});

sheetRouter.get('/chart/test', async (req, res) => {
  const sheetId = 0;
  const request = {
    spreadsheetId,
    resource: {
      requests: [
        {
          addChart: {
            chart: {
              spec: {
                title: 'Model Q1 Sales',
                basicChart: {
                  chartType: 'COLUMN',
                  legendPosition: 'BOTTOM_LEGEND',
                  axis: [
                    {
                      position: 'BOTTOM_AXIS',
                      title: 'Model Numbers',
                    },
                    {
                      position: 'LEFT_AXIS',
                      title: 'Sales',
                    },
                  ],
                  domains: [
                    {
                      domain: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 0,
                              endRowIndex: 7,
                              startColumnIndex: 0,
                              endColumnIndex: 1,
                            },
                          ],
                        },
                      },
                    },
                  ],
                  series: [
                    {
                      series: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 0,
                              endRowIndex: 7,
                              startColumnIndex: 1,
                              endColumnIndex: 2,
                            },
                          ],
                        },
                      },
                      targetAxis: 'LEFT_AXIS',
                    },
                    {
                      series: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 0,
                              endRowIndex: 7,
                              startColumnIndex: 2,
                              endColumnIndex: 3,
                            },
                          ],
                        },
                      },
                      targetAxis: 'LEFT_AXIS',
                    },
                    {
                      series: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 0,
                              endRowIndex: 7,
                              startColumnIndex: 3,
                              endColumnIndex: 4,
                            },
                          ],
                        },
                      },
                      targetAxis: 'LEFT_AXIS',
                    },
                    {
                      series: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 7,
                              endRowIndex: 14,
                              startColumnIndex: 1,
                              endColumnIndex: 2,
                            },
                          ],
                        },
                      },
                      targetAxis: 'LEFT_AXIS',
                    },
                    {
                      series: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 7,
                              endRowIndex: 14,
                              startColumnIndex: 2,
                              endColumnIndex: 3,
                            },
                          ],
                        },
                      },
                      targetAxis: 'LEFT_AXIS',
                    },
                    {
                      series: {
                        sourceRange: {
                          sources: [
                            {
                              sheetId: sheetId,
                              startRowIndex: 7,
                              endRowIndex: 14,
                              startColumnIndex: 3,
                              endColumnIndex: 4,
                            },
                          ],
                        },
                      },
                      targetAxis: 'LEFT_AXIS',
                    },
                  ],
                  headerCount: 1,
                },
              },
              position: {
                overlayPosition: {
                  anchorCell: {
                    sheetId,
                    rowIndex: 9,
                    columnIndex: 1,
                  },
                  offsetXPixels: 0,
                  offsetYPixels: 0,
                  widthPixels: 400,
                  heightPixels: 200,
                },
              },
            },
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
    res.status(400).send({
      message: "can't edit spreadsheet",
      err: err,
    });
  }
});

sheetRouter.get('/cell/center', async(req, res) => {
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
      message: response.data
    });

  } catch(err) {
    res.status(400).send({
      message: 'can\'t centered cell',
      err: err
    });
  }

});

export default sheetRouter;
