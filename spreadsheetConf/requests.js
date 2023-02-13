import { insMeta, timeRanges } from './area.js';
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
const createCategoryFrame = (positionOrder) => {

  // 셀 병합요청 파라메터
  const mergeCells = {
    mergeCells: {
      range: {
        sheetId,
        startRowIndex: startRowIndex + positionOrder * rowOffset,
        endRowIndex: endRowIndex + positionOrder * rowOffset,
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
        startRowIndex: startRowIndex + positionOrder * rowOffset,
        endRowIndex: endRowIndex + positionOrder * rowOffset,
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

  return [mergeCells, updateBorders];
};

/**
 * 각 개소들의 spreadsheet 요청 파라메터
 * 1. 프레임 (셀 병합 및 범위) 처리 요청
 * 2. 테두리 처리 요청
 */
const createGraphFrame = (positionOrder) => {

  // 셀 병합요청 파라메터
  const mergeCells = {
    mergeCells: {
      range: {
        sheetId,
        startRowIndex: startGraphRowIndex + positionOrder * graphRowOffset,
        endRowIndex: endGraphRowIndex + positionOrder * graphRowOffset,
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
        startRowIndex: startGraphRowIndex + positionOrder * graphRowOffset,
        endRowIndex: endGraphRowIndex + positionOrder * graphRowOffset,
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

  return [mergeCells, updateBorders];
};

const createDataFrame = (positionOrder) => {

  const updateBorders = {
    updateBorders: {
      range: {
        sheetId,
        startRowIndex: startRowIndex + positionOrder * rowOffset,
        endRowIndex: startRowIndex + positionOrder * rowOffset + 12,
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

  return [updateBorders];
};

/**
 * 개소 이름 예) 주간 종합,개소 1, 개소 2, ......
 * 데이터 카테고리 : 보행자 통행량, 차량 통행량, 불법주정차
 */
const setCategoryValues = (positionOrder) => {
    
    const data = [];
    const basedIndex = startRowIndex + 1 + positionOrder * gap * 3;
    
    // 개소 이름
    const insTitle = insMeta[new String(positionOrder)]?.title ? insMeta[new String(positionOrder)].title : '해당 없음' ;
    data.push({
      range: `${sheetTitle}!B${basedIndex}:B${basedIndex + 3}`,
      majorDimension: 'ROWS',
      values: [[insTitle]]
    });
    
    // 데이터 수집 카테고리(보행자 통행량, 차량 통행량)
    const categories = insMeta[new String(positionOrder)]?.category ? insMeta[new String(positionOrder)].category : [[]];
    data.push({
      range: `${sheetTitle}!C${basedIndex + 1}:C${basedIndex + 3}`,
      majorDimension: 'ROWS',
      values: categories
    });

    // 합계
    data.push({
      range: `${sheetTitle}!D${basedIndex}:D${basedIndex}`,
      majorDimension: 'ROWS',
      values: [['합계']]
    });

    return data;
};

/**
 * 시간별 : 00 ~ 01, 01 ~ 02, 02 ~ 03..... 23 ~ 00
 */
const setTimeRangeValues = (positionOrder) => {
  const data = [];
  const basedIndex = startRowIndex + 1 + positionOrder * gap * 3;

  data.push({
    range: `${sheetTitle}!E${basedIndex}:L${basedIndex}`,
    majorDimension: 'ROWS',
    values: [timeRanges[0]]
  });

  data.push({
    range: `${sheetTitle}!E${basedIndex + gap}:L${basedIndex + gap * 2}`,
    majorDimension: 'ROWS',
    values: [timeRanges[1]],
  });

  data.push({
    range: `${sheetTitle}!E${basedIndex + gap * 2}:L${basedIndex + gap * 2}`,
    majorDimension: 'ROWS',
    values: [timeRanges[2]],
  });

  return data;
};

/**
 * 병합된 셀의 수평 및 수직 정렬을 가운데로 함
 * @returns {{repeatCell: {range: {endColumnIndex: number, endRowIndex: number, sheetId: number, startColumnIndex: number, startRowIndex: number}, cell: {userEnteredFormat: {horizontalAlignment: string, verticalAlignment: string}}, fields: string}}}
 */
const centerAlign = () => {
  const range = {
    sheetId,
    startRowIndex,
    endRowIndex: startRowIndex + gap * 3 * cnt + 1 + graphRowOffset * cnt + 3,
    startColumnIndex: 1,
    endColumnIndex: 2
  }

  return {
    repeatCell: {
      range,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE'
        }
      },
      fields: 'userEnteredFormat(horizontalAlignment, verticalAlignment)'
    }
  }
}

export const reqParams = {
  categoryFrame: createCategoryFrame,
  graphFrame: createGraphFrame,
  dataFrame: createDataFrame,
  categoryValues: setCategoryValues,
  timeRangeValues: setTimeRangeValues,
  centerAlign: centerAlign
};
