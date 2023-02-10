import { insMeta } from './area.js';
import { border } from './style.js';
import {
  cnt,
  startRowIndex,
  endRowIndex,
  startColumnIndex,
  endColumnIndex,
  rowOffset,
  startGraphRowIndex,
  endGraphRowIndex,
  graphRowOffset,
  sheetId,
  spreadsheetId,
  sheetTitle,
  gap
} from './properties.js';

/**
 * 각 개소들의 카테고리 spreadsheet 요청 파라메터
 * 1. 프레임 (셀 병합 및 범위) 처리 요청
 * 2. 테두리 처리 요청
 */
const createCategoryFrame = () => {
  const apiParams = {};

  const insNos = Object.keys(insMeta);
  for (const insNoStr in insNos) {
    const insNo = parseInt(insNoStr);

    // 셀 병합요청 파라메터
    const mergeCells = {
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: startRowIndex + insNo * rowOffset,
          endRowIndex: endRowIndex + insNo * rowOffset,
          startColumnIndex,
          endColumnIndex,
        },
        mergeType: 'MERGE_ALL',
      },
    };

    const updateBorders = {
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: startRowIndex + insNo * rowOffset,
          endRowIndex: endRowIndex + insNo * rowOffset,
          startColumnIndex: 1,
          endColumnIndex: 1 + 3,
        },
        top: border.top,
        bottom: border.bottom,
        left: border.left,
        right: border.right,
        innerHorizontal: border.innerHorizontal,
        innerVertical: border.innerVertical,
      },
    };

    apiParams[insNoStr] = [mergeCells, updateBorders];
  } //for

  return apiParams;
};

/**
 * 각 개소들의 spreadsheet 요청 파라메터
 * 1. 프레임 (셀 병합 및 범위) 처리 요청
 * 2. 테두리 처리 요청
 */
const createGraphFrame = () => {
  const apiParams = {};

  const insNos = Object.keys(insMeta);
  for (const insNoStr in insNos) {
    const insNo = parseInt(insNoStr);

    // 셀 병합요청 파라메터
    const mergeCells = {
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: startGraphRowIndex + insNo * graphRowOffset,
          endRowIndex: endGraphRowIndex + insNo * graphRowOffset,
          startColumnIndex,
          endColumnIndex,
        },
        mergeType: 'MERGE_ALL',
      },
    };

    // border solid 스타일 적용 파라메터
    const updateBorders = {
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: startGraphRowIndex + insNo * graphRowOffset,
          endRowIndex: endGraphRowIndex + insNo * graphRowOffset,
          startColumnIndex: 1,
          endColumnIndex: 1 + 2,
        },
        top: border.top,
        bottom: border.bottom,
        left: border.left,
        right: border.right,
        innerHorizontal: border.innerHorizontal,
        innerVertical: border.innerVertical,
      },
    };

    apiParams[insNoStr] = [mergeCells, updateBorders];
  } //for

  return apiParams;
};

const createDataFrame = () => {
  const apiParams = {};
  const insNos = Object.keys(insMeta);

  for (const insNoStr in insNos) {
    const insNo = parseInt(insNoStr);

    const updateBorders = {
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: startRowIndex + insNo * rowOffset,
          endRowIndex: startRowIndex + insNo * rowOffset + 12,
          startColumnIndex: 4,
          endColumnIndex: 4 + 8,
        },
        top: border.top,
        bottom: border.bottom,
        left: border.left,
        right: border.right,
        innerHorizontal: border.innerHorizontal,
        innerVertical: border.innerVertical,
      },
    };

    apiParams[insNoStr] = [updateBorders];
  } //for

  return apiParams;
};

/**
 * 개소 이름 예) 주간 종합,개소 1, 개소 2, ......
 * 데이터 카테고리 : 보행자 통행량, 차량 통행량, 불법주정차
 * 시간별 : 00 ~ 01, 01 ~ 02, 02 ~ 03..... 23 ~ 00   
 */
const setCategory = () => {
    
    const apiParams = {};
    const insNos = Object.keys(insMeta);
    

    for(const insNoStr in insNos) {
        const insNo = parseInt(insNoStr);
        const data = [];
        data.push({
            range: `${sheetTitle}!B${startRowIndex + insNo * gap * 3 + 1}:B${startRowIndex + insNo * gap * 3 + 1 + 4 - 1}`,
            majorDimension: 'ROWS',
            values: [[insMeta[insNoStr].title]]
        });

        apiParams[insNoStr] = data;
    }

    return apiParams;
};

const setTimeRange = () => {

};

export const reqParams = {
  category: createCategoryFrame(),
  graph: createGraphFrame(),
  data: createDataFrame(),
  category: setCategory(),
  timeRange: setTimeRange()
};
