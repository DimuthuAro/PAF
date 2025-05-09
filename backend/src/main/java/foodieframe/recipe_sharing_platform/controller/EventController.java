package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.Event;
import foodieframe.recipe_sharing_platform.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;
    
    // Enhanced create event method with detailed error handling
    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            System.out.println("[DEBUG] Incoming Event Payload: " + event);

            // Validate required fields
            StringBuilder validationErrors = new StringBuilder();

            if (event.getTitle() == null || event.getTitle().trim().length() < 6) {
                validationErrors.append("Title must be at least 6 characters long. ");
            }

            if (event.getDescription() == null || event.getDescription().trim().length() < 6) {
                validationErrors.append("Description must be at least 6 characters long. ");
            }

            if (event.getImage() == null || event.getImage().trim().isEmpty()) {
                // Set default image if not provided
                event.setImage("https://example.com/default-image.jpg");
            }

            if (event.getDate() == null || event.getDate().trim().length() < 6) {
                validationErrors.append("Date must be at least 6 characters long. ");
            }

            if (event.getLocation() == null || event.getLocation().trim().length() < 6) {
                validationErrors.append("Location must be at least 6 characters long. ");
            }

            if (event.getTime() == null || event.getTime().trim().length() < 6) {
                validationErrors.append("Time must be at least 6 characters long. ");
            }

            if (event.getUserId() == null) {
                validationErrors.append("UserId is required. ");
            }

            // If validation errors exist, return bad request
            if (validationErrors.length() > 0) {
                System.err.println("[ERROR] Validation failed: " + validationErrors.toString());
                return new ResponseEntity<>(validationErrors.toString(), HttpStatus.BAD_REQUEST);
            }

            Event savedEvent = eventService.saveEvent(event);
            System.out.println("[DEBUG] Event successfully saved: " + savedEvent);
            return new ResponseEntity<Event>(savedEvent, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to save event: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("An error occurred while creating the event: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Read all
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return new ResponseEntity<List<Event>>(eventService.getAllEvents(), HttpStatus.OK);
    }
    
    // Read one
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(event -> new ResponseEntity<>(event, HttpStatus.OK))
                .orElse(new ResponseEntity<Event>(HttpStatus.NOT_FOUND));
    }
    
    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        try {
            return new ResponseEntity<Event>(eventService.updateEvent(id, event), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Update (without ID in path)
    @PutMapping
    public ResponseEntity<?> updateEventNoPath(@RequestBody Event event) {
        if (event.getId() == null) {
            return new ResponseEntity<>("Event ID is required for update", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(eventService.updateEvent(event.getId(), event), HttpStatus.OK);
    }
    
    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}