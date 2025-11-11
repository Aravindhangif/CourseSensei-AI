const express = require('express');
const router = express.Router();
const { summarizeVideo } = require('../controllers/videoController');
const protect = require('../middleware/auth');

router.post('/summarize', protect, summarizeVideo);

module.exports = router;