import {  } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz'

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
 * 
    select
        CAST(ins_no AS integer) as ins_no,
        date_format(uptime, '%H %p') as hour,
        sum(car_count) as total_car_cnt,
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

getWeekStartEnd();