import express from 'express';
import http from 'http';

import fs from 'fs';
import path from 'path';

import { google } from 'googleapis';

const __dirname = path.resolve();
s
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
];    

const app = express();
const port = 3000;


const credentials = 
    JSON.parse(fs.readFileSync(path.join(__dirname + '/credentials-web.json'))).web;
const oauth2Client = new google.auth.OAuth2({
    clientId: credentials.client_id,
    clientSecret: credentials.client_secret,
    redirectUri: credentials.redirect_uris[0]
});
const authorizedUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true
})
app.set('port', port);
app.set('oauth2Client', oauth2Client);

app.get('/create-sheet', (req, res) => {

    const token = JSON.parse(fs.readFileSync(path.join(__dirname  + '/token-web.json')));
    const oauth2Client = app.get('oauth2Client');
    oauth2Client.setCredentials(token);

});

const server = http.createServer(app);
server.listen(app.get('port'), (err) => {
    if(!err) console.log('server is runiing on port : ', app.get('port'));
});
