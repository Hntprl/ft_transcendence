import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-8">Welcome, {user?.firstName}!</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-4">User Information</h3>
              <ul className="space-y-3">
                <li>
                  <span className="font-medium">First Name: {user?.firstName}</span> 
                </li>
                <li>
                  <span className="font-medium">Last Name: {user?.lastName}</span> 
                </li>
                <li>
                  <span className="font-medium">Email: {user?.email}</span> 
                </li>
                <li>
                  <span className="font-medium">User ID: {user?.id}</span> 
                </li>
              </ul>
            </div>

            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-4">Status</h3>
              <div className="space-y-3">
                <p>
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  You are successfully logged in
                </p>
                <p className="text-sm text-gray-600">
                  Your session is active and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
