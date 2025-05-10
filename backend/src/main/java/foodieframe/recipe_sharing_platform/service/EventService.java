package foodieframe.recipe_sharing_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import foodieframe.recipe_sharing_platform.model.Event;
import foodieframe.recipe_sharing_platform.repository.EventRepository;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    // Create
    // Enhanced save event method with more robust error handling
    public Event saveEvent(Event event) {
        try {
            System.out.println("[DEBUG] Saving event to database: " + event);

            // Set default values for missing fields
            if (event.getImage() == null || event.getImage().trim().isEmpty()) {
                event.setImage("https://example.com/default-image.jpg");
            }

            // Convert time to have minimum length if necessary
            if (event.getTime() != null && event.getTime().length() < 6) {
                event.setTime(event.getTime() + " (24-hour format)");
            }

            // Convert date to have minimum length if necessary
            if (event.getDate() != null && event.getDate().length() < 6) {
                event.setDate(event.getDate() + " (YYYY-MM-DD)");
            }

            Event savedEvent = eventRepository.save(event);
            System.out.println("[DEBUG] Event saved successfully: " + savedEvent);
            return savedEvent;
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to save event: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save event: " + e.getMessage(), e);
        }
    }

    // Read all
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // Read one
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }
    
    // Search events by a search term across multiple fields
    public List<Event> searchEvents(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllEvents();
        }
        return eventRepository.searchEvents(searchTerm);
    }
    
    // Get events by user ID
    public List<Event> getEventsByUserId(Long userId) {
        return eventRepository.findByUserId(userId);
    }

    // Update
    public Event updateEvent(Long id, Event eventDetails) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setImage(eventDetails.getImage());
        event.setDate(eventDetails.getDate());
        event.setLocation(eventDetails.getLocation());
        event.setTime(eventDetails.getTime());
        event.setLocation(eventDetails.getLocation());
        event.setDescription(eventDetails.getDescription());
        return eventRepository.save(event);
    }

    // Delete
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + id));
        eventRepository.delete(event);
    }
}
