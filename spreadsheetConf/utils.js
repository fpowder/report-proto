import { spreadsheetId } from './properties.js';
export const createBatchReq = ( data ) => {
    return {
        spreadsheetId,
        resource: {
            requests: data,
        },
    };
};

export const createValuesReq = ( data ) => {
    return {
        spreadsheetId,
        resource: {
            data: data,
            valueInputOption: 'RAW'
        } 
    }
};