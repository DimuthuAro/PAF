package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.AuthResponse;
import foodieframe.recipe_sharing_platform.model.User;
import foodieframe.recipe_sharing_platform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;
    
    // Create
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        return new ResponseEntity<User>(userService.saveUser(user), HttpStatus.CREATED);
    }
    
    // Read all
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return new ResponseEntity<List<User>>(userService.getAllUsers(), HttpStatus.OK);
    }
    
    // Read one
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<User>(HttpStatus.NOT_FOUND));
    }
    
    // Update
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User user) {
        try {
            return new ResponseEntity<User>(userService.updateUser(id, user), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Delete
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Register
    @PostMapping("/users/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody User user) {
        return new ResponseEntity<User>(userService.registerUser(user), HttpStatus.CREATED);
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        try {
            System.out.println("Login attempt: " + user.getEmail());
            AuthResponse response = userService.login(user.getEmail(), user.getPassword());
            if (response != null) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(
                    Map.of("error", "Invalid credentials", "timestamp", new Date()),
                    HttpStatus.UNAUTHORIZED
                );
            }
        } catch (io.jsonwebtoken.JwtException e) {
            System.err.println("JWT Error during login: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("error", "Authentication error: " + e.getMessage(), "timestamp", new Date()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        } catch (Exception e) {
            System.err.println("Error during login: " + e.getMessage());
            return new ResponseEntity<>(
                Map.of("error", "An error occurred during login", "timestamp", new Date()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // New direct registration endpoint to match frontend request
    @PostMapping("/register")
    public ResponseEntity<?> registerNewUser(@Valid @RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(
                Map.of("error", e.getMessage(), "timestamp", new Date()),
                HttpStatus.BAD_REQUEST
            );
        }
    }
}