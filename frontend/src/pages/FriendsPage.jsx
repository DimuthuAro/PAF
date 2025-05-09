import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { friendService, userService, authService } from '../services/api';

const FriendsPage = () => {
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [friendsDetails, setFriendsDetails] = useState([]);
    const [pendingRequestsDetails, setPendingRequestsDetails] = useState([]);
    const [sentRequestsDetails, setSentRequestsDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('friends');

    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) {
                setError("You must be logged in to view friends");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch friends list
                const friendsResponse = await friendService.getUserFriends(currentUser.user.id);
                setFriends(friendsResponse.data || []);

                // Fetch pending friend requests received
                const pendingResponse = await friendService.getPendingRequests(currentUser.user.id);
                setPendingRequests(pendingResponse.data || []);

                // Fetch pending friend requests sent
                const sentResponse = await friendService.getSentFriendRequests(currentUser.user.id);
                setSentRequests(sentResponse.data || []);

                // Fetch user details for friends
                if (friendsResponse.data && friendsResponse.data.length > 0) {
                    const friendsDetailsPromises = friendsResponse.data.map(friendship => {
                        // Get the ID of the other user in the friendship
                        const otherId = friendship.userId === currentUser.user.id ?
                            friendship.friendId : friendship.userId;
                        return userService.getUserById(otherId);
                    });

                    const detailsResponses = await Promise.all(friendsDetailsPromises);
                    setFriendsDetails(detailsResponses.map(res => res.data));
                }

                // Fetch user details for pending requests
                if (pendingResponse.data && pendingResponse.data.length > 0) {
                    const pendingDetailsPromises = pendingResponse.data.map(request =>
                        userService.getUserById(request.userId)
                    );

                    const pendingDetailsResponses = await Promise.all(pendingDetailsPromises);
                    setPendingRequestsDetails(pendingDetailsResponses.map(res => res.data));
                }

                // Fetch user details for sent requests
                if (sentResponse.data && sentResponse.data.length > 0) {
                    const sentDetailsPromises = sentResponse.data.map(request =>
                        userService.getUserById(request.friendId)
                    );

                    const sentDetailsResponses = await Promise.all(sentDetailsPromises);
                    setSentRequestsDetails(sentDetailsResponses.map(res => res.data));
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching friends data:', error);
                setError('Failed to load friends data. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            setSearching(true);
            // Search for users by name or username
            const response = await userService.getUsersByName(searchQuery);

            // Filter out current user from results
            const filteredResults = response.data.filter(user =>
                user.id !== currentUser.user.id
            );

            setSearchResults(filteredResults);
            setSearching(false);
        } catch (error) {
            console.error('Error searching for users:', error);
            setSearching(false);
        }
    };

    const handleSendFriendRequest = async (friendId) => {
        if (!currentUser) return;

        try {
            await friendService.sendFriendRequest(currentUser.user.id, friendId);

            // Update UI to reflect the friend request was sent
            const userDetails = searchResults.find(user => user.id === friendId);
            setSentRequestsDetails([...sentRequestsDetails, userDetails]);

            // Remove from search results
            setSearchResults(searchResults.filter(user => user.id !== friendId));
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    const handleAcceptFriendRequest = async (userId) => {
        if (!currentUser) return;

        try {
            await friendService.acceptFriendRequest(currentUser.user.id, userId);

            // Move user from pending to friends
            const userDetails = pendingRequestsDetails.find(user => user.id === userId);
            setFriendsDetails([...friendsDetails, userDetails]);

            // Remove from pending requests
            setPendingRequestsDetails(pendingRequestsDetails.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleRejectFriendRequest = async (userId) => {
        if (!currentUser) return;

        try {
            await friendService.rejectFriendRequest(currentUser.user.id, userId);

            // Remove from pending requests
            setPendingRequestsDetails(pendingRequestsDetails.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        if (!currentUser) return;

        try {
            await friendService.removeFriend(currentUser.user.id, friendId);

            // Remove from friends list
            setFriendsDetails(friendsDetails.filter(user => user.id !== friendId));
        } catch (error) {
            console.error('Error removing friend:', error);
        }
    };

    const handleCancelRequest = async (friendId) => {
        if (!currentUser) return;

        try {
            await friendService.rejectFriendRequest(currentUser.user.id, friendId);

            // Remove from sent requests
            setSentRequestsDetails(sentRequestsDetails.filter(user => user.id !== friendId));
        } catch (error) {
            console.error('Error canceling friend request:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Friends</h1>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Friends</h1>
                    <div className="bg-red-100 p-4 rounded-md text-red-700">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Friends</h1>

                {/* Search box */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <div className="flex-grow">
                            <input
                                type="text"
                                placeholder="Search for new friends..."
                                className="w-full p-2 border rounded-md"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            disabled={searching}
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Search Results</h3>
                            <div className="space-y-2">
                                {searchResults.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSendFriendRequest(user.id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                                        >
                                            Add Friend
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="mb-4 border-b">
                    <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'friends'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'hover:text-gray-600 hover:border-gray-300 border-transparent'}`}
                                onClick={() => setActiveTab('friends')}
                            >
                                Friends {friendsDetails.length > 0 && `(${friendsDetails.length})`}
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'requests'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'hover:text-gray-600 hover:border-gray-300 border-transparent'}`}
                                onClick={() => setActiveTab('requests')}
                            >
                                Requests {pendingRequestsDetails.length > 0 && `(${pendingRequestsDetails.length})`}
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'sent'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'hover:text-gray-600 hover:border-gray-300 border-transparent'}`}
                                onClick={() => setActiveTab('sent')}
                            >
                                Sent {sentRequestsDetails.length > 0 && `(${sentRequestsDetails.length})`}
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Friends list */}
                {activeTab === 'friends' && (
                    <div>
                        {friendsDetails.length === 0 ? (
                            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-600 mb-4">You don't have any friends yet.</p>
                                <p className="text-gray-500">Search for users to add as friends.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {friendsDetails.map(friend => (
                                    <div key={friend.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-medium">
                                                {friend.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium">{friend.name}</p>
                                                <p className="text-sm text-gray-500">@{friend.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/profile/${friend.id}`}
                                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 text-sm"
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={() => handleRemoveFriend(friend.id)}
                                                className="bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Pending requests */}
                {activeTab === 'requests' && (
                    <div>
                        {pendingRequestsDetails.length === 0 ? (
                            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-600">You don't have any pending friend requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequestsDetails.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-medium">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAcceptFriendRequest(user.id)}
                                                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleRejectFriendRequest(user.id)}
                                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 text-sm"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sent requests */}
                {activeTab === 'sent' && (
                    <div>
                        {sentRequestsDetails.length === 0 ? (
                            <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-600">You haven't sent any friend requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sentRequestsDetails.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-medium">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancelRequest(user.id)}
                                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsPage;
