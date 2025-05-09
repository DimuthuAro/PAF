package foodieframe.recipe_sharing_platform.service;

import foodieframe.recipe_sharing_platform.model.RecipeGroup;
import foodieframe.recipe_sharing_platform.model.RecipeGroup.GroupPrivacy;
import foodieframe.recipe_sharing_platform.model.RecipeGroupMember;
import foodieframe.recipe_sharing_platform.model.RecipeGroupMember.MemberRole;
import foodieframe.recipe_sharing_platform.model.RecipeGroupMember.MembershipStatus;
import foodieframe.recipe_sharing_platform.repository.RecipeGroupMemberRepository;
import foodieframe.recipe_sharing_platform.repository.RecipeGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecipeGroupService {

    @Autowired
    private RecipeGroupRepository recipeGroupRepository;

    @Autowired
    private RecipeGroupMemberRepository memberRepository;

    // Create a new recipe group
    public RecipeGroup createGroup(RecipeGroup group) {
        // Check if a group with this name already exists
        if (recipeGroupRepository.existsByNameIgnoreCase(group.getName())) {
            throw new RuntimeException("A group with this name already exists");
        }

        // Save the group
        RecipeGroup savedGroup = recipeGroupRepository.save(group);

        // Add the creator as an admin member
        RecipeGroupMember member = new RecipeGroupMember(
                savedGroup.getId(),
                savedGroup.getCreatorId(),
                MemberRole.ADMIN);
        memberRepository.save(member);

        return savedGroup;
    }

    // Get all recipe groups
    public List<RecipeGroup> getAllGroups() {
        return recipeGroupRepository.findAll();
    }

    // Get a group by ID
    public Optional<RecipeGroup> getGroupById(Long groupId) {
        return recipeGroupRepository.findById(groupId);
    }

    // Get groups created by a user
    public List<RecipeGroup> getGroupsByCreator(Long creatorId) {
        return recipeGroupRepository.findByCreatorId(creatorId);
    }

    // Search groups by name
    public List<RecipeGroup> searchGroupsByName(String name) {
        return recipeGroupRepository.findByNameContainingIgnoreCase(name);
    }

    // Get public groups
    public List<RecipeGroup> getPublicGroups() {
        return recipeGroupRepository.findByPrivacy(GroupPrivacy.PUBLIC);
    }

    // Update group information
    public RecipeGroup updateGroup(Long groupId, RecipeGroup groupDetails) {
        RecipeGroup group = recipeGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with id: " + groupId));

        // Check if name is being changed and if new name is unique
        if (!group.getName().equalsIgnoreCase(groupDetails.getName()) &&
                recipeGroupRepository.existsByNameIgnoreCase(groupDetails.getName())) {
            throw new RuntimeException("A group with this name already exists");
        }

        group.setName(groupDetails.getName());
        group.setDescription(groupDetails.getDescription());
        group.setImageUrl(groupDetails.getImageUrl());
        group.setPrivacy(groupDetails.getPrivacy());

        return recipeGroupRepository.save(group);
    }

    // Delete a group
    public void deleteGroup(Long groupId) {
        // First delete all memberships
        List<RecipeGroupMember> members = memberRepository.findByGroupId(groupId);
        memberRepository.deleteAll(members);

        // Then delete the group
        recipeGroupRepository.deleteById(groupId);
    }

    // Add a user to a group
    public RecipeGroupMember addMember(Long groupId, Long userId, MemberRole role) {
        // Check if the user is already a member
        if (memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new RuntimeException("User is already a member of this group");
        }

        RecipeGroupMember member = new RecipeGroupMember(groupId, userId, role);
        return memberRepository.save(member);
    }

    // Get group members
    public List<RecipeGroupMember> getGroupMembers(Long groupId) {
        return memberRepository.findByGroupId(groupId);
    }

    // Get active group members
    public List<RecipeGroupMember> getActiveGroupMembers(Long groupId) {
        return memberRepository.findByGroupIdAndStatus(groupId, MembershipStatus.ACTIVE);
    }

    // Get group admins
    public List<RecipeGroupMember> getGroupAdmins(Long groupId) {
        return memberRepository.findByGroupIdAndRole(groupId, MemberRole.ADMIN);
    }

    // Update member role
    public RecipeGroupMember updateMemberRole(Long groupId, Long userId, MemberRole newRole) {
        RecipeGroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setRole(newRole);
        return memberRepository.save(member);
    }

    // Update member status
    public RecipeGroupMember updateMemberStatus(Long groupId, Long userId, MembershipStatus newStatus) {
        RecipeGroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setStatus(newStatus);
        return memberRepository.save(member);
    }

    // Remove a member from a group
    public void removeMember(Long groupId, Long userId) {
        memberRepository.deleteByGroupIdAndUserId(groupId, userId);
    }

    // Get groups a user is a member of
    public List<RecipeGroupMember> getUserMemberships(Long userId) {
        return memberRepository.findByUserId(userId);
    }

    // Check if a user is a member of a group
    public boolean isUserMember(Long groupId, Long userId) {
        return memberRepository.existsByGroupIdAndUserId(groupId, userId);
    }

    // Check if a user is an admin of a group
    public boolean isUserAdmin(Long groupId, Long userId) {
        Optional<RecipeGroupMember> member = memberRepository.findByGroupIdAndUserId(groupId, userId);
        return member.isPresent() && member.get().getRole() == MemberRole.ADMIN;
    }

    // Count members in a group
    public long countGroupMembers(Long groupId) {
        return memberRepository.countByGroupIdAndStatus(groupId, MembershipStatus.ACTIVE);
    }
}
