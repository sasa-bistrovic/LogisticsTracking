package com.by.sasa.bistrovic.logistics.tracking;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
public class Vehicle {
    @Id
    private String id;
    
    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();  // Generiše UUID ako nije već postavljen
        }
    }

    @Enumerated(EnumType.STRING)
    private VehicleType type;

    private String model;
    private String licensePlate;
    private double maxWeight;
    private double maxVolume;
    private boolean isRefrigerated;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "current_location_id")
    private Location currentLocation;

    private boolean available;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore  // 🚀 This prevents recursive JSON serialization
    private User user;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public VehicleType getType() { return type; }
    public void setType(VehicleType type) { this.type = type; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public double getMaxWeight() { return maxWeight; }
    public void setMaxWeight(double maxWeight) { this.maxWeight = maxWeight; }
    public double getMaxVolume() { return maxVolume; }
    public void setMaxVolume(double maxVolume) { this.maxVolume = maxVolume; }
    public boolean getIsRefrigerated() { return isRefrigerated; }
    public void setIsRefrigerated(boolean isRefrigerated) { this.isRefrigerated = isRefrigerated; }
    public Location getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(Location currentLocation) { this.currentLocation = currentLocation; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

}