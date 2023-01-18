import fs from 'fs';
import path from 'path';
import express from 'express';
import open from 'open';

import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { Server } from 'http';

import axios from 'axios';

const __dirname = path.resolve();

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
];    




async function create(title) {

    const keys = JSON.parse(fs.readFileSync(path.join(__dirname + '/credentials.json')));

    // Create an oAuth2 client to authorize the API call
    let client = new google.auth.OAuth2(
        keys.installed.client_id,
        keys.installed.client_secret,
    );

    const authorizeUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    const auth = new GoogleAuth({
        scopes: SCOPES,
        authClient: client
    });

    const service = google.sheets({version: 'v4', auth});
    const resource = {
        properties: {
            title,
        },
    };
    try {
        const spreadsheet = await service.spreadsheets.create({
            resource,
            fields: 'spreadsheetId',
        });
        console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
        return spreadsheet.data.spreadsheetId;
    } catch (err) {
        // TODO (developer) - Handle exception
        throw err;
    }

}

create('gch-report-test2');
