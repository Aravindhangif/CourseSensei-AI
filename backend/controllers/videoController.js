const { GoogleGenerativeAI } = require('@google/generative-ai');
const { google } = require('googleapis');
const youtube = google.youtube('v3');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extract video ID from URL
const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const summarizeVideo = async (req, res) => {
    try {
        const { videoUrl } = req.body;
        const videoId = extractVideoId(videoUrl);

        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Get video details from YouTube API
        const videoData = await youtube.videos.list({
            key: process.env.YOUTUBE_API_KEY,
            part: ['snippet', 'statistics'],
            id: [videoId]
        });

        const videoDetails = videoData.data.items[0].snippet;
        
        // Generate summary using Gemini with enhanced context
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Please provide a comprehensive summary of this YouTube video:
        Title: ${videoDetails.title}
        Description: ${videoDetails.description}
        URL: ${videoUrl}
        
        Please include:
        1. Main topics and key points
        2. Important details and examples
        3. Key takeaways
        4. Any technical concepts explained
        
        Structure the summary in a clear and organized way.`;

        const result = await model.generateContent(prompt);
        const summary = await result.response.text();

        res.json({ 
            summary,
            videoDetails: {
                title: videoDetails.title,
                description: videoDetails.description,
                publishedAt: videoDetails.publishedAt,
                channelTitle: videoDetails.channelTitle,
                thumbnails: videoDetails.thumbnails
            }
        });
    } catch (error) {
        console.error('Summarization error:', error);
        res.status(500).json({ error: 'Failed to summarize video' });
    }
};

module.exports = {
    summarizeVideo
};