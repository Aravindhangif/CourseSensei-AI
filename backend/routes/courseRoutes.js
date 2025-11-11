const express = require('express');
const router = express.Router();
const { generateCourse, getCourses, getCourseById, saveCourse } = require('../controllers/courseController');
const protect = require('../middleware/auth');

router.get('/', protect, getCourses);
router.get('/:courseId', protect, getCourseById);
router.post('/generate', protect, generateCourse);
router.post('/save', protect, saveCourse);

module.exports = router;