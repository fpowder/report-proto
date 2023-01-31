import express from 'express';
import { apiInstance } from './GoogleAPIs.js';

const app = express();

app.get('/token', (req, res) => {
  const authUrl = apiInstance.setAuthUrl().requestNewToken();
  res.status(200).send({
    message: 'request token',
    authUrl: authUrl,
  });
});

app.get('/oauth2Callback', async (req, res) => {
  // res.status(200).send({message: req.query.code});
  console.log(req);
  try {
    if (req.query.code) {
      const code = req.query.code;
      apiInstance.getToken(code);
    }
    res.status(200);
  } catch (err) {
    res.status(400);
  }
});


app.get('/sheet/create', async (req, res) => {
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

// gch-report-test
/**
 *  spreadsheetId: 1mpqMu0vULe1yGjuz3vm3PcUFiDfdCOvRZwMW-Y-a4Rs
 */
app.get('/sheet/io', async(req, res) => {
  const spreadsheetId = '1mpqMu0vULe1yGjuz3vm3PcUFiDfdCOvRZwMW-Y-a4Rs';

  try {

    const getResult = await apiInstance.sheets.spreadsheets.get({ spreadsheetId: spreadsheetId });
    console.log('getResult');
    console.log(getResult.data.sheets);

    const request = {
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            "mergeCells": {
              "range": {
                "sheetId": 0,
                "startRowIndex": 0,
                "endRowIndex": 2,
                "startColumnIndex": 0,
                "endColumnIndex": 2
              },
              "mergeType": "MERGE_ALL"
            }
          },
          {
            "mergeCells": {
              "range": {
                "sheetId": 0,
                "startRowIndex": 2,
                "endRowIndex": 6,
                "startColumnIndex": 0,
                "endColumnIndex": 2
              },
              "mergeType": "MERGE_COLUMNS"
            }
          }
        ]
      }
    }

    const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);
    console.log('response.data');
    console.log(response.data);

    res.status(200).send({
      message: response.data
    });
    
  } catch(err) {
    res.status(400).send({
      message: 'shreadsheet io failed',
      errMessage: err
    })  
  }
});

app.get('/set/frame', async(req, res) => {

  const spreadsheetId = '1mpqMu0vULe1yGjuz3vm3PcUFiDfdCOvRZwMW-Y-a4Rs';
  const range = {
    sheetId: 0,
    startRowIndex: 1,
    endRowIndex: 2,
    startColumnIndex: 1,
    endColumnIndex: 12
  };

  try {
    const request = {
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            mergeCells: {
              range,
              mergeType: "MERGE_ALL"
            }
          },
          {
            updateBorders: {
              range,
              top: {
                style: 'SOLID_THICK',
                width: 1,
                color: {
                  red: 0,
                  blue: 0,
                  green: 0
                }
              },
              bottom: {
                style: 'SOLID_THICK',
                width: 1,
                color: {
                  red: 0,
                  blue: 0,
                  green: 0
                }
              },
              left: {
                style: 'SOLID_THICK',
                width: 1,
                color: {
                  red: 0,
                  blue: 0,
                  green: 0
                }
              },
              right: {
                style: 'SOLID_THICK',
                width: 1,
                color: {
                  red: 0,
                  blue: 0,
                  green: 0
                }
              },
              innerHorizontal: {
                style: 'SOLID_THICK',
                width: 1,
                color: {
                  red: 0,
                  blue: 0,
                  green: 0
                }
              }
            }
          }
        ]
      }
    }; // request

    const response = await apiInstance.sheets.spreadsheets.batchUpdate(request);
    
    res.status(200).send({
      message: response.data
    });

  } catch(err) {
    res.status(400).send({
      message: 'can\'t edit spreadsheet',
      err: err
    });
  }

});


/**
 * get sheet sheetId
 * 
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
app.get('/sheet/info', async(req, res) => {

  const spreadsheetId = '1mpqMu0vULe1yGjuz3vm3PcUFiDfdCOvRZwMW-Y-a4Rs';

  try {

    const getResult = await apiInstance.sheets.spreadsheets.get({ spreadsheetId: spreadsheetId });
    console.log('getResult');
    console.log(getResult.data.sheets);

    res.status(200).send({
      spreadsheet_info: response.data.sheets
    });
    
  } catch(err) {
    res.status(400).send({
      message: 'shreadsheet io failed',
      errMessage: err
    })  
  }

});

let server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('server is running on [%s:%s]', host, port);
});
