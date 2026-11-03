package com.by.sasa.bistrovic.logistics.tracking;

public class StatusUpdateRequest {
    private String transporterId;
    private String transporterVehicleId;
    private Location currentLocation;
    private OrderStatus status;
    private String statusUpdate;
    private String timestamp;
    private String note;

    // Prazan konstruktor (potreban za deserializaciju)
    public StatusUpdateRequest() {}

    // Konstruktor sa svim poljima
    public StatusUpdateRequest(String transporterId, String transporterVehicleId, Location currentLocation, OrderStatus status, String statusUpdate, String timestamp, String note) {
        this.transporterId = transporterId;
        this.transporterVehicleId = transporterVehicleId;
        this.currentLocation = currentLocation;
        this.status = status;
        this.statusUpdate = statusUpdate;
        this.timestamp = timestamp;
        this.note = note;
    }

    // GETTERI
    public String getTransporterId() {
        return transporterId;
    }

    public String getTransporterVehicleId() {
        return transporterVehicleId;
    }

    public Location getCurrentLocation() {
        return currentLocation;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public String getStatusUpdate() {
        return statusUpdate;
    }
    
    public String getTimestamp() {
        return timestamp;
    }
    
    public String getNote() {
        return note;
    }    

    // SETTERI
    public void setTransporterId(String transporterId) {
        this.transporterId = transporterId;
    }

    public void setTransporterVehicleId(String transporterVehicleId) {
        this.transporterVehicleId = transporterVehicleId;
    }

    public void setCurrentLocation(Location currentLocation) {
        this.currentLocation = currentLocation;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public void setStatusUpdate(String statusUpdate) {
        this.statusUpdate = statusUpdate;
    }
    
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
    
    public void setNote(String note) {
        this.note = note;
    }

}