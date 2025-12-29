const sql = require('mssql');

const config = {
  user: 'attendance_user',
  password: 'StrongPass@123',
  server: '127.0.0.1',
  port: 1433,
  database: 'AttendanceDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Connected to MS SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });

module.exports = { sql, poolPromise };
