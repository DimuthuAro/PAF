package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.Post;
import foodieframe.recipe_sharing_platform.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private PostService postService;

    @DeleteMapping("/files/orphaned")
    public ResponseEntity<Map<String, Object>> cleanupOrphanedFiles() {
        Map<String, Object> response = new HashMap<>();
        int imagesRemoved = 0;
        int videosRemoved = 0;

        try {
            // Get base directories
            String uploadDir = System.getProperty("user.dir") + "/uploads";
            Path imagesPath = Paths.get(uploadDir + "/images");
            Path videosPath = Paths.get(uploadDir + "/videos");

            // Process images directory
            if (Files.exists(imagesPath)) {
                File imagesDir = imagesPath.toFile();
                File[] imageFiles = imagesDir.listFiles();

                if (imageFiles != null) {
                    for (File file : imageFiles) {
                        String filename = file.getName();
                        boolean isOrphaned = true;

                        // Check if this file is referenced in any post
                        for (Post post : postService.getAllPosts()) {
                            String imagePath = post.getImage();
                            if (imagePath != null && imagePath.contains(filename)) {
                                isOrphaned = false;
                                break;
                            }
                        }

                        // Delete if orphaned
                        if (isOrphaned) {
                            if (file.delete()) {
                                imagesRemoved++;
                            }
                        }
                    }
                }
            }

            // Process videos directory
            if (Files.exists(videosPath)) {
                File videosDir = videosPath.toFile();
                File[] videoFiles = videosDir.listFiles();

                if (videoFiles != null) {
                    for (File file : videoFiles) {
                        String filename = file.getName();
                        boolean isOrphaned = true;

                        // Check if this file is referenced in any post
                        for (Post post : postService.getAllPosts()) {
                            String videoPath = post.getVideo();
                            if (videoPath != null && videoPath.contains(filename)) {
                                isOrphaned = false;
                                break;
                            }
                        }

                        // Delete if orphaned
                        if (isOrphaned) {
                            if (file.delete()) {
                                videosRemoved++;
                            }
                        }
                    }
                }
            }

            response.put("success", true);
            response.put("imagesRemoved", imagesRemoved);
            response.put("videosRemoved", videosRemoved);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/files/{postId}")
    public ResponseEntity<Map<String, Object>> deletePostFiles(@PathVariable Long postId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Get the post
            Optional<Post> postOpt = postService.getPostById(postId);
            if (!postOpt.isPresent()) {
                response.put("success", false);
                response.put("error", "Post not found");
                return ResponseEntity.status(404).body(response);
            }

            Post post = postOpt.get();
            String baseDir = System.getProperty("user.dir") + "/uploads";
            boolean imageDeleted = false;
            boolean videoDeleted = false;

            // Delete image file if exists
            if (post.getImage() != null && !post.getImage().isEmpty()) {
                String imagePath = post.getImage();
                if (imagePath.startsWith("/uploads/")) {
                    imagePath = imagePath.substring(9); // Remove /uploads/ prefix
                }

                File imageFile = new File(baseDir + "/" + imagePath);
                if (imageFile.exists()) {
                    imageDeleted = imageFile.delete();
                }
            }

            // Delete video file if exists
            if (post.getVideo() != null && !post.getVideo().isEmpty()) {
                String videoPath = post.getVideo();
                if (videoPath.startsWith("/uploads/")) {
                    videoPath = videoPath.substring(9); // Remove /uploads/ prefix
                }

                File videoFile = new File(baseDir + "/" + videoPath);
                if (videoFile.exists()) {
                    videoDeleted = videoFile.delete();
                }
            }

            response.put("success", true);
            response.put("imageDeleted", imageDeleted);
            response.put("videoDeleted", videoDeleted);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
