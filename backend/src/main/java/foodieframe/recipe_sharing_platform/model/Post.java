package foodieframe.recipe_sharing_platform.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Post entity class representing recipe posts in the sharing platform
 * 
 * CRUD Operations:
 * - Create: Add new recipe posts with title, content, ingredients, etc.
 * - Read: Retrieve post details by ID or fetch all/filtered posts
 * - Update: Modify post information such as title, content, image
 * - Delete: Remove posts from the system
 */
@Entity
public class Post {

    /**
     * Unique identifier for the post
     * @crud.attribute primary key, auto-generated
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;    /**
     * ID of the user who created this post
     * @crud.attribute required, references user entity
     */
    @NotNull(message = "UserID is required")
    private Long userID;

    /**
     * Title of the recipe post
     * @crud.attribute required, searchable, min length: 3
     */
    @NotBlank(message = "Title is required")
    @Size(min = 3, message = "Title must be at least 3 characters long")
    private String title;    /**
     * Detailed description of the recipe
     * @crud.attribute required, searchable, min length: 10
     */
    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters long")
    private String description;

    /**
     * Category of the recipe (e.g., Italian, Asian, Dessert)
     * @crud.attribute required, filterable
     */
    @NotBlank(message = "Category is required")
    private String category;
    
    /**
     * URL or path to recipe image
     * @crud.attribute optional
     */
    private String image;

    /**
     * URL or path to recipe video
     * 
     * @crud.attribute optional
     */
    private String video;

    /**
     * Step-by-step instructions for the recipe
     * 
     * @crud.attribute required
     */
    @NotBlank(message = "Steps are required")
    private String steps;
    
    /**
     * Tags associated with the recipe for searching/filtering
     * @crud.attribute optional, searchable
     */
    private String tags;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getVideo() {
        return video;
    }

    public void setVideo(String video) {
        this.video = video;
    }

    public String getSteps() {
        return steps;
    }

    public void setSteps(String steps) {
        this.steps = steps;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }
}