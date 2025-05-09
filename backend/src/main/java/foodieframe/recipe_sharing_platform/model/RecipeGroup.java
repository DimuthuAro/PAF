package foodieframe.recipe_sharing_platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * RecipeGroup entity class representing groups for recipes
 * 
 * CRUD Operations:
 * - Create: Create new recipe groups
 * - Read: Get group details and members
 * - Update: Modify group information
 * - Delete: Remove a recipe group
 */
@Entity
@Table(name = "recipe_groups")
public class RecipeGroup {

    /**
     * Unique identifier for the recipe group
     * 
     * @crud.attribute primary key, auto-generated
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Name of the recipe group
     * 
     * @crud.attribute required, searchable
     */
    @NotBlank(message = "Group name is required")
    @Size(min = 3, max = 50, message = "Group name must be between 3 and 50 characters")
    private String name;

    /**
     * Description of the recipe group
     */
    @Column(length = 500)
    private String description;

    /**
     * ID of the user who created/owns this group
     * 
     * @crud.attribute required, references user entity
     */
    @NotNull(message = "Creator user ID is required")
    @Column(name = "creator_id")
    private Long creatorId;

    /**
     * Image or icon for the group
     */
    private String imageUrl;

    /**
     * Privacy setting for the group
     */
    @Enumerated(EnumType.STRING)
    private GroupPrivacy privacy = GroupPrivacy.PUBLIC;

    /**
     * Date when the group was created
     */
    @Column(name = "created_date")
    private LocalDateTime createdDate = LocalDateTime.now();

    /**
     * Date when the group was last updated
     */
    @Column(name = "updated_date")
    private LocalDateTime updatedDate = LocalDateTime.now();

    /**
     * Enum defining group privacy levels
     */
    public enum GroupPrivacy {
        PUBLIC, // Anyone can see and join
        PRIVATE // Only visible to members, joining requires approval
    }

    // Constructors
    public RecipeGroup() {
    }

    public RecipeGroup(String name, String description, Long creatorId) {
        this.name = name;
        this.description = description;
        this.creatorId = creatorId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long creatorId) {
        this.creatorId = creatorId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public GroupPrivacy getPrivacy() {
        return privacy;
    }

    public void setPrivacy(GroupPrivacy privacy) {
        this.privacy = privacy;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    @Override
    public String toString() {
        return "RecipeGroup{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", creatorId=" + creatorId +
                ", imageUrl='" + imageUrl + '\'' +
                ", privacy=" + privacy +
                ", createdDate=" + createdDate +
                ", updatedDate=" + updatedDate +
                '}';
    }
}
