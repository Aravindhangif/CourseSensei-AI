import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ChapterContent = () => {
  const { courseId, chapterIndex } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [course, setCourse] = useState(null);  // Add this state

  useEffect(() => {
    const fetchChapterContent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch chapter content');

        const courseData = await response.json();
        setCourse(courseData);  // Store the full course data
        setChapter(courseData.chapters[chapterIndex]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterContent();
  }, [courseId, chapterIndex]);

  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleNext = () => {
    if (currentContentIndex < chapter.content.length - 1) {
      // Next resource in current chapter
      setCurrentContentIndex(prev => prev + 1);
    } else if (parseInt(chapterIndex) < course.chapters.length - 1) {
      // Go to next chapter
      navigate(`/dashboard/courses/${courseId}/chapters/${parseInt(chapterIndex) + 1}`);
      setCurrentContentIndex(0);
    } else {
      // All chapters completed, return to course page
      navigate(`/dashboard/courses/${courseId}`);
    }
  };

  if (loading) return <div className="p-4">Loading chapter content...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!chapter) return <div className="p-4">Chapter not found</div>;

  const currentContent = chapter.content[currentContentIndex];
  const videoId = getYoutubeVideoId(currentContent.videoUrl);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{chapter.title}</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-700 mb-4">{chapter.summary}</p>
        <span className="text-sm text-gray-500">{chapter.duration}</span>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Video Resource</h2>
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={currentContent.videoTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-[400px] rounded-lg"
          ></iframe>
        </div>
        <h3 className="font-semibold text-lg mb-2">{currentContent.videoTitle}</h3>
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p className="text-gray-700">{currentContent.summary}</p>
        </div>

        {currentContent.keyPoints.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Key Points</h2>
            <ul className="list-disc pl-5">
              {currentContent.keyPoints.map((point, i) => (
                <li key={i} className="text-gray-700 mb-1">{point}</li>
              ))}
            </ul>
          </div>
        )}

        {currentContent.codeBlocks.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Code Examples</h2>
            {currentContent.codeBlocks.map((block, i) => (
              <div key={i} className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">{block.language}</h3>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{block.code}</code>
                </pre>
                <p className="mt-2 text-gray-600">{block.explanation}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-between items-center">
          <span className="text-gray-500">
            Resource {currentContentIndex + 1} of {chapter.content.length}
          </span>
          {(currentContentIndex < chapter.content.length - 1 || parseInt(chapterIndex) < course.chapters.length - 1) && (
            <button
              onClick={handleNext}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              Next {currentContentIndex === chapter.content.length - 1 ? 'Chapter' : 'Resource'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterContent;