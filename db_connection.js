const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mpesa_te'
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});