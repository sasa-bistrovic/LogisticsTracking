package com.by.sasa.bistrovic.logistics.tracking;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    private double basePrice;
    private double pricePerKm;
    private double pricePerKg;
    private double pricePerM3;
    private double pricePerApproachKm;
    private double coolingCoefficient;
    private double hazardousCoefficient;
    private double urgentCoefficient;
    private boolean isRefrigerated;
    @Enumerated(EnumType.STRING)
    private Currency currency;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "current_location_id")
    private Location currentLocation;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "dimensions_id")
    private Dimensions dimensions;

    private boolean available;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
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
    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }
    public double getPricePerKm() { return pricePerKm; }
    public void setPricePerKm(double pricePerKm) { this.pricePerKm = pricePerKm; }
    public double getPricePerKg() { return pricePerKg; }
    public void setPricePerKg(double pricePerKg) { this.pricePerKg = pricePerKg; }
    public double getPricePerM3() { return pricePerM3; }
    public void setPricePerM3(double pricePerM3) { this.pricePerM3 = pricePerM3; }
    public double getPricePerApproachKm() { return pricePerApproachKm; }
    public void setPricePerApproachKm(double pricePerApproachKm) { this.pricePerApproachKm = pricePerApproachKm; }
    public double getHazardousCoefficient() { return hazardousCoefficient; }
    public void setHazardousCoefficient(double hazardousCoefficient) { this.hazardousCoefficient = hazardousCoefficient; }
    public double getCoolingCoefficient() { return coolingCoefficient; }
    public void setCoolingCoefficient(double coolingCoefficient) { this.coolingCoefficient = coolingCoefficient; }
    public double getUrgentCoefficient() { return urgentCoefficient; }
    public void setUrgentCoefficient(double urgentCoefficient) { this.urgentCoefficient = urgentCoefficient; }
    public boolean getIsRefrigerated() { return isRefrigerated; }
    public void setIsRefrigerated(boolean isRefrigerated) { this.isRefrigerated = isRefrigerated; }
    public Location getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(Location currentLocation) { this.currentLocation = currentLocation; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public Dimensions getDimensions() { return dimensions; }
    public void setDimensions(Dimensions dimensions) { this.dimensions = dimensions; }        
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }        
}