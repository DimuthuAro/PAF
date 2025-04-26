package foodieframe.recipe_sharing_platform.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "UserId is required")
    private Long userId;

    @NotBlank(message = "Title is required")
    @Size(min = 6, message = "Title must be at least 6 characters long")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 6, message = "Description must be at least 6 characters long")
    private String description;

    @NotBlank(message = "Image is required")
    @Size(min = 6, message = "Image must be at least 6 characters long")
    private String image;

    @NotBlank(message = "Date is required")
    @Size(min = 6, message = "Date must be at least 6 characters long")
    private String date;

    @NotBlank(message = "Location is required")
    @Size(min = 6, message = "Location must be at least 6 characters long")
    private String location;

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
