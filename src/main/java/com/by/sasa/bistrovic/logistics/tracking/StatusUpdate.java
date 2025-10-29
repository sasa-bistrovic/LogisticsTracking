package com.by.sasa.bistrovic.logistics.tracking;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class StatusUpdate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    private String status;
    
    private String timestamp;
    
    private String note;

    @ManyToOne
    private Location location;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore 
    private Order order;

    // Constructors
    public StatusUpdate() {}

    public StatusUpdate(String status, String timestamp, String note, Location location, Order order) {
        this.status = status;
        this.timestamp = timestamp;
        this.note = note;
        this.location = location;
        this.order = order;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

}
