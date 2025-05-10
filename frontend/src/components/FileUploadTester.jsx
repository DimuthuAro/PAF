import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FileUploadTester = () => {
    const { currentUser } = useAuth();
    const [uploadStatus, setUploadStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [testImage, setTestImage] = useState(null);
    const [testVideo, setTestVideo] = useState(null);

    // Test upload states
    const [testImageFile, setTestImageFile] = useState(null);
    const [testVideoFile, setTestVideoFile] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewVideo, setPreviewVideo] = useState('');

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    useEffect(() => {
        const checkUploadStatus = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8082/api/uploads/status', {
                    withCredentials: true
                });
                setUploadStatus(response.data);

                // Set a test image and video if available
                if (response.data.sampleImageUrls && response.data.sampleImageUrls.length > 0) {
                    setTestImage(response.data.sampleImageUrls[0]);
                }

                if (response.data.sampleVideoUrls && response.data.sampleVideoUrls.length > 0) {
                    setTestVideo(response.data.sampleVideoUrls[0]);
                }

            } catch (err) {
                console.error('Error checking upload status:', err);
                setError('Failed to check upload status');
            } finally {
                setLoading(false);
            }
        };

        checkUploadStatus();
    }, []);

    if (loading) {
        return <div className="p-4 bg-gray-50 rounded-lg">Loading upload status...</div>;
    }

    if (error) {
        return <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>;
    }
    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (limit to 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('Image file is too large (max 10MB)');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            setTestImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle video selection
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (limit to 50MB)
            if (file.size > 50 * 1024 * 1024) {
                alert('Video file is too large (max 50MB)');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('video/')) {
                alert('Please select a valid video file');
                return;
            }

            setTestVideoFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewVideo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle test upload
    const handleTestUpload = async () => {
        if (!currentUser) {
            alert('You must be logged in to test the upload');
            return;
        }

        if (!testImageFile && !testVideoFile) {
            alert('Please select at least one file to upload');
            return;
        }

        setUploading(true);
        setUploadResult(null);

        try {
            // Create form data
            const formData = new FormData();
            formData.append('title', 'Test Upload ' + new Date().toLocaleTimeString());
            formData.append('description', 'This is a test upload from the FileUploadTester component');
            formData.append('category', 'Test');
            formData.append('steps', '1. Test Step');
            formData.append('tags', 'test,upload,debug');
            formData.append('userID', currentUser.user.id);

            if (testImageFile) {
                formData.append('imageFile', testImageFile);
            }

            if (testVideoFile) {
                formData.append('videoFile', testVideoFile);
            }

            // Send the request
            const response = await axios.post(
                'http://localhost:8082/api/posts/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            setUploadResult({
                success: true,
                data: response.data
            });
        } catch (err) {
            console.error('Test upload failed:', err);
            setUploadResult({
                success: false,
                error: err.message || 'Upload failed'
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">File Upload System Status</h2>

            {/* Test Upload Form */}
            <div className="mb-8 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="text-lg font-medium text-blue-800 mb-3">Test File Upload</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Image Upload</label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => imageInputRef.current.click()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                            >
                                Select Image
                            </button>
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <span className="text-sm text-gray-500">
                                {testImageFile ? testImageFile.name : 'No file selected'}
                            </span>
                        </div>

                        {previewImage && (
                            <div className="mt-2">
                                <img src={previewImage} alt="Preview" className="h-32 object-cover rounded-md" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Video Upload</label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => videoInputRef.current.click()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                            >
                                Select Video
                            </button>
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className="hidden"
                            />
                            <span className="text-sm text-gray-500">
                                {testVideoFile ? testVideoFile.name : 'No file selected'}
                            </span>
                        </div>

                        {previewVideo && (
                            <div className="mt-2">
                                <video src={previewVideo} controls className="h-32 rounded-md" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        onClick={handleTestUpload}
                        disabled={(!testImageFile && !testVideoFile) || uploading || !currentUser}
                        className={`px-6 py-2 rounded-md text-white ${(!testImageFile && !testVideoFile) || uploading || !currentUser
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                            } transition`}
                    >
                        {uploading ? 'Uploading...' : 'Test Upload'}
                    </button>

                    {!currentUser && (
                        <p className="mt-2 text-sm text-red-500">You must be logged in to test uploads</p>
                    )}
                </div>

                {uploadResult && (
                    <div className={`mt-4 p-3 rounded-md ${uploadResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <h4 className="font-medium">{uploadResult.success ? 'Upload Successful' : 'Upload Failed'}</h4>
                        {uploadResult.success ? (
                            <div className="mt-2 text-sm">
                                <p>Recipe ID: {uploadResult.data.id}</p>
                                <p>Image Path: {uploadResult.data.image || 'None'}</p>
                                <p>Video Path: {uploadResult.data.video || 'None'}</p>
                            </div>
                        ) : (
                            <p className="mt-1 text-sm">{uploadResult.error}</p>
                        )}
                    </div>
                )}
            </div>

            {uploadStatus && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-800 mb-2">Upload Directories</h3>
                            <div className="space-y-2 text-sm">
                                <p>Base Upload Directory: {uploadStatus.uploadsDirectoryExists ? '✓ Exists' : '✗ Missing'}</p>
                                <p>Images Directory: {uploadStatus.imagesDirectoryExists ? '✓ Exists' : '✗ Missing'}</p>
                                <p>Videos Directory: {uploadStatus.videosDirectoryExists ? '✓ Exists' : '✗ Missing'}</p>
                            </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-medium text-green-800 mb-2">Uploaded Files</h3>
                            <div className="space-y-2 text-sm">
                                <p>Images: {uploadStatus.imageFileCount} files</p>
                                <p>Videos: {uploadStatus.videoFileCount} files</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-medium text-gray-800 mb-3">Media Test</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border p-4 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-2">Test Image</h4>
                                {testImage ? (
                                    <div>
                                        <img
                                            src={`http://localhost:8082${testImage}`}
                                            alt="Test uploaded image"
                                            className="w-full h-48 object-cover rounded"
                                        />
                                        <p className="text-sm mt-2 text-gray-500">{testImage}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No sample images available</p>
                                )}
                            </div>

                            <div className="border p-4 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-2">Test Video</h4>
                                {testVideo ? (
                                    <div>
                                        <video
                                            src={`http://localhost:8082${testVideo}`}
                                            controls
                                            className="w-full h-48 object-cover rounded"
                                            preload="metadata"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                        <p className="text-sm mt-2 text-gray-500">{testVideo}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No sample videos available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploadTester;
