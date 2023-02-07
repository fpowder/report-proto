import express from 'express';
import { apiInstance } from './GoogleAPIs.js';
import sheetRouter from './router/sheet.js';

const app = express();

app.use('/sheet', sheetRouter);

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

let server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('server is running on [%s:%s]', host, port);
});
