import { startOfWeek, endOfWeek, subMilliseconds, fromUnixTime, getUnixTime } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import { scheduleJob } from 'node-schedule';

const { utcToZonedTime, format } = dateFnsTz;


/**
 * 매주 월요일이 되자마자 1초를 뺀 후 
 * 바로 이전주의 시작일과 마지막일 계산
 * sow -> start of week
 * eow -> end of week
 * @param {*} date 
 * @returns { sow: sowStr, eow: eowStr }
 */
export const getWeekStartEnd = (date) => {
    
    const timeZone = 'Asia/Seoul';
    const zonedDate = utcToZonedTime(date, timeZone);

    const pattern = 'yyyy-MM-dd HH:mm:ss';

    const curDate = format(zonedDate, pattern, { timeZone: timeZone });
    console.log('current Date : ' + curDate);

    const unixTime = getUnixTime(zonedDate);
    const subMilliOneSec = getUnixTime(subMilliseconds(zonedDate, 1000));

    console.log('unixTime now : ' + unixTime);
    console.log('unixTime submilliseconds 1000 : ' + subMilliOneSec);

    console.log(format(fromUnixTime(unixTime), pattern, { timeZone: timeZone }));
    console.log(format(fromUnixTime(subMilliOneSec), pattern, { timeZone: timeZone }));

    const oneSecFormerDate = fromUnixTime(subMilliOneSec);
    const sow = startOfWeek(oneSecFormerDate, { weekStartsOn: 1 });
    const eow = endOfWeek(oneSecFormerDate, { weekStartsOn: 1 });

    const sowStr = format(sow, pattern, { timeZone: timeZone });
    const eowStr = format(eow, pattern, { timeZone: timeZone });

    console.log('Start of Week : ' + sowStr);
    console.log('End of Week : ' + eowStr);

    return {
        sow: sowStr,
        eow: eowStr
    }
}

/** query sample
 * 
    select
        CAST(ins_no AS integer) as ins_no,
        date_format(uptime, '%H %p') as hour,
        sum(car_count) as car_count,
        AVG(p_density) as p_density,
        sum(ped_count) as ped_count
    from
        traffic_data
    WHERE
        uptime between "2023-01-01 00:00:00" AND "2023-01-07 23:59:59"
    group by
        ins_no asc, date_format(uptime, '%H %p')
    order by ins_no, hour asc;
 * 
 */

// getWeekStartEnd();

(() => {
    // every Monday check
    scheduleJob('0 0 * * 1', () => {
        const date = new Date();
        const timeZone = 'Asia/Seoul';
        const zonedDate = utcToZonedTime(date, timeZone);

        const pattern = 'yyyy-MM-dd HH:mm:ss';

        const curDate = format(zonedDate, pattern, { timeZone: timeZone });
        console.log('current Date : ' + curDate);

        const unixTime = getUnixTime(zonedDate);
        const subMilliOneSec = getUnixTime(subMilliseconds(zonedDate, 1000));

        console.log('unixTime now : ' + unixTime);
        console.log('unixTime submilliseconds 1000 : ' + subMilliOneSec);

        console.log(format(fromUnixTime(unixTime), pattern, { timeZone: timeZone }));
        console.log(format(fromUnixTime(subMilliOneSec), pattern, { timeZone: timeZone }));

        const oneSecFormerDate = fromUnixTime(subMilliOneSec);
        const sow = startOfWeek(oneSecFormerDate, { weekStartsOn: 1 });
        const eow = endOfWeek(oneSecFormerDate, { weekStartsOn: 1 });

        const sowStr = format(sow, pattern, { timeZone: timeZone });
        const eowStr = format(eow, pattern, { timeZone: timeZone });

        console.log('Start of Week : ' + sowStr);
        console.log('End of Week : ' + eowStr);

    });
})();