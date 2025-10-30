// src/components/Layout.tsx
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Clock, ListTodo } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    onLogout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              {/* Logo/Title */}
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-xl font-semibold text-gray-900">
                  Task Time Tracker
                </span>
              </div>

              {/* Navigation Links */}
              <div className="flex space-x-4 items-center">
                <Link
                  to="/tasks"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive('/tasks')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ListTodo className="h-4 w-4 mr-2" />
                  Tasks
                </Link>
                <Link
                  to="/cds"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive('/cds')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Today's Summary
                </Link>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}