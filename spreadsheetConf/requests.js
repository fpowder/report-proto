import { insMeta, timeRanges, menu } from './area.js';
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
  gap,
} from './properties.js';
import { getWeekStartEndDate } from '../utils.js';

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
  const insTitle = insMeta[new String(positionOrder)]?.title
    ? insMeta[new String(positionOrder)].title
    : '';
  data.push({
    range: `${sheetTitle}!B${basedIndex}:B${basedIndex + 3}`,
    majorDimension: 'ROWS',
    values: [[insTitle]],
  });

  // 데이터 수집 카테고리(보행자 통행량, 차량 통행량)
  const category = insMeta[new String(positionOrder)]?.category
    ? insMeta[new String(positionOrder)].category
    : [[]];
  data.push({
    range: `${sheetTitle}!C${basedIndex + 1}:C${basedIndex + 3}`,
    majorDimension: 'ROWS',
    values: category,
  });

  // 합계
  data.push({
    range: `${sheetTitle}!D${basedIndex}:D${basedIndex}`,
    majorDimension: 'ROWS',
    values: [['합계']],
  });

  return data;
};

/**
 *  그래프 영역
 *  개소 이름 카테고리 텍스트
 */
const setGraphCategoryValues = (positionOrder) => {
  const data = [];
  const basedIndex = startGraphRowIndex + 1 + positionOrder * graphRowOffset;

  const insTitle = insMeta[new String(positionOrder)]?.title
    ? insMeta[new String(positionOrder)].title
    : '';
  data.push({
    range: `${sheetTitle}!B${basedIndex}:B${basedIndex + 2}`,
    majorDimension: 'ROWS',
    values: [[insTitle]],
  });

  const category = insMeta[new String(positionOrder)]?.category;
  data.push({
    range: `${sheetTitle}!C${basedIndex}:C${basedIndex + 2}`,
    majorDimension: 'ROWS',
    values: category,
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
    values: [timeRanges[0]],
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

// 보고서 제목 영역 셀 병합 및 타이틀
const setTitle = () => {
  const range = {
    sheetId,
    startRowIndex: 1,
    endRowIndex: 2,
    startColumnIndex: 1,
    endColumnIndex: 12,
  };

  // cell merge and horizontal, vertical center request data
  const mergeCells = {
    mergeCells: {
      range,
      mergeType: 'MERGE_ALL',
    },
  };

  const repeatCell = {
    repeatCell: {
      range,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          textFormat: {
            bold: true,
          },
        },
      },
      fields:
        'userEnteredFormat(textFormat, horizontalAlignment, verticalAlignment)',
    },
  };

  // title text request data
  const data = [];
  data.push({
    range: `${sheetTitle}!B2:L2`,
    majorDimension: 'ROWS',
    values: [['보행자 알림이 보고서']],
  });

  return {
    frame: [mergeCells, repeatCell],
    value: data,
  };
};

/**
 * 데이터 기간 제목영역 스타일 및 기간삽입 요청
 */
const setTerm = () => {
  const termRange = {
    sheetId,
    startRowIndex: 2,
    endRowIndex: 3,
    startColumnIndex: 10,
    endColumnIndex: 12,
  };

  const categoryRange = {
    sheetId,
    startRowIndex: 2,
    endRowIndex: 3,
    startColumnIndex: 9,
    endColumnIndex: 10,
  };

  const termMergeCells = {
    mergeCells: {
      range: termRange,
      mergeType: 'MERGE_ALL',
    },
  };

  const categoryRepeatCell = {
    repeatCell: {
      range: categoryRange,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'LEFT',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(horizontalAlignment, verticalAlignment)',
    },
  };

  const termRepeatCell = {
    repeatCell: {
      range: termRange,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(horizontalAlignment, verticalAlignment)',
    },
  };

  // text request data
  const data = [];
  data.push({
    range: `${sheetTitle}!J3:J3`,
    majorDimension: 'ROWS',
    values: [['기간:']],
  });

  // get current week start, end date
  const weekStartEndDate = getWeekStartEndDate(new Date());

  data.push({
    range: `${sheetTitle}!K3:L3`,
    majorDimension: 'ROWS',
    values: [[`${weekStartEndDate.sow} ~ ${weekStartEndDate.eow}`]],
  });

  return {
    frame: [termMergeCells, categoryRepeatCell, termRepeatCell],
    value: data,
  };
};

/**
 * 메뉴 셀 병합 및 텍스트 삽입
 * 1. 시스템 점검
 * 2. 개소별 현황
 */
const setMenu = () => {

  const frame = [];
  const data = [];

  for(const number in menu) {
    const mergeCells = {
      mergeCells: {
        range: menu[number].range,
        mergeType: 'MERGE_ALL'
      }
    };

    const repeatCell = {
      repeatCell: {
        range: menu[number].range,
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'LEFT',
            verticalAlignment: 'MIDDLE',
            textFormat: {
              bold: true
            }
          }
        },
        fields: 'userEnteredFormat(horizontalAlignment, verticalAlignment, textFormat)'
      }
    };

    frame.push(mergeCells, repeatCell);
    
    const title = menu[number].title;
    data.push({
      range: `${sheetTitle}!${menu[number].sheetRange}`,
      majorDimension: 'ROWS',
      values: [[`${number}. ${title}`]]
    });
  } // for

  return {
    frame: frame,
    value: data
  }

}



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
    endColumnIndex: 2,
  };

  return {
    repeatCell: {
      range,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(horizontalAlignment, verticalAlignment)',
    },
  };
};

export const reqParams = {
  categoryFrame: createCategoryFrame,
  graphFrame: createGraphFrame,
  dataFrame: createDataFrame,
  categoryValues: setCategoryValues,
  timeRangeValues: setTimeRangeValues,
  centerAlign: centerAlign,
  graphCategoryValues: setGraphCategoryValues,
  title: setTitle(),
  term: setTerm(),
  menu: setMenu()
};
