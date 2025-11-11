import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (loading) return <div className="p-4">Loading course details...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!course) return <div className="p-4">Course not found</div>;

  const handleGenerateContent = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/generate-content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const updatedCourse = await response.json();
      setCourse(updatedCourse);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{course.name}</h1>
        {!course.chapters.some(chapter => chapter.content?.length > 0) && (
          <button
            onClick={handleGenerateContent}
            disabled={generating}
            className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
              generating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
            } text-white font-medium transition duration-200 transform hover:scale-105`}
          >
            {generating ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating Content...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Course Content</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="capitalize bg-blue-100 text-blue-800 px-3 py-1 rounded">
            {course.difficulty}
          </span>
          <span className="text-gray-600">{course.totalDuration}</span>
        </div>
        <p className="text-gray-700 mb-4">{course.summary}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Course Chapters</h2>
      <div className="space-y-4">
        {course.chapters.map((chapter, index) => (
          <div key={chapter._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">
                Chapter {index + 1}: {chapter.title}
              </h3>
              <span className="text-gray-500">{chapter.duration}</span>
            </div>
            <p className="text-gray-600 mb-4">{chapter.summary}</p>
            {chapter.content && chapter.content.length > 0 && (
              <Link 
                to={`/dashboard/courses/${courseId}/chapters/${index}`}
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
              >
                View Chapter Content
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetails;