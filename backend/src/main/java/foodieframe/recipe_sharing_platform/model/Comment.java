package foodieframe.recipe_sharing_platform.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Comment entity class representing user comments on posts and recipes
 * 
 * CRUD Operations:
 * - Create: Add new comments on posts, recipes or events
 * - Read: Retrieve comments by ID, post ID, or user ID
 * - Update: Modify comment content
 * - Delete: Remove comments from the system
 */
@Entity
public class Comment {

    /**
     * Unique identifier for the comment
     * @crud.attribute primary key, auto-generated
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID of the user who created this comment
     * @crud.attribute required, references user entity
     */
    @NotNull(message = "User ID is required")
    private Long userId;

    /**
     * ID of the post this comment belongs to (can be null if comment is on an event)
     * @crud.attribute optional, references post entity
     */
    private Long postId;
    
    /**
     * ID of the event this comment belongs to (can be null if comment is on a post)
     * @crud.attribute optional, references event entity
     */
    private Long eventId;
    
    /**
     * Content of the comment
     * @crud.attribute required, min length: 1
     */
    @NotBlank(message = "Comment content is required")
    @Size(min = 1, message = "Comment must not be empty")
    private String content;
    
    /**
     * Date and time when the comment was created
     * @crud.attribute auto-generated, sortable
     */
    private String createdAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
