sheetRouter.get('/set/frame', async (req, res) => {
  const insCnt = 13;

  const startRowIndex = 10,
    endRowIndex = startRowIndex + 3;
  const startColumnIndex = 1,
    endColumnIndex = 2;
  const rowOffset = 9;

  const startGraphRowIndex = startRowIndex + rowOffset * insCnt + 1,
    endGraphRowIndex = startGraphRowIndex + 3;
  const graphRowOffset = 15;

  const sheetId = 0;

  const requests = [];

  // 개소별 현황 테이블을 위한 cell merge (합계 cell 포함)
  for (let i = 0; i < insCnt + 1; i++) {
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
  for (let i = 0; i < insCnt + 1; i++) {
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



sheetRouter.get('/set/frame', async (req, res) => {

    const startRowIndex = 13, endRowIndex = 16;
      const startColumnIndex = 1, endColumnIndex = 2;
      const rowOffset = 3;
  
      const startGraphRowIndex = 68, endGraphRowIndex = 71;
      const graphRowOffset = 15;
  
      const sheetId = 0;
  
      const insCnt = 13;
  
      const requests = [];
  
      // '합계' 입력할 cell merge set
      requests.push({
          mergeCells: {
              range: {
                  sheetId,
                  startRowIndex: 10,
                  endRowIndex: 13,
                  startColumnIndex,
                  endColumnIndex
              },
              mergeType: 'MERGE_ALL'
          }
      });
  
      // 개소별 현황 테이블을 위한 cell merge
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
  
      // 합계 통계 그래프용 cell merge
      requests.push({
          mergeCells: {
              range: {
                  sheetId,
                  startRowIndex: 53,
                  endRowIndex: 56,
                  startColumnIndex,
                  endColumnIndex
              },
              mergeType: 'MERGE_ALL'
          }
      });
  
      // 개소별 통계 그래프용 cell merge
      for(let i = 0; i < insCnt; i++) {
        requests.push({
            mergeCells: {
                range: {
                    sheetId,
                    startRowIndex: startGraphRowIndex + (i * graphRowOffset),
                    endRowIndex: endGraphRowIndex + (i * graphRowOffset),
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