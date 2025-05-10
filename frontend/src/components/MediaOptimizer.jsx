import React, { useState } from 'react';

const MediaOptimizer = ({
    imageFile,
    videoFile,
    onImageOptimized,
    onVideoOptimized
}) => {
    const [processing, setProcessing] = useState(false);
    const [optimizationResults, setOptimizationResults] = useState(null);

    const optimizeImage = () => {
        if (!imageFile) return;

        setProcessing(true);

        // Check image dimensions
        const img = new Image();
        img.onload = () => {
            const width = img.width;
            const height = img.height;
            const aspectRatio = width / height;
            const fileSize = imageFile.size / 1024 / 1024; // MB

            // Create results object
            const results = {
                width,
                height,
                aspectRatio: aspectRatio.toFixed(2),
                fileSize: fileSize.toFixed(2) + " MB",
                format: imageFile.type.split('/')[1],
                quality: "Unknown"
            };

            // Determine quality based on resolution and file size
            if (width >= 1920 && height >= 1080) {
                results.quality = "High";
            } else if (width >= 1280 && height >= 720) {
                results.quality = "Medium";
            } else {
                results.quality = "Low";
            }

            // Suggest optimization
            if (fileSize > 2) {
                results.suggestions = "Image size is large. Consider compressing before upload.";
            } else if (width < 800 || height < 600) {
                results.suggestions = "Image resolution is low. Higher resolution recommended.";
            } else {
                results.suggestions = "Image appears optimal for upload.";
            }

            setOptimizationResults({ type: 'image', data: results });
            setProcessing(false);
        };

        img.onerror = () => {
            setOptimizationResults({
                type: 'image',
                error: "Failed to analyze image."
            });
            setProcessing(false);
        };

        img.src = URL.createObjectURL(imageFile);
    };

    const optimizeVideo = () => {
        if (!videoFile) return;

        setProcessing(true);

        // Create a video element to analyze the video
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            const fileSize = videoFile.size / 1024 / 1024; // MB
            const duration = video.duration;

            // Create results object
            const results = {
                duration: duration.toFixed(1) + " seconds",
                fileSize: fileSize.toFixed(2) + " MB",
                format: videoFile.type.split('/')[1] || "Unknown",
                bitrate: (fileSize * 8 / duration).toFixed(2) + " Mbps",
                quality: "Unknown"
            };

            // Determine quality based on file size and duration
            if (fileSize / duration > 2.5) {
                results.quality = "High";
            } else if (fileSize / duration > 1) {
                results.quality = "Medium";
            } else {
                results.quality = "Low";
            }

            // Suggest optimization
            if (fileSize > 50) {
                results.suggestions = "Video file is very large. Consider compressing before upload.";
            } else if (fileSize / duration > 3) {
                results.suggestions = "Video bitrate is high. Consider compressing for faster loading.";
            } else if (fileSize / duration < 0.5) {
                results.suggestions = "Video quality is low. Consider using higher quality if available.";
            } else {
                results.suggestions = "Video appears optimal for upload.";
            }

            setOptimizationResults({ type: 'video', data: results });
            setProcessing(false);
        };

        video.onerror = () => {
            setOptimizationResults({
                type: 'video',
                error: "Failed to analyze video."
            });
            setProcessing(false);
        };

        video.src = URL.createObjectURL(videoFile);
    };

    return (
        <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-3">Media Optimization</h3>

            {/* Image optimization */}
            {imageFile && (
                <div className="mb-3">
                    <button
                        onClick={optimizeImage}
                        disabled={processing}
                        className={`px-3 py-1 rounded ${processing ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {processing ? 'Analyzing...' : 'Check Image Quality'}
                    </button>
                </div>
            )}

            {/* Video optimization */}
            {videoFile && (
                <div className="mb-3">
                    <button
                        onClick={optimizeVideo}
                        disabled={processing}
                        className={`px-3 py-1 rounded ${processing ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {processing ? 'Analyzing...' : 'Check Video Quality'}
                    </button>
                </div>
            )}

            {/* Results display */}
            {optimizationResults && (
                <div className="mt-3 p-3 bg-white rounded-md shadow-sm">
                    <h4 className="font-medium text-gray-800 mb-2">
                        {optimizationResults.type === 'image' ? 'Image Analysis' : 'Video Analysis'}
                    </h4>

                    {optimizationResults.error ? (
                        <p className="text-red-500">{optimizationResults.error}</p>
                    ) : (
                        <div className="text-sm">
                            <table className="w-full text-left">
                                <tbody>
                                    {Object.entries(optimizationResults.data).map(([key, value]) => (
                                        key !== 'suggestions' && (
                                            <tr key={key} className="border-b border-gray-100">
                                                <td className="py-1 font-medium capitalize">{key}</td>
                                                <td className="py-1">{value}</td>
                                            </tr>
                                        )
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-100">
                                <p className="text-yellow-800">
                                    <span className="font-medium">Suggestion:</span> {optimizationResults.data.suggestions}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MediaOptimizer;
