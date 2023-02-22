import promisePool from '../config/mariaDBConn.js';
import { insMeta } from '../spreadsheetConf/area.js';
import { getWeekStartEnd } from '../common/utils.js';

export const createTotalWeek = async() => {

    const weekStartEnd = getWeekStartEnd();
    const sow = weekStartEnd.sow;
    const eow = weekStartEnd.eow;

    // test date
    // const sow = '2023-01-13 00:00:00';
    // const eow = '2023-01-19 23:59:59';
    
    let tdSql = `
        SELECT
            T.hour as hour,
            CAST(IFNULL(td.ped_count, 0) as signed) as ped_count,
            CAST(IFNULL(td.car_count, 0) as signed) as car_count,
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
                    sum(ped_count) as ped_count,
                    sum(car_count) as car_count,
                    CAST(ROUND(AVG(p_density), 1) as DOUBLE) as p_density
                FROM
                    traffic_data
                WHERE uptime BETWEEN '${sow}' AND '${eow}' GROUP BY hour
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
                    illegal_in_time 
                BETWEEN '${sow}' AND '${eow}' GROUP BY hour
            ) AS illegal
        ON T.hour = illegal.hour;
    `;

    const conn = await promisePool.getConnection();
    try {
      let [tdRows] = await conn.query(tdSql);
      let [illegalRows] = await conn.query(illegalSql);

      const eachHourData = [];
      let ped = [], car = [], illegal = [];
      let pedCnt = 0, carCnt = 0, illegalCnt = 0;
      /**
       * make data set like
       * [
       *    [
       *       [....],[....],[....]
       *    ],
       *    [
       *       [....],[....],[....]
       *    ],
       *    [
       *       [....],[....],[....]
       *    ],
       * ]
       */
      for (let i = 0; i < 24; i++) {
        // console.log(typeof tdRows[i].ped_count);
        ped.push(tdRows[i].ped_count);
        car.push(tdRows[i].car_count);
        illegal.push(illegalRows[i].illegal_cnt);

        pedCnt += tdRows[i].ped_count;
        carCnt += tdRows[i].car_count;
        illegalCnt += illegalRows[i].illegal_cnt;

        // 00 ~ 07, 08 ~ 15, 16 ~ 23 단위로 나눈다.
        if ((i + 1) % 8 === 0) {
          const temp = [];
          temp.push(ped, car, illegal);
          eachHourData.push(temp);
          ped = []; car = []; illegal = []; // 초기화
        }
      }

      return {
        hour: eachHourData,
        total: [[`보행자 통행량 : ${pedCnt}`], [`차량 통행량: ${carCnt}`], [`불법주정차 수: ${illegalCnt}`]],
      };
    } catch(e) {
        console.log('error occurred on createTotalWeek data for google spreadsheet');
        console.log(e);
    } finally {
        conn.release();
    }

}

export const createInsWeek = async (insNo) => {
  const weekStartEnd = getWeekStartEnd();
  const sow = weekStartEnd.sow;
  const eow = weekStartEnd.eow;

  /**
   * 주의
   * traffic_data의 ins_no는 뻐킹 varchar(2)로 되어있음
   * illegal_parking_table의 i_ins_no는 int(11)
   */
  const insNoStr = insNo.toString();
  const insNoNum = parseInt(insNo);

  const eachInsMeta = insMeta[insNoStr];

  const iotType = eachInsMeta.iotType;
  const ifIllegalParking = eachInsMeta.illegalParking;

  let tdSql = `
        SELECT
            T.hour as hour,
            CAST(IFNULL(td.ped_count, 0) as signed) as ped_count,
            CAST(IFNULL(td.car_count, 0) as signed) as car_count,
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
                    sum(ped_count) as ped_count,
                    sum(car_count) as car_count,
                    CAST(ROUND(AVG(p_density), 1) as DOUBLE) as p_density
                FROM
                    traffic_data
                WHERE 
                    ins_no = ${insNoStr}
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

    const eachHourData = [];
    let ped = [],
      pDen = [],
      car = [],
      illegal = [];
    let pedCnt = 0,
      pDensityAvg = 0.0,
      carCnt = 0,
      illegalCnt = 0;

    for (let i = 0; i < 24; i++) {
      pDensityAvg += tdRows[i].p_density;
      pedCnt += tdRows[i].ped_count;
      carCnt += tdRows[i].car_count;

      pDen.push(tdRows[i].p_density);
      ped.push(tdRows[i].ped_count);
      car.push(tdRows[i].car_count);

      // 불법 주정차 데이터를 수집할경우에만 삽입
      if (ifIllegalParking) {
        illegal.push(illegalRows[i].illegal_cnt);
        illegalCnt += illegalRows[i].illegal_cnt;
      }

      if ((i + 1) % 8 === 0) {
        const temp = [];
        if (iotType === 'sad') {
          temp.push(pDen, car, illegal);
        } else {
          temp.push(ped, car, illegal);
        }

        eachHourData.push(temp);
        ped = [];
        car = [];
        illegal = [];
        pDen = [];
      }
    } // for

    return {
      hour: eachHourData,
      total: [
        (() => {
          if (iotType === 'sad') {
            const pDen = parseFloat((pDensityAvg / 24).toFixed(1));
            return [`보행자 점유율 평균: ${pDen}`];
          } else {
            return [`보행자 통행량: ${pedCnt}`];
          }
        })(),
        [`차량 통행량: ${carCnt}`],
        (() => {
          if (ifIllegalParking) {
            return [`불법주정차 수: ${illegalCnt}`];
          } else {
            return [];
          }
        })(),
      ],
    };
  } catch (e) {
    console.log(
      'error occurred on createTotalWeek data for google spreadsheet'
    );
    console.log(e);
  } finally {
    conn.release();
  }
};

export const createTotalWeekByTerm = async (sow, eow) => {

  let tdSql = `
        SELECT
            T.hour as hour,
            CAST(IFNULL(td.ped_count, 0) as signed) as ped_count,
            CAST(IFNULL(td.car_count, 0) as signed) as car_count,
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
                    sum(ped_count) as ped_count,
                    sum(car_count) as car_count,
                    CAST(ROUND(AVG(p_density), 1) as DOUBLE) as p_density
                FROM
                    traffic_data
                WHERE uptime BETWEEN '${sow}' AND '${eow}' GROUP BY hour
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
                    illegal_in_time 
                BETWEEN '${sow}' AND '${eow}' GROUP BY hour
            ) AS illegal
        ON T.hour = illegal.hour;
    `;

  const conn = await promisePool.getConnection();
  try {
    let [tdRows] = await conn.query(tdSql);
    let [illegalRows] = await conn.query(illegalSql);

    const eachHourData = [];
    let ped = [],
      car = [],
      illegal = [];
    let pedCnt = 0,
      carCnt = 0,
      illegalCnt = 0;
    /**
     * make data set like
     * [
     *    [
     *       [....],[....],[....]
     *    ],
     *    [
     *       [....],[....],[....]
     *    ],
     *    [
     *       [....],[....],[....]
     *    ],
     * ]
     */
    for (let i = 0; i < 24; i++) {
      // console.log(typeof tdRows[i].ped_count);
      ped.push(tdRows[i].ped_count);
      car.push(tdRows[i].car_count);
      illegal.push(illegalRows[i].illegal_cnt);

      pedCnt += tdRows[i].ped_count;
      carCnt += tdRows[i].car_count;
      illegalCnt += illegalRows[i].illegal_cnt;

      // 00 ~ 07, 08 ~ 15, 16 ~ 23 단위로 나눈다.
      if ((i + 1) % 8 === 0) {
        const temp = [];
        temp.push(ped, car, illegal);
        eachHourData.push(temp);
        ped = [];
        car = [];
        illegal = []; // 초기화
      }
    }

    return {
      hour: eachHourData,
      total: [
        [`보행자 통행량 : ${pedCnt}`],
        [`차량 통행량: ${carCnt}`],
        [`불법주정차 수: ${illegalCnt}`],
      ],
    };
  } catch (e) {
    console.log(
      'error occurred on createTotalWeekByTerm data for google spreadsheet'
    );
    console.log(e);
  } finally {
    conn.release();
  }
};

export const createInsWeekByTerm = async (insNo, sow, eow) => {
  /**
   * 주의
   * traffic_data의 ins_no는 뻐킹 varchar(2)로 되어있음
   * illegal_parking_table의 i_ins_no는 int(11)
   */
  const insNoStr = insNo.toString();
  const insNoNum = parseInt(insNo);

  const eachInsMeta = insMeta[insNoStr];

  const iotType = eachInsMeta.iotType;
  const ifIllegalParking = eachInsMeta.illegalParking;

  let tdSql = `
        SELECT
            T.hour as hour,
            CAST(IFNULL(td.ped_count, 0) as signed) as ped_count,
            CAST(IFNULL(td.car_count, 0) as signed) as car_count,
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
                    sum(ped_count) as ped_count,
                    sum(car_count) as car_count,
                    CAST(ROUND(AVG(p_density), 1) as DOUBLE) as p_density
                FROM
                    traffic_data
                WHERE 
                    ins_no = ${insNoStr}
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

    const eachHourData = [];
    let ped = [],
      pDen = [],
      car = [],
      illegal = [];
    let pedCnt = 0,
      pDensityAvg = 0.0,
      carCnt = 0,
      illegalCnt = 0;

    for (let i = 0; i < 24; i++) {
      pDensityAvg += tdRows[i].p_density;
      pedCnt += tdRows[i].ped_count;
      carCnt += tdRows[i].car_count;

      pDen.push(tdRows[i].p_density);
      ped.push(tdRows[i].ped_count);
      car.push(tdRows[i].car_count);

      // 불법 주정차 데이터를 수집할경우에만 삽입
      if (ifIllegalParking) {
        illegal.push(illegalRows[i].illegal_cnt);
        illegalCnt += illegalRows[i].illegal_cnt;
      }

      if ((i + 1) % 8 === 0) {
        const temp = [];
        if (iotType === 'sad') {
          temp.push(pDen, car, illegal);
        } else {
          temp.push(ped, car, illegal);
        }

        eachHourData.push(temp);
        ped = [];
        car = [];
        illegal = [];
        pDen = [];
      }
    } // for

    return {
      hour: eachHourData,
      total: [
        (() => {
          if (iotType === 'sad') {
            const pDen = parseFloat((pDensityAvg / 24).toFixed(1));
            return [`보행자 점유율 평균: ${pDen}`];
          } else {
            return [`보행자 통행량: ${pedCnt}`];
          }
        })(),
        [`차량 통행량: ${carCnt}`],
        (() => {
          if (ifIllegalParking) {
            return [`불법주정차 수: ${illegalCnt}`];
          } else {
            return [];
          }
        })(),
      ],
    };
  } catch (e) {
    console.log(
      'error occurred on createInsWeekByTerm data for google spreadsheet'
    );
    console.log(e);
  } finally {
    conn.release();
  }
};

// (async() => {
//     await createInsWeek(5);
// })();