import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiCreditCard, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { credit } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(user || null);

  useEffect(() => {
    // Get user data from AuthContext
    if (user) {
      setUserData(user);
      setIsLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Please sign in to view your profile</p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-violet-600 mb-6 transition-colors group"
        >
          <FiArrowLeft className="mr-2 group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-8 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 p-1 mb-4">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user?.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="text-4xl text-violet-600" />
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {userData?.name || 'User'}
            </h1>
            <p className="text-violet-100">{user?.email}</p>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <FiMail className="h-5 w-5 text-violet-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
              </div>

              {/* Credits */}
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <FiCreditCard className="h-5 w-5 text-violet-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Credits Remaining</h3>
                  <p className="text-2xl font-bold text-gray-900">{credit || 0}</p>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center items-center px-6 py-3 rounded-full text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200"
                >
                  <FiLogOut className="mr-2" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
