import { 
    startOfWeek, endOfWeek, subMilliseconds, 
    fromUnixTime, getUnixTime,
    getYear, getMonth, parseISO,
    startOfYesterday, endOfYesterday 
} from 'date-fns';
import dateFnsTz from 'date-fns-tz';
// import { scheduleJob } from 'node-schedule';

const { utcToZonedTime, format } = dateFnsTz;
const timeZone = 'Asia/Seoul';
const dataPattern = 'yyyy-MM-dd HH:mm:ss';
const innerCellPattern = 'yyyy. MM. dd.';
const filenamePattern = 'yyyy-MM-dd';


/**
 * 매주 월요일이 되자마자 301초를 뺀 후 
 * 바로 이전주의 시작일과 마지막일 계산
 * 매주 월요일 00시 5분에 301초를 뺀 unix timestamp를 계산하여 전주 시작일과 끝일을 구하는데 사용
 * sow -> start of week
 * eow -> end of week
 * @param {*} date 
 * @returns { sow: sowStr, eow: eowStr }
 */
export const getWeekStartEnd = () => {
    const zonedDate = utcToZonedTime(new Date(), timeZone);
    const sody = startOfYesterday(zonedDate);

    const sow = startOfWeek(sody, { weekStartsOn: 1 });
    const eow = endOfWeek(sody, { weekStartsOn: 1 });

    const sowStr = format(sow, dataPattern, { timeZone: timeZone });
    const eowStr = format(eow, dataPattern, { timeZone: timeZone });

    return {
        sow: sowStr,
        eow: eowStr,
        year: getYear(sow),
        month: getMonth(sow)
    }
}

/**
 * sow -> start of week
 * eow -> end of week
 * @param {*} date 
 * @returns { sow: sowStr, eow: eowStr }
 */
export const getWeekStartEndDate = () => {
    const zonedDate = utcToZonedTime(new Date(), timeZone);
    const sody = startOfYesterday(zonedDate);

    const sow = startOfWeek(sody, { weekStartsOn: 1 });
    const eow = endOfWeek(sody, { weekStartsOn: 1 });

    const sowStr = format(sow, innerCellPattern, { timeZone: timeZone });
    const eowStr = format(eow, innerCellPattern, { timeZone: timeZone });

    return {
        sow: sowStr,
        eow: eowStr,
        year: getYear(sow),
        month: getMonth(sow)
    }
}

export const getWeekStartEndDate2 = () => {
    const zonedDate = utcToZonedTime(new Date(), timeZone);
    const sody = startOfYesterday(zonedDate);

    const sow = startOfWeek(sody, { weekStartsOn: 1 });
    const eow = endOfWeek(sody, { weekStartsOn: 1 });

    const sowStr = format(sow, filenamePattern, { timeZone: timeZone });
    const eowStr = format(eow, filenamePattern, { timeZone: timeZone });

    return {
        sow: sowStr,
        eow: eowStr,
        year: getYear(sow),
        month: getMonth(sow)
    };
};

/**
 * 전날 시작 시간 및 종료일 
 * @param {*} date 
 * @returns 
 */
export const yesterdayStartEnd = () => {
    const zonedDate = utcToZonedTime(new Date(), timeZone);

    const sody = startOfYesterday(zonedDate);
    const eody = endOfYesterday(zonedDate);

    const sod = format(sody, dataPattern, { timeZone: timeZone });
    const eod = format(eody, dataPattern, { timeZone: timeZone });

    return {
        sod: sod,
        eod: eod
    }
}

export const isUtcHandler = (dateStr) => {
    const date = parseISO(dateStr);
    // if timezone is utc change to timezone as asia/seoul
    if(date.toISOString().endsWith('Z')) {
        const seoulDate = utcToZonedTime(date, 'Asia/Seoul');
        return format(seoulDate, dataPattern);
    } else return dateStr;
}

(() =>{
    console.log(yesterdayStartEnd());
})();

/* (() => {
    // 일요일 테스트
    scheduleJob('0 0 * * 7', () => {
        const date = new Date();
        const zonedDate = utcToZonedTime(date, timeZone);

        const curDate = format(zonedDate, dataPattern, { timeZone: timeZone });
        console.log('current Date : ' + curDate);

        const unixTime = getUnixTime(zonedDate);
        const subMilliSubSec = getUnixTime(subMilliseconds(zonedDate, 1000));

        console.log('unixTime now : ' + unixTime);
        console.log('unixTime submilliseconds 1000 : ' + subMilliSubSec);

        console.log(format(fromUnixTime(unixTime), dataPattern, { timeZone: timeZone }));
        console.log(format(fromUnixTime(subMilliSubSec), dataPattern, { timeZone: timeZone }));

        const subSecFormerDate = fromUnixTime(subMilliSubSec);
        const sow = startOfWeek(subSecFormerDate, { weekStartsOn: 1 });
        const eow = endOfWeek(subSecFormerDate, { weekStartsOn: 1 });

        const sowStr = format(sow, dataPattern, { timeZone: timeZone });
        const eowStr = format(eow, dataPattern, { timeZone: timeZone });

        console.log('Start of Week : ' + sowStr);
        console.log('End of Week : ' + eowStr);

    });
})(); */