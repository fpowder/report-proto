import promisePool from '../config/mariaDBConn.js';
import { getWeekStartEnd } from '../utils.js';

export const createTotalWeek = async() => {

    const weekStartEnd = getWeekStartEnd(new Date());
    // const sow = weekStartEnd.sow;
    // const eow = weekStartEnd.eow;

    const sow = '2023-01-01 00:00:00';
    const eow = '2023-01-07 23:59:59';

    let tdSql =`
        SELECT
            T.hour as hour,
            IFNULL(td.ped_count, 0) as ped_count,
            IFNULL(td.car_count, 0) as car_count,
            td.p_density as p_density
        FROM
            (
                SELECT @N := @N + 1 AS hour
                FROM traffic_data, (SELECT @N := -1 from dual) NN LIMIT 24
            ) AS T
        LEFT JOIN
            (
                SELECT
                    date_format(uptime, '%H') as hour,
                    sum(car_count) as car_count,
                    ROUND(AVG(p_density), 1) as p_density,
                    sum(ped_count) as ped_count
                FROM
                    traffic_data
                WHERE uptime BETWEEN '${sow}' AND '${eow}'
                GROUP BY hour
            ) AS td
        ON T.hour = td.hour;
    `;

    let illegalSql = `
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
                WHERE illegal_in_time BETWEEN '${sow}' AND '${eow}'
                GROUP BY hour
            ) AS illegal
        ON T.hour = illegal.hour;
    `;

    const conn = await promisePool.getConnection();
    try {
        let [tdRows] = await conn.query(tdSql);
        let [illegalRows] = await conn.query(illegalSql);

        const sheetRowData = [];
        let pedCnt = [];
        let carCnt = [];
        let illegalCnt = [];

        for(let i = 0; i < 24; i++){
            pedCnt.push(tdRows[i].ped_count);
            carCnt.push(tdRows[i].car_count);
            illegalCnt.push(illegalRows[i].illegal_cnt);
            if((i+1) % 8 === 0){
                const temp = [];
                temp.push(pedCnt, carCnt, illegalCnt);
                sheetRowData.push(temp);
                pedCnt = []; carCnt = []; illegalCnt = [];
            }
        }

        return sheetRowData;

    } catch(e) {
        console.log('error occurred on createTotalWeek data for google spreadsheet');
        console.log(e);
    } finally {
        conn.release();
    }

}

export const createInsWeek = async(insNo) => {
    const weekStartEnd = getWeekStartEnd(new Date());
    // const sow = weekStartEnd.sow;
    // const eow = weekStartEnd.eow;

    const sow = '2023-01-01 00:00:00';
    const eow = '2023-01-07 23:59:59';

    /**
     * 주의 
     * traffic_data의 ins_no는 뻐킹 varchar(2)로 되어있음
     * illegal_parking_table의 i_ins_no는 int(11)
     */
    const insNoStr = new String(insNo);
    const insNoNum = parseInt(insNo);

    let tdSql = `
        SELECT
            T.hour as hour,
            IFNULL(td.ped_count, 0) as ped_count,
            IFNULL(td.car_count, 0) as car_count,
            td.p_density as p_density
        FROM
            (
                SELECT @N := @N + 1 AS hour
                FROM traffic_data, (SELECT @N := -1 from dual) NN LIMIT 24
            ) AS T
        LEFT JOIN
            (
                SELECT
                    date_format(uptime, '%H') as hour,
                    sum(car_count) as car_count,
                    ROUND(AVG(p_density), 1) as p_density,
                    sum(ped_count) as ped_count
                FROM
                    traffic_data
                WHERE 
                    ins_no = '${insNoStr}'
                AND
                    uptime BETWEEN '${sow}' AND '${eow}'
                GROUP BY hour
            ) AS td
        ON T.hour = td.hour;
    `;

    let illegalSql = `
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
                WHERE
                    i_ins_no = ${insNoNum}
                AND
                    illegal_in_time BETWEEN '${sow}' AND '${eow}'
                GROUP BY hour
            ) AS illegal
        ON T.hour = illegal.hour;
    `;

    const conn = await promisePool.getConnection();
    try {
        let [tdRows] = await conn.query(tdSql);
        let [illegalRows] = await conn.query(illegalSql);

        const sheetRowData = [];
        let pedCnt = [];
        let carCnt = [];
        let illegalCnt = [];

        for(let i = 0; i < 24; i++){
            pedCnt.push(tdRows[i].ped_count);
            carCnt.push(tdRows[i].car_count);
            illegalCnt.push(illegalRows[i].illegal_cnt);
            if((i+1) % 8 === 0){
                const temp = [];
                temp.push(pedCnt, carCnt, illegalCnt);
                sheetRowData.push(temp);
                pedCnt = []; carCnt = []; illegalCnt = [];
            }
        }

        return sheetRowData;

    } catch(e) {
        console.log('error occurred on createTotalWeek data for google spreadsheet');
        console.log(e);
    } finally {
        conn.release();
    }
}

// (async() => {
//     await createInsWeek(5);
// })();