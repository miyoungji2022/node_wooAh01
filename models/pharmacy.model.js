const sql = require('./db.js');

// pharmacy 객체에 속성(property)을 갖는 pharmacy 생성자 함수 정의
const Pharmacy = function(pharmacy){
    this.hpid = pharmacy.hpid;
    this.dutyName = pharmacy.dutyName;
    this.dutyTel1 = pharmacy.dutyTel1;
    this.dutyTime1c = pharmacy.dutyTime1c;
    this.dutyTime2c = pharmacy.dutyTime2c;
    this.dutyTime3c = pharmacy.dutyTime3c;
    this.dutyTime4c = pharmacy.dutyTime4c;
    this.dutyTime5c = pharmacy.dutyTime5c;
    this.dutyTime6c = pharmacy.dutyTime6c;
    this.dutyTime7c = pharmacy.dutyTime7c;
    this.dutyTime8c = pharmacy.dutyTime8c;
    this.dutyTime1s = pharmacy.dutyTime1s;
    this.dutyTime2s = pharmacy.dutyTime2s;
    this.dutyTime3s = pharmacy.dutyTime3s;
    this.dutyTime4s = pharmacy.dutyTime4s;
    this.dutyTime5s = pharmacy.dutyTime5s;
    this.dutyTime6s = pharmacy.dutyTime6s;
    this.dutyTime7s = pharmacy.dutyTime7s;
    this.dutyTime8s = pharmacy.dutyTime8s;
    this.dutyAddr = pharmacy.postAddr;
    this.postCdn1 = pharmacy.postCdn1;
    this.postCdn2 = pharmacy.postCdn2;
    this.dgidIdName = pharmacy.dgidIdName;
    this.wgs84Lon = pharmacy.wgs84Lon;
    this.wgs84Lat = pharmacy.wgs84Lat;
    this.regDate = pharmacy.regDate;
    this.modDate = pharmacy.modDate;
}

// pharmacy 테이블에 pharmacy 추가하는 create() 메서드 
// result는 callback 함수(function), 만일 insert_sql을 실행하는 동안 에러(err)가 발생할 경우 result(err, null) 
// insert_sql이 정상적으로 실행되면 result(null, res) 
Pharmacy.create = (newPharmcy, result) =>{
    console.log('pharmacy.model.js의 pharmacy.create: ' + typeof(result));
    let insert_sql = "INSERT INTO pharmacy SET ?";

    // newPharmacy 새롭게 추가할 pharmacy객체, 
    // err -> insert_sql을 실행하는 동안 에러가 발생할 경우 
    // res -> insert_sql이 성공적으로 실행될 경우 
    sql.query(insert_sql, newPharmacy, (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        }

        console.log("새로운 pharmacy 생성됨 : ", {hpid:res.insertId, ...newPharmacy});
        result(null, {hpid:res.insertId, ...newPharmacy}); //// ...newPharmacy은 pharmacy 객체를 의미
    });
};

// hpid로 pharmacy 테이블에서 검색하는 findById() 메서드
Pharmacy.findById = (hpid, result) => {
    let select_sql = "SELECT * FROM pharmacy WHERE hpid=?";
    sql.query(select_sql, hpid, (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        }   
        
        if(res.length) {
            console.log(" 검색된 pharmacy : ", res[0]);
            result(null, res[0]);
            return;
        }

        //검색된 결과가 없을 경우
        result({select_result:'검색된 결과가 없습니다.'}, null);
    });
}; 

// 모든 pharmacy 검색
Pharmacy.getAll = (query, result) => {
//     let selectall_sql = "SELECT * FROM pharmacy";
//     sql.query(selectall_sql, (err, res) =>{
//         if(err) {
//             console.log("에러 : ", err);
//             result(err, null);
//             return;
//         } 

//         console.log("검색된 pharmacy : ", res);
//         result(null, res);
//     });
// }
    /* 
    전체검색 - /pharmacy?addr=서울시&page=1&limit=20
    현재방문 가능 약국 - /pharmacy?avalpharmacy=1&page=0&limit=20&addr=서울시
    방문가능 요일 - /pharmacy?avalday=1&page=0&limit=20&addr=서울시
    공휴일 방문가능 약국 - /pharmacy?avalholiday=1&page=0&limit=20&addr=서울시
    내위치 검색 - /pharmacy?mylon=126.9019532&mylat=37.5170112&page=1&limit=20
    */
   
    var select_sql = '';
    var paramPage = (query.page)?query.page:0;
    var paramLimit = (query.limit)?query.limit:5;

    console.log(query)
    select_sql = "SELECT * FROM pharmacy "

    if( (query.mylat) && (query.mylon)) {
        // 위경도 조건이 있을경우
        select_sql = 
        `SELECT a.*,
        ST_Distance_Sphere(POINT(${query.mylon}, ${query.mylat}), POINT(a.wgs84Lon, a.wgs84Lat)) AS distance
        FROM pharmacy a
        WHERE ST_Distance_Sphere(POINT(${query.mylon}, ${query.mylat}), POINT(a.wgs84Lon, a.wgs84Lat))<= 2000\
        ORDER BY distance`;
    } else {
        
        // 첫번째 조건 존재 여부
        var isExist = false;  

        // 검색조건이 있을경우
        if( query.addr || query.avalpharmacy || query.avalday || query.avalholiday  || query.avalnight) {
            select_sql += 'WHERE ';
        }
        
        // 검색 주소가 있을 경우
        if( query.addr) {
            if(isExist) {
                select_sql += ' AND ';
            } else {
                isExist = true;
            }

            select_sql += 
            `dutyAddr LIKE '%${query.addr}%'`;
        } 

        // 방문가능 약국 조회시
        if( query.avalpharmacy) {
            if(isExist) {
                select_sql += ' AND ';
            } else {
                isExist = true;
            }

            // 1. 현재 요일 (일요일은 0, 월요일은 1, 화요일은 2, 수요일은 3, 목요일은 4, 금요일은 5, 토요일은 6)
            // 2. 현재 시간 : 0900
            // 예) 월요일 09시일 경우 0900 이 dutyTime1s, dutyTime1c 데이터 사이에 있는 약국 조회

            // 시간 정보
            require('date-utils');
            var now = new Date();	// 현재 날짜 및 시간
            var daynum = now.getDay();	// 요일
            console.log("현재시간 & 요일 : ", now, daynum);
            
            var newDate = new Date();
            var currTime = newDate.toFormat('HH24MI');

            // 스위치문 이용
            switch (daynum) {
                case 0 : 
                select_sql += ` dutyTime7s <= ${currTime} AND dutyTime7c >= ${currTime}`;
                break;
                case 1 : 
                select_sql += ` dutyTime1s <= ${currTime} AND dutyTime1c >= ${currTime}`;
                break;
                case 2 : 
                select_sql += ` dutyTime2s <= ${currTime} AND dutyTime2c >= ${currTime}`;
                break;
                case 3 : 
                select_sql += ` dutyTime3s <= ${currTime} AND dutyTime3c >= ${currTime}`;
                break;
                case 4 : 
                select_sql += ` dutyTime4s <= ${currTime} AND dutyTime4c >= ${currTime}`;
                break;
                case 5 : 
                select_sql += ` dutyTime5s <= ${currTime} AND dutyTime5c >= ${currTime}`;
                break;
                case 6 : 
                select_sql += ` dutyTime6s <= ${currTime} AND dutyTime6c >= ${currTime}`;
                
            }
        } 
 
        // 야간 약국 조회시
        if( query.avalnight) {
            if(isExist) {
                select_sql += ' AND ';
            } else {
                isExist = true;
            }

            // 1. 현재 요일 (일요일은 0, 월요일은 1, 화요일은 2, 수요일은 3, 목요일은 4, 금요일은 5, 토요일은 6)
            // 2. 현재 시간 : 0900
            // 예) 월요일 09시일 경우 0900 이 dutyTime1s, dutyTime1c 데이터 사이에 있는 약국 조회

            // 시간 정보
            require('date-utils');
            var now = new Date();	// 현재 날짜 및 시간
            var daynum = now.getDay();	// 요일
            console.log("현재시간 & 요일 : ", now, daynum);
            
            var newDate = new Date();
            //var currTime = newDate.toFormat('HH24MI');
            var currTime = '2100';
            
            // 스위치문 이용
            switch (daynum) {
                case 0 : 
                select_sql += ` dutyTime7s <= ${currTime} AND dutyTime7c >= ${currTime}`;
                break;
                case 1 : 
                select_sql += ` dutyTime1s <= ${currTime} AND dutyTime1c >= ${currTime}`;
                break;
                case 2 : 
                select_sql += ` dutyTime2s <= ${currTime} AND dutyTime2c >= ${currTime}`;
                break;
                case 3 : 
                select_sql += ` dutyTime3s <= ${currTime} AND dutyTime3c >= ${currTime}`;
                break;
                case 4 : 
                select_sql += ` dutyTime4s <= ${currTime} AND dutyTime4c >= ${currTime}`;
                break;
                case 5 : 
                select_sql += ` dutyTime5s <= ${currTime} AND dutyTime5c >= ${currTime}`;
                break;
                case 6 : 
                select_sql += ` dutyTime6s <= ${currTime} AND dutyTime6c >= ${currTime}`;
                
            }
        } 

        // 방문가능 요일 조회시
        if( query.avalday) {
            if(isExist) {
                select_sql += ' AND ';
            } else {
                isExist = true;
            }

            // 1. 요일정보 (일요일은 0, 월요일은 1, 화요일은 2, 수요일은 3, 목요일은 4, 금요일은 5, 토요일은 6)
            
            var daynum = parseInt(query.avalday);

            // 스위치문 이용
            switch (daynum) {
                case 0 : 
                select_sql += ` dutyTime7s != '' AND dutyTime7c != ''`;
                break;
                case 1 : 
                select_sql += ` dutyTime1s != '' AND dutyTime1c != ''`;
                break;
                case 2 : 
                select_sql += ` dutyTime2s != '' AND dutyTime2c != ''`;
                break;
                case 3 : 
                select_sql += ` dutyTime3s != '' AND dutyTime3c != ''`;
                break;
                case 4 : 
                select_sql += ` dutyTime4s != '' AND dutyTime4c != ''`;
                break;
                case 5 : 
                select_sql += ` dutyTime5s != '' AND dutyTime5c != ''`;
                break;
                case 6 : 
                select_sql += ` dutyTime6s != '' AND dutyTime6c != ''`;
            }
            console.log("방문 요일 : ", daynum);
        } 

        // 공휴일 방문가능 조회시  
        if( query.avalholiday) {
            if(isExist) {
                select_sql += ' AND ';
            } else {
                isExist = true;
            }
            
            select_sql += ` dutyTime8s != '' AND dutyTime8c != ''`;
        } 

    }

    select_sql += ` LIMIT ${paramPage*paramLimit}, ${paramLimit}`;

    console.log(select_sql)

    sql.query(select_sql, (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        } 

        //console.log("검색된 pharmacy : ", res);
        console.log(select_sql)
        result(null, res);
    });

}

//hpid로 pharmacy 수정
Pharmacy.updateById = (hpid, pharmacy, result) => {
    let update_sql = "UPDATE pharmacy SET dutyName=?, dutyTel1=?, dutyTime1c=?, dutyTime2c=?, dutyTime3c=?, dutyTime4c=?, dutyTime5c=?, dutyTime6c=?, dutyTime7c=?, dutyTime8c=?, dutyTime1s=?, dutyTime2s=?, dutyTime3s=?, dutyTime4s=?, dutyTime5s=?, dutyTime6s=?, dutyTime7s=?, dutyTime8s=?, dutyAddr=?, postCdn1=?, postCdn2=?, dgidIdName=?, wgs84Lon=?, wgs84Lat=?, regDate=?, modDate=? WHERE hpid=?";

    sql.query(update_sql, [pharmacy.hpid, pharmacy.dutyName, pharmacy.dutyTel1, pharmacy.dutyTime1c, pharmacy.dutyTime2c, pharmacy.dutyTime3c, pharmacy.dutyTime4c, pharmacy.dutyTime5c, pharmacy.dutyTime6c, pharmacy.dutyTime7c, pharmacy.dutyTime8c, pharmacy.dutyTime1s, pharmacy.dutyTime2s, pharmacy.dutyTime3s, pharmacy.dutyTime4s, pharmacy.dutyTime5s, pharmacy.dutyTime6s, pharmacy.dutyTime7s, pharmacy.dutyTime8s, pharmacy.dutyAddr, pharmacy.postCdn1, pharmacy.postCdn2, pharmacy.dgidIdName, pharmacy.wgs84Lon, pharmacy.wgs84Lat, pharmacy.regDate, pharmacy.modDate,, hpid], (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        } 

        //hpid가 일치하는 것이 없을 경우
        if(res.affectedRows ==0){
            result({update_result:"hpid가 일치하는 pharmacy가 없습니다."}, null);
            return;
        }

        console.log("일치하는 pharmacy 수정 : ", {hpid:hpid, ...pharmacy});
        result(null, {hpid:hpid, ...pharmacy}); // ...pharmacy는 pharmacy 객체를 의미
    });
};

//hpid가 일치하는 customer 삭제
Pharmacy.remove = (hpid, result) =>{
    let delete_sql = "DELETE FROM pharmacy WHERE hpid=?";
    sql.query(delete_sql, hpid, (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        } 

        //hpid가 일치하는 것이 없을 경우
        if(res.affectedRows ==0){
            result({delete_result:"hpid가 일치하는 pharmacy이 없습니다."}, null);
            return;
        }

        console.log(`${hpid}인 pharmacy 삭제`);
        result(null, res);
    });
};

// pharmacy 전체 삭제
Pharmacy.removeAll = (result) =>{
    let deleteall_sql = "DELETE FROM pharmacy";
    sql.query(deleteall_sql, (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        } 

        //hpid가 일치하는 것이 없을 경우
        if(res.affectedRows ==0){
            result({delete_result:"삭제할 pharmacy이 없습니다."}, null);
            return;
        }

        console.log(`pharmacy hpid가 ${res.affectedRows} pharmacy 삭제`);
        result(null, res);
    });
};

module.exports = Pharmacy;