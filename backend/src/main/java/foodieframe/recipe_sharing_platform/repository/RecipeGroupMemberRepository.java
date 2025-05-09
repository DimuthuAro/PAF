package foodieframe.recipe_sharing_platform.repository;

import foodieframe.recipe_sharing_platform.model.RecipeGroupMember;
import foodieframe.recipe_sharing_platform.model.RecipeGroupMember.MemberRole;
import foodieframe.recipe_sharing_platform.model.RecipeGroupMember.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeGroupMemberRepository extends JpaRepository<RecipeGroupMember, Long> {
    // Find all members of a specific group
    List<RecipeGroupMember> findByGroupId(Long groupId);

    // Find all groups a user is a member of
    List<RecipeGroupMember> findByUserId(Long userId);

    // Find active members of a group
    List<RecipeGroupMember> findByGroupIdAndStatus(Long groupId, MembershipStatus status);

    // Find member by group and user IDs
    Optional<RecipeGroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    // Find admins of a group
    List<RecipeGroupMember> findByGroupIdAndRole(Long groupId, MemberRole role);

    // Check if a user is a member of a group
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    // Count number of members in a group
    long countByGroupIdAndStatus(Long groupId, MembershipStatus status);

    // Delete a membership
    void deleteByGroupIdAndUserId(Long groupId, Long userId);
}
