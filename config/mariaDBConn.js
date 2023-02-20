import mysql from 'mysql2';

const db = {
    gch: {
        host: '192.168.1.4',
        port: 3306,
        user: 'alta',
        password: 'alta0204',
        database: 'gch_report',
        connectionLimit: 10000,
        multipleStatements: true
    }
};

const promisePool = mysql.createPool(db.gch).promise();
export default promisePool;