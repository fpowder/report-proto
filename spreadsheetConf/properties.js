export const cnt = 13;

export const gap = 4;
export const startRowIndex = 9;
export const endRowIndex = startRowIndex + gap;
export const startColumnIndex = 1;
export const endColumnIndex = 2;
export const rowOffset = gap * 3;

export const startGraphRowIndex = startRowIndex + rowOffset * cnt + 1;
export const endGraphRowIndex = startGraphRowIndex + 3;
export const graphRowOffset = 15;

// export let sheetId = 0;
// export let spreadsheetId = '1IyI7QM7QL0fyyoieunbgXuiHS0KXdA9JkQXBhTOiTFE';
// export let sheetTitle = 'report';

class Sheet {

    sheetId = 0;
    spreadsheetId;
    sheetTitle = 'report'

    constructor() {

    }

    setSpreadsheetId(spreadsheetId) {
        this.spreadsheetId = spreadsheetId;
    }

    getSpreadsheetId () {
        return this.spreadsheetId;
    }
}

// for singleton
export const sheet = new Sheet();
