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
        if (user.getRole() == UserRole.orderer) {
            return orderRepository.findByOrdererId(user.getId());
        } else {
            List<Vehicle> userVehicles = vehicleRepository.findByUserId(user.getId());
            List<Order> pendingOrders = findPendingOrdersWithin500Km(userVehicles);
            Set<Order> eligibleOrders = new HashSet<>();

            //for (Vehicle vehicle : userVehicles) {
                /*
                List<Order> aktivneNarudzbe = orderRepository.findByStatusInAndTransporterVehicleId(
                    Arrays.asList(OrderStatus.determine_price, OrderStatus.accepted, OrderStatus.in_transit, OrderStatus.pickup),
                    vehicle.getId()
                );

                Dimenzije prostor = new Dimenzije(
                    vehicle.getDimensions().getLength(),
                    vehicle.getDimensions().getWidth(),
                    vehicle.getDimensions().getHeight()
                );
                double maxNosivost = vehicle.getMaxWeight();
                double ukupnaTezina = aktivneNarudzbe.stream().mapToDouble(o -> o.getCargo().getWeight() * o.getCargo().getItems()).sum();

                List<Teret> stavljeniTereti = new ArrayList<>();
                for (Order akt : aktivneNarudzbe) {
                    stavljeniTereti.add(new Teret(
                        akt.getId(),
                        akt.getCargo().getDimensions().getLength(),
                        akt.getCargo().getDimensions().getWidth(),
                        akt.getCargo().getDimensions().getHeight(),
                        akt.getCargo().getWeight()
                    ));
                }
                */
                //for (Order order : pendingOrders) {
                    /*
                    if (order.getTransporterVehicleId() != null || order.getCargo().getRequiresRefrigeration() != vehicle.getIsRefrigerated()) continue;

                    Teret novi = new Teret(
                        order.getId(),
                        order.getCargo().getDimensions().getLength(),
                        order.getCargo().getDimensions().getWidth(),
                        order.getCargo().getDimensions().getHeight(),
                        order.getCargo().getWeight()
                    );

                    if (mozeSeDodati(novi, stavljeniTereti, prostor, maxNosivost - ukupnaTezina)) {
                    */
                    //    eligibleOrders.add(order);
                    /*    
                    }
                    */
                //}
            //}

            List<Order> aktivne = findAcceptedOrPickupOrInTransitOrDeliveredOrdersForUser(user);
            eligibleOrders.addAll(aktivne);
            return new ArrayList<>(eligibleOrders);
        }
    }

    // Pronađi sve narudžbe "accepted" ili "pickup" vezane za vozila korisnika
    private List<Order> findAcceptedOrPickupOrdersForUser(User user) {
        return orderRepository.findByTransporterIdAndStatusIn(user.getId(), List.of(OrderStatus.accepted, OrderStatus.pickup, OrderStatus.in_transit));
    }
    
    private List<Order> findAcceptedOrPickupOrInTransitOrDeliveredOrdersForUser(User user) {
        return orderRepository.findByTransporterIdAndStatusIn(user.getId(), List.of(OrderStatus.pending, OrderStatus.cancelled, OrderStatus.determine_price, OrderStatus.accepted, OrderStatus.pickup, OrderStatus.in_transit, OrderStatus.delivered));
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
            double currentLength = getCurrentVehicleLength(vehicle);
            double currentWidth = getCurrentVehicleWidth(vehicle);
            double currentHeight = getCurrentVehicleHeight(vehicle);

            // Sabiramo težinu i zapreminu svih pending narudžbi koje nemaju dodeljeno vozilo
            //for (Order order : pendingOrders) {
                if (order.getTransporterVehicleId() == null) {
                    double pendingWeight = 0;
                    double pendingVolume = 0;                    
                    double pendingLength = 0;             
                    double pendingWidth = 0;             
                    double pendingHeight = 0;             
                    pendingWeight += order.getCargo().getWeight() * order.getCargo().getItems();
                    pendingVolume += order.getCargo().getVolume() * order.getCargo().getItems();
                    pendingLength += order.getCargo().getDimensions().getLength() * order.getCargo().getItems();
                    pendingWidth += order.getCargo().getDimensions().getWidth() * order.getCargo().getItems();
                    pendingHeight += order.getCargo().getDimensions().getHeight() * order.getCargo().getItems();

                    // Proveravamo da li vozilo može podneti dodatni teret
                    if ((currentWeight + pendingWeight) <= vehicle.getMaxWeight() &&
                        (currentVolume + pendingVolume) <= vehicle.getMaxVolume() &&
                        (currentLength + pendingLength) <= vehicle.getDimensions().getLength() &&
                        (currentWidth + pendingWidth) <= vehicle.getDimensions().getWidth() &&
                        (currentHeight + pendingHeight) <= vehicle.getDimensions().getHeight() &&
                        order.getCargo().getRequiresRefrigeration() == vehicle.getIsRefrigerated()) {
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
    
    private double getCurrentVehicleLength(Vehicle vehicle) {
        List<Order> activeOrders = orderRepository.findByStatusInAndTransporterVehicleId(
            Arrays.asList(OrderStatus.determine_price, OrderStatus.accepted,OrderStatus.in_transit, OrderStatus.pickup), vehicle.getId()
        );

        return activeOrders.stream().mapToDouble(o -> o.getCargo().getDimensions().getLength()* o.getCargo().getItems()).sum();
    }    
    
    private double getCurrentVehicleWidth(Vehicle vehicle) {
        List<Order> activeOrders = orderRepository.findByStatusInAndTransporterVehicleId(
            Arrays.asList(OrderStatus.determine_price, OrderStatus.accepted,OrderStatus.in_transit, OrderStatus.pickup), vehicle.getId()
        );

        return activeOrders.stream().mapToDouble(o -> o.getCargo().getDimensions().getWidth() * o.getCargo().getItems()).sum();
    }        
    
    private double getCurrentVehicleHeight(Vehicle vehicle) {
        List<Order> activeOrders = orderRepository.findByStatusInAndTransporterVehicleId(
            Arrays.asList(OrderStatus.determine_price, OrderStatus.accepted,OrderStatus.in_transit, OrderStatus.pickup), vehicle.getId()
        );

        return activeOrders.stream().mapToDouble(o -> o.getCargo().getDimensions().getHeight() * o.getCargo().getItems()).sum();
    }        

    public Vehicle findEligibleUserVehicle2(User user, String orderId) {
        List<Vehicle> userVehicles = vehicleRepository.findByUserId(user.getId());
        Optional<Order> pendingOrders = orderRepository.findById(orderId);

        if (pendingOrders.isEmpty()) return null;
        Order order = pendingOrders.get();

        for (Vehicle vehicle : userVehicles) {
            Dimenzije kamion = new Dimenzije(vehicle.getDimensions().getLength(),
                                             vehicle.getDimensions().getWidth(),
                                             vehicle.getDimensions().getHeight());
            double maxNosivost = vehicle.getMaxWeight();
            double ukupnaTezina = getCurrentVehicleLoad(vehicle);

            List<Teret> tereti = new ArrayList<>();
            tereti.add(new Teret(order.getId(),
                                  order.getCargo().getDimensions().getLength(),
                                  order.getCargo().getDimensions().getWidth(),
                                  order.getCargo().getDimensions().getHeight(),
                                  order.getCargo().getWeight()));

            List<Pozicija> zauzetePozicije = new ArrayList<>();
            List<Teret> stavljeni = new ArrayList<>();
            List<Pozicija> mogucePozicije = new ArrayList<>();
            mogucePozicije.add(new Pozicija(0, 0, 0, null));

            for (Teret t : tereti) {
                boolean stavljeno = false;
                for (Dimenzije rot : t.getSveRotacije()) {
                    for (Pozicija p : mogucePozicije) {
                        Pozicija nova = new Pozicija(p.x, p.y, p.z, rot);
                        if (!nova.unutar(kamion)) continue;
                        boolean kolizija = false;
                        for (Pozicija zauzeta : zauzetePozicije) {
                            if (nova.kolidira(zauzeta)) {
                                kolizija = true;
                                break;
                            }
                        }
                        if (!kolizija && ukupnaTezina + t.tezina <= maxNosivost &&
                            order.getCargo().getRequiresRefrigeration() == vehicle.getIsRefrigerated()) {

                            zauzetePozicije.add(nova);
                            stavljeni.add(t);
                            ukupnaTezina += t.tezina;

                            mogucePozicije.add(new Pozicija(nova.x + rot.duzina, nova.y, nova.z, null));
                            mogucePozicije.add(new Pozicija(nova.x, nova.y + rot.sirina, nova.z, null));
                            mogucePozicije.add(new Pozicija(nova.x, nova.y, nova.z + rot.visina, null));

                            stavljeno = true;
                            break;
                        }
                    }
                    if (stavljeno) break;
                }
            }
            if (!stavljeni.isEmpty()) {
                return vehicle;
            }
        }

        return null;
    }

    private static class Dimenzije {
        double duzina, sirina, visina;
        public Dimenzije(double d, double s, double v) {
            this.duzina = d;
            this.sirina = s;
            this.visina = v;
        }
    }

    private static class Teret {
        String id;
        Dimenzije original;
        double tezina;

        public Teret(String id, double d, double s, double v, double t) {
            this.id = id;
            this.original = new Dimenzije(d, s, v);
            this.tezina = t;
        }

        public List<Dimenzije> getSveRotacije() {
            List<Dimenzije> rotacije = new ArrayList<>();
            double[] d = {original.duzina, original.sirina, original.visina};
            for (int i = 0; i < 3; i++) {
                for (int j = 0; j < 3; j++) {
                    if (j == i) continue;
                    int k = 3 - i - j;
                    rotacije.add(new Dimenzije(d[i], d[j], d[k]));
                }
            }
            return rotacije;
        }
    }

    private static class Pozicija {
        double x, y, z;
        Dimenzije dim;

        public Pozicija(double x, double y, double z, Dimenzije dim) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.dim = dim;
        }

        public boolean kolidira(Pozicija druga) {
            return x < druga.x + druga.dim.duzina &&
                   x + dim.duzina > druga.x &&
                   y < druga.y + druga.dim.sirina &&
                   y + dim.sirina > druga.y &&
                   z < druga.z + druga.dim.visina &&
                   z + dim.visina > druga.z;
        }

        public boolean unutar(Dimenzije granice) {
            return x + dim.duzina <= granice.duzina &&
                   y + dim.sirina <= granice.sirina &&
                   z + dim.visina <= granice.visina;
        }
    }
    private boolean mozeSeDodati(Teret novi, List<Teret> postojeci, Dimenzije prostor, double preostalaTezina) {
        if (novi.tezina > preostalaTezina) return false;

        List<Pozicija> zauzete = new ArrayList<>();
        List<Pozicija> moguce = new ArrayList<>();
        moguce.add(new Pozicija(0, 0, 0, null));

        for (Teret t : postojeci) {
            zauzete.add(new Pozicija(0, 0, 0, t.original));
        }

        for (Dimenzije rot : novi.getSveRotacije()) {
            for (Pozicija p : moguce) {
                Pozicija nova = new Pozicija(p.x, p.y, p.z, rot);
                if (!nova.unutar(prostor)) continue;
                boolean kolizija = false;
                for (Pozicija z : zauzete) {
                    if (nova.kolidira(z)) {
                        kolizija = true;
                        break;
                    }
                }
                if (!kolizija) return true;
            }
        }
        return false;
    }
}