import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Header from "../components/Header";
import Steps from "../components/Steps";
import BgSlider from "../components/BgSlider";
import Testimonials from "../components/Testimonials";
import Upload from "../components/Upload";
import { FiUpload, FiImage, FiX } from 'react-icons/fi';

const Home = () => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const { removeBg, isProcessing } = useApp();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast.error('Please upload an image file');
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    noClick: !!preview,
    noKeyboard: true
  });
  
  // Manually trigger file input click
  const handleBrowseClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemoveBg = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/' } });
      toast('Please sign in to remove background', { icon: '🔒' });
      return;
    }

    if (selectedFile) {
      try {
        // Show loading state
        const toastId = toast.loading('Processing your image...');
        
        const { success, message } = await removeBg(selectedFile);
        
        if (success) {
          toast.update(toastId, {
            render: 'Image processed successfully!',
            type: 'success',
            isLoading: false,
            autoClose: 3000,
            closeButton: true,
          });
        } else {
          throw new Error(message || 'Failed to process image');
        }
      } catch (error) {
        console.error('Error processing image:', error);
        toast.dismiss();
        toast.error(error.message || 'An error occurred while processing the image');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast.error('Please upload an image file');
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <Header/>
      <Steps/>
      <BgSlider/>
      <Testimonials />
      <Upload/>
      
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="p-6 sm:p-8 md:p-10 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Remove Background
            </h1>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Instantly remove the background from your images with AI. 100% automatic and free to try.
            </p>

            {!preview ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging ? 'border-violet-500 bg-violet-50' : 'border-violet-200 hover:border-violet-400 bg-violet-50/50'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  {...getInputProps()}
                />
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-full flex items-center justify-center border-2 border-dashed border-violet-200">
                    <FiUpload className="w-8 h-8 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      or{' '}
                      <span 
                        onClick={handleBrowseClick}
                        className="text-violet-600 font-medium hover:text-violet-700 cursor-pointer"
                      >
                        browse files
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                      Supports: JPG, PNG, WEBP (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto max-h-[400px] object-contain mx-auto"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                    aria-label="Remove image"
                  >
                    <FiX className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={handleRemoveImage}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={handleRemoveBg}
                    disabled={isProcessing}
                    className={`px-6 py-2.5 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2 ${
                      isProcessing
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiImage className="w-4 h-4" />
                        Remove Background
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;