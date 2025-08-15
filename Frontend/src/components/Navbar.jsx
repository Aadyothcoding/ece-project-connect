import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

export default function Navbar({ user, handleLogout }) {
  const navigate = useNavigate();
  const profileUrl = user?.role === 'teacher' ? '/teacher-profile' : '/student-profile';

  return (
    <header className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-4">
        <div 
            className={`w-12 h-12 flex items-center justify-center bg-gradient-to-r ${user?.role === 'teacher' ? 'from-purple-600 to-pink-600' : 'from-blue-600 to-cyan-500'} rounded-2xl shadow-xl cursor-pointer`}
            onClick={() => navigate(user?.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard')}
        >
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold capitalize">{user?.role} Dashboard</h1>
          {user && (
            <p className={`text-md ${user?.role === 'teacher' ? 'text-pink-200' : 'text-cyan-200'}`}>
              Welcome, <span className="font-semibold">{user.fullName}</span>
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link 
          to={profileUrl}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-full shadow text-sm transition-colors"
        >
          <User className="w-4 h-4" /> Profile
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:to-red-700 text-white rounded-full shadow text-sm"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </header>
  );
}
