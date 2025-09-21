package com.by.sasa.bistrovic.logistics.tracking;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")  // Avoids conflict with PostgreSQL's "ORDER" keyword
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Order {

    @Id
    private String id;
    
    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();  // Generiše UUID ako nije već postavljen
        }
    }

    private String ordererId;
    private String transporterId;
    private String transporterVehicleId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime scheduledPickup;
    private LocalDateTime estimatedDelivery;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "pickup_location_id")
    private Location pickupLocation;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "delivery_location_id")
    private Location deliveryLocation;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "cargo_id")
    private Cargo cargo;

    private double price;
    private double proposedPrice;
    private double distanceKm;
    private double transporterToPickupDistanceKm;
    private String currency;
    private String notes;

    @ManyToOne
    @JoinColumn(name = "current_location_id", nullable = true)
    private Location currentLocation;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StatusUpdate> statusUpdates = new ArrayList<>();

    // Constructors
    public Order() {
        this.createdAt = LocalDateTime.now();
    }

    public Order(String ordererId, String transporterId, String transporterVehicleId, OrderStatus status,
                 LocalDateTime scheduledPickup, LocalDateTime estimatedDelivery, Location pickupLocation,
                 Location deliveryLocation, Cargo cargo, double price, double proposedPrice, double distanceKm, double transporterToPickupDistanceKm, String currency, String notes,
                 Location currentLocation) {
        this.ordererId = ordererId;
        this.transporterId = transporterId;
        this.transporterVehicleId = transporterVehicleId;
        this.status = status;
        this.createdAt = LocalDateTime.now();
        this.scheduledPickup = scheduledPickup;
        this.estimatedDelivery = estimatedDelivery;
        this.pickupLocation = pickupLocation;
        this.deliveryLocation = deliveryLocation;
        this.cargo = cargo;
        this.price = price;
        this.proposedPrice = proposedPrice;
        this.currency = currency;
        this.notes = notes;
        this.currentLocation = currentLocation;
        this.distanceKm = distanceKm;
        this.transporterToPickupDistanceKm = transporterToPickupDistanceKm;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrdererId() { return ordererId; }
    public void setOrdererId(String ordererId) { this.ordererId = ordererId; }

    public String getTransporterId() { return transporterId; }
    public void setTransporterId(String transporterId) { this.transporterId = transporterId; }

    public String getTransporterVehicleId() { return transporterVehicleId; }
    public void setTransporterVehicleId(String transporterVehicleId) { this.transporterVehicleId = transporterVehicleId; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }    

    public LocalDateTime getScheduledPickup() { return scheduledPickup; }
    public void setScheduledPickup(LocalDateTime scheduledPickup) { this.scheduledPickup = scheduledPickup; }

    public LocalDateTime getEstimatedDelivery() { return estimatedDelivery; }
    public void setEstimatedDelivery(LocalDateTime estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }

    public Location getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(Location pickupLocation) { this.pickupLocation = pickupLocation; }

    public Location getDeliveryLocation() { return deliveryLocation; }
    public void setDeliveryLocation(Location deliveryLocation) { this.deliveryLocation = deliveryLocation; }

    public Cargo getCargo() { return cargo; }
    public void setCargo(Cargo cargo) { this.cargo = cargo; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getProposedPrice() { return proposedPrice; }
    public void setProposedPrice(double proposedPrice) { this.proposedPrice = proposedPrice; }

    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }

    public double getTransporterToPickupDistanceKm() { return transporterToPickupDistanceKm; }
    public void setTransporterToPickupDistanceKm(double transporterToPickupDistanceKm) { this.transporterToPickupDistanceKm = transporterToPickupDistanceKm; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Location getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(Location currentLocation) { this.currentLocation = currentLocation; }

    public List<StatusUpdate> getStatusUpdates() { return statusUpdates; }
    public void setStatusUpdates(List<StatusUpdate> statusUpdates) { this.statusUpdates = statusUpdates; }
    
    public List<StatusUpdate> getStatusUpdate() {
        return statusUpdates;
    }    
    
    public void setStatusUpdate(List<StatusUpdate> statusUpdates) {
        this.statusUpdates = statusUpdates;
    }

    public void addStatusUpdate(StatusUpdate statusUpdate) {
        statusUpdates.add(statusUpdate);
        statusUpdate.setOrder(this); // Postavlja referencu na ovog korisnika
    }
}
