package foodieframe.recipe_sharing_platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Category entity class representing categories for recipes
 * 
 * CRUD Operations:
 * - Create: Create new recipe categories
 * - Read: Get category information and associated recipes
 * - Update: Modify category information
 * - Delete: Remove a recipe category
 */
@Entity
@Table(name = "categories")
public class Category {

    /**
     * Unique identifier for the category
     * 
     * @crud.attribute primary key, auto-generated
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Name of the category
     * 
     * @crud.attribute required, unique, searchable
     */
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 50, message = "Category name must be between 2 and 50 characters")
    @Column(unique = true)
    private String name;

    /**
     * Description of the category
     */
    @Column(length = 500)
    private String description;

    /**
     * Image or icon for the category
     */
    private String imageUrl;

    /**
     * Date when the category was created
     */
    @Column(name = "created_date")
    private LocalDateTime createdDate = LocalDateTime.now();

    // Constructors
    public Category() {
    }

    public Category(String name) {
        this.name = name;
    }

    public Category(String name, String description) {
        this.name = name;
        this.description = description;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    @Override
    public String toString() {
        return "Category{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", createdDate=" + createdDate +
                '}';
    }
}
