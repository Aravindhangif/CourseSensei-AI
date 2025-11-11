const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const youtube = google.youtube('v3');
const Course = require('../models/Course');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Delay helper to avoid rate limits
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateChapterContent = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        for (const chapter of course.chapters) {

            const searchQuery = `${course.topic} ${chapter.title} tutorial -gaming -gameplay`;

            const searchResult = await youtube.search.list({
                key: process.env.YOUTUBE_API_KEY,
                part: ['snippet'],
                q: searchQuery,
                type: ['video'],
                maxResults: 3,
                relevanceLanguage: 'en',
                safeSearch: 'strict'
            });

            const videoContents = [];

            // ✅ Generate one video content at a time (no Promise.all)
            for (const item of searchResult.data.items) {

                const videoData = await youtube.videos.list({
                    key: process.env.YOUTUBE_API_KEY,
                    part: ['snippet', 'statistics', 'contentDetails'],
                    id: [item.id.videoId]
                });

                const videoDetails = videoData.data.items[0].snippet;

                const prompt = `
Return ONLY valid JSON with no explanation.

{
 "summary": "Technical explanation of ${chapter.title}",
 "codeBlocks": [
   {
     "language": "javascript or python or c++",
     "code": "example code relevant to ${chapter.title}",
     "explanation": "explain the code clearly"
   }
 ],
 "keyPoints": ["important concept 1", "important concept 2"]
}

Video Title: "${videoDetails.title}"
Description: ${videoDetails.description}

Rules:
- Do NOT add markdown.
- Do NOT add comments outside JSON.
- If unsure, return empty arrays but keep JSON valid.
                `;

                let aiResponse;
                try {
                    const result = await model.generateContent(prompt);
                    aiResponse = result.response.text().replace(/```json|```/g, "").trim();
                } catch (err) {
                    aiResponse = null;
                }

                let parsedContent;
                try {
                    parsedContent = JSON.parse(aiResponse);
                } catch {
                    parsedContent = {
                        summary: "Content generation failed.",
                        codeBlocks: [],
                        keyPoints: []
                    };
                }

                videoContents.push({
                    videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    videoTitle: videoDetails.title,
                    ...parsedContent
                });

                // ✅ Pause to avoid API overload
                await wait(1200);
            }

            chapter.content = videoContents;
        }

        await course.save();
        res.json(course);

    } catch (error) {
        console.error('Course content generation error:', error);
        res.status(500).json({
            error: 'Failed to generate course content',
            details: error.message
        });
    }
};

module.exports = {
    generateChapterContent
};
