package foodieframe.recipe_sharing_platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * User entity class representing users in the recipe sharing platform
 * 
 * CRUD Operations:
 * - Create: Register new users with username, email, password
 * - Read: Retrieve user details by ID or username
 * - Update: Modify user account information
 * - Delete: Remove user accounts from the system
 */
@Entity
@Table(name = "users")
public class User {

    /**
     * Unique identifier for the user
     * @crud.attribute primary key, auto-generated
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Username for login and identification
     * @crud.attribute required, unique, searchable
     */
    @NotBlank(message = "Username is required")
    @Column(unique = true)
    private String username;

    /**
     * Email address of the user
     * @crud.attribute required, unique, validated
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Name is required")
    private String name;

    @Column(length = 500)
    private String bio;

    // Default constructor
    public User() {}

    // Constructor with fields
    public User(String username, String email, String password, String name, String bio) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.name = name;
        this.bio = bio;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}