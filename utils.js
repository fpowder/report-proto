import { startOfWeek, endOfWeek, subMilliseconds, fromUnixTime, getUnixTime } from 'date-fns';
import dateFnsTz from 'date-fns-tz';
import { scheduleJob } from 'node-schedule';

const { utcToZonedTime, format } = dateFnsTz;

export const getWeekStartEnd = () => {
    const curr = new Date;
    console.log('curr', curr);

    const first = curr.getDate() - curr.getDay() + 1;
    const last = first + 6;

    const firstDay = new Date(curr.setDate(first));
    const lastDay = new Date(curr.setDate(last));

    console.log('firstDay', firstDay );
    console.log('lastDay', lastDay);

    const date = new Date();
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
    // const date = new Date();
    // const timeZone = 'Asia/Seoul';
    // const zonedDate = utcToZonedTime(date, timeZone);

    // console.log(zonedDate);

    // const pattern = 'yyyy-MM-dd HH:mm:ss';
    // // const output = format(zonedDate, pattern, { timeZone: 'Asia/Seoul' });
    // const output = format(zonedDate, pattern, { timeZone: timeZone });

    // console.log(output);

    // const sow = startOfWeek(zonedDate, { weekStartsOn: 1 });
    // const eow = endOfWeek(zonedDate, { weekStartsOn: 1 });

    // const sowStr = format(sow, pattern, { timeZone: timeZone });
    // const eowStr = format(eow, pattern, { timeZone: timeZone });

    // console.log('Start of Week : ' + sowStr);
    // console.log('End of Week : ' + eowStr);

    // const unixTime = getUnixTime(zonedDate);
    // const subMilliOneSec = getUnixTime(subMilliseconds(zonedDate, 1000));
    
    // console.log('date milliseconds : ' + unixTime);
    // console.log('date subbilliseconds 1000 milliseconds : ' + subMilliOneSec);

    // console.log(format(fromUnixTime(unixTime), pattern, { timeZone: timeZone }));
    // console.log(format(fromUnixTime(subMilliOneSec), pattern, { timeZone: timeZone }));

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