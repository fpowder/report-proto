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
} from './properties.js';

/**
 * 전체 개소들의 spreadsheet 요청 파라메터
 * 1. 프레임 (셀 병합 및 범위) 처리 요청
 * 2. 테두리 처리 요청
 */
export const gchTotal = {};

const insFrame = {
  0: {
    title: '주간 종합',
    category: ['보행자 통행량', '차량 통행량', '불법주정차 수'],
  },
  1: {
    title: '개소 1',
    category: ['보행자 통행량', '차량 통행량'],
  },
  2: {
    title: '개소 2',
    category: ['보행자 통행량', '차량 통행량'],
  },
  3: {
    title: '개소 3',
    category: ['보행자 통행량', '차량 통행량'],
  },
  4: {
    title: '개소 4',
    category: ['보행자 통행량', '차량 통행량'],
  },
  5: {
    title: '개소 5',
    category: ['보행자 통행량', '차량 통행량', '불법주정차 수'],
  },
  6: {
    title: '개소 6',
    category: ['보행자 통행량', '차량 통행량', '불법주정차 수'],
  },
  7: {
    title: '개소 7',
    category: ['보행자 통행량', '차량 통행량'],
  },
  8: {
    title: '개소 8',
    category: ['보행자 통행량', '차량 통행량'],
  },
  9: {
    title: '개소 9',
    category: ['보행자 통행량', '차량 통행량'],
  },
  10: {
    title: '개소 10',
    category: ['보행자 통행량', '차량 통행량'],
  },
  11: {
    title: '개소 11',
    category: ['보행자 통행량', '차량 통행량'],
  },
  12: {
    title: '개소 12',
    category: ['보행자 통행량', '차량 통행량'],
  },
  13: {
    title: '개소 13',
    category: ['보행자 통행량', '차량 통행량'],
  },
};

/**
 * 각 개소들의 카테고리 spreadsheet 요청 파라메터
 * 1. 프레임 (셀 병합 및 범위) 처리 요청
 * 2. 테두리 처리 요청
 */
const createCategorySheetFrame = () => {
  const apiParams = {};

  const insNumbers = Object.keys(insFrame);
  for (const insNumStr in insNumbers) {
    const insNo = parseInt(insNumStr);

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

    apiParams[insNumStr] = [mergeCells, updateBorders];
  }

  return apiParams;
};

/**
 * 각 개소들의 spreadsheet 요청 파라메터
 * 1. 프레임 (셀 병합 및 범위) 처리 요청
 * 2. 테두리 처리 요청
 */
const createGraphSheetFrame = () => {
  const apiParams = {};

  const insNumbers = Object.keys(insFrame);
  for (const insNumStr in insNumbers) {
    const insNo = parseInt(insNumStr);

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
            }
        };

    apiParams[insNumStr] = [mergeCells, updateBorders];
  }

  return apiParams;
};

export const reqParams = {
  category: createCategorySheetFrame(),
  graph: createGraphSheetFrame()
};
