package foodieframe.recipe_sharing_platform.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Event entity class representing culinary events in the recipe sharing platform
 * 
 * CRUD Operations:
 * - Create: Add new culinary events with title, description, date, etc.
 * - Read: Retrieve event details by ID or fetch all events
 * - Update: Modify event information such as title, description, time, etc.
 * - Delete: Remove events from the system
 */
@Entity
public class Event {

    /**
     * Unique identifier for the event
     * @crud.attribute primary key, auto-generated
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;    /**
     * ID of the user who created this event
     * @crud.attribute required, references user entity
     */
    @NotNull(message = "UserId is required")
    private Long userId;

    /**
     * Title of the culinary event
     * @crud.attribute required, searchable, min length: 6
     */
    @NotBlank(message = "Title is required")
    @Size(min = 6, message = "Title must be at least 6 characters long")
    private String title;

    /**
     * Detailed description of the event
     * @crud.attribute required, min length: 6
     */
    @NotBlank(message = "Description is required")
    @Size(min = 6, message = "Description must be at least 6 characters long")
    private String description;    /**
     * URL or path to event image
     * @crud.attribute required, min length: 6
     */
    @NotBlank(message = "Image is required")
    @Size(min = 6, message = "Image must be at least 6 characters long")
    private String image;

    /**
     * Date when the event will take place
     * @crud.attribute required, filterable, min length: 6
     */
    @NotBlank(message = "Date is required")
    @Size(min = 6, message = "Date must be at least 6 characters long")
    private String date;

    /**
     * Location where the event will be held
     * @crud.attribute required, filterable, min length: 6
     */
    @NotBlank(message = "Location is required")
    @Size(min = 6, message = "Location must be at least 6 characters long")
    private String location;    /**
     * Time when the event will start
     * @crud.attribute required, filterable, min length: 6
     */
    @NotBlank(message = "Time is required")
    @Size(min = 6, message = "Location must be at least 6 characters long")
    private String time;

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

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }
}
