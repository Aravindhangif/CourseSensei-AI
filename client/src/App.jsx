import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import CreateCourse from './components/CreateCourse';
import CourseDetails from './components/CourseDetails';
import ChapterContent from './components/ChapterContent';
import CodeCompiler from './components/CodeCompiler';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Navigate to="courses" replace />} />
          <Route path="courses" element={<Courses />} />
          <Route path="create" element={<CreateCourse />} />
          <Route path="compiler" element={<CodeCompiler />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />
          <Route path="courses/:courseId/chapters/:chapterIndex" element={<ChapterContent />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
