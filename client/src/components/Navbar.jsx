import React, { useState, useEffect } from "react";
import { assets } from '../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { FiChevronDown, FiUser, FiCreditCard, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { credit, loadCreditsData } = useAppContext();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load credits data when the component mounts or when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadCreditsData();
    }
  }, [isAuthenticated, loadCreditsData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className='bg-white shadow-md py-3 px-4 flex justify-between items-center'>
      <Link to='/' className='text-xl font-bold text-slate-800'>
        <img className='w-32 sm:w-44' src={assets.logo} alt="Logo" />
      </Link>

      <div className='flex items-center gap-4'>
        {isAuthenticated ? (
          <div className='flex items-center gap-4'>
            <div className='hidden sm:flex items-center gap-2'>
              <span className='text-sm text-slate-600'>Credits:</span>
              <span className='font-medium'>{credit}</span>
            </div>
            <Link 
              to='/buy' 
              className='hidden sm:block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'
            >
              Buy Credits
            </Link>
            <div className='relative dropdown-container'>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className='flex items-center gap-1 focus:outline-none transition-colors rounded-full p-1 hover:bg-gray-100'
              >
                <div className='w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium'>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <FiChevronDown className={`text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div 
                  className='absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 divide-y divide-gray-100'
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className='px-4 py-3'>
                    <p className='text-sm font-medium text-gray-900'>{user?.name || 'User'}</p>
                    <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
                  </div>
                  <div className='py-1'>
                    <Link
                      to='/profile'
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiUser className='mr-3 h-5 w-5 text-gray-400' />
                      Your Profile
                    </Link>
                    <Link
                      to='/buy'
                      className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 sm:hidden'
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiCreditCard className='mr-3 h-5 w-5 text-gray-400' />
                      Buy Credits ({credit} left)
                    </Link>
                  </div>
                  <div className='py-1'>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className='w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                    >
                      <FiLogOut className='mr-3 h-5 w-5 text-red-400' />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <Link
              to='/auth'
              className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700'
            >
              Sign In / Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;