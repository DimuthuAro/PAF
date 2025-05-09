package foodieframe.recipe_sharing_platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * SavedRecipe entity class representing saved/bookmarked recipes by users
 * 
 * CRUD Operations:
 * - Create: Users can save recipes they like
 * - Read: Retrieve all saved recipes for a user
 * - Delete: Remove saved recipes
 */
@Entity
@Table(name = "saved_recipes", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "post_id" }))
public class SavedRecipe {

    /**
     * Unique identifier for the saved recipe entry
     * 
     * @crud.attribute primary key, auto-generated
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID of the user who saved the recipe
     * 
     * @crud.attribute required, references user entity
     */
    @NotNull(message = "User ID is required")
    @Column(name = "user_id")
    private Long userId;

    /**
     * ID of the post/recipe being saved
     * 
     * @crud.attribute required, references post entity
     */
    @NotNull(message = "Post ID is required")
    @Column(name = "post_id")
    private Long postId;

    /**
     * Date and time when the recipe was saved
     */
    @Column(name = "saved_date")
    private LocalDateTime savedDate = LocalDateTime.now();

    /**
     * Optional note or comment about the saved recipe
     */
    @Column(length = 255)
    private String note;

    // Constructors
    public SavedRecipe() {
    }

    public SavedRecipe(Long userId, Long postId) {
        this.userId = userId;
        this.postId = postId;
    }

    public SavedRecipe(Long userId, Long postId, String note) {
        this.userId = userId;
        this.postId = postId;
        this.note = note;
    }

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

    public LocalDateTime getSavedDate() {
        return savedDate;
    }

    public void setSavedDate(LocalDateTime savedDate) {
        this.savedDate = savedDate;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    @Override
    public String toString() {
        return "SavedRecipe{" +
                "id=" + id +
                ", userId=" + userId +
                ", postId=" + postId +
                ", savedDate=" + savedDate +
                ", note='" + note + '\'' +
                '}';
    }
}
