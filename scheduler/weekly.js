import { scheduleJob } from 'node-schedule';
import { getDayStartEnd } from '../common/utils.js';
import { url, tdPath, illegalPath } from '../config/source.js'
import promisePool from '../config/mariaDBConn.js';
import { illegalPath, tdPath } from '../config/source';

export const dailySyncJob = () => {
    scheduleJob('0 0 * * *', async() => {

        let dailyTd; let dailyIllegal;

        // get data from server
        try {
            const prevDayStartEnd = getDayStartEnd(new Date());
            const start = prevDayStartEnd.sod;
            const end = prevDayStartEnd.eod;
            
            dailyTd = await axios.get(`${url}${tdPath}`, { params: { start, end } }).data;
            dailyIllegal = await axios.get(`${url}${illegalPath}`, {
              params: { start, end },
            }).data;

        } catch(err) {
            console.log('error occured on daily data sync');
        }
        
        const insertTdSql = `
            INSERT INTO traffic_data 
                (no, ins_no, cctv_no, c_density_in, c_density_out, ped_count, car_out_count, ped_out_count, car_count, p_density, uptime) 
            VALUES ?;
        `;

        const insertIllegalSql = `
            INSERT INTO illegal_parking_table 
                (i_no, i_ins_no, cctv_no, illegal_in_time, illegal_out_time) 
            VALUES ?;
        `;

        const conn = await promisePool.getConnection();
        try {
            // daily traffic data sync
            let mtstParam = [];
            for (let eachRow of dailyTd) {
              let value = [];
              value.push(eachRow.no);
              value.push(
                (() => {
                  if (typeof eachRow.ins_no === 'string') {
                    return parseInt(eachRow.ins_no);
                  }
                  return eachRow.ins_no;
                })()
              );
              value.push(
                (() => {
                  if (typeof eachRow.cctv_no === 'string') {
                    return parseInt(eachRow.cctv_no);
                  }
                  return eachRow.cctv_no;
                })()
              );
              value.push(
                eachRow.c_density_in,
                eachRow.c_density_out,
                eachRow.ped_count,
                eachRow.car_out_count,
                eachRow.ped_out_count,
                eachRow.car_count,
                eachRow.p_density,
                eachRow.uptime
              );

              mtstParam.push(value);
            }

            const tdInsertResult = await conn.query(insertTdSql, [mtstParam]);

            // daily illegal data sync
            mtstParam = [];
            for (let eachRow of dailyIllegal) {
              if (eachRow.i_ins_no === 4) continue;
              let value = [];
              value.push(
                eachRow.i_no,
                eachRow.i_ins_no,
                eachRow.cctv_no,
                eachRow.illegal_in_time,
                eachRow.illegal_out_time
              );
              mtstParam.push(value);
            }

            const illegalInsertResult = await conn.query(insertIllegalSql, [
              mtstParam,
            ]);
        } catch(err) {
            console.log(err);
        } finally {
            conn.release();
        }
    });
};