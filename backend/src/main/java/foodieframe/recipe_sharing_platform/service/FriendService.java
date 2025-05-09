package foodieframe.recipe_sharing_platform.service;

import foodieframe.recipe_sharing_platform.model.Friend;
import foodieframe.recipe_sharing_platform.model.Friend.FriendshipStatus;
import foodieframe.recipe_sharing_platform.repository.FriendRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FriendService {

    @Autowired
    private FriendRepository friendRepository;

    // Send a friend request
    public Friend sendFriendRequest(Long userId, Long friendId) {
        if (userId.equals(friendId)) {
            throw new IllegalArgumentException("Users cannot send friend requests to themselves");
        }

        // Check if a friend request already exists
        Optional<Friend> existingFriendship = friendRepository.findByUserIdAndFriendId(userId, friendId);
        if (existingFriendship.isPresent()) {
            return existingFriendship.get();
        }

        // Check if the friend has already sent a request
        Optional<Friend> reverseRequest = friendRepository.findByUserIdAndFriendId(friendId, userId);
        if (reverseRequest.isPresent()) {
            Friend friendship = reverseRequest.get();
            friendship.setStatus(FriendshipStatus.ACCEPTED);
            friendship.setUpdatedDate(LocalDateTime.now());
            return friendRepository.save(friendship);
        }

        // Create a new friend request
        Friend friendship = new Friend(userId, friendId, FriendshipStatus.PENDING);
        return friendRepository.save(friendship);
    }

    // Accept a friend request
    public Friend acceptFriendRequest(Long friendshipId) {
        Friend friendship = friendRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found with id: " + friendshipId));
        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendship.setUpdatedDate(LocalDateTime.now());
        return friendRepository.save(friendship);
    }

    // Accept a friend request by user IDs
    public Friend acceptFriendRequest(Long userId, Long friendId) {
        Friend friendship = friendRepository.findByUserIdAndFriendId(friendId, userId)
                .orElseThrow(() -> new RuntimeException("Friendship not found between users"));
        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendship.setUpdatedDate(LocalDateTime.now());
        return friendRepository.save(friendship);
    }

    // Reject or cancel a friend request
    public void rejectFriendRequest(Long friendshipId) {
        friendRepository.deleteById(friendshipId);
    }

    // Reject or cancel a friend request by user IDs
    public void rejectFriendRequest(Long userId, Long friendId) {
        Optional<Friend> friendship = friendRepository.findByUserIdAndFriendId(friendId, userId);
        friendship.ifPresent(f -> friendRepository.delete(f));
    }

    // Remove a friend
    public void removeFriend(Long userId, Long friendId) {
        Optional<Friend> friendship1 = friendRepository.findByUserIdAndFriendId(userId, friendId);
        Optional<Friend> friendship2 = friendRepository.findByUserIdAndFriendId(friendId, userId);

        friendship1.ifPresent(f -> friendRepository.delete(f));
        friendship2.ifPresent(f -> friendRepository.delete(f));
    }

    // Block a user
    public Friend blockUser(Long userId, Long blockedUserId) {
        // Remove any existing friendship
        removeFriend(userId, blockedUserId);

        // Create a blocked relationship
        Friend friendship = new Friend(userId, blockedUserId, FriendshipStatus.BLOCKED);
        return friendRepository.save(friendship);
    }

    // Unblock a user
    public void unblockUser(Long userId, Long blockedUserId) {
        Optional<Friend> friendship = friendRepository.findByUserIdAndFriendId(userId, blockedUserId);
        friendship.ifPresent(f -> {
            if (f.getStatus() == FriendshipStatus.BLOCKED) {
                friendRepository.delete(f);
            }
        });
    }

    // Get all friends of a user
    public List<Friend> getUserFriends(Long userId) {
        List<Friend> sentFriendships = friendRepository.findByUserIdAndStatus(userId, FriendshipStatus.ACCEPTED);
        List<Friend> receivedFriendships = friendRepository.findByFriendIdAndStatus(userId, FriendshipStatus.ACCEPTED);

        // Combine both lists
        sentFriendships.addAll(receivedFriendships);
        return sentFriendships;
    }

    // Get all pending friend requests sent to a user
    public List<Friend> getPendingFriendRequests(Long userId) {
        return friendRepository.findByFriendIdAndStatus(userId, FriendshipStatus.PENDING);
    }

    // Get all pending friend requests sent by a user
    public List<Friend> getSentFriendRequests(Long userId) {
        return friendRepository.findByUserIdAndStatus(userId, FriendshipStatus.PENDING);
    }

    // Get all users blocked by a user
    public List<Friend> getBlockedUsers(Long userId) {
        return friendRepository.findByUserIdAndStatus(userId, FriendshipStatus.BLOCKED);
    }

    // Check if users are friends
    public boolean areFriends(Long userId1, Long userId2) {
        List<Friend> allFriendships = friendRepository.findAllFriendshipsByUserId(userId1, FriendshipStatus.ACCEPTED);

        return allFriendships.stream().anyMatch(
                friendship -> (friendship.getUserId().equals(userId1) && friendship.getFriendId().equals(userId2)) ||
                        (friendship.getUserId().equals(userId2) && friendship.getFriendId().equals(userId1)));
    }
}
