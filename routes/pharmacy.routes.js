// 클라이언트의 HTTP 요청(GET, POST, PUT, DELETE)에 대해 
// 서버가 어떻게 응답할지 결정해야 하며 이에 대한 라우팅을 설정 

const express = require('express');
const router = express.Router();


module.exports = (app) => {
const pharmacy = require("../controllers/pharmacy.controller.js");

// pharmacy 테이블에 pharmacy 데이터 추가
app.post("/pharmacy", pharmacy.create);

// pharmacy 테이블의 모든 데이터 검색
app.get("/pharmacy", pharmacy.findAll);

// pharmacy 테이블 중 hpid가 일치하는 데이터 검색
app.get("/pharmacy/:hpid", pharmacy.findOne);

// pharmacy 테이블 중 hpid가 일치하는 데이터 수정
app.put("/pharmacy/:pharmacyId", pharmacy.update);

// pharmacy 테이블 중 hpid가 일치하는 데이터 삭제
app.delete("/pharmacy/:pharmacyId", pharmacy.delete);

// pharmacy 테이블 데이터 전체 삭제
app.delete("/pharmacy", pharmacy.deleteAll);

};