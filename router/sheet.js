import express from 'express';
import promisePool from '../config/mariaDBConn.js';
import { apiInstance } from '../GoogleAPIs.js';

const sheetRouter = express.Router();

const spreadsheetId = '1IyI7QM7QL0fyyoieunbgXuiHS0KXdA9JkQXBhTOiTFE';
const sheetTitle = 'report';

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

sheetRouter.get('/cell/center', async (req, res) => {
  const range = {
    sheetId: 0,
    startRowIndex: 1,
    endRowIndex: 2,
    startColumnIndex: 1,
    endColumnIndex: 12,
  };

  const request = {
    spreadsheetId: spreadsheetId,
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
              top: {
                style: 'SOLID',
                width: 1,
                color: {
                  red: 0,
                  blue: 0,
                  green: 0,
                },
              },
              bottom: {
                style: 'SOLID',
                width: 1,
                color: {
                  red: 0,
                  blue: 0,
                  green: 0,
                },
              },
              left: {
                style: 'SOLID',
                width: 1,
                color: {
                  red: 0,
                  blue: 0,
                  green: 0,
                },
              },
              right: {
                style: 'SOLID',
                width: 1,
                color: {
                  red: 0,
                  blue: 0,
                  green: 0,
                },
              },
              innerHorizontal: {
                style: 'SOLID',
                width: 1,
                color: {
                  red: 0,
                  blue: 0,
                  green: 0,
                },
              },
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

sheetRouter.get('/set/frame', async(req, res) => {

    const startRowIndex = 13, endRowIndex = 16;
    const startColumnIndex = 1, endColumnIndex = 2;
    
    const rowOffset = 3;
    const sheetId = 0;

    const insCnt = 13;

    const requests = [];

    for(let i = 0; i < insCnt; i++) {
        requests.push({
            mergeCells: {
                range: {
                    sheetId,
                    startRowIndex: startRowIndex + (i * rowOffset),
                    endRowIndex: endRowIndex + (i * rowOffset),
                    startColumnIndex,
                    endColumnIndex
                },
                mergeType: 'MERGE_ALL'
            }
        });
    }

    const request = {
        spreadsheetId: spreadsheetId,
        resource: {
            requests: requests
        }
    };

    try {
        const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);

        res.status(200).send({
            message: response.data,
        });
    } catch(err) {
        res.status(400).send({
            message: "can't edit spreadsheet",
            err: err
        });
    }
});

export default sheetRouter;
