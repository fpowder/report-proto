import axios from 'axios';
import { scheduleJob } from 'node-schedule';
import { yesterdayStartEnd, isUtcHandler } from '../common/utils.js';
import { url, tdPath, illegalPath } from '../config/source.js';

import promisePool from '../config/mariaDBConn.js';

import { logger } from '../logger.js';

export const dailySyncJob = () => {
    // 매일 00시 00분
    // scheduleJob('0 0 * * *', async () => {
    scheduleJob(`06 * * * *`, async () => {
        let dailyTd;
        let dailyIllegal;

        // get data from server
        try {
            const prevDayStartEnd = yesterdayStartEnd();
            const start = prevDayStartEnd.sod;
            const end = prevDayStartEnd.eod;

            dailyTd = (await axios.get(`${url}${tdPath}`, { params: { start, end } })).data;
            dailyIllegal = (await axios.get(`${url}${illegalPath}`, {
                params: { start, end },
            })).data;
        } catch (err) {
            logger.info('error occured on daily data sync');
            logger.error(err);
        }

        const insertTdSql = `
                INSERT IGNORE INTO traffic_data 
                    (no, ins_no, cctv_no, c_density_in, c_density_out, ped_count, car_out_count, ped_out_count, car_count, p_density, uptime) 
                VALUES ?;
            `;

        const insertIllegalSql = `
                INSERT IGNORE INTO illegal_parking_table 
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
                    (() => {
                        return isUtcHandler(eachRow.uptime);
                    })()
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
                    (() => {
                        if (eachRow.illegal_in_time) {
                          return isUtcHandler(eachRow.illegal_in_time);
                        } else return null;
                    })(),
                    (() => {
                        if(eachRow.illegal_in_time) {
                            return isUtcHandler(eachRow.illegal_out_time);
                        } else return null;
                    })()
                );
                mtstParam.push(value);
            }

            const illegalInsertResult = await conn.query(insertIllegalSql, [
                mtstParam,
            ]);

            logger.info(tdInsertResult);
            logger.info(illegalInsertResult);

        } catch (err) {
            logger.error('error occured on daily traffic, illegal data');
            logger.error(err);
        } finally {
            conn.release();
        }
    });
};
