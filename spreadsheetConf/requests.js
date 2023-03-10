import { insMeta, timeRanges, menu, collectionList } from './area.js';
import { border, timeRangeBgColor } from './style.js';
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
  gap,
  sheet
} from './properties.js';
import { createInsWeek, createTotalWeek, createInsWeekByTerm, createTotalWeekByTerm } from '../spreadSheetData/data.js';
import { createSeries } from './utils.js';

const sheetId = sheet.sheetId;
const sheetTitle = sheet.sheetTitle;
/**
 * 각 개소들의 카테고리 spreadsheet 요청 파라메터
 * 1. 프레임 (셀 병합 및 범위) 처리 요청
 * 2. 테두리 처리 요청
 */
const categoryFrame = (positionOrder) => {

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

  const repeatCell = {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: startRowIndex + positionOrder * rowOffset + 1,
        endRowIndex: endRowIndex + positionOrder * rowOffset,
        startColumnIndex: 2,
        endColumnIndex: 2 + 2,
      },
      cell: {
        userEnteredFormat: {
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(verticalAlignment)',
    },
  };

  return [mergeCells, updateBorders, repeatCell];
};

/**
 * 각 개소들의 spreadsheet 요청 파라메터
 * 1. 프레임 (셀 병합 및 범위) 처리 요청
 * 2. 테두리 처리 요청
 */
const graphFrame = (positionOrder) => {
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

const dataFrame = (positionOrder) => {
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
const categoryValues = (positionOrder) => {
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
    range: `${sheetTitle}!D${basedIndex + 1}:D${basedIndex + 3}`,
    majorDimension: 'ROWS',
    values: category,
  });

  // 종합 text
  data.push({
    range: `${sheetTitle}!C${basedIndex}:C${basedIndex}`,
    majorDimension: 'ROWS',
    values: [['종합']],
  });

  data.push({
    range: `${sheetTitle}!D${basedIndex}:D${basedIndex}`,
    majorDimension: 'ROWS',
    values: [['시간별']],
  });

  return data;
};

/**
 *  그래프 영역
 *  개소 이름 카테고리 텍스트
 */
const graphCategoryValues = (positionOrder) => {
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
const timeRange = (positionOrder) => {

  const basedIndex = startRowIndex + positionOrder * gap * 3;

  // set center
  const requests = [];
  const range1 = {
    sheetId,
    startRowIndex: basedIndex,
    endRowIndex: basedIndex + 1,
    startColumnIndex: 2,
    endColumnIndex: 12
  };

  const range2 = {
    sheetId,
    startRowIndex: basedIndex + gap,
    endRowIndex: basedIndex + gap + 1,
    startColumnIndex: 4,
    endColumnIndex: 12,
  };
  
  const range3 = {
    sheetId,
    startRowIndex: basedIndex + gap * 2,
    endRowIndex: basedIndex + gap * 2 + 1,
    startColumnIndex: 4,
    endColumnIndex: 12,
  };

  requests.push({
    repeatCell: {
      range: range1,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          backgroundColor: timeRangeBgColor,
          textFormat: {
            bold: true,
          },
        },
      },
      fields:
        'userEnteredFormat(textFormat, backgroundColor, horizontalAlignment, verticalAlignment)',
    },
  });

  requests.push({
    repeatCell: {
      range: range2,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          backgroundColor: timeRangeBgColor,
          textFormat: {
            bold: true,
          },
        },
      },
      fields: 'userEnteredFormat(textFormat, backgroundColor, horizontalAlignment, verticalAlignment)',
    },
  });

  requests.push({
    repeatCell: {
      range: range3,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          backgroundColor: timeRangeBgColor,
          textFormat: {
            bold: true,
          },
        },
      },
      fields: 'userEnteredFormat(textFormat, backgroundColor, horizontalAlignment, verticalAlignment)',
    },
  });

  // set time range text
  const data = [];
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1}:L${basedIndex + 1}`,
    majorDimension: 'ROWS',
    values: [timeRanges[0]],
  });

  data.push({
    range: `${sheetTitle}!E${basedIndex + 1 + gap}:L${basedIndex + 1 + gap}`,
    majorDimension: 'ROWS',
    values: [timeRanges[1]],
  });

  data.push({
    range: `${sheetTitle}!E${basedIndex + 1 + gap * 2}:L${basedIndex + 1 + gap * 2}`,
    majorDimension: 'ROWS',
    values: [timeRanges[2]],
  });

  return {
    frame: requests,
    values: data
  }; 
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
        'userEnteredFormat(textFormat, backgroundColor, horizontalAlignment, verticalAlignment)',
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
const term = (weekStartEndDate) => {
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
 * 데이터 입력 부분 영역 우측 정렬
 */
const dataAlignRight = (positionOrder) => {

  const basedIndex = startRowIndex + positionOrder * gap * 3 + 1;
  const requests = [];
  const range1 = {
    sheetId,
    startRowIndex: basedIndex,
    endRowIndex: basedIndex + 3,
    startColumnIndex: 4,
    endColumnIndex: 12
  }
  const range2 = {
    sheetId,
    startRowIndex: basedIndex + gap,
    endRowIndex: basedIndex + gap + 3,
    startColumnIndex: 4,
    endColumnIndex: 12,
  };
  const range3 = {
    sheetId,
    startRowIndex: basedIndex + gap * 2,
    endRowIndex: basedIndex + gap * 2 + 3,
    startColumnIndex: 4,
    endColumnIndex: 12,
  };

  requests.push({
    repeatCell: {
      range: range1,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'RIGHT',
          verticalAlignment: 'MIDDLE',
        }
      },
      fields: 'userEnteredFormat(horizontalAlignment, verticalAlignment)'
    }
  });
  requests.push({
    repeatCell: {
      range: range2,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'RIGHT',
          verticalAlignment: 'MIDDLE',
        }
      },
      fields: 'userEnteredFormat(horizontalAlignment, verticalAlignment)'
    }
  });
  requests.push({
    repeatCell: {
      range: range3,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'RIGHT',
          verticalAlignment: 'MIDDLE',
        }
      },
      fields: 'userEnteredFormat(horizontalAlignment, verticalAlignment)'
    }
  });

  return requests;

}

/** 
 * 시스템 점검 (상태)
 */
const setSystemCollection = () => {

  const range = {
    sheetId,
    startRowIndex: 4,
    endRowIndex: 7,
    startColumnIndex: 1,
    endColumnIndex: 12,
  };

  const updateBorders = {
    updateBorders: {
      range,
      top: border.top,
      bottom: border.bottom,
      left: border.left,
      right: border.right,
      innerHorizontal: border.innerHorizontal,
      innerVertical: border.innerVertical
    }
  };

  const repeatCell = {
    repeatCell: {
      range,
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          textFormat: {
            bold: true
          }
        }
      }, // range
      fields: 'userEnteredFormat(horizontalAlignment, verticalAlignment, textFormat)'
    }
  }

  const data = [];
  data.push({
    range: `${sheetTitle}!B5:L7`,
    majorDimension: 'ROWS',
    values: collectionList
  });

  return {
    frame: [updateBorders, repeatCell],
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

  return [{
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
  }]; // return
};

const adjustCell = (dimension, pixelSize, startIndex, endIndex) => {
  return [{
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension,
        startIndex,
        endIndex
      },
      properties: {
        pixelSize
      },
      fields: 'pixelSize'
    }
  }]; // return
}

const weekTotalData = async () => {
  const tdDataSet = await createTotalWeek();

  const hourDataSet = tdDataSet.hour;
  const totalDataSet = tdDataSet.total;

  const positionOrder = 0
  const basedIndex = startRowIndex + 1 + positionOrder * gap * 3;

  const data = [];
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1}:L${basedIndex + 1 + 2}`,
    majorDimension: 'ROWS',
    values: hourDataSet[0],
  });
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1 + gap}:L${basedIndex + 1 + gap + 2}`,
    majorDimension: 'ROWS',
    values: hourDataSet[1]
  });
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1 + gap * 2}:L${basedIndex + 1 + gap * 2 + 2}`,
    majorDimension: 'ROWS',
    values: hourDataSet[2],
  });

  data.push({
    range: `${sheetTitle}!C${basedIndex + 1}:C${basedIndex + 1 + 2}`,
    majorDimension: 'ROWS',
    values: totalDataSet,
  });

  return data;
}

const weekInsData = async(insNo, positionOrder) => {
  const tdDataSet = await createInsWeek(insNo);

  const hourDataSet = tdDataSet.hour;
  const totalDataSet = tdDataSet.total;

  const basedIndex = startRowIndex + 1 + positionOrder * gap * 3;

  const data = [];
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1}:L${basedIndex + 1 + 2}`,
    majorDimension: 'ROWS',
    values: hourDataSet[0],
  });
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1 + gap}:L${basedIndex + 1 + gap + 2}`,
    majorDimension: 'ROWS',
    values: hourDataSet[1],
  });
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1 + gap * 2}:L${basedIndex + 1 + gap * 2 + 2}`,
    majorDimension: 'ROWS',
    values: hourDataSet[2],
  });

  data.push({
    range: `${sheetTitle}!C${basedIndex + 1}:C${basedIndex + 1 + 2}`,
    majorDimension: 'ROWS',
    values: totalDataSet,
  });

  return data;
}

const weekTotalDataByTerm = async (sow, eow) => {
  const tdDataSet = await createTotalWeekByTerm(sow, eow);

  const hourDataSet = tdDataSet.hour;
  const totalDataSet = tdDataSet.total;

  const positionOrder = 0;
  const basedIndex = startRowIndex + 1 + positionOrder * gap * 3;

  const data = [];
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1}:L${basedIndex + 1 + 2}`,
    majorDimension: 'ROWS',
    values: hourDataSet[0],
  });
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1 + gap}:L${
      basedIndex + 1 + gap + 2
    }`,
    majorDimension: 'ROWS',
    values: hourDataSet[1],
  });
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1 + gap * 2}:L${
      basedIndex + 1 + gap * 2 + 2
    }`,
    majorDimension: 'ROWS',
    values: hourDataSet[2],
  });

  data.push({
    range: `${sheetTitle}!C${basedIndex + 1}:C${basedIndex + 1 + 2}`,
    majorDimension: 'ROWS',
    values: totalDataSet,
  });

  return data;
};

const weekInsDataByTerm = async (insNo, positionOrder, sow, eow) => {
  const tdDataSet = await createInsWeekByTerm(insNo, sow, eow);

  const hourDataSet = tdDataSet.hour;
  const totalDataSet = tdDataSet.total;

  const basedIndex = startRowIndex + 1 + positionOrder * gap * 3;

  const data = [];
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1}:L${basedIndex + 1 + 2}`,
    majorDimension: 'ROWS',
    values: hourDataSet[0],
  });
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1 + gap}:L${
      basedIndex + 1 + gap + 2
    }`,
    majorDimension: 'ROWS',
    values: hourDataSet[1],
  });
  data.push({
    range: `${sheetTitle}!E${basedIndex + 1 + gap * 2}:L${
      basedIndex + 1 + gap * 2 + 2
    }`,
    majorDimension: 'ROWS',
    values: hourDataSet[2],
  });

  data.push({
    range: `${sheetTitle}!C${basedIndex + 1}:C${basedIndex + 1 + 2}`,
    majorDimension: 'ROWS',
    values: totalDataSet,
  });

  return data;
};

const lineChart = (positionOrder) => {
  const data = [];

  const basicIndex = startRowIndex + positionOrder * rowOffset;
  const basicGraphIndex = startGraphRowIndex + positionOrder * graphRowOffset;
  const insNo = positionOrder;

  const domain = {
    sourceRange: {
      sources: [
        {
          sheetId,
          startRowIndex: basicIndex,
          endRowIndex: basicIndex + 1,
          startColumnIndex: 3,
          endColumnIndex: 12,
        },
        {
          sheetId,
          startRowIndex: basicIndex + gap,
          endRowIndex: basicIndex + gap + 1,
          startColumnIndex: 4,
          endColumnIndex: 12,
        },
        {
          sheetId,
          startRowIndex: basicIndex + gap * 2,
          endRowIndex: basicIndex + gap * 2 + 1,
          startColumnIndex: 4,
          endColumnIndex: 12,
        },
      ],
    },
  };

  const chartReq = {
    addChart: {
      chart: {
        chartId: insNo,
        spec: {
          title: '',
          basicChart: {
            chartType: 'LINE',
            legendPosition: 'BOTTOM_LEGEND',
            axis: [
              {
                position: 'BOTTOM_AXIS',
                title: '시간 별',
              },
              // {
              //   position: 'LEFT_AXIS',
              //   title: 'title1',
              // },
            ],
            domains: [
              {
                domain
              },
            ],
            series: createSeries(positionOrder),
            headerCount: 1,
          },
        },
        position: {
          overlayPosition: {
            anchorCell: {
              sheetId,
              rowIndex: basicGraphIndex,
              columnIndex: 3,
            },
            offsetXPixels: 0,
            offsetYPixels: 0,
            widthPixels: 900,
            heightPixels: 300,
          },
        }, // position
      },
    }, // addChart
  };

  data.push(chartReq);
  return data;
}

export const reqParams = {
  categoryFrame,
  graphFrame,
  dataFrame,
  categoryValues,
  timeRange,
  graphCategoryValues,
  adjustCell,
  weekTotalData,
  weekInsData,
  dataAlignRight,
  lineChart,
  term,
  centerAlign: centerAlign(),
  title: setTitle(),
  menu: setMenu(),
  systemCollection: setSystemCollection(),
  weekTotalDataByTerm,
  weekInsDataByTerm,
};
