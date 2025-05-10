import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSave, FiX, FiCalendar, FiClock, FiMapPin, FiCamera, FiFileText, FiUpload, FiLink } from 'react-icons/fi';

const CreateEventPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();   const [newEvent, setNewEvent] = useState({
    userId: currentUser ? currentUser.user.id : null,
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Set default date to today
    time: '12:00',
    location: '',
    image: '' // Empty by default, will be filled by URL or file upload
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [useImageUrl, setUseImageUrl] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login', { state: { from: '/events/create', message: 'Please login to create an event' } });
    }
  }, [currentUser, loading, navigate]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value
    });
  };
  
  // Handle image file selection
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large (max 5MB)');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setImageFile(file);
      setUseImageUrl(false);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Form validation
      if (newEvent.title.length < 6) {
        setError("Title must be at least 6 characters long");
        setSubmitting(false);
        return;
      }

      if (newEvent.description.length < 6) {
        setError("Description must be at least 6 characters long");
        setSubmitting(false);
        return;
      }

      if (newEvent.location.length < 6) {
        setError("Location must be at least 6 characters long");
        setSubmitting(false);
        return;
      }
      
      // Check image source
      if (!useImageUrl && !imageFile) {
        setError("Please provide either an image URL or upload an image file");
        setSubmitting(false);
        return;
      }
      
      if (useImageUrl && (!newEvent.image || newEvent.image.trim() === '')) {
        setError("Please provide a valid image URL");
        setSubmitting(false);
        return;
      }

      // Ensure time has minimum length of 6 characters
      let timeValue = newEvent.time;
      if (timeValue.length < 6) {
        timeValue = timeValue + " (24-hour format)";
      }

      // Ensure date has minimum length of 6 characters
      let dateValue = newEvent.date;
      if (dateValue.length < 6) {
        const date = new Date(dateValue);
        dateValue = date.toDateString(); // Format: Wed Jan 01 2025
      }

      const eventData = {
        ...newEvent,
        time: timeValue,
        date: dateValue,
        userId: currentUser.user.id
      };
      
      // Add image file if using file upload
      if (!useImageUrl && imageFile) {
        eventData.imageFile = imageFile;
        // Remove the image URL property if we're using a file
        delete eventData.image;
      }
      
      console.log("Sending event data to backend:", eventData);

      const response = await eventService.createEvent(eventData);
      console.log("Event created successfully:", response);

      navigate(`/events/${response.data.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      setError(error.message || "Failed to create event. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="overflow-hidden shadow-xl rounded-lg border border-indigo-100">
            <div className="relative">
              <div className="absolute inset-0 h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="relative px-6 pt-32 pb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
                <p className="text-gray-500 mb-6">Share your event with the community</p>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border border-indigo-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiFileText className="text-indigo-500 mr-2 text-xl" />
                        <label htmlFor="title" className="block text-sm font-medium text-indigo-700">Event Title</label>
                      </div>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={newEvent.title}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-indigo-300 bg-white shadow-sm focus:border-purple-500 focus:ring-purple-500 transition-all" placeholder="Enter your event title" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center mb-2">
                          <FiCalendar className="text-blue-500 mr-2 text-xl" />
                          <label htmlFor="date" className="block text-sm font-medium text-blue-700">Event Date</label>
                        </div>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={newEvent.date}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-blue-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all" />
                      </div>
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-lg border border-amber-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center mb-2">
                          <FiClock className="text-amber-500 mr-2 text-xl" />
                          <label htmlFor="time" className="block text-sm font-medium text-amber-700">Event Time</label>
                        </div>
                        <input
                          type="time"
                          id="time"
                          name="time"
                          value={newEvent.time}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-amber-300 bg-white shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-all" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-teal-50 to-green-50 p-5 rounded-lg border border-teal-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiMapPin className="text-teal-500 mr-2 text-xl" />
                        <label htmlFor="location" className="block text-sm font-medium text-teal-700">Event Location</label>
                      </div>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={newEvent.location}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-teal-300 bg-white shadow-sm focus:border-green-500 focus:ring-green-500 transition-all" placeholder="Enter your event venue or address" />
                    </div>                    <div className="bg-gradient-to-r from-pink-50 to-red-50 p-5 rounded-lg border border-pink-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiCamera className="text-pink-500 mr-2 text-xl" />
                        <span className="block text-sm font-medium text-pink-700">Event Image</span>
                      </div>
                      
                      {/* Image Source Toggle */}
                      <div className="flex mb-4 bg-white rounded-md overflow-hidden border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setUseImageUrl(true)}
                          className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center ${
                            useImageUrl 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <FiLink className="mr-1" /> Use URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setUseImageUrl(false)}
                          className={`flex-1 py-2 px-4 text-sm font-medium flex items-center justify-center ${
                            !useImageUrl 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <FiUpload className="mr-1" /> Upload File
                        </button>
                      </div>
                      
                      {/* URL Input */}
                      {useImageUrl && (
                        <input
                          type="url"
                          id="image"
                          name="image"
                          value={newEvent.image}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          className="mt-1 block w-full rounded-md border-pink-300 bg-white shadow-sm focus:border-red-500 focus:ring-red-500 transition-all"
                        />
                      )}
                      
                      {/* File Upload */}
                      {!useImageUrl && (
                        <div>
                          <div className="flex items-center mt-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current.click()}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center"
                            >
                              <FiUpload className="mr-1" /> Choose Image
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                            <span className="ml-2 text-sm text-gray-500">
                              {imageFile ? imageFile.name : 'No file selected'}
                            </span>
                          </div>
                          
                          {/* Image preview */}
                          {imagePreview && (
                            <div className="mt-3">
                              <img 
                                src={imagePreview} 
                                alt="Event preview" 
                                className="h-32 object-cover rounded-md shadow-sm"
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* URL Image Preview */}
                      {useImageUrl && newEvent.image && (
                        <div className="mt-3">
                          <img 
                            src={newEvent.image} 
                            alt="Event preview from URL" 
                            className="h-32 object-cover rounded-md shadow-sm"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center mb-2">
                        <FiFileText className="text-purple-500 mr-2 text-xl" />
                        <label htmlFor="description" className="block text-sm font-medium text-purple-700">Event Description</label>
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        value={newEvent.description}
                        onChange={handleInputChange}
                        rows={6}
                        required
                        className="mt-1 block w-full rounded-md border-purple-300 bg-white shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all" placeholder="Provide a detailed description of your event..." />
                    </div>
                    <div className="flex justify-end space-x-4 mt-8">
                      <button
                        type="button"
                        onClick={() => navigate('/events')}
                        className="flex items-center px-6 py-3 border border-red-300 shadow-sm text-base font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all">
                        <FiX className="mr-2 text-red-500" /> Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`flex items-center px-6 py-3 border border-transparent shadow-md text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}>
                        <FiSave className="mr-2" /> {submitting ? 'Creating...' : 'Create Event'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;