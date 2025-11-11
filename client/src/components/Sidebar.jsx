import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-gray-800 text-white fixed left-0 top-0">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-8">Course Gen AI</h2>
        <nav className="space-y-4">
          <Link 
            to="/dashboard/courses" 
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Show Courses
          </Link>
          <Link 
            to="/dashboard/create" 
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Create Course
          </Link>
          <Link 
            to="/dashboard/compiler" 
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Code Compiler
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 text-red-400"
          >
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;