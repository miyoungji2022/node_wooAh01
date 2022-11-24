// db.config.js 파일을 이용하여 MySQL DB 연결
const mysql = require('mysql');
const dbConfig = require('../config/db.confg');

//createConnection()메서드로 연결 객체(connection) 정의
const conn = mysql.createConnection({
    host:dbConfig.host,
    user:dbConfig.user,
    password:dbConfig.password,
    database:dbConfig.db,
    ssl:dbConfig.ssl
});


// connect() 메서드로 MySQL DB에 연결
conn.connect( error => {
    if(error) {
        console.error('연결 에러 발생 : ' + error);
    }
    else {
        console.log(`성공적으로 ${dbConfig.db} 데이터베이스에 연결되었습니다.`);
    }
});

module.exports = conn;
