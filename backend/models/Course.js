const mongoose = require('mongoose');

const videoContentSchema = new mongoose.Schema({
    videoUrl: String,
    videoTitle: String,
    summary: String,
    codeBlocks: [{
        code: String,
        explanation: String,
        language: String
    }],
    keyPoints: [String]
});

const chapterSchema = new mongoose.Schema({
    title: String,
    summary: String,
    duration: String,
    content: [videoContentSchema]
});

const courseSchema = new mongoose.Schema({
    name: String,
    topic: String,
    summary: String,
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    totalDuration: String,
    chapters: [chapterSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);