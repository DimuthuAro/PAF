import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const response = await eventService.getAllEvents();
                setEvents(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Failed to load events. Please try again later.');
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter((event) =>
        event.title && event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) return dateString;
        
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Upcoming Events</h1>
                <Link 
                    to="/events/create"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
                    Create Event
                </Link>
            </div>
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700">{error}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => (
                            <Link to={`/events/${event.id}`} key={event.id}
                                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="p-6">
                                    {event.image && (
                                        <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
                                    <p className="text-gray-600 line-clamp-2 mb-3">{event.description}</p>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatDate(event.date)}</span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">No events found. Try adjusting your search.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Events;