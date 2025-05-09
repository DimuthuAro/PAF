import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/api';

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventService.getEventById(id);
        setEvent(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !loading && currentUser && event && event.user?.id !== currentUser.id) {
      navigate(`/events/${id}`, { state: { message: 'You can only edit your own events' } });
    }

    if (!authLoading && !currentUser) {
      navigate('/login', { state: { from: `/edit-event/${id}`, message: 'Please login to edit an event' } });
    }
  }, [authLoading, currentUser, loading, event, id, navigate]);

  const handleSubmit = async (updatedEvent) => {
    try {
      await eventService.updateEvent(id, updatedEvent);
      navigate(`/events/${id}`);
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event. Please try again later.');
    }
  };

   const handleEdit = (eventID) => {
      if (!currentUser?.user?.id) {
        navigate('/login', { state: { from: window.location.pathname } });
        return;
      }
  
      navigate(`/edit-event/${event.id}`, { state: { event } });
    };
  
    const handleDelete = async (eventID) => {
      if (!currentUser?.user?.id) {
        navigate('/login', { state: { from: window.location.pathname } });
        return;
      }
  
      await recipeService.deleteRecipe(eventID)
      .then((response) => {
        console.log('Recipe deleted successfully:', response);
        alert('Recipe deleted successfully');
        window.location.reload();
      })  
    }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate('/events')}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Back to Events
        </button>
      </div>
    );
  }

  if (!event || !currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="overflow-hidden shadow-xl rounded-lg border border-indigo-100">
            <div className="relative">
              <div className="absolute inset-0 h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="relative px-6 pt-32 pb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Event</h1>
                <p className="text-gray-500 mb-6">Update your event details</p>
                {/* Replace the following with your event form component */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const updatedEvent = {}; // Collect updated event data here
                  handleSubmit(updatedEvent);
                }}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        defaultValue={event.title}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="4"
                        defaultValue={event.description}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Save Changes
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

export default EditEventPage;