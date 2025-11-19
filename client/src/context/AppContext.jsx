import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const AppProvider = ({ children }) => {
  const [credit, setCredit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Load credits when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadCreditsData();
    } else {
      setCredit(0);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create an axios instance with default config
  const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Add a request interceptor to include the auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Load user credits
  const loadCreditsData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!localStorage.getItem('token')) {
        setCredit(0);
        return;
      }

      const { data } = await api.get('/api/user/credits');

      if (data.success) {
        setCredit(data.credits);
      }
      setError(null);
    } catch (error) {
      console.error('Error loading credits:', error);
      setError(error.response?.data?.message || 'Failed to load credits');
      setCredit(0);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  // Add credits to user's account
  const addCredits = async (amount) => {
    try {
      setLoading(true);
      
      const { data } = await api.post('/api/user/add-credits', { amount });

      if (data.success) {
        setCredit(data.newBalance);
        toast.success(`Successfully added ${amount} credits!`);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Error adding credits:', error);
      const errorMsg = error.response?.data?.message || 'Failed to add credits';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Remove background from image
  const removeBg = async (imageFile) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: window.location.pathname } });
      return { success: false, message: 'Please log in first' };
    }

    // Clear any existing image first
    if (image && typeof image === 'string' && image.startsWith('blob:')) {
      URL.revokeObjectURL(image);
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(imageFile);
      setImage(imageUrl);
      setResultImage(null);
      
      // Wait for the image to be set in state and rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // Create a custom config for this request
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${progress}%`);
          // You can update a progress state here if needed
        }
      };
      
      const { data } = await api.post('/api/image/remove-bg', formData, config);

      if (data.success) {
        // Create a new object URL for the result image if it's a blob
        const resultImageUrl = data.imageUrl || data.resultImage;
        setResultImage(resultImageUrl);
        setCredit(data.newCreditBalance || data.creditBalance);
        
        // Navigate to result page
        navigate('/result');
        
        return { 
          success: true, 
          imageUrl: resultImageUrl,
          creditBalance: data.newCreditBalance || data.creditBalance
        };
      } else {
        throw new Error(data.message || 'Failed to process image');
      }
      
      const errorMsg = data.message || 'Failed to process image';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } catch (error) {
      console.error('Error removing background:', error);
      const errorMsg = error.response?.data?.message || 'An error occurred while processing the image';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear the current image and result
  const clearImages = () => {
    // Revoke the object URL when clearing the image
    if (image && typeof image === 'string' && image.startsWith('blob:')) {
      URL.revokeObjectURL(image);
    }
    setImage(null);
    setResultImage(null);
  };

  // Context value
  const value = {
    credit,
    loading,
    error,
    image,
    resultImage,
    isProcessing,
    loadCreditsData,
    addCredits,
    removeBg,
    clearImages,
    backendUrl
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Export the context and provider
export { AppContext };
export default AppProvider;