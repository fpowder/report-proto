import express from 'express';
import http from 'http';
import asyncify from 'express-asyncify';

import fs from 'fs';
import path from 'path';

import { google } from 'googleapis';

const __dirname = path.resolve();

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
];    

const app = asyncify(express());
const port = 3000;


const credentials = 
    JSON.parse(fs.readFileSync(path.join(__dirname + '/credentials.json'))).installed;
const oauth2Client = new google.auth.OAuth2({
    clientId: credentials.client_id,
    clientSecret: credentials.client_secret,
    redirectUri: credentials.redirect_uris[0]
});
const authorizedUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true
});

console.log('authorizedUrl : ', authorizedUrl);

app.set('port', port);
app.set('oauth2Client', oauth2Client);

app.get('/oauth2Callback', async(req, res) => {
    res.status(200).send({message: req.query.code});
});

app.get('/set-token', async(req, res) => {
    try {
        const code = req.query.code;
        const oauth2Client = await app.get('oauth2Client');

        const newToken = await oauth2Client.getToken(code);

        console.log('newToken', newToken);

        await app.set('token', newToken.tokens);
        res.status(200).send({message: 'set new token complete'});
    } catch(err) {
        res.status(400).send({
            message: 'can\'t get new token',
            err: err
        });
    }
});

app.get('/create-drive', async(req, res) => {
    const oauth2Client = await app.get('oauth2Client');
    await oauth2Client.setCredentials(app.get('token'));

    try {
        const service = await google.drive({version: 'v3', oauth2Client});
        const result = await service.files.create({
            resource: {
                name: 'gch-report-test',
                mimeType: 'application/vnd.google-apps.spreadsheet',
              },
              media: {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              }
        });
        res.status(200).send({message: result});

    } catch(err) {
        res.status(400).send({
            messsage: 'can\'t create spreadsheet with drive api',
            err: err
        });

    }


})

app.get('/create-sheet', async(req, res) => {

    // const token = JSON.parse(fs.readFileSync(path.join(__dirname  + '/token-web.json')));
    const oauth2Client = await app.get('oauth2Client');

    // const token = await oauth2Client.getToken(await );
    await oauth2Client.setCredentials(app.get('token'));

    const service = await google.sheets({version: 'v4', oauth2Client});
    const resource = {
        properties: {
            title: 'gch-report-test',
        },
    };
    try {
        const spreadsheet = await service.spreadsheets.create({
            resource,
            fields: 'spreadsheetId',
        });
        console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
        await res.status(200).send({
            message: 'creat sheet complete!',
            spreadSheetId: spreadsheet.data.spreadSheetId
        })
    } catch (err) {
        // TODO (developer) - Handle exception
        res.status(400).send({
            message: 'create sheet failed',
            errMessage: err
        });
        throw err;
    } 
    
});

const server = http.createServer(app);
server.listen(app.get('port'), (err) => {
    if(!err) console.log('server is runiing on port : ', app.get('port'));
});
