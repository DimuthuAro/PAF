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
    public Event saveEvent(Event event) {
        return eventRepository.save(event);
    }

    // Read all
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // Read one
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
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
