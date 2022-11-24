const fs = require('fs');

module.exports = {
    host:"wooahdb1.mysql.database.azure.com",
    user:"db_wooahyoung@wooahdb1",
    password:"wooahdb01_jmy",
    db:"wooahdb_1",
    port: 3306,
    ssl: {ca: fs.readFileSync("./BaltimoreCyberTrustRoot.crt.pem")}
};
