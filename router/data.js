import express from 'express';
import promisePool from '../config/mariaDBConn.js'
import { isMatch } from 'date-fns';
import { url, tdPath, illegalPath } from '../config/source.js';
import axios from 'axios';

const datePattern = 'yyyy-MM-dd HH:mm:ss';
const dataRouter = express.Router();
dataRouter.get('/td/sync', async(req, res) => {

    if(!(req.query.start || req.query.end)) {
        res.status(400).send({
            message: `start and paramr must be included`
        });
        return;
    }
    
    if(!(isMatch(req.query.start) || isMatch(req.query.end))) {
        res.status(400).send({
            message: `start or end param date pattern is not ${datePattern}`
        });
        return;
    }

    const insertTdSql = `
        INSERT INTO traffic_data 
            (no, ins_no, cctv_no, c_density_in, c_density_out, ped_count, car_out_count, ped_out_count, car_count, p_density, uptime) 
        VALUES ?;
    `;

    // create data base connection
    const conn = await promisePool.getConnection();
    try {
        
        const start = req.query.start;
        const end = req.query.end;
        
        const dataForInsert = await axios.get(`${url}${tdPath}`, { params: { start, end }});
        
        let mtstParam = [];
        for(let eachRow of dataForInsert.data) {
            let value = [];
            value.push(eachRow.no);
            value.push((() => {
                if(typeof eachRow.ins_no === 'string') {
                    return parseInt(eachRow.ins_no);
                }
                return eachRow.ins_no;
            })());
            value.push((() => {
                if(typeof eachRow.cctv_no === 'string') {
                    return parseInt(eachRow.cctv_no);
                }
                return eachRow.cctv_no;
            })());
            value.push(
                eachRow.c_density_in, eachRow.c_density_out, 
                eachRow.ped_count, eachRow.car_out_count,
                eachRow.ped_out_count, eachRow.car_count,
                eachRow.p_density, eachRow.uptime
            );

            mtstParam.push(value);
        }

        const executeResult = await conn.query(insertTdSql, [ mtstParam ]);

        res.status(200).send({
            message: `traffic data sync complete`,
            executeResult: executeResult
        });
        
    } catch(err) {
        console.log(err);
        res.status(400).send({
            message: `can't sync traffic data.`,
            err: err
        });
    } finally {
        conn.release();
    }

});

dataRouter.get('/illegal/sync', async(req, res) => {
    if (!(req.query.start || req.query.end)) {
      res.status(400).send({
        message: `start and paramr must be included`,
      });
      return;
    }
    if (
      !(
        isMatch(req.query.start, datePattern) ||
        isMatch(req.query.end, datePattern)
      )
    ) {
      res.status(400).send({
        message: `start or end param date pattern is not ${datePattern}`,
      });
      return;
    }

    const insertTdSql = `
        INSERT INTO illegal_parking_table 
            (i_no, i_ins_no, cctv_no, illegal_in_time, illegal_out_time) 
        VALUES ?;
    `;

    // create data base connection
    const conn = await promisePool.getConnection();
    try {
      const start = req.query.start;
      const end = req.query.end;

      const dataForInsert = await axios.get(`${url}${illegalPath}`, {
        params: { start, end },
      });

      let mtstParam = [];
      for (let eachRow of dataForInsert.data) {
        if(eachRow.i_ins_no === 4) continue;
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

      const executeResult = await conn.query(insertTdSql, [mtstParam]);

      res.status(200).send({
        message: `illegal data sync complete`,
        executeResult: executeResult,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send({
        message: `can't sync illegal data.`,
        err: err,
      });
    } finally {
      conn.release();
    }
});

export default dataRouter;