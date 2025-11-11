const express = require('express');
const router = express.Router();
const { generateChapterContent } = require('../controllers/chapterController');
const protect = require('../middleware/auth');

router.post('/courses/:courseId/generate-content', protect, generateChapterContent);

module.exports = router;