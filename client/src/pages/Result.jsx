import React, { useContext, useEffect, useState, useRef } from 'react';
import { FiUpload, FiImage, FiLoader, FiDownload } from 'react-icons/fi';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Result = () => {
    const navigate = useNavigate();
    const { resultImage, image, isProcessing, clearImages, removeBg } = useContext(AppContext);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [resultImageLoaded, setResultImageLoaded] = useState(false);

    // Handle file input change
    const fileInputRef = useRef(null);

    // Handle back to home and open file dialog
    const handleTryAnother = async () => {
        // Clear existing images and reset states
        clearImages();
        setImageLoaded(false);
        setResultImageLoaded(false);
        
        // Create a new input element to trigger file selection
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
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
            
            try {
                // Show loading state
                const toastId = toast.loading('Processing your image...');
                
                // Process the selected file
                const imageUrl = URL.createObjectURL(file);
                
                // Call removeBg which will handle setting the image and processing
                const result = await removeBg(file);
                
                if (result?.success) {
                    toast.update(toastId, {
                        render: 'Image processed successfully!',
                        type: 'success',
                        isLoading: false,
                        autoClose: 3000,
                        closeButton: true,
                    });
                } else {
                    throw new Error(result?.message || 'Failed to process image');
                }
                
                // Clean up the object URL when done
                URL.revokeObjectURL(imageUrl);
            } catch (error) {
                console.error('Error processing image:', error);
                toast.dismiss();
                toast.error(error.message || 'An error occurred while processing the image');
            }
        };
        
        // Trigger the file input
        input.click();
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (image && typeof image === 'string' && image.startsWith('blob:')) {
                URL.revokeObjectURL(image);
            }
        };
    }, [image]);

    return (
        <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]'>

        <div className='bg-white rounded-lg px-8 py-6 drop-shadow-sm'>

            {/* -------- Image Container -------- */}
            <div className='flex flex-col sm:grid grid-cols-2 gap-8'>
                {/* -------- Left Side -------- */}
                <div>
                    <p className='font-semibold text-gray-600 mb-2'>Original</p>
                    <div className='relative rounded-md border border-gray-300 min-h-[300px] bg-gray-50 flex items-center justify-center overflow-hidden'>
                        {image ? (
                            <>
                                {!imageLoaded && (
                                    <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-80'>
                                        <div className='flex flex-col items-center'>
                                            <FiLoader className='animate-spin text-3xl text-violet-600 mb-2' />
                                            <p className='text-sm text-gray-600'>Loading image...</p>
                                        </div>
                                    </div>
                                )}
                                <img 
                                    className={`w-full h-auto max-h-[500px] object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                                    src={image} 
                                    alt="Original" 
                                    onLoad={() => setImageLoaded(true)}
                                    onError={(e) => {
                                        console.error('Error loading image:', image);
                                        e.target.onerror = null;
                                        e.target.src = '';
                                    }}
                                />
                            </>
                        ) : (
                            <div className='flex flex-col items-center justify-center p-6 text-center w-full h-full'>
                                <div className='w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4'>
                                    <FiImage className='text-violet-600 text-2xl' />
                                </div>
                                <p className='text-gray-500 mb-6'>No image available</p>
                                <button 
                                    onClick={handleTryAnother}
                                    className='px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md'
                                >
                                    <FiUpload className='text-base' />
                                    Upload New Image
                                </button>
                                <p className='text-xs text-gray-400 mt-3'>or drag and drop an image</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* -------- Right Side -------- */}
                <div className='flex flex-col'>
                    <p className='font-semibold text-gray-600 mb-2'>Background Removed</p>
                    <div className='relative rounded-lg border-2 border-dashed border-gray-300 h-full min-h-[300px] bg-gray-50 overflow-hidden transition-colors hover:border-violet-400'>
                        {isProcessing ? (
                            <div className='absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90'>
                                <FiLoader className='animate-spin text-3xl text-violet-600 mb-4' />
                                <p className='text-gray-600'>Processing your image...</p>
                                <p className='text-sm text-gray-500 mt-2'>This may take a few moments</p>
                            </div>
                        ) : resultImage ? (
                            <>
                                {!resultImageLoaded && resultImage && (
                                    <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-80'>
                                        <div className='flex flex-col items-center'>
                                            <FiLoader className='animate-spin text-3xl text-violet-600 mb-2' />
                                            <p className='text-sm text-gray-600'>Loading result...</p>
                                        </div>
                                    </div>
                                )}
                                <img 
                                    src={resultImage} 
                                    alt="Background removed" 
                                    className={`w-full h-auto max-h-[500px] object-contain transition-opacity duration-300 ${resultImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setResultImageLoaded(true)}
                                    onError={(e) => {
                                        console.error('Error loading result image:', resultImage);
                                        e.target.onerror = null;
                                        e.target.src = '';
                                    }}
                                />
                            </>
                        ) : (
                            <div className='flex items-center justify-center h-full min-h-[200px] bg-gray-50'>
                                <p className='text-gray-500'>Upload an image to see the result</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* ------- Buttons -------- */}
            {resultImage && (
                <div className='flex justify-center sm:justify-end items-center flex-wrap gap-4 mt-6'>
                    <button 
                        onClick={handleTryAnother}
                        className='px-8 py-2.5 text-violet-600 text-sm border border-violet-600 rounded-full hover:scale-105 transition-all duration-700 flex items-center gap-2'
                    >
                        <FiImage className='text-base' />
                        Try another image
                    </button>
                    <a 
                        href={resultImage} 
                        download="background-removed.png" 
                        className='px-8 py-2.5 text-white text-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full hover:scale-105 transition-all duration-700 flex items-center gap-2'
                    >
                        <FiDownload className='text-base' />
                        Download image
                    </a>
                </div>
            )}
        </div>

        </div>
    )
}

export default Result