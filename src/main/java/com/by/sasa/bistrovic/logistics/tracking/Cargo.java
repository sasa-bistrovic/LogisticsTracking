package com.by.sasa.bistrovic.logistics.tracking;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import java.util.UUID;

@Entity
public class Cargo {
    
    @Id
    private String id;
    private String description;
    private double weight;
    private double volume;
    private int items;
    private boolean requiresRefrigeration;
    private boolean isHazardous;
    private boolean isUrgent;

    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "dimensions_id")
    private Dimensions dimensions;
    
    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();  // Generiše UUID ako nije već postavljen
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }
    public double getVolume() { return volume; }
    public void setVolume(double volume) { this.volume = volume; }
    public int getItems() { return items; }
    public void setItems(int items) { this.items = items; }
    public boolean getRequiresRefrigeration() { return requiresRefrigeration; }
    public void setRequiresRefrigeration(boolean requiresRefrigeration) { this.requiresRefrigeration = requiresRefrigeration; }    
    public void setIsHazardous(boolean isHazardous) { this.isHazardous = isHazardous; }    
    public boolean getIsHazardous() { return isHazardous; }
    public boolean getIsUrgent() { return isUrgent; }
    public void setIsUrgent(boolean isUrgent) { this.isUrgent = isUrgent; }    
    public Dimensions getDimensions() { return dimensions; }
    public void setDimensions(Dimensions dimensions) { this.dimensions = dimensions; }            
}