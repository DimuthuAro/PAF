package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.Friend;
import foodieframe.recipe_sharing_platform.service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;

    // Send a friend request
    @PostMapping("/request")
    public ResponseEntity<Friend> sendFriendRequest(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long friendId = request.get("friendId");

        try {
            return new ResponseEntity<>(
                    friendService.sendFriendRequest(userId, friendId),
                    HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // Accept a friend request
    @PutMapping("/accept/{friendshipId}")
    public ResponseEntity<Friend> acceptFriendRequest(@PathVariable Long friendshipId) {
        try {
            return new ResponseEntity<>(
                    friendService.acceptFriendRequest(friendshipId),
                    HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Accept a friend request by user IDs
    @PutMapping("/users/{userId}/accept/{friendId}")
    public ResponseEntity<Friend> acceptFriendRequestByUsers(
            @PathVariable Long userId,
            @PathVariable Long friendId) {

        try {
            return new ResponseEntity<>(
                    friendService.acceptFriendRequest(userId, friendId),
                    HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Reject or cancel a friend request
    @DeleteMapping("/{friendshipId}")
    public ResponseEntity<Void> rejectFriendRequest(@PathVariable Long friendshipId) {
        friendService.rejectFriendRequest(friendshipId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Reject or cancel a friend request by user IDs
    @DeleteMapping("/users/{userId}/reject/{friendId}")
    public ResponseEntity<Void> rejectFriendRequestByUsers(
            @PathVariable Long userId,
            @PathVariable Long friendId) {

        friendService.rejectFriendRequest(userId, friendId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Remove a friend
    @DeleteMapping("/users/{userId}/remove/{friendId}")
    public ResponseEntity<Void> removeFriend(
            @PathVariable Long userId,
            @PathVariable Long friendId) {

        friendService.removeFriend(userId, friendId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Block a user
    @PostMapping("/users/{userId}/block/{blockedUserId}")
    public ResponseEntity<Friend> blockUser(
            @PathVariable Long userId,
            @PathVariable Long blockedUserId) {

        return new ResponseEntity<>(
                friendService.blockUser(userId, blockedUserId),
                HttpStatus.CREATED);
    }

    // Unblock a user
    @DeleteMapping("/users/{userId}/unblock/{blockedUserId}")
    public ResponseEntity<Void> unblockUser(
            @PathVariable Long userId,
            @PathVariable Long blockedUserId) {

        friendService.unblockUser(userId, blockedUserId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Get all friends of a user
    @GetMapping("/users/{userId}")
    public ResponseEntity<List<Friend>> getUserFriends(@PathVariable Long userId) {
        return new ResponseEntity<>(
                friendService.getUserFriends(userId),
                HttpStatus.OK);
    }

    // Get pending friend requests for a user
    @GetMapping("/users/{userId}/pending")
    public ResponseEntity<List<Friend>> getPendingFriendRequests(@PathVariable Long userId) {
        return new ResponseEntity<>(
                friendService.getPendingFriendRequests(userId),
                HttpStatus.OK);
    }

    // Get friend requests sent by a user
    @GetMapping("/users/{userId}/sent")
    public ResponseEntity<List<Friend>> getSentFriendRequests(@PathVariable Long userId) {
        return new ResponseEntity<>(
                friendService.getSentFriendRequests(userId),
                HttpStatus.OK);
    }

    // Get users blocked by a user
    @GetMapping("/users/{userId}/blocked")
    public ResponseEntity<List<Friend>> getBlockedUsers(@PathVariable Long userId) {
        return new ResponseEntity<>(
                friendService.getBlockedUsers(userId),
                HttpStatus.OK);
    }

    // Check if users are friends
    @GetMapping("/users/{userId1}/is-friend/{userId2}")
    public ResponseEntity<Map<String, Boolean>> checkFriendship(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {

        boolean areFriends = friendService.areFriends(userId1, userId2);
        return new ResponseEntity<>(
                Map.of("areFriends", areFriends),
                HttpStatus.OK);
    }
}
