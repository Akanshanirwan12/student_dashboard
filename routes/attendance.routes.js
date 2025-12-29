const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/allowRoles.middleware');

const {
  markAttendance,
  getStudentAttendance,
  getAttendancePercentage,
  getAttendanceSummary,
} = require('../controllers/attendance.controller');

// Teacher/Admin mark attendance
router.post(
  '/mark',
  auth,
  allowRoles('teacher', 'admin'),
  markAttendance
);

// Student routes
router.get(
  '/student/:student_id',
  auth,
  getStudentAttendance
);

router.get(
  '/student/:student_id/percentage',
  auth,
  getAttendancePercentage
);

router.get(
  '/student/:student_id/summary',
  auth,
  getAttendanceSummary
);

module.exports = router;
