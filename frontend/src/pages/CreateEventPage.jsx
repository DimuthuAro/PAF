import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateEventPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const eventData = {
        ...newEvent,
        userId: currentUser.id
      };
      
      const response = await eventService.createEvent(eventData);
      navigate(`/events/${response.data.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Failed to create event. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-6 py-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Event Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newEvent.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Event Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={newEvent.date}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Event Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={newEvent.location}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                      Event Image URL (optional)
                    </label>
                    <input
                      type="url"
                      id="image"
                      name="image"
                      value={newEvent.image}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Event Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={newEvent.description}
                      onChange={handleInputChange}
                      rows={6}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate('/events')}
                      className="px-6 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`px-6 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {submitting ? 'Creating...' : 'Create Event'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;