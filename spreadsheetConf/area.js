import { sheetId } from './properties.js';
export const insMeta = {
  0: {
    title: '주간 종합',
    category: [['보행자 통행량'], ['차량 통행량'], ['불법주정차 수']],
  },
  1: {
    title: '개소 1',
    category: [['보행자 점유율 평균'], ['차량 통행량']],
    iotType: 'sad',
    illegalParking: false,
  },
  2: {
    title: '개소 2',
    category: [['보행자 통행량'], ['차량 통행량']],
    iotType: 'svd',
    illegalParking: false,
  },
  3: {
    title: '개소 3',
    category: [['보행자 점유율 평균'], ['차량 통행량']],
    iotType: 'sad',
    illegalParking: false,
  },
  4: {
    title: '개소 4',
    category: [['보행자 점유율 평균'], ['차량 통행량']],
    iotType: 'sad',
    illegalParking: false,
  },
  5: {
    title: '개소 5',
    category: [['보행자 통행량'], ['차량 통행량'], ['불법주정차 수']],
    iotType: 'svd',
    illegalParking: true,
  },
  6: {
    title: '개소 6',
    category: [['보행자 통행량'], ['차량 통행량'], ['불법주정차 수']],
    iotType: 'svd',
    illegalParking: true,
  },
  7: {
    title: '개소 7',
    category: [['보행자 통행량'], ['차량 통행량']],
    iotType: 'svd',
    illegalParking: false,
  },
  8: {
    title: '개소 8',
    category: [['보행자 통행량'], ['차량 통행량']],
    iotType: 'svd',
    illegalParking: false,
  },
  9: {
    title: '개소 9',
    category: [['행자 통행량'], ['차량 통행량']],
    iotType: 'svd',
    illegalParking: false,
  },
  10: {
    title: '개소 10;',
    category: [['보행자 통행량'], ['차량 통행량']],
    iotType: 'svd',
    illegalParking: false,
  },
  11: {
    title: '개소 11',
    category: [['보행자 통행량'], ['차량 통행량']],
    iotType: 'svd',
    illegalParking: false,
  },
  12: {
    title: '개소 12',
    category: [['보행자 통행량'], ['차량 통행량']],
    iotType: 'svd',
    illegalParking: false,
  },
  13: {
    title: '개소 13',
    category: [['보행자 통행량'], ['차량 통행량']],
    iotType: 'svd',
    illegalParking: false,
  },
};

export const timeRanges = [
  ['00 ~ 01', '01 ~ 02', '02 ~ 03', '03 ~ 04', '04 ~ 05', '05 ~ 06', '06 ~ 07', '07 ~ 08'],
  ['08 ~ 09', '09 ~ 10', '10 ~ 11', '11 ~ 12', '12 ~ 13', '13 ~ 14', '14 ~ 15', '15 ~ 16'],
  ['16 ~ 17', '17 ~ 18', '18 ~ 19', '19 ~ 20', '20 ~ 21', '21 ~ 22', '22 ~ 23', '23 ~ 24'],
];

export const menu = {
  1: {
    title: '시스템 점검(상태): 자동 수집 정보',
    sheetRange: 'B4:L4',
    range: {
      sheetId,
      startRowIndex: 3,
      endRowIndex: 4,
      startColumnIndex: 1,
      endColumnIndex: 13
    }
  },
  2: {
    title: '개소별 현황',
    sheetRange: 'B9:L9',
    range: {
      sheetId,
      startRowIndex: 8,
      endRowIndex: 9,
      startColumnIndex: 1,
      endColumnIndex: 13 
    }
  }
};

export const collectionList = [
  ['전광판', 'cctv', '경관조명', '로고젝터', '지향성 스피커'],
  ['동작중', '동작중', '동작중', '동작중', '동작중']
];