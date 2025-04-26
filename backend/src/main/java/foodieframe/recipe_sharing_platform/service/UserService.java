package foodieframe.recipe_sharing_platform.service;

import java.util.List;
import java.util.Optional;

import foodieframe.recipe_sharing_platform.model.AuthResponse;
import foodieframe.recipe_sharing_platform.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import foodieframe.recipe_sharing_platform.model.User;
import foodieframe.recipe_sharing_platform.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    // Create
    public User saveUser(User user) {
        return userRepository.save(user);
    }
    
    // Read all
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    // Read one
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    // Update
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setPassword(userDetails.getPassword());
        user.setName(userDetails.getName());
        user.setBio(userDetails.getBio());
        
        return userRepository.save(user);
    }
    
    // Delete
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        userRepository.delete(user);
    }

    public boolean authenticateUser(String email, String password) {
        // Implement authentication logic here
        // For example, check if the user exists and the password matches
        User user = userRepository.findByEmail(email);
        if (user != null && user.getPassword().equals(password)) {
            return true;
        }
        return false;
    }
    
    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email);
        System.out.println("User: " + user);
        System.out.println("Password: " + password);
        if (user != null && user.getPassword().equals(password)) {
            String token = jwtUtil.generateToken(email);
            // Don't include password in response
            user.setPassword(null);
            return new AuthResponse(token, user);
        }
        return null;
    }

    public User registerUser(User user) {
        // Check if username already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username is already taken.");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email is already in use.");
        }
        
        if (user.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long.");
        }
        return userRepository.save(user);
    }
    
    // Find user by username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    // Search users by name
    public List<User> searchUsersByName(String name) {
        return userRepository.findByNameContainingIgnoreCase(name);
    }
    
    // Search users by username
    public List<User> searchUsersByUsername(String username) {
        return userRepository.findByUsernameContainingIgnoreCase(username);
    }
    
    // Search users by bio keywords
    public List<User> searchUsersByBioKeyword(String keyword) {
        return userRepository.findUsersByBioKeyword(keyword);
    }
    
    // Get recently registered users
    public List<User> getRecentUsers() {
        return userRepository.findTop10ByOrderByIdDesc();
    }
    
    // Check if username is available
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }
    
    // Check if email is available
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }
}
