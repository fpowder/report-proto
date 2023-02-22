import express from 'express';
import { apiInstance } from './GoogleAPIs.js';

import sheetRouter from './router/sheet.js';
import dataRouter from './router/data.js';
import reportRouter from './router/report.js';

import asyncify from 'express-asyncify';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';

import { dailySyncJob } from './scheduler/daily.js';
import { weeklyReportCreateJob } from './scheduler/weekly.js';

const port = 8082;

const app = asyncify(express());
// const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// create xlsx folder create if not exist
const __dirname = path.resolve();
if(!fs.existsSync(path.resolve(__dirname, './xlsx'))) {
  fs.mkdirSync(path.resolve(__dirname, './xlsx'));
}

app.use('/sheet', sheetRouter);
app.use('/data', dataRouter);
app.use('/report', reportRouter);

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

let server = app.listen(port, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('server is running on [%s:%s]', host, port);
});

/**
 * 주기적으로 데이터를 수집 
 * 금천구 api 사용
 */
(() => {
  dailySyncJob();
  weeklyReportCreateJob();
})();