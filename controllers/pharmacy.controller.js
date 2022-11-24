const Pharmacy = require("../models/pharmacy.model.js");

// 새 Pharmacy 객체 생성
exports.create = (req,res)=>{
    //
    if(!req.body){
        res.status(400).send({
            message: "테이블에 추가할 데이터는 빈 상태일 수 없습니다."
        });
    };

    // Pharmacy 객체 생성
    const pharmacy = new Pharmacy({
      hpid: req.body.hpid,
      dutyName: req.body.dutyName,
      dutyTel1: req.body.dutyTel1,
      dutyTime1c: req.body.dutyTime1c,
      dutyTime2c: req.body.dutyTime2c,
      dutyTime3c: req.body.dutyTime3c,
      dutyTime4c: req.body.dutyTime4c,
      dutyTime5c: req.body.dutyTime5c,
      dutyTime6c: req.body.dutyTime6c,
      dutyTime7c: req.body.dutyTime7c,
      dutyTime8c: req.body.dutyTime8c,
      dutyTime1s: req.body.dutyTime1s,
      dutyTime2s: req.body.dutyTime2s,
      dutyTime3s: req.body.dutyTime3s,
      dutyTime4s: req.body.dutyTime4s,
      dutyTime5s: req.body.dutyTime5s,
      dutyTime6s: req.body.dutyTime6s,
      dutyTime7s: req.body.dutyTime7s,
      dutyTime8s: req.body.dutyTime8s,
      dutyAddr: req.body.dutyAddr,
      postCdn1: req.body.dutyCdn1,
      postCdn2: req.body.dutyCdn2,
      wgs84Lon: req.body.wgs84Lon,
      wgs84Lat: req.body.wgs84Lat,
      regDate: req.body.regDate,
      modDate: req.body.modDate,
    });

    // 데이터베이스에 저장
    Pharmacy.create(pharmacy, (err, data) =>{
        if(err){
            res.status(500).send({
                message:
                err.message || "pharmacy 테이블에 데이터를 추가하는 동안 에러가 발생했습니다."
            });
        }
        else {
          console.log(data);
          res.send(data);
        }
    })
};

// 전체 검색
exports.findAll = (req,res)=>{
  console.log(req.query.name)
  
  Pharmacy.getAll(req.query, (err, data) => {
        if (err) {
          res.status(500).send({
            message:
              err.message || "pharmacy 테이블을 검색하는 동안 에러가 발생했습니다."
          });
        }
        else {
          console.log(data);
          //res.send(data);
          // data는 JSON 배열임으로 swift에서 responseDecodable 에서 사용 가능한 JSON 포맷<key:value>으로 가공
          const result = {"pharmacy":data};
          res.send(result);
        } 
      });
};

// hpid로 검색
exports.findOne = (req,res)=>{
    Pharmacy.findById(req.params.hpid, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Pharmacy 테이블에서 ${req.params.hpid}가 검색되지 않았습니다.`
            });
          } else {
            res.status(500).send({
              message:  req.params.hpid + "로 검색하는 동안 에러가 발생했습니다."
            });
          }
        } else res.send(data);
      });
};

// hpid로 갱신
exports.update = (req,res)=>{

  if (!req.body) {
    res.status(400).send({
      message: "테이블에 추가할 데이터는 빈 상태일 수 없습니다."
    });
  }

  Pharmacy.updateById(
    req.params.hpid,
    new Pharmacy(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `pharmacy 테이블에서 hpid가 ${req.params.hpid}인 pharmacy이 존재하지 않습니다.`
          });
        } else {
          res.status(500).send({
            message:"pharmacy 테이블의 hyid가 " + req.params.hpid + " 인 업데이트하는 중에 에러 발생했습니다."
          });
        }
      } else res.send(data);
    }
  );
};

// hpid로 삭제
exports.delete = (req,res)=>{
    Pharmacy.remove(req.params.hpid, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Pharmacy 테이블에서 hpid인 ${req.params.hpid}가 없습니다.`
            });
          } else {
            res.status(500).send({
              message:  req.params.hpid + "인 pharmacy을 삭제할 수 없습니다. "
            });
          }
        } else res.send({ message: `hpid가 ${req.params.hpid}인 pharmacy이 삭제되었습니다.` });
    });
};

// 전체 삭제
exports.deleteAll = (req,res)=>{
    Pharmacy.removeAll((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "모든 pharmacy 데이터를 삭제하는 중에 에러가 발생했습니다."
          });
        else res.send({ message: `모든 pharmacy 데이터가 삭제되었습니다.` });
    });
};