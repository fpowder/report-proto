import { spreadsheetId, sheetId, rowOffset, startRowIndex, gap } from './properties.js';

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

// create series data for line chart
export const createSeries = (positionOrder) => {
    const basicIndex = startRowIndex + positionOrder * rowOffset;
    const series = [];
    let sources = [];

    for(let i = 0; i < 3; i++){
        sources.push({
            sheetId,
            startRowIndex: basicIndex + i + 1,
            endRowIndex: basicIndex + i + 1 + 1,
            startColumnIndex: 3,
            endColumnIndex: 12,
        });
        sources.push({
            sheetId,
            startRowIndex: basicIndex + gap + i + 1,
            endRowIndex: basicIndex + gap + i + 1 + 1,
            startColumnIndex: 4,
            endColumnIndex: 12,
        });
        sources.push({
            sheetId,
            startRowIndex: basicIndex + gap * 2 + i + 1,
            endRowIndex: basicIndex + gap * 2 + i + 1 + 1,
            startColumnIndex: 4,
            endColumnIndex: 12,
        });

        series.push({
            series: {
                sourceRange: {
                    sources: sources,
                },
            },
            targetAxis: 'LEFT_AXIS',
            dataLabel: {
                type: 'DATA',
                placement: 'ABOVE',
                textFormat: {
                    fontSize: 8
                }
            }
        });

        sources = [];
    }

    return series;
}