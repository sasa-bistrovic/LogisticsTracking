package com.by.sasa.bistrovic.logistics.tracking;

public class ProposePriceRequest {
    private double price;
    private String transporterId;
    private String transporterVehicleId;
    private Location currentLocation;
    private String currency;

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getTransporterId() { return transporterId; }
    public void setTransporterId(String transporterId) { this.transporterId = transporterId; }

    public String getTransporterVehicleId() { return transporterVehicleId; }
    public void setTransporterVehicleId(String transporterVehicleId) { this.transporterVehicleId = transporterVehicleId; }    
    
    public Location getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(Location currentLocation) { this.currentLocation = currentLocation; }    
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }    
}
