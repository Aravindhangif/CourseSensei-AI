const { GoogleGenerativeAI } = require('@google/generative-ai');
const Course = require('../models/Course');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateCourse = async (req, res) => {
    try {
        const { topic, details, difficulty, duration, numChapters } = req.body;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Generate a detailed course layout in strict JSON format for:
        Topic: ${topic}
        ${details ? `Additional Details: ${details}` : ''}
        Difficulty Level: ${difficulty}
        Total Duration: ${duration}
        Number of Chapters: ${numChapters}

        Return ONLY a JSON object with this exact structure:
        {
            "name": "Course Name",
            "summary": "Course Summary",
            "chapters": [
                {
                    "title": "Chapter Title",
                    "summary": "Chapter Summary",
                    "duration": "Duration"
                }
            ]
        }

        Do not include any markdown formatting, code blocks, or additional text. Return only the JSON object.`;

        const result = await model.generateContent(prompt);
        let generatedContent = await result.response.text();
        
        // Clean up the response
        generatedContent = generatedContent.replace(/```json|```/g, '').trim();
        
        const courseLayout = JSON.parse(generatedContent);

        // Return the generated course layout without saving
        res.status(200).json({
            name: courseLayout.name,
            topic,
            summary: courseLayout.summary,
            difficulty,
            totalDuration: duration,
            chapters: courseLayout.chapters
        });
    } catch (error) {
        console.error('Course generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate course',
            details: error.message 
        });
    }
};

// Add this function to your existing courseController.js
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('createdBy', 'username');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId)
            .populate('createdBy', 'username');
        
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch course' });
    }
};

const saveCourse = async (req, res) => {
    try {
        const courseData = { ...req.body, createdBy: req.user._id };
        const course = new Course(courseData);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to save course',
            details: error.message 
        });
    }
};

module.exports = {
    generateCourse,
    getCourses,
    getCourseById,
    saveCourse
};