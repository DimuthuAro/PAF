package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.Post;
import foodieframe.recipe_sharing_platform.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;
    
    // Create
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        System.out.println("Incoming Post Payload: " + post);
        return new ResponseEntity<Post>(postService.savePost(post), HttpStatus.CREATED);
    }
    
    // Read all
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return new ResponseEntity<List<Post>>(postService.getAllPosts(), HttpStatus.OK);
    }
    
    // Read one
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return postService.getPostById(id)
                .map(post -> new ResponseEntity<>(post, HttpStatus.OK))
                .orElse(new ResponseEntity<Post>(HttpStatus.NOT_FOUND));
    }
    
    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post post) {
        try {
            return new ResponseEntity<Post>(postService.updatePost(id, post), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    } // Delete post and associated files
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        try {
            // Get the post before deletion to access file paths
            Optional<Post> postOpt = postService.getPostById(id);
            if (postOpt.isPresent()) {
                Post post = postOpt.get();

                // Save file paths before deleting the post
                String imagePath = post.getImage();
                String videoPath = post.getVideo();

                // Delete the post from the database
                postService.deletePost(id);

                // Delete associated files
                deletePostFiles(imagePath, videoPath);

                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Helper method to delete files associated with a post
    private void deletePostFiles(String imagePath, String videoPath) {
        try {
            String baseDir = System.getProperty("user.dir") + "/uploads";

            // Delete image file if exists
            if (imagePath != null && !imagePath.isEmpty()) {
                String imageFilePath = imagePath;
                if (imageFilePath.startsWith("/uploads/")) {
                    imageFilePath = imageFilePath.substring(9); // Remove /uploads/ prefix
                }

                File imageFile = new File(baseDir + "/" + imageFilePath);
                if (imageFile.exists()) {
                    boolean deleted = imageFile.delete();
                    System.out.println("Deleted image file: " + deleted + " - " + imageFile.getAbsolutePath());
                }
            }

            // Delete video file if exists
            if (videoPath != null && !videoPath.isEmpty()) {
                String videoFilePath = videoPath;
                if (videoFilePath.startsWith("/uploads/")) {
                    videoFilePath = videoFilePath.substring(9); // Remove /uploads/ prefix
                }

                File videoFile = new File(baseDir + "/" + videoFilePath);
                if (videoFile.exists()) {
                    boolean deleted = videoFile.delete();
                    System.out.println("Deleted video file: " + deleted + " - " + videoFile.getAbsolutePath());
                }
            }

        } catch (Exception e) {
            System.err.println("Error deleting files: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Find by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable Long userId) {
        return new ResponseEntity<List<Post>>(postService.getPostsByUserId(userId), HttpStatus.OK);
    }

    // Upload post with files
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Post> createPostWithFiles(
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestParam(value = "videoFile", required = false) MultipartFile videoFile,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("steps") String steps,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam("userID") Long userId) {

        try {
            // Create Post object
            Post post = new Post();
            post.setTitle(title);
            post.setDescription(description);
            post.setCategory(category);
            post.setSteps(steps);
            post.setTags(tags);
            post.setUserID(userId);
            // Save image file if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageFileName = saveFile(imageFile, "images");
                String imageUrl = "/uploads/images/" + imageFileName;
                post.setImage(imageUrl);
            }

            // Save video file if provided
            if (videoFile != null && !videoFile.isEmpty()) {
                String videoFileName = saveFile(videoFile, "videos");
                String videoUrl = "/uploads/videos/" + videoFileName;
                post.setVideo(videoUrl);
            }

            // Save the post
            Post savedPost = postService.savePost(post);
            return new ResponseEntity<>(savedPost, HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Helper method to save uploaded files
    private String saveFile(MultipartFile file, String directory) throws IOException {
        // Create base upload directory if it doesn't exist
        String baseUploadDir = System.getProperty("user.dir") + "/uploads";
        Path baseUploadPath = Paths.get(baseUploadDir);

        if (!Files.exists(baseUploadPath)) {
            Files.createDirectories(baseUploadPath);
            System.out.println("Created base uploads directory at: " + baseUploadPath.toAbsolutePath());
        }

        // Create specific directory (images or videos)
        String uploadDir = baseUploadDir + "/" + directory;
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            System.out.println("Created directory at: " + uploadPath.toAbsolutePath());
        }

        // Generate unique filename to prevent overwriting
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(uniqueFileName);

        // Save the file
        Files.copy(file.getInputStream(), filePath);
        System.out.println("File saved to: " + filePath.toAbsolutePath());

        return uniqueFileName;
    }
}