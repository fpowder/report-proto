import { spreadsheetId, sheetId, rowOffset, startRowIndex } from './properties.js';
import { insMeta } from './area.js';

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
    const insNo = positionOrder;
    const basicIndex = startRowIndex + positionOrder * rowOffset;

    const series = [];

    let increase = 0
    let gap = 0;
    const startColumnIndex = 3;
    const endColumnIndex = 4;
    for(let i = 1; i <= 24; i++) {

        series.push(
            {
                series: {
                    sourceRange: {
                        sources: [
                            {
                                sheetId,
                                startRowIndex: basicIndex + gap,
                                endRowIndex: basicIndex + gap + insMeta[new String(insNo)].category.length,
                                startColumnIndex: startColumnIndex + increase,
                                endColumnIndex: endColumnIndex + increase
                                }
                        ]
                    }
                },
                targetAxis: 'LEFT_AXIS'
            }
        );
        
        increase++;
        if(i % 8 === 0){
            increase = 0;
            gap += 4;
        }
    } // for

    return series;

}