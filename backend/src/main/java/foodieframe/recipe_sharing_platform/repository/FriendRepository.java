package foodieframe.recipe_sharing_platform.repository;

import foodieframe.recipe_sharing_platform.model.Friend;
import foodieframe.recipe_sharing_platform.model.Friend.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> { // Find all friendships where this user is the
                                                                        // initiator
    List<Friend> findByUserIdAndStatus(Long userId, FriendshipStatus status);

    // Find all friendships where this user is the friend
    List<Friend> findByFriendIdAndStatus(Long friendId, FriendshipStatus status);

    // Find friendship between two specific users
    Optional<Friend> findByUserIdAndFriendId(Long userId, Long friendId);

    // Find all friendships of a user (both as initiator and as friend)
    @Query("SELECT f FROM Friend f WHERE (f.userId = :userId OR f.friendId = :userId) AND f.status = :status")
    List<Friend> findAllFriendshipsByUserId(@Param("userId") Long userId,
            @Param("status") Friend.FriendshipStatus status);

    // Check if a friendship exists between two users
    boolean existsByUserIdAndFriendId(Long userId, Long friendId);
}
