const express = require('express');
const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', (req,res) =>{
    res.json({message:"안녕하세요."});
});


// hospital.routes.js 모듈이 express app 인스턴스(instance)를 사용하는 함수를 
// 내보낸다는 것을 의미. 해당 함수를 즉시 호출하고 app에 전달
require('./routes/hospital.routes.js')(app);
require('./routes/pharmacy.routes.js')(app);

app.listen(port, ()=>{
    console.log(`서버 포트 : ${port} 동작중...`)
});

let corsOptions = {
    origin: [
      "http://localhost:3000", "http://172.16.90.175:3000", "http://172.20.10.4:3000"
      // 새 ip 주소 추가
    ],
    //CORS 에러 해결위한 IP:PORT# 허용 조건
    //여기에 에러나는 IP:PORT# 를 처리할 수 있는 조건을 넣어둬야 함,
    preflightContinue: false,
    credentials: true,
  };