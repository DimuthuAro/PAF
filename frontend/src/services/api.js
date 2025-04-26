import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication services
export const authService = {
  login: async (credentials) => {
    try {
      // Send login request to the backend - fix the endpoint path
      const response = await axiosInstance.post('/login', credentials);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
        // Set auth header for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error?.response?.data || error.message || 'Login failed';
    }
  },
  logout: () => {
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
  },
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  }
};

// Recipe services - now mapped to post endpoints
export const recipeService = {
  getAllRecipes: () => axiosInstance.get('/posts'),
  getRecipeById: (id) => axiosInstance.get(`/posts/${id}`),
  createRecipe: (recipe) => axiosInstance.post('/posts', recipe),
  updateRecipe: (id, recipe) => axiosInstance.put(`/posts/${id}`, recipe),
  deleteRecipe: (id) => axiosInstance.delete(`/posts/${id}`),
  getUserRecipes: (userId) => axiosInstance.get(`/posts/user/${userId}`),
};

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Unauthorized - could redirect to login or clear token
      authService.logout();
      return Promise.reject(new Error('Authentication failed. Please log in again.'));
    }

    // Handle specific database constraint violations
    if (error.response && error.response.status === 500) {
      if (error.response.data && error.response.data.includes('UK_6DOTKOTT2KJSP8VW4D0M25FB7')) {
        return Promise.reject(new Error('Email address already exists. Please use a different email.'));
      }
      if (error.response.data && error.response.data.includes('UK_R43AF9AP4EDM43MMTQ01ODDJ6')) {
        return Promise.reject(new Error('Username already exists. Please choose a different username.'));
      }
    }

    return Promise.reject(error);
  }
);

// Post services
export const postService = {
  getAllPosts: () => axiosInstance.get('/posts'),
  getPostById: (id) => axiosInstance.get(`/posts/${id}`),
  createPost: (post) => axiosInstance.post('/posts', post),
  updatePost: (id, post) => axiosInstance.put(`/posts/${id}`, post),
  deletePost: (id) => axiosInstance.delete(`/posts/${id}`),
};

// User services
export const userService = {
  createUser: (user) => axiosInstance.post('/users', user),
  getUserById: (id) => axiosInstance.get(`/users/${id}`),
  updateUser: (id, user) => axiosInstance.put(`/users/${id}`, user),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
  registerUser: async (userData) => {
    try {
      const response = await axiosInstance.post('/register', userData);
      return response.data;
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        throw error;  // Use our custom error message
      }
      throw error?.response?.data || error.message || 'Registration failed';
    }
  },
};

// Event services
export const eventService = {
  getAllEvents: () => axiosInstance.get('/events'),
  getEventById: (id) => axiosInstance.get(`/events/${id}`),
  createEvent: (event) => axiosInstance.post('/events', event),
  updateEvent: (id, event) => axiosInstance.put(`/events/${id}`, event),
  deleteEvent: (id) => axiosInstance.delete(`/events/${id}`),
  getUserEvents: (userId) => axiosInstance.get(`/events/user/${userId}`),
};

// Interaction services
export const interactionService = {
  createLike: (userId, recipeId) => 
    axiosInstance.post(`/interactions/users/${userId}/recipes/${recipeId}?type=LIKE`),
  createFavorite: (userId, recipeId) => 
    axiosInstance.post(`/interactions/users/${userId}/recipes/${recipeId}?type=FAVORITE`),
  createComment: (userId, recipeId, comment) => 
    axiosInstance.post(`/interactions/users/${userId}/recipes/${recipeId}?type=COMMENT`, comment),
  getRecipeInteractions: (recipeId) => 
    axiosInstance.get(`/interactions/recipes/${recipeId}`),
  getRecipeComments: (recipeId) => 
    axiosInstance.get(`/interactions/recipes/${recipeId}/type/COMMENT`),
  getUserFavorites: (userId) => 
    axiosInstance.get(`/interactions/users/${userId}/type/FAVORITE`),
  getInteractionCount: (recipeId, type) => 
    axiosInstance.get(`/interactions/recipes/${recipeId}/type/${type}/count`),
  updateComment: (interactionId, comment) => 
    axiosInstance.put(`/interactions/${interactionId}`, comment),
  deleteInteraction: (interactionId) => 
    axiosInstance.delete(`/interactions/${interactionId}`),
  checkUserInteraction: (userId, recipeId, type) => 
    axiosInstance.get(`/interactions/users/${userId}/recipes/${recipeId}/type/${type}/check`),
  deleteTypeInteractions: (recipeId, type) => 
    axiosInstance.delete(`/interactions/recipes/${recipeId}/type/${type}`),
};

// Set authorization header if user is logged in
const user = authService.getCurrentUser();
if (user && user.token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
}

export default axiosInstance;