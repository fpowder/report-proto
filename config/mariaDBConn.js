import mysql from 'mysql2';

const db = {
    gch: {
        host: '192.168.1.7',
        port: 13306,
        user: 'devuser',
        password: 'alta0204',
        database: 'gch',
        connectionLimit: 10000,
        multipleStatements: true
    }
}

const promisePool = mysql.createPool(db.gch).promise();
export default promisePool;