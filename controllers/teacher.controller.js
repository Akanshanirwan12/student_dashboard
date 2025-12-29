const { poolPromise, sql } = require('../db');

// ===============================
// 📊 Teacher Dashboard Stats
// ===============================
const getDashboardStats = async (req, res) => {
  try {
    const pool = await poolPromise;

    const studentsResult = await pool.request().query(
      `SELECT COUNT(*) AS total FROM Users WHERE role = 'student'`
    );

    const attendanceResult = await pool.request().query(`
      SELECT
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent,
        COUNT(*) AS total
      FROM Attendance
    `);

    const totalStudents = studentsResult.recordset[0].total;
    const present = attendanceResult.recordset[0].present || 0;
    const absent = attendanceResult.recordset[0].absent || 0;
    const total = attendanceResult.recordset[0].total || 0;

    const averageAttendance =
      total === 0 ? 0 : ((present / total) * 100).toFixed(1);

    res.json({
      totalStudents,
      present,
      absent,
      averageAttendance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
};

// ===============================
// 🔍 Filter Attendance
// ===============================
const getFilteredAttendance = async (req, res) => {
  const { startDate, endDate, subjectId } = req.query;

  try {
    const pool = await poolPromise;
    let query = `
      SELECT A.date, A.status, S.subject_name
      FROM Attendance A
      JOIN Subjects S ON A.subject_id = S.subject_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (startDate) {
      query += ' AND A.date >= @startDate';
      request.input('startDate', sql.Date, startDate);
    }

    if (endDate) {
      query += ' AND A.date <= @endDate';
      request.input('endDate', sql.Date, endDate);
    }

    if (subjectId) {
      query += ' AND A.subject_id = @subjectId';
      request.input('subjectId', sql.Int, subjectId);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch filtered data' });
  }
};

// ===============================
// ✅ EXPORTS (VERY IMPORTANT)
// ===============================
module.exports = {
  getDashboardStats,
  getFilteredAttendance,
};
