import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
// import axios from 'axios';

const __dirname = path.resolve();
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname + '/credentials_web.json')));
// const refreshToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/refresh-token-web.json'))).web.refresh_token;
// const TOKEN_PATH = 'token.json';
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
];
class GoogleAPIs {
    
    drives;
    sheets;
    
    oauth2Client;
    authUrl;

    constructor() {

        const { client_secret, client_id, redirect_uris } = credentials.web;
        this.oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        this.oauth2Client.on('tokens', (tokens) => {
            console.log('token refreshed.');
            console.log(tokens);

            // this is current token
            fs.writeFileSync(path.join(__dirname + '/token.json'), JSON.stringify(tokens));
            // refresh token only can get once in first time
            if(tokens.refresh_token) {
                fs.writeFileSync(path.join(__dirname + '/refresh_token.json'), JSON.stringify({refresh_token: tokens.refresh_token}));
            }

            const newToken = tokens;
            if(!tokens.refresh_token && fs.existsSync(path.join(__dirname + '/refresh_token.json'))) {
                const refreshToken = JSON.parse(
                    fs.readFileSync(path.join(__dirname + '/refresh_token.json'))
                );
                newToken.refresh_token = refreshToken.refresh_token;
            }

            this.oauth2Client.setCredentials(newToken);
            this.setDriveAuth(this.oauth2Client);
            this.setSheetAuth(this.oauth2Client);
        });

    }

    setDriveAuth = (auth) => {
        this.drives = google.drive({ version: 'v3', auth });
        return this;
    }

    setSheetAuth = (auth) => {
        this.sheets = google.sheets({ version: 'v4', auth });
        return this;
    }

    setAuthUrl = () => {
        this.authUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        return this;
    }

    requestNewToken = () => {
        console.log(this.authUrl);
        // const result = await axios.get(this.authUrl);
        // console.log('request new token result', result);
    }

    getToken = (code) => {
        this.oauth2Client.getToken(code, (err, token) => {
            if (err) {
                console.log('Can\'t get token! please check oauth2 configuratioin on web console');
                console.log(err);
            }
            console.log('token');
            console.log(token);
        });
    }

    getDriveAuth = () => {
        return this.drives;
    }

    getSheetAuth = () => {
        return this.sheets;
    }
}

export const apiInstance = new GoogleAPIs();