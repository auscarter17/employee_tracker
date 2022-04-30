const express = require('express');
const router = express.Router();

// point router to folders where routing takes place
router.use(require('./departmentRoutes'));
router.use(require('./employeeRoutes'));
router.use(require('./roleRoutes'));

// export router module to use in server.js
module.exports = router;