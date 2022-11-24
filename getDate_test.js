require('date-utils');

var now = new Date();	// 현재 날짜 및 시간
var date = now.getDate();	// 일
var day = now.getDay();  //요일
console.log("일 : ", date, day);

var newDate = new Date();
var time = newDate.toFormat('HH24MI');
console.log(time);