import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Categories from './pages/Categories';
import CategoryPage from './pages/CategoryPage';
import Events from './pages/Events';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
// import CreatePostPage from './pages/CreatePostPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import FriendsPage from './pages/FriendsPage';
import RecipeGroupsPage from './pages/RecipeGroupsPage';
import CategoriesPage from './pages/CategoriesPage';

import './App.css';

// Protected Route component that uses AuthContext
const ProtectedRoute = ({ element }) => {
  const { currentUser } = useAuth();
  return currentUser ? element : <Navigate to="/login" state={{ message: "Please log in to access this page" }} />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen relative">
        <div className="min-h-screen bg-cover bg-center bg-opacity-50 relative" style={{ backgroundImage: "url('bg.jpg')" }}>
        <Navbar />
        <main>
          <div>
          </div>           
          <Routes>
            <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
            <Route path="/recipes" element={<ProtectedRoute element={<RecipesPage />} />} />
            <Route path="/recipes/:id" element={<ProtectedRoute element={<RecipeDetailPage />} />} />
        
            <Route path="/create-recipe" element={<ProtectedRoute element={<CreateRecipePage />} />} />
            <Route path="/edit-recipe/:id" element={<ProtectedRoute element={<EditRecipePage />} />} />
            <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categorypage/:categoryName" element={<CategoryPage />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/create" element={<ProtectedRoute element={<CreateEventPage />} />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/favorites" element={<ProtectedRoute element={<SavedRecipesPage />} />} />
            <Route path="/friends" element={<ProtectedRoute element={<FriendsPage />} />} />
            <Route path="/groups" element={<ProtectedRoute element={<RecipeGroupsPage />} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
