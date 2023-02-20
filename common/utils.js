import { startOfWeek, endOfWeek, subMilliseconds, fromUnixTime, getUnixTime, startOfDay, endOfDay, getYear, getMonth, parseISO } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
// import { scheduleJob } from 'node-schedule';

const { utcToZonedTime, format } = dateFnsTz;
const timeZone = 'Asia/Seoul';
const pattern = 'yyyy-MM-dd HH:mm:ss';
const datePattern = 'yyyy. MM. dd.';
const datePattern2 = 'yyyy-MM-dd';

/**
 * 전날 및 전주 계산을 위해 추가로 빼는 시간
 * 5초
 */
const subMoreMilli = 5000;

/**
 * 매주 월요일이 되자마자 301초를 뺀 후 
 * 바로 이전주의 시작일과 마지막일 계산
 * 매주 월요일 00시 5분에 301초를 뺀 unix timestamp를 계산하여 전주 시작일과 끝일을 구하는데 사용
 * sow -> start of week
 * eow -> end of week
 * @param {*} date 
 * @returns { sow: sowStr, eow: eowStr }
 */
export const getWeekStartEnd = (date, subSeconds) => {

    const zonedDate = utcToZonedTime(date, timeZone);

    // const curDate = format(zonedDate, pattern, { timeZone: timeZone });
    // console.log('current Date : ' + curDate);

    // const unixTime = getUnixTime(zonedDate);
    const subMilliSubSec = getUnixTime(subMilliseconds(zonedDate, subSeconds * 1000 + subMoreMilli));

    // console.log('unixTime now : ' + unixTime);
    // console.log('unixTime submilliseconds 1000 : ' + subMilliSubSec);

    // console.log(format(fromUnixTime(unixTime), pattern, { timeZone: timeZone }));
    // console.log(format(fromUnixTime(subMilliSubSec), pattern, { timeZone: timeZone }));

    const subSecFormerDate = fromUnixTime(subMilliSubSec);
    const sow = startOfWeek(subSecFormerDate, { weekStartsOn: 1 });
    const eow = endOfWeek(subSecFormerDate, { weekStartsOn: 1 });

    const sowStr = format(sow, pattern, { timeZone: timeZone });
    const eowStr = format(eow, pattern, { timeZone: timeZone });

    // console.log('Start of Week : ' + sowStr);
    // console.log('End of Week : ' + eowStr);

    return {
        sow: sowStr,
        eow: eowStr,
        year: getYear(subSecFormerDate),
        month: getMonth(subSecFormerDate)
    }
}

/**
 * sow -> start of week
 * eow -> end of week
 * @param {*} date 
 * @returns { sow: sowStr, eow: eowStr }
 */
export const getWeekStartEndDate = (date, subSeconds) => {
    
    const zonedDate = utcToZonedTime(date, timeZone);

    // const curDate = format(zonedDate, datePattern, { timeZone: timeZone });
    // console.log('current Date : ' + curDate);

    // const unixTime = getUnixTime(zonedDate);
    const subMilliSubSec = getUnixTime(subMilliseconds(zonedDate, subSeconds * 1000 + subMoreMilli));

    // console.log('unixTime now : ' + unixTime);
    // console.log('unixTime submilliseconds 1000 : ' + subMilliSubSec);

    // console.log(format(fromUnixTime(unixTime), datePattern, { timeZone: timeZone }));
    // console.log(format(fromUnixTime(subMilliSubSec), datePattern, { timeZone: timeZone }));

    const subSecFormerDate = fromUnixTime(subMilliSubSec);
    const sow = startOfWeek(subSecFormerDate, { weekStartsOn: 1 });
    const eow = endOfWeek(subSecFormerDate, { weekStartsOn: 1 });

    const sowStr = format(sow, datePattern, { timeZone: timeZone });
    const eowStr = format(eow, datePattern, { timeZone: timeZone });

    // console.log('Start of Week : ' + sowStr);
    // console.log('End of Week : ' + eowStr);

    return {
        sow: sowStr,
        eow: eowStr,
        year: getYear(subSecFormerDate),
        month: getMonth(subSecFormerDate)
    }
}

export const getWeekStartEndDate2 = (date, subSeconds) => {
    const zonedDate = utcToZonedTime(date, timeZone);

    // const curDate = format(zonedDate, datePattern, { timeZone: timeZone });
    // console.log('current Date : ' + curDate);

    // const unixTime = getUnixTime(zonedDate);
    const subMilliSubSec = getUnixTime(subMilliseconds(zonedDate, subSeconds * 1000 + subMoreMilli));

    // console.log('unixTime now : ' + unixTime);
    // console.log('unixTime submilliseconds 1000 : ' + subMilliSubSec);

    // console.log(format(fromUnixTime(unixTime), datePattern, { timeZone: timeZone }));
    // console.log(format(fromUnixTime(subMilliSubSec), datePattern, { timeZone: timeZone }));

    const subSecFormerDate = fromUnixTime(subMilliSubSec);
    const sow = startOfWeek(subSecFormerDate, { weekStartsOn: 1 });
    const eow = endOfWeek(subSecFormerDate, { weekStartsOn: 1 });

    const sowStr = format(sow, datePattern2, { timeZone: timeZone });
    const eowStr = format(eow, datePattern2, { timeZone: timeZone });

    // console.log('Start of Week : ' + sowStr);
    // console.log('End of Week : ' + eowStr);

    return {
        sow: sowStr,
        eow: eowStr,
        year: getYear(subSecFormerDate),
        month: getMonth(subSecFormerDate)
    };
};

/**
 * 00시가 된 후 subSeconds 만큼 뺀 날짜 바로 전날 시작일 및 종료일을 구한다.
 * - 일일 데이터 동기화 스케줄러에 활용
 * @param {*} date 
 * @returns 
 */
export const getDayStartEnd = (date, subSeconds) => {
    const zonedDate = utcToZonedTime(date, timeZone);

    const subMilliSubSec = getUnixTime(subMilliseconds(zonedDate, subSeconds * 1000 + subMoreMilli));
    
    const subSecFormerDate = fromUnixTime(subMilliSubSec);
    const sod = startOfDay(subSecFormerDate);
    const eod = endOfDay(subSecFormerDate);

    const sodStr = format(sod, datePattern, { timeZone: timeZone });
    const eodStr = format(eod, datePattern, { timeZone: timeZone });

    return {
        sod: sodStr,
        eod: eodStr
    }
}

export const isUtcHandler = (dateStr) => {
    const date = parseISO(dateStr);
    // if timezone is utc change to timezone as asia/seoul
    if(date.toISOString().endsWith('Z')) {
        const seoulDate = utcToZonedTime(date, 'Asia/Seoul');
        return format(seoulDate, pattern);
    } else return dateStr;
}


/** query sample
 * 
    select
        CAST(ins_no AS integer) as ins_no,
        date_format(uptime, '%H') as hour,
        sum(car_count) as car_count,
        ROUND(AVG(p_density), 1) as p_density,
        sum(ped_count) as ped_count
    from
        traffic_data
    WHERE
        uptime between "2023-01-01 00:00:00" AND "2023-01-07 23:59:59"
    group by
        ins_no asc, date_format(uptime, '%H')
    order by ins_no, hour asc;
 * 
 */
/**
    SELECT
        T.hour as hour, IFNULL(illegal.illegal_cnt, 0) as illegal_cnt
    FROM
        (
            SELECT @N := @N + 1 AS hour
            FROM illegal_parking_table, (SELECT @N := -1 from dual) NN LIMIT 24
        ) AS T
    LEFT JOIN
        (
            SELECT
                CAST(DATE_FORMAT(illegal_in_time, '%H') as signed) as hour,
                count(i_no) as illegal_cnt
            FROM
                illegal_parking_table
            WHERE illegal_in_time BETWEEN '2023-01-01 00:00:00' AND '2023-01-07 23:59:59'
            GROUP BY hour
        ) AS illegal
    ON T.hour = illegal.hour;
 */
// getWeekStartEnd();

// (() => {
//     // every Monday check
//     일요일 테스트
//     scheduleJob('0 0 * * 7', () => {
//         const date = new Date();
//         const zonedDate = utcToZonedTime(date, timeZone);

//         const curDate = format(zonedDate, pattern, { timeZone: timeZone });
//         console.log('current Date : ' + curDate);

//         const unixTime = getUnixTime(zonedDate);
//         const subMilliSubSec = getUnixTime(subMilliseconds(zonedDate, 1000));

//         console.log('unixTime now : ' + unixTime);
//         console.log('unixTime submilliseconds 1000 : ' + subMilliSubSec);

//         console.log(format(fromUnixTime(unixTime), pattern, { timeZone: timeZone }));
//         console.log(format(fromUnixTime(subMilliSubSec), pattern, { timeZone: timeZone }));

//         const subSecFormerDate = fromUnixTime(subMilliSubSec);
//         const sow = startOfWeek(subSecFormerDate, { weekStartsOn: 1 });
//         const eow = endOfWeek(subSecFormerDate, { weekStartsOn: 1 });

//         const sowStr = format(sow, pattern, { timeZone: timeZone });
//         const eowStr = format(eow, pattern, { timeZone: timeZone });

//         console.log('Start of Week : ' + sowStr);
//         console.log('End of Week : ' + eowStr);

//     });
// })();