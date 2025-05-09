package foodieframe.recipe_sharing_platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Friend entity class representing friendship relationships between users
 * 
 * CRUD Operations:
 * - Create: Send friend request / Accept friend request
 * - Read: Get all friends of a user
 * - Update: Update friendship status
 * - Delete: Remove friendship connection
 */
@Entity
@Table(name = "friends", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "friend_id" }))
public class Friend {

    /**
     * Friendship status enumeration
     */
    public enum FriendshipStatus {
        PENDING, // Friend request sent, not yet accepted
        ACCEPTED, // Friend request accepted, users are friends
        BLOCKED // User has blocked the other user
    }

    /**
     * Unique identifier for the friendship record
     * 
     * @crud.attribute primary key, auto-generated
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID of the user who initiated the friendship
     * 
     * @crud.attribute required, references user entity
     */
    @NotNull(message = "User ID is required")
    @Column(name = "user_id")
    private Long userId;

    /**
     * ID of the friend (the user being friended)
     * 
     * @crud.attribute required, references user entity
     */
    @NotNull(message = "Friend ID is required")
    @Column(name = "friend_id")
    private Long friendId;

    /**
     * Current status of the friendship
     * 
     * @crud.attribute required
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendshipStatus status = FriendshipStatus.PENDING;

    /**
     * Date and time when the friendship was created
     */
    @Column(name = "created_date")
    private LocalDateTime createdDate = LocalDateTime.now();

    /**
     * Date and time when the friendship status was last updated
     */
    @Column(name = "updated_date")
    private LocalDateTime updatedDate = LocalDateTime.now();

    // Constructors
    public Friend() {
    }

    public Friend(Long userId, Long friendId) {
        this.userId = userId;
        this.friendId = friendId;
    }

    public Friend(Long userId, Long friendId, FriendshipStatus status) {
        this.userId = userId;
        this.friendId = friendId;
        this.status = status;
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

    public Long getFriendId() {
        return friendId;
    }

    public void setFriendId(Long friendId) {
        this.friendId = friendId;
    }

    public FriendshipStatus getStatus() {
        return status;
    }

    public void setStatus(FriendshipStatus status) {
        this.status = status;
        this.updatedDate = LocalDateTime.now();
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
        return "Friend{" +
                "id=" + id +
                ", userId=" + userId +
                ", friendId=" + friendId +
                ", status=" + status +
                ", createdDate=" + createdDate +
                ", updatedDate=" + updatedDate +
                '}';
    }
}
