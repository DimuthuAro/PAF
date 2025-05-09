package foodieframe.recipe_sharing_platform.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * RecipeGroupMember entity class representing membership in recipe groups
 * 
 * CRUD Operations:
 * - Create: Add user to a recipe group
 * - Read: Get all members of a group or all groups a user belongs to
 * - Update: Change member status or role
 * - Delete: Remove user from a group
 */
@Entity
@Table(name = "recipe_group_members", uniqueConstraints = @UniqueConstraint(columnNames = { "group_id", "user_id" }))
public class RecipeGroupMember {

    /**
     * Role enumeration for group members
     */
    public enum MemberRole {
        MEMBER, // Regular member
        MODERATOR, // Can moderate content and members
        ADMIN // Full control of group, can add/remove members
    }

    /**
     * Membership status enumeration
     */
    public enum MembershipStatus {
        PENDING, // User requested to join, awaiting approval
        ACTIVE, // Active member
        BANNED // User banned from group
    }

    /**
     * Unique identifier for the group membership
     * 
     * @crud.attribute primary key, auto-generated
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID of the group
     * 
     * @crud.attribute required, references group entity
     */
    @NotNull(message = "Group ID is required")
    @Column(name = "group_id")
    private Long groupId;

    /**
     * ID of the user member
     * 
     * @crud.attribute required, references user entity
     */
    @NotNull(message = "User ID is required")
    @Column(name = "user_id")
    private Long userId;

    /**
     * Role of the user in this group
     * 
     * @crud.attribute required
     */
    @Enumerated(EnumType.STRING)
    private MemberRole role = MemberRole.MEMBER;

    /**
     * Current status of the membership
     * 
     * @crud.attribute required
     */
    @Enumerated(EnumType.STRING)
    private MembershipStatus status = MembershipStatus.ACTIVE;

    /**
     * Date when the user joined the group
     */
    @Column(name = "joined_date")
    private LocalDateTime joinedDate = LocalDateTime.now();

    /**
     * Date when the membership was last updated
     */
    @Column(name = "updated_date")
    private LocalDateTime updatedDate = LocalDateTime.now();

    // Constructors
    public RecipeGroupMember() {
    }

    public RecipeGroupMember(Long groupId, Long userId) {
        this.groupId = groupId;
        this.userId = userId;
    }

    public RecipeGroupMember(Long groupId, Long userId, MemberRole role) {
        this.groupId = groupId;
        this.userId = userId;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public MemberRole getRole() {
        return role;
    }

    public void setRole(MemberRole role) {
        this.role = role;
        this.updatedDate = LocalDateTime.now();
    }

    public MembershipStatus getStatus() {
        return status;
    }

    public void setStatus(MembershipStatus status) {
        this.status = status;
        this.updatedDate = LocalDateTime.now();
    }

    public LocalDateTime getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(LocalDateTime joinedDate) {
        this.joinedDate = joinedDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    @Override
    public String toString() {
        return "RecipeGroupMember{" +
                "id=" + id +
                ", groupId=" + groupId +
                ", userId=" + userId +
                ", role=" + role +
                ", status=" + status +
                ", joinedDate=" + joinedDate +
                ", updatedDate=" + updatedDate +
                '}';
    }
}
