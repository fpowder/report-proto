
import fs from 'fs';
import path from 'path';
import express from 'express';
import readline from 'readline';

import { google } from 'googleapis';

const __dirname = path.resolve();
// Google API Token Path
const TOKEN_PATH = 'token.json'
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]; 
const app = express();

let GoogleDrivers = null;
let GoogleSheets = null;

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err)
        oAuth2Client.setCredentials(token)
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err)
          console.log('Token stored to', TOKEN_PATH)
        })
        callback(oAuth2Client)
      });
    });
  }

function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2 (client_id, client_secret, redirect_uris[0])
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  };

  function initialization(auth) {
    GoogleDrivers = google.drive({ version: 'v3', auth });
    GoogleSheets = google.sheets({ version: 'v4', auth });
  }

 app.get('/create-sheet', async(req, res) => {
    const resource = {
        properties: {
            title: 'gch-report-test',
        },
    };
    try{
        const spreadsheet = await GoogleSheets.spreadsheets.create({
            resource,
            fields: 'spreadsheetId',
        });
        console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
        res.status(200).send({
            message: 'creat sheet complete!',
            spreadSheetId: spreadsheet.data.spreadSheetId
        });
    } catch(err) {
        res.status(400).send({
            message: 'create sheet failed',
            errMessage: err
        });
        throw err;
    }
});

app.get('/oauth2Callback', async(req, res) => {
    res.status(200).send({message: req.query.code});
});

let server = app.listen(3000, function () {
    let host = server.address().address
    let port = server.address().port
 
    fs.readFile('credentials-web.json', (err, content) => {
     if (err) return console.log('[Error] Error loading client secret file:', err)
     authorize(JSON.parse(content), initialization)
   })
 
    console.log("00. Wait Export Excel Server [%s:%s]", host, port)
 });