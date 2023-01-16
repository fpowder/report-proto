import { google } from 'googleapis';
class GoogleAPIs {
    
    drives;
    sheets;

    constructor(auth) {
        this.drives = google.drive({ version: 'v3', auth }) ;
        this.sheets = google.sheets({ version: 'v4', auth });
    }

    static getDriveAuth() {
        return this.drives;
    }

    static getSheetAuth() {
        return this.sheets;
    }
}