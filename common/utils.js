import { startOfWeek, endOfWeek, subMilliseconds, fromUnixTime, getUnixTime } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
// import { scheduleJob } from 'node-schedule';

const { utcToZonedTime, format } = dateFnsTz;
const timeZone = 'Asia/Seoul';
const pattern = 'yyyy-MM-dd HH:mm:ss';
const datePattern = 'yyyy. MM. dd.';

/**
 * 매주 월요일이 되자마자 1초를 뺀 후 
 * 바로 이전주의 시작일과 마지막일 계산
 * sow -> start of week
 * eow -> end of week
 * @param {*} date 
 * @returns { sow: sowStr, eow: eowStr }
 */
export const getWeekStartEnd = (date) => {
    

    const zonedDate = utcToZonedTime(date, timeZone);

    // const curDate = format(zonedDate, pattern, { timeZone: timeZone });
    // console.log('current Date : ' + curDate);

    // const unixTime = getUnixTime(zonedDate);
    const subMilliOneSec = getUnixTime(subMilliseconds(zonedDate, 1000));

    // console.log('unixTime now : ' + unixTime);
    // console.log('unixTime submilliseconds 1000 : ' + subMilliOneSec);

    // console.log(format(fromUnixTime(unixTime), pattern, { timeZone: timeZone }));
    // console.log(format(fromUnixTime(subMilliOneSec), pattern, { timeZone: timeZone }));

    const oneSecFormerDate = fromUnixTime(subMilliOneSec);
    const sow = startOfWeek(oneSecFormerDate, { weekStartsOn: 1 });
    const eow = endOfWeek(oneSecFormerDate, { weekStartsOn: 1 });

    const sowStr = format(sow, pattern, { timeZone: timeZone });
    const eowStr = format(eow, pattern, { timeZone: timeZone });

    // console.log('Start of Week : ' + sowStr);
    // console.log('End of Week : ' + eowStr);

    return {
        sow: sowStr,
        eow: eowStr
    }
}

/**
 * 매주 월요일이 되자마자 1초를 뺀 후 
 * 바로 이전주의 시작일과 마지막일 계산
 * sow -> start of week
 * eow -> end of week
 * @param {*} date 
 * @returns { sow: sowStr, eow: eowStr }
 */
export const getWeekStartEndDate = (date) => {
    
    const zonedDate = utcToZonedTime(date, timeZone);

    // const curDate = format(zonedDate, datePattern, { timeZone: timeZone });
    // console.log('current Date : ' + curDate);

    // const unixTime = getUnixTime(zonedDate);
    const subMilliOneSec = getUnixTime(subMilliseconds(zonedDate, 1000));

    // console.log('unixTime now : ' + unixTime);
    // console.log('unixTime submilliseconds 1000 : ' + subMilliOneSec);

    // console.log(format(fromUnixTime(unixTime), datePattern, { timeZone: timeZone }));
    // console.log(format(fromUnixTime(subMilliOneSec), datePattern, { timeZone: timeZone }));

    const oneSecFormerDate = fromUnixTime(subMilliOneSec);
    const sow = startOfWeek(oneSecFormerDate, { weekStartsOn: 1 });
    const eow = endOfWeek(oneSecFormerDate, { weekStartsOn: 1 });

    const sowStr = format(sow, datePattern, { timeZone: timeZone });
    const eowStr = format(eow, datePattern, { timeZone: timeZone });

    // console.log('Start of Week : ' + sowStr);
    // console.log('End of Week : ' + eowStr);

    return {
        sow: sowStr,
        eow: eowStr
    }
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
//     scheduleJob('0 0 * * 7', () => {
//         const date = new Date();
//         const zonedDate = utcToZonedTime(date, timeZone);

//         const curDate = format(zonedDate, pattern, { timeZone: timeZone });
//         console.log('current Date : ' + curDate);

//         const unixTime = getUnixTime(zonedDate);
//         const subMilliOneSec = getUnixTime(subMilliseconds(zonedDate, 1000));

//         console.log('unixTime now : ' + unixTime);
//         console.log('unixTime submilliseconds 1000 : ' + subMilliOneSec);

//         console.log(format(fromUnixTime(unixTime), pattern, { timeZone: timeZone }));
//         console.log(format(fromUnixTime(subMilliOneSec), pattern, { timeZone: timeZone }));

//         const oneSecFormerDate = fromUnixTime(subMilliOneSec);
//         const sow = startOfWeek(oneSecFormerDate, { weekStartsOn: 1 });
//         const eow = endOfWeek(oneSecFormerDate, { weekStartsOn: 1 });

//         const sowStr = format(sow, pattern, { timeZone: timeZone });
//         const eowStr = format(eow, pattern, { timeZone: timeZone });

//         console.log('Start of Week : ' + sowStr);
//         console.log('End of Week : ' + eowStr);

//     });
// })();