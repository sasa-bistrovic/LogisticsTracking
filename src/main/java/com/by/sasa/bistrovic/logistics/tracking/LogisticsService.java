package com.by.sasa.bistrovic.logistics.tracking;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LogisticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public List<Order> getEligibleOrders(User user) {
        
        if (user.getRole()==UserRole.orderer) {
            return orderRepository.findByOrdererId(user.getId());
        } else {
        List<Vehicle> userVehicles = vehicleRepository.findByUserId(user.getId());
        List<Order> pendingOrders = findPendingOrdersWithin500Km(userVehicles);
        
        Set<Order> eligibleOrders = new HashSet<>();

        for (Vehicle vehicle : userVehicles) {
            double currentWeight = getCurrentVehicleLoad(vehicle);
            double currentVolume = getCurrentVehicleVolume(vehicle);

            // Sabiramo težinu i zapreminu svih pending narudžbi koje nemaju dodeljeno vozilo
            for (Order order : pendingOrders) {
                if (order.getTransporterVehicleId() == null) {
                    double pendingWeight = 0;
                    double pendingVolume = 0;                    
                    pendingWeight += order.getCargo().getWeight() * order.getCargo().getItems();
                    pendingVolume += order.getCargo().getVolume() * order.getCargo().getItems();

                    // Proveravamo da li vozilo može podneti dodatni teret
                    if ((currentWeight + pendingWeight) <= vehicle.getMaxWeight() &&
                        (currentVolume + pendingVolume) <= vehicle.getMaxVolume()) {
                        eligibleOrders.add(order);
                    }                    
                }
            }
        }
/*            
            // Pronađi sve "accepted" ili "pickup" narudžbe povezane sa vozilima korisnika
            List<Order> acceptedOrPickupOrders = findAcceptedOrPickupOrdersForUser(user);

            // Pronađi referentnu lokaciju na osnovu narudžbi ili vozila
            Location referenceLocation = getReferenceLocation(user, acceptedOrPickupOrders);
            if (referenceLocation == null) {
                throw new IllegalStateException("No valid location found for user.");
            }

            // Pronađi sve "pending" narudžbe unutar 500 km od referentne lokacije
            List<Order> pendingOrders = findPendingOrdersWithinDistance(referenceLocation.getLatitude(), referenceLocation.getLongitude());

            // Proveri da li zajedno sa svakom "pending" narudžbom, ukupna težina i zapremina ne premašuju vozilo
            List<Order> eligibleOrders = new ArrayList<>();            
        
            for (Order pendingOrder : pendingOrders) {
                // Uzmimo trenutnu težinu i zapreminu svih prethodnih prihvaćenih/pickup narudžbi
                double totalWeight = 0.0;
                double totalVolume = 0.0;
                for (Order order : acceptedOrPickupOrders) {
                    totalWeight += order.getCargo().getWeight();
                    totalVolume += order.getCargo().getVolume();
                }

                // Dodajemo težinu i zapreminu trenutne pending narudžbe
                totalWeight += pendingOrder.getCargo().getWeight();
                totalVolume += pendingOrder.getCargo().getVolume();

                // Proveravamo sve vozila korisnika da vidimo da li neka može da preveze ovu kombinaciju narudžbi
                for (Vehicle vehicle : user.getVehicles()) {
                    if (totalWeight <= vehicle.getMaxWeight() && totalVolume <= vehicle.getMaxVolume()) {
                        eligibleOrders.add(pendingOrder);  // Ako vozilo može da preveze, dodajemo narudžbu
                        break;  // Nema potrebe da dalje proveravamo vozila za ovu narudžbu
                    }
                }
            }
            */
            List<Order> acceptedOrPickupOrInTransitOrDeliveredOrders = findAcceptedOrPickupOrInTransitOrDeliveredOrdersForUser(user);
            for (Order order : acceptedOrPickupOrInTransitOrDeliveredOrders) {
                eligibleOrders.add(order);  // Ako vozilo može da preveze, dodajemo narudžbu
            }
            
            return new ArrayList<>(eligibleOrders);            
            
        }
    }

    // Pronađi sve narudžbe "accepted" ili "pickup" vezane za vozila korisnika
    private List<Order> findAcceptedOrPickupOrdersForUser(User user) {
        return orderRepository.findByTransporterIdAndStatusIn(user.getId(), List.of(OrderStatus.accepted, OrderStatus.pickup, OrderStatus.in_transit));
    }
    
    private List<Order> findAcceptedOrPickupOrInTransitOrDeliveredOrdersForUser(User user) {
        return orderRepository.findByTransporterIdAndStatusIn(user.getId(), List.of(OrderStatus.determine_price, OrderStatus.accepted, OrderStatus.pickup, OrderStatus.in_transit));
    }

    // Pronađi referentnu lokaciju (vozilo ili narudžba)
    private Location getReferenceLocation(User user, List<Order> acceptedOrders) {
        // Prvo proveravamo da li neka narudžba već ima lokaciju
        for (Order order : acceptedOrders) {
            if (order.getCurrentLocation() != null) {
                return order.getCurrentLocation();
            }
        }

        // Ako nema narudžbi, proveravamo da li vozila imaju poznatu lokaciju
        for (Vehicle vehicle : user.getVehicles()) {
            if (vehicle.getCurrentLocation() != null) {
                return vehicle.getCurrentLocation();
            }
        }

        return null; // Ako nema lokacije, vraća null
    }

    // Pronađi sve pending narudžbe unutar 500 km od referentne lokacije
    private List<Order> findPendingOrdersWithinDistance(double refLatitude, double refLongitude) {
        List<Order> allPendingOrders = orderRepository.findByStatus(OrderStatus.pending);
        List<Order> nearbyOrders = new ArrayList<>();

        for (Order order : allPendingOrders) {
            Location pickupLocation = order.getPickupLocation();
            double distance = GeoUtils.calculateDistance(refLatitude, refLongitude, pickupLocation.getLatitude(), pickupLocation.getLongitude());
            if (distance <= 500.0) {  // Samo narudžbe unutar 500 km
                nearbyOrders.add(order);
            }
        }

        return nearbyOrders;
    }
    
    public Vehicle findEligibleUserVehicle(User user, String orderId) {
        List<Vehicle> userVehicles = vehicleRepository.findByUserId(user.getId());
        Optional<Order> pendingOrders = orderRepository.findById(orderId);
        
        Order order = pendingOrders.get();

        for (Vehicle vehicle : userVehicles) {
            double currentWeight = getCurrentVehicleLoad(vehicle);
            double currentVolume = getCurrentVehicleVolume(vehicle);

            // Sabiramo težinu i zapreminu svih pending narudžbi koje nemaju dodeljeno vozilo
            //for (Order order : pendingOrders) {
                if (order.getTransporterVehicleId() == null) {
                    double pendingWeight = 0;
                    double pendingVolume = 0;                    
                    pendingWeight += order.getCargo().getWeight() * order.getCargo().getItems();
                    pendingVolume += order.getCargo().getVolume() * order.getCargo().getItems();

                    // Proveravamo da li vozilo može podneti dodatni teret
                    if ((currentWeight + pendingWeight) <= vehicle.getMaxWeight() &&
                        (currentVolume + pendingVolume) <= vehicle.getMaxVolume()) {
                        return vehicle;
                    }                    
                }
            //}
        }

        return null;
    }
    
    public Vehicle findUserVehicle(User user, String orderId, String vehicleId) {
        Optional<Vehicle> userVehicles = vehicleRepository.findById(vehicleId);
        Optional<Order> pendingOrders = orderRepository.findById(orderId);
        
        Order order = pendingOrders.get();
        
        Vehicle vehicle = userVehicles.get();

        //for (Vehicle vehicle : userVehicles) {
            double currentWeight = getCurrentVehicleLoad(vehicle);
            double currentVolume = getCurrentVehicleVolume(vehicle);

            // Sabiramo težinu i zapreminu svih pending narudžbi koje nemaju dodeljeno vozilo
            //for (Order order : pendingOrders) {
                if (order.getTransporterVehicleId() == null) {
                    double pendingWeight = 0;
                    double pendingVolume = 0;                    
                    pendingWeight += order.getCargo().getWeight() * order.getCargo().getItems();
                    pendingVolume += order.getCargo().getVolume() * order.getCargo().getItems();

                    // Proveravamo da li vozilo može podneti dodatni teret
                    if ((currentWeight + pendingWeight) <= vehicle.getMaxWeight() &&
                        (currentVolume + pendingVolume) <= vehicle.getMaxVolume() &&
                         order.getCargo().getRequiresRefrigeration() == vehicle.getIsRefrigerated()) {
                        return vehicle;
                    }                    
                }
            //}
        //}

        return null;
    }

    private List<Order> findPendingOrdersWithin500Km(List<Vehicle> vehicles) {
        List<Order> allPendingOrders = orderRepository.findByStatus(OrderStatus.pending);
        List<Order> nearbyOrders = new ArrayList<>();

        for (Order order : allPendingOrders) {
            for (Vehicle vehicle : vehicles) {
                double distance = GeoUtils.calculateDistance(
                    order.getPickupLocation().getLatitude(),
                    order.getPickupLocation().getLongitude(),
                    vehicle.getCurrentLocation().getLatitude(),
                    vehicle.getCurrentLocation().getLongitude()
                );

                if (distance <= 100000.0) {
                    nearbyOrders.add(order);
                    break;
                }
            }
        }

        return nearbyOrders;
    }

    private double getCurrentVehicleLoad(Vehicle vehicle) {
        List<Order> activeOrders = orderRepository.findByStatusInAndTransporterVehicleId(
            Arrays.asList(OrderStatus.determine_price, OrderStatus.accepted, OrderStatus.in_transit, OrderStatus.pickup), vehicle.getId()
        );

        return activeOrders.stream().mapToDouble(o -> o.getCargo().getWeight() * o.getCargo().getItems()).sum();
    }

    private double getCurrentVehicleVolume(Vehicle vehicle) {
        List<Order> activeOrders = orderRepository.findByStatusInAndTransporterVehicleId(
            Arrays.asList(OrderStatus.determine_price, OrderStatus.accepted,OrderStatus.in_transit, OrderStatus.pickup), vehicle.getId()
        );

        return activeOrders.stream().mapToDouble(o -> o.getCargo().getVolume() * o.getCargo().getItems()).sum();
    }    
}