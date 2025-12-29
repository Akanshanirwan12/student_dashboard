const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

const {
  getDashboardStats,
  getFilteredAttendance,
} = require('../controllers/teacher.controller');

router.get(
  '/dashboard',
  auth,
  role('teacher'),
  getDashboardStats
);

router.get(
  '/filter',
  auth,
  role('teacher'),
  getFilteredAttendance
);

module.exports = router;
