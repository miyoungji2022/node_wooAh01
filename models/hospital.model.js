const sql = require('./db.js');

// hospital 객체에 속성(property)을 갖는 hospital 생성자 함수 정의
const Hospital = function(hospital){
    this.hpid = hospital.hpid;
    this.dutyName = hospital.dutyName;
    this.dutyTel1 = hospital.dutyTel1;
    this.dutyTel3  = hospital.dutyTel3;
    this.dutyTime1c = hospital.dutyTime1c;
    this.dutyTime2c = hospital.dutyTime2c;
    this.dutyTime3c = hospital.dutyTime3c;
    this.dutyTime4c = hospital.dutyTime4c;
    this.dutyTime5c = hospital.dutyTime5c;
    this.dutyTime6c = hospital.dutyTime6c;
    this.dutyTime7c = hospital.dutyTime7c;
    this.dutyTime8c = hospital.dutyTime8c;
    this.dutyTime1s = hospital.dutyTime1s;
    this.dutyTime2s = hospital.dutyTime2s;
    this.dutyTime3s = hospital.dutyTime3s;
    this.dutyTime4s = hospital.dutyTime4s;
    this.dutyTime5s = hospital.dutyTime5s;
    this.dutyTime6s = hospital.dutyTime6s;
    this.dutyTime7s = hospital.dutyTime7s;
    this.dutyTime8s = hospital.dutyTime8s;
    this.dutyAddr = hospital.postAddr;
    this.postCdn1 = hospital.postCdn1;
    this.postCdn2 = hospital.postCdn2;
    this.dgidIdName = hospital.dgidIdName;
    this.wgs84Lon = hospital.wgs84Lon;
    this.wgs84Lat = hospital.wgs84Lat;
    this.dutyEryn = hospital.dutyEryn;
    this.o038 = hospital.o038;
    this.regDate = hospital.regDate;
    this.modDate = hospital.modDate;
}

// hospital 테이블에 hospital 추가하는 create() 메서드 
// result는 callback 함수(function), 만일 insert_sql을 실행하는 동안 에러(err)가 발생할 경우 result(err, null) 
// nsert_sql이 정상적으로 실행되면 result(null, res) 
Hospital.create = (newHospital, result) =>{
    console.log('hospital.model.js의 hospital.create: ' + typeof(result));
    let insert_sql = "INSERT INTO hospital SET ?";

    // newHospital 새롭게 추가할 hospital객체, 
    // err -> insert_sql을 실행하는 동안 에러가 발생할 경우 
    // res -> insert_sql이 성공적으로 실행될 경우 
    sql.query(insert_sql, newHospital, (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        }

        console.log("새로운 hospital 생성됨 : ", {hpid:res.insertId, ...newHospital});
        result(null, {hpid:res.insertId, ...newHospital}); //// ...newHospital은 hospital 객체를 의미
    });
};

// hpid로 hospital 테이블에서 검색하는 findById() 메서드
Hospital.findById = (hpid, result) => {
    let select_sql = "SELECT * FROM hospital WHERE hpid=?";
    sql.query(select_sql, hpid, (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        }   
        
        if(res.length) {
            console.log(" 검색된 hospital : ", res[0]);
            result(null, res[0]);
            return;
        }

        //검색된 결과가 없을 경우
        result({select_result:'검색된 결과가 없습니다.'}, null);
    });
}; 

// 모든 hospital 검색
Hospital.getAll = (query, result)  => {
    //let selectall_sql = "SELECT * FROM hospital";
    //let selectall_sql = "SELECT hpid,dutyName, dutyAddr, dgidIdName, o038 FROM hospital";

    // // 검색 조건이 있을 경우
    // if(query.name, query.code) {
    //     let selectall_sql = "SELECT hpid, dutyName FROM hospital where dutyName like '%"+ query.name +"%' and hpid like '%"+query.code+"%'";
    //     // let selectall_sql = "SELECT hpid, dutyName FROM hospital where dutyName like '%"+ query.name +"%' and hpid like '%"+query.code+"%' limit "+query.page+", "+query.limit;
    //     // let selectall_sql = "SELECT hpid, dutyName FROM hospital where dutyName like '%"+ query.name +"%' and hpid like '%"+query.code+"%'";
    //     console.log(selectall_sql);
    //     sql.query(selectall_sql, (err, res) =>{
    //         if(err) {
    //             console.log("에러 : ", err);
    //             result(err, null);
    //             return;
    //         } 

    //         console.log("검색된 hospital : ", res);
    //         result(null, res);
    //     });
    //     return;
    // } 

/* 
전체검색 - /hospital?addr=서울시&page=1&limit=20
현재진료 가능 - /hospital?avalhospital=1&page=0&limit=20&addr=서울시
진료요일 - /hospital?avalday=1&page=0&limit=20&addr=서울시
공휴일 진료병원 - /hospital?avalhoilday=1&page=0&limit=20&addr=서울시
진료과목 - /hospital?healthclinic=소아과&page=0&limit=20&addr=서울시
응급실여부 - /hospital?emergencyrm=1&page=0&limit=20&addr=서울시

내위치검색 -/hospital?mylon=126.9019532&mylat=37.5170112&page=1&limit=20
*/
    var select_sql = '';
    var paramPage = (query.page)?query.page:0;
    var paramLimit = (query.limit)?query.limit:5;

    console.log(query)
    select_sql = "SELECT * FROM hospital "

    if( (query.mylat) && (query.mylon)) {
        // 위경도 조건이 있을경우
        select_sql = 
        `SELECT a.*,
        ST_Distance_Sphere(POINT(${query.mylon}, ${query.mylat}), POINT(a.wgs84Lon, a.wgs84Lat)) AS distance
        FROM hospital a
        WHERE ST_Distance_Sphere(POINT(${query.mylon}, ${query.mylat}), POINT(a.wgs84Lon, a.wgs84Lat))<= 2000\
        ORDER BY distance`;
    } else {
        
        // 첫번째 조건 존재 여부
        var isExist = false;  

        // 검색조건이 있을경우
        if( query.addr || query.avalhospital || query.avalday || query.healthclinic || query.emergencyrm || avalhoilday) {
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

        // 진료가능 병원 조회시
        if( query.avalhospital) {
            if(isExist) {
                select_sql += ' AND ';
            } else {
                isExist = true;
            }

            // 1. 현재 요일 (일요일은 0, 월요일은 1, 화요일은 2, 수요일은 3, 목요일은 4, 금요일은 5, 토요일은 6)
           
            // 2. 현재 시간 : 0900
            // 예) 월요일 09시일 경우 0900 이 dutyTime1s, dutyTime1c 데이터 사이에 있는 병원 조회

            // 시간 정보
            require('date-utils');
            var now = new Date();	// 현재 날짜 및 시간
            var daynum = now.getDay();	// 요일
            console.log("현재시간 & 요일 : ", now, daynum);
            
            var newDate = new Date();
            var currTime = newDate.toFormat('HH24MI');

            // 스위치 이용
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
        // 진료가능 요일 조회시
        if( query.avalday) {
            if(isExist) {
                select_sql += ' AND ';
            } else {
                isExist = true;
            }

            // 1. 요일정보 (일요일은 0, 월요일은 1, 화요일은 2, 수요일은 3, 목요일은 4, 금요일은 5, 토요일은 6)
            
            var daynum = parseInt(query.avalday);

            // 스위치 이용
            switch (daynum) {
                case 1 : 
                select_sql += ` dutyTime7s != '' AND dutyTime7c != ''`;
                break;
                case 2 : 
                select_sql += ` dutyTime1s != '' AND dutyTime1c != ''`;
                break;
                case 3 : 
                select_sql += ` dutyTime2s != '' AND dutyTime2c != ''`;
                break;
                case 4 : 
                select_sql += ` dutyTime3s != '' AND dutyTime3c != ''`;
                break;
                case 5 : 
                select_sql += ` dutyTime4s != '' AND dutyTime4c != ''`;
                break;
                case 6 : 
                select_sql += ` dutyTime5s != '' AND dutyTime5c != ''`;
                break;
                case 7 : 
                select_sql += ` dutyTime6s != '' AND dutyTime6c != ''`;

            }
          
        } 
          // 공휴일 진료병원 조회시
          
          if( query.avalhoilday) {
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

        //console.log("검색된 hospital : ", res);
        console.log(select_sql)
        result(null, res);
    });
    
}

//hpid로 hospital 수정
Hospital.updateById = (hpid, hospital, result) => {
    let update_sql = "UPDATE hospital SET dutyName=?, dutyTel1=?, dutyTel3=? dutyTime1c=?, dutyTime2c=?, dutyTime3c=?, dutyTime4c=?, dutyTime5c=?, dutyTime6c=?, dutyTime7c=?, dutyTime8c=?, dutyTime1s=?, dutyTime2s=?, dutyTime3s=?, dutyTime4s=?, dutyTime5s=?, dutyTime6s=?, dutyTime7s=?, dutyTime8s=?, dutyAddr=?, postCdn1=?, postCdn2=?, dgidIdName=?, wgs84Lon=?, wgs84Lat=?, dutyEryn=?, o038=?, regDate=?, modDate=? WHERE hpid=?";

    sql.query(update_sql, [hospital.hpid, hospital.dutyName, hospital.dutyTel1, hospital.dutyTel3, hospital.dutyTime1c, hospital.dutyTime2c, hospital.dutyTime3c, hospital.dutyTime4c, hospital.dutyTime5c, hospital.dutyTime6c, hospital.dutyTime7c, hospital.dutyTime8c, hospital.dutyTime1s, hospital.dutyTime2s, hospital.dutyTime3s, hospital.dutyTime4s, hospital.dutyTime5s, hospital.dutyTime6s, hospital.dutyTime7s, hospital.dutyTime8s, hospital.dutyAddr, hospital.postCdn1, hospital.postCdn2, hospital.dgidIdName, hospital.wgs84Lon, hospital.wgs84Lat, hospital.dutyEryn, hospital.o038, hospital.regDate, hospital.modDate,, hpid], (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        } 

        //hpid가 일치하는 것이 없을 경우
        if(res.affectedRows ==0){
            result({update_result:"hpid가 일치하는 hospital가 없습니다."}, null);
            return;
        }

        console.log("일치하는 hospital 수정 : ", {hpid:hpid, ...hospital});
        result(null, {hpid:hpid, ...hospital}); // ...hospital는 hospital 객체를 의미
    });
};

//hpid가 일치하는 hospital 삭제
Hospital.remove = (hpid, result) =>{
    let delete_sql = "DELETE FROM hospital WHERE hpid=?";
    sql.query(delete_sql, hpid, (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        } 

        //hpid가 일치하는 것이 없을 경우
        if(res.affectedRows ==0){
            result({delete_result:"hpid가 일치하는 hospital이 없습니다."}, null);
            return;
        }

        console.log(`${hpid}인 hospital 삭제`);
        result(null, res);
    });
};

// hospital 전체 삭제
Hospital.removeAll = (result) =>{
    let deleteall_sql = "DELETE FROM hospital";
    sql.query(deleteall_sql, (err, res) =>{
        if(err) {
            console.log("에러 : ", err);
            result(err, null);
            return;
        } 

        //hpid가 일치하는 것이 없을 경우
        if(res.affectedRows ==0){
            result({delete_result:"삭제할 hospital이 없습니다."}, null);
            return;
        }

        console.log(`hospital hpid가 ${res.affectedRows} hospital 삭제`);
        result(null, res);
    });
};

module.exports = Hospital;

// 참고자료
// https://www.npmjs.com/package/mysql#getting-the-number-of-affected-rows