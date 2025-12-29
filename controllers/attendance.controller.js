const { poolPromise } = require('../db');
const sql = require('mssql');

/* ================================
   MARK / UPDATE ATTENDANCE
================================ */
const markAttendance = async (req, res) => {
  const { student_id, subject_id, date, status } = req.body;

  if (!student_id || !subject_id || !date || !status) {
    return res.status(400).json({
      error: 'student_id, subject_id, date and status are required'
    });
  }

  try {
    const pool = await poolPromise;

    // Check if attendance already exists
    const check = await pool.request()
      .input('student_id', sql.Int, student_id)
      .input('subject_id', sql.Int, subject_id)
      .input('date', sql.Date, date)
      .query(`
        SELECT attendance_id
        FROM Attendance
        WHERE student_id = @student_id
          AND subject_id = @subject_id
          AND date = @date
      `);

    if (check.recordset.length > 0) {
      // Update existing attendance
      await pool.request()
        .input('student_id', sql.Int, student_id)
        .input('subject_id', sql.Int, subject_id)
        .input('date', sql.Date, date)
        .input('status', sql.NVarChar, status)
        .query(`
          UPDATE Attendance
          SET status = @status
          WHERE student_id = @student_id
            AND subject_id = @subject_id
            AND date = @date
        `);

      return res.json({ message: 'Attendance updated successfully' });
    }

    // Insert new attendance
    await pool.request()
      .input('student_id', sql.Int, student_id)
      .input('subject_id', sql.Int, subject_id)
      .input('date', sql.Date, date)
      .input('status', sql.NVarChar, status)
      .query(`
        INSERT INTO Attendance (student_id, subject_id, date, status)
        VALUES (@student_id, @subject_id, @date, @status)
      `);

    res.status(201).json({ message: 'Attendance marked successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

/* ================================
   FETCH STUDENT ATTENDANCE
================================ */
const getStudentAttendance = async (req, res) => {
  const { student_id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('student_id', sql.Int, student_id)
      .query(`
        SELECT
          A.date,
          A.status,
          S.subject_name
        FROM Attendance A
        JOIN Subjects S ON A.subject_id = S.subject_id
        WHERE A.student_id = @student_id
        ORDER BY A.date DESC
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

/* ================================
   ATTENDANCE PERCENTAGE
================================ */
const getAttendancePercentage = async (req, res) => {
  const { student_id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('student_id', sql.Int, student_id)
      .query(`
        SELECT
          S.subject_name,
          COUNT(*) AS total_classes,
          SUM(CASE WHEN A.status = 'Present' THEN 1 ELSE 0 END) AS present_days,
          CAST(
            (SUM(CASE WHEN A.status = 'Present' THEN 1 ELSE 0 END) * 100.0)
            / COUNT(*)
          AS DECIMAL(5,2)) AS attendance_percentage
        FROM Attendance A
        JOIN Subjects S ON A.subject_id = S.subject_id
        WHERE A.student_id = @student_id
        GROUP BY S.subject_name
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate attendance percentage' });
  }
};

/* ================================
   DAILY ATTENDANCE SUMMARY (TEACHER)
================================ */
const getDailySummary = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Date is required' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('date', sql.Date, date)
      .query(`
        SELECT
          COUNT(*) AS total_students,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present,
          SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent,
          SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late
        FROM Attendance
        WHERE date = @date
      `);

    res.json(result.recordset[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch daily summary' });
  }
};

/* ================================
   SUBJECT-WISE ATTENDANCE
================================ */
const getSubjectReport = async (req, res) => {
  const { subject_id } = req.params;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('subject_id', sql.Int, subject_id)
      .query(`
        SELECT
          U.user_id AS student_id,
          U.email,
          A.status,
          A.date
        FROM Attendance A
        JOIN Users U ON A.student_id = U.user_id
        WHERE A.subject_id = @subject_id
        ORDER BY A.date DESC
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch subject report' });
  }
};
const getAttendanceSummary = async (req, res) => {
  try {
    const { student_id } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('student_id', sql.Int, student_id)
      .query(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present,
          SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent,
          SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late
        FROM Attendance
        WHERE student_id = @student_id
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
};


module.exports = {
  markAttendance,
  getStudentAttendance,
  getAttendancePercentage,
  getAttendanceSummary,
};
