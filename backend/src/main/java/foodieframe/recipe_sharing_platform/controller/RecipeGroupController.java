package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.RecipeGroup;
import foodieframe.recipe_sharing_platform.model.RecipeGroupMember;
import foodieframe.recipe_sharing_platform.model.RecipeGroupMember.MemberRole;
import foodieframe.recipe_sharing_platform.model.RecipeGroupMember.MembershipStatus;
import foodieframe.recipe_sharing_platform.service.RecipeGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/recipe-groups")
public class RecipeGroupController {

    @Autowired
    private RecipeGroupService recipeGroupService;

    // Create a new recipe group
    @PostMapping
    public ResponseEntity<RecipeGroup> createGroup(@RequestBody RecipeGroup group) {
        try {
            RecipeGroup createdGroup = recipeGroupService.createGroup(group);
            return new ResponseEntity<>(createdGroup, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Get all recipe groups
    @GetMapping
    public ResponseEntity<List<RecipeGroup>> getAllGroups() {
        return new ResponseEntity<>(recipeGroupService.getAllGroups(), HttpStatus.OK);
    }

    // Get a group by ID
    @GetMapping("/{groupId}")
    public ResponseEntity<RecipeGroup> getGroupById(@PathVariable Long groupId) {
        return recipeGroupService.getGroupById(groupId)
                .map(group -> new ResponseEntity<>(group, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Get groups created by a user
    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<RecipeGroup>> getGroupsByCreator(@PathVariable Long creatorId) {
        return new ResponseEntity<>(
                recipeGroupService.getGroupsByCreator(creatorId),
                HttpStatus.OK);
    }

    // Search groups by name
    @GetMapping("/search")
    public ResponseEntity<List<RecipeGroup>> searchGroupsByName(@RequestParam String name) {
        return new ResponseEntity<>(
                recipeGroupService.searchGroupsByName(name),
                HttpStatus.OK);
    }

    // Get public groups
    @GetMapping("/public")
    public ResponseEntity<List<RecipeGroup>> getPublicGroups() {
        return new ResponseEntity<>(
                recipeGroupService.getPublicGroups(),
                HttpStatus.OK);
    }

    // Update group information
    @PutMapping("/{groupId}")
    public ResponseEntity<RecipeGroup> updateGroup(
            @PathVariable Long groupId,
            @RequestBody RecipeGroup groupDetails) {

        try {
            RecipeGroup updatedGroup = recipeGroupService.updateGroup(groupId, groupDetails);
            return new ResponseEntity<>(updatedGroup, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Delete a group
    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId) {
        try {
            recipeGroupService.deleteGroup(groupId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Add a user to a group
    @PostMapping("/{groupId}/members")
    public ResponseEntity<RecipeGroupMember> addMember(
            @PathVariable Long groupId,
            @RequestBody Map<String, Object> request) {

        Long userId = Long.valueOf(request.get("userId").toString());
        MemberRole role = request.get("role") != null ? MemberRole.valueOf(request.get("role").toString())
                : MemberRole.MEMBER;

        try {
            RecipeGroupMember member = recipeGroupService.addMember(groupId, userId, role);
            return new ResponseEntity<>(member, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Get group members
    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<RecipeGroupMember>> getGroupMembers(@PathVariable Long groupId) {
        return new ResponseEntity<>(
                recipeGroupService.getGroupMembers(groupId),
                HttpStatus.OK);
    }

    // Get active group members
    @GetMapping("/{groupId}/members/active")
    public ResponseEntity<List<RecipeGroupMember>> getActiveGroupMembers(@PathVariable Long groupId) {
        return new ResponseEntity<>(
                recipeGroupService.getActiveGroupMembers(groupId),
                HttpStatus.OK);
    }

    // Get group admins
    @GetMapping("/{groupId}/admins")
    public ResponseEntity<List<RecipeGroupMember>> getGroupAdmins(@PathVariable Long groupId) {
        return new ResponseEntity<>(
                recipeGroupService.getGroupAdmins(groupId),
                HttpStatus.OK);
    }

    // Update member role
    @PutMapping("/{groupId}/members/{userId}/role")
    public ResponseEntity<RecipeGroupMember> updateMemberRole(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {

        try {
            MemberRole newRole = MemberRole.valueOf(request.get("role"));
            RecipeGroupMember updatedMember = recipeGroupService.updateMemberRole(groupId, userId, newRole);
            return new ResponseEntity<>(updatedMember, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Update member status
    @PutMapping("/{groupId}/members/{userId}/status")
    public ResponseEntity<RecipeGroupMember> updateMemberStatus(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        try {
            MembershipStatus newStatus = MembershipStatus.valueOf(request.get("status"));
            RecipeGroupMember updatedMember = recipeGroupService.updateMemberStatus(groupId, userId, newStatus);
            return new ResponseEntity<>(updatedMember, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Remove a member from a group
    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long groupId,
            @PathVariable Long userId) {

        try {
            recipeGroupService.removeMember(groupId, userId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Get groups a user is a member of
    @GetMapping("/user/{userId}/memberships")
    public ResponseEntity<List<RecipeGroupMember>> getUserMemberships(@PathVariable Long userId) {
        return new ResponseEntity<>(
                recipeGroupService.getUserMemberships(userId),
                HttpStatus.OK);
    }

    // Check if a user is a member of a group
    @GetMapping("/{groupId}/members/{userId}/check")
    public ResponseEntity<Map<String, Boolean>> isUserMember(
            @PathVariable Long groupId,
            @PathVariable Long userId) {

        boolean isMember = recipeGroupService.isUserMember(groupId, userId);
        return new ResponseEntity<>(Map.of("isMember", isMember), HttpStatus.OK);
    }

    // Check if a user is an admin of a group
    @GetMapping("/{groupId}/admins/{userId}/check")
    public ResponseEntity<Map<String, Boolean>> isUserAdmin(
            @PathVariable Long groupId,
            @PathVariable Long userId) {

        boolean isAdmin = recipeGroupService.isUserAdmin(groupId, userId);
        return new ResponseEntity<>(Map.of("isAdmin", isAdmin), HttpStatus.OK);
    }

    // Count members in a group
    @GetMapping("/{groupId}/members/count")
    public ResponseEntity<Map<String, Long>> countGroupMembers(@PathVariable Long groupId) {
        long count = recipeGroupService.countGroupMembers(groupId);
        return new ResponseEntity<>(Map.of("count", count), HttpStatus.OK);
    }
}
