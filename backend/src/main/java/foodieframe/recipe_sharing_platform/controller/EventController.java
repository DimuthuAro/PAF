package foodieframe.recipe_sharing_platform.controller;

import foodieframe.recipe_sharing_platform.model.Event;
import foodieframe.recipe_sharing_platform.service.EventService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;
    
    // Create
    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event) {
        try {
            return new ResponseEntity<Event>(eventService.saveEvent(event), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
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
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @Valid @RequestBody Event event) {
        try {
            return new ResponseEntity<Event>(eventService.updateEvent(id, event), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // Update (without ID in path)
    @PutMapping
    public ResponseEntity<?> updateEventNoPath(@Valid @RequestBody Event event) {
        if (event.getId() == null) {
            return new ResponseEntity<>("Event ID is required for update", HttpStatus.BAD_REQUEST);
        }
        
        try {
            return new ResponseEntity<>(eventService.updateEvent(event.getId(), event), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
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