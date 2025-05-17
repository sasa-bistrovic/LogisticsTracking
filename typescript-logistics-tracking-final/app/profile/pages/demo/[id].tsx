import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator, TextInput, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Package, 
  Calendar, 
  Clock, 
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Snowflake,
  Ruler,
  AlertTriangle,
  Globe,
  Navigation,
  Box,
  Phone,
  Truck,
  User, Repeat, Car, ClipboardList, List, PlusCircle, 
  Calculator, UserCircle, 
  Hand, ThumbsUp, Eye, LogOut, Search
} from 'lucide-react-native';
import { useOrderStore2 } from '@/store/orderStore2';
import { useAuthStore2 } from '@/store/authStore2';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { StatusTimeline } from '@/components/StatusTimeline';
import MapView from '@/components/MapView';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel, calculateDistance, calculateTransportPrice, requestLocationPermission } from '@/utils/helpers';
import { geocodeAddress } from '@/utils/geocoding';
import { Order, OrderStatus, Vehicle, Location as LocationType, LoginCredentials } from '@/types';
//import Geolocation from '@react-native-community/geolocation';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userTest = useAuthStore2(state => state.userTest);
  const { isLoading, getOrders2, updateOrderById, getAvailableOrders } = useOrderStore2();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [orderer, setOrderer] = useState<undefined>(undefined);  
  const [transporter, setTransporter] = useState<undefined>(undefined);
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [geocodedLocations, setGeocodedLocations] = useState<{
    pickup?: LocationType;
    delivery?: LocationType;
    current?: LocationType;
  }>({});
  const [proposedPrice, setProposedPrice] = useState<string>('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [showPriceInput, setShowPriceInput] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState<boolean>(false);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [approachDistanceKm, setApproachDistanceKm] = useState<number | null>(null);
  const { login, no, nonumber, getTransporter, getOrderer, getVehicle} = useAuthStore2();

  const steps = [
    { title: "Switch to Transporter Account", action: () => { nonumber();} },
    { title: "Start Vehicle Registration", action: () => { nonumber(); router.replace('/profile/pages/add'); } },
    { title: "Add Vehicle Details", action: () => { nonumber(); /* continue logic */ } },
    { title: "Switch to Orderer Account", action: () => { nonumber(); } },
    { title: "View Your Orders", action: () => { nonumber(); router.replace('/profile/pages/list'); } },
    { title: "Create a New Transport Order", action: () => { nonumber(); } },
    { title: "Enter Cargo Information", action: () => { nonumber(); } },
    { title: "Enter Pickup and Delivery Locations", action: () => { nonumber(); } },
    { title: "Calculate the Transport Price", action: () => { nonumber(); } },
    { title: "Confirm and Create the Order", action: () => { nonumber(); } },
    { title: "Go to Your Profile Page", action: () => { nonumber(); router.replace('/profile/pages/profile'); } },
    { title: "Switch Back to Transporter Account", action: () => { nonumber(); } },
    { title: "Browse Available Orders", action: () => { nonumber(); router.replace('/profile/pages/list'); } },
    { title: "Select an Order to Manage", action: () => { nonumber(); } },
    { title: "Accept the Selected Order", action: () => { nonumber();handleUpdateStatus('accepted'); } },
    { title: "View the Accepted Order", action: () => { nonumber(); } },
    { title: "Pickup the Cargo", action: () => { nonumber();handleUpdateStatus('pickup'); } },
    { title: "View Ongoing Orders", action: () => { nonumber();  } },
    { title: "Mark as In Transit", action: () => { nonumber();handleUpdateStatus('in_transit'); } },
    { title: "Open the Order Details", action: () => { nonumber();  } },
    { title: "Complete Delivery and Confirm", action: () => { nonumber();handleUpdateStatus('delivered'); } },
    { title: "Exit the Demo and Return to Profile", action: () => { nonumber(); router.replace('/(tabs)/profile'); } },
  ];


  
const StepButtons = ({ steps, isLoading = false, isDisabled = false }: { steps: { title: string; action: () => void }[], isLoading?: boolean, isDisabled?: boolean }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(no);

  const handlePress = () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep) {
      currentStep.action();
    }
  };

  const currentStep = steps[currentStepIndex];

  if (!currentStep) {
    return null; // Ako nema više koraka, ništa ne prikazuje
  }

  return (
      <Button
        title={currentStep.title}
        onPress={handlePress}
        disabled={isDisabled}
        isLoading={isLoading}
        leftIcon={getStepIcon(currentStep.title)}
        style={styles.button}
      />
  );
};

const getStepIcon = (title: string) => {
  const lower = title.toLowerCase();

  if (lower.includes('switch to transporter')) return <Repeat size={20} color="white" />;
  if (lower.includes('start vehicle registration')) return <Car size={20} color="white" />;
  if (lower.includes('add vehicle details')) return <ClipboardList size={20} color="white" />;
  if (lower.includes('switch to orderer')) return <Repeat size={20} color="white" />;
  if (lower.includes('view your orders')) return <List size={20} color="white" />;
  if (lower.includes('create a new transport order')) return <PlusCircle size={20} color="white" />;
  if (lower.includes('enter cargo information')) return <Package size={20} color="white" />;
  if (lower.includes('enter pickup and delivery locations')) return <MapPin size={20} color="white" />;
  if (lower.includes('calculate the transport price')) return <Calculator size={20} color="white" />;
  if (lower.includes('confirm and create the order')) return <CheckCircle size={20} color="white" />;
  if (lower.includes('go to your profile page')) return <UserCircle size={20} color="white" />;
  if (lower.includes('switch back to transporter')) return <Repeat size={20} color="white" />;
  if (lower.includes('browse available orders')) return <Search size={20} color="white" />;
  if (lower.includes('select an order to manage')) return <Hand size={20} color="white" />;
  if (lower.includes('accept the selected order')) return <ThumbsUp size={20} color="white" />;
  if (lower.includes('view the accepted order')) return <Eye size={20} color="white" />;
  if (lower.includes('pickup the cargo')) return <Truck size={20} color="white" />;
  if (lower.includes('view ongoing orders')) return <Clock size={20} color="white" />;
  if (lower.includes('mark as in transit')) return <Truck size={20} color="white" />;
  if (lower.includes('open the order details')) return <FileText size={20} color="white" />;
  if (lower.includes('complete delivery and confirm')) return <CheckCircle size={20} color="white" />;
  if (lower.includes('exit the demo and return to profile')) return <LogOut size={20} color="white" />;

  return null;
};

  
  // Use a ref to track initial mount
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const orders = getOrders2();

        const order = orders.find(order => order.id === id);

        //const orderData = await getOrderById(id); // dodan await
        setOrder(order);
  
        if (order) {
          geocodeOrderAddresses(order);
        }
      }
    };
    fetchData();
  }, [id]);

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) {
      document.body.style.overflow = "hidden"; // Disable scroll
    } else {
      document.body.style.overflow = "auto"; // Enable scroll
    }

    return () => {
      document.body.style.overflow = "auto"; // Ensure cleanup
    };
  }, [isFocused]);

  const handleCallPhone = (phoneNumber: string) => {
    if (!phoneNumber) return;
  
    const phoneUrl = `tel:${phoneNumber}`;
  
    if (Platform.OS === 'web') {
      // Na webu samo otvorimo link
      window.open(phoneUrl, '_self');
      return;
    }
  
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Nije podržano', 'Vaš uređaj ne podržava pozive.');
        }
      })
      .catch(error => {
        //console.error('Greška pri otvaranju aplikacije za pozive:', error);
        Alert.alert('Greška', 'Ne možemo da otvorimo aplikaciju za pozive.');
      });
  };
  
  const loadData = async () => {
    const responseOrderer = await getOrderer();
    setOrderer(responseOrderer);
  
    const responseTransporter = await getTransporter();
    setTransporter(responseTransporter);
  
    const responseVehicle = await getVehicle();
    setVehicle(responseVehicle);
  };
  
  useEffect(() => {
    loadData();
  }, []);
    
    const geocodeOrderAddresses = async (orderData: Order) => {
      setIsGeocodingLoading(true);
      
      try {
        const locations: {
          pickup?: LocationType;
          delivery?: LocationType;
          current?: LocationType;
        } = {};
        
        // Geocode pickup location if it doesn't have coordinates
        if (orderData.pickupLocation && 
            (!orderData.pickupLocation.latitude || !orderData.pickupLocation.longitude)) {
          const pickupCoords = await geocodeAddress(orderData.pickupLocation.address);
          if (pickupCoords) {
            locations.pickup = {
              ...orderData.pickupLocation,
              ...pickupCoords
            };
          }
        } else {
          locations.pickup = orderData.pickupLocation;
        }
        
        // Geocode delivery location if it doesn't have coordinates
        if (orderData.deliveryLocation && 
            (!orderData.deliveryLocation.latitude || !orderData.deliveryLocation.longitude)) {
          const deliveryCoords = await geocodeAddress(orderData.deliveryLocation.address);
          if (deliveryCoords) {
            locations.delivery = {
              ...orderData.deliveryLocation,
              ...deliveryCoords
            };
          }
        } else {
          locations.delivery = orderData.deliveryLocation;
        }
        
        // Geocode current location if it exists and doesn't have coordinates
        if (orderData.currentLocation && 
            (!orderData.currentLocation.latitude || !orderData.currentLocation.longitude)) {
          const currentCoords = await geocodeAddress(orderData.currentLocation.address);
          if (currentCoords) {
            locations.current = {
              ...orderData.currentLocation,
              ...currentCoords
            };
          }
        } else if (orderData.currentLocation) {
          locations.current = orderData.currentLocation;
        }
        
        setGeocodedLocations(locations);

        if (locations.pickup?.latitude && locations.pickup?.longitude && 
          locations.delivery?.latitude && locations.delivery?.longitude) {
        const distance = calculateDistance(
          locations.pickup.latitude,
          locations.pickup.longitude,
          locations.delivery.latitude,
          locations.delivery.longitude
        );
        setDistanceKm(distance);
      }
      } catch (error) {
        //console.error('Error geocoding addresses:', error);
      } finally {
        setIsGeocodingLoading(false);
      }
    };

    async function reverseGeocode(lat: number, lon: number): Promise<string> {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CargoConnect/1.0 (sasa.bistrovic@gmail.com)', // obavezno za Nominatim
        }
      });
    
      if (!response.ok) {
        throw new Error(`Greška: ${response.statusText}`);
      }
    
      const data = await response.json();
      return data.display_name || 'Adresa nije pronađena';
    }  

    const handleUpdateStatus = async (newStatus: OrderStatus) => {
      if (!order || !id) return;
  
      setIsDisabled(true);
      try {
      
 
              const orders = getOrders2();

              const updatedOrder = orders.find(order => order.id === id);

              const updatedOrder2 = {
                ...updatedOrder,
                status: newStatus,
                statusUpdates: [
                  ...(updatedOrder?.statusUpdates || []), // postojeći statusUpdates ako ih ima
                  {
                    status: newStatus,
                    timestamp: new Date().toISOString(),
                    note: `Status updated to ${newStatus}`,
                  },
                ],
              };

              updateOrderById(id, updatedOrder2);

              setOrder(updatedOrder2);

              getOrders2();

              setIsDisabled(false);

              router.replace('/profile/pages/list');
              
      } catch (error) {
        setIsDisabled(false);
        Alert.alert('Error', 'Failed to update order status');
      }
    };
    
    const handleProposePrice = async () => {
      if (!order || !id || !userTest || !selectedVehicle) return;
      
      // Use calculated price if available, otherwise use manually entered price
      const finalPrice = calculatedPrice || Number(proposedPrice);
      
      if (isNaN(finalPrice) || finalPrice <= 0) {
        Alert.alert('Invalid Price', 'Please enter a valid price');
        return;
      }
      
      try {
      } catch (error) {
        Alert.alert('Error', 'Failed to propose price');
      }
    };
    
    const handleAcceptPrice = async () => {
      if (!order || !id) return;
      
      try {
        // Refresh order data
      } catch (error) {
        Alert.alert('Error', 'Failed to accept price');
      }
    };
    
    const handleSelectVehicle = (vehicle: Vehicle) => {
      setSelectedVehicle(vehicle);
      
      // Calculate price automatically based on the formula
      if (order && distanceKm) {
        // Calculate approach distance from vehicle to pickup location
        let approachDistance = 0;
        if (vehicle.currentLocation && order.pickupLocation &&
            vehicle.currentLocation.latitude && vehicle.currentLocation.longitude &&
            order.pickupLocation.latitude && order.pickupLocation.longitude) {
          approachDistance = calculateDistance(
            vehicle.currentLocation.latitude,
            vehicle.currentLocation.longitude,
            order.pickupLocation.latitude,
            order.pickupLocation.longitude
          );
        }
        setApproachDistanceKm(approachDistance);
        
        const price = calculateTransportPrice(
          distanceKm,
          order.cargo.weight,
          order.cargo.volume,
          order.cargo.requiresRefrigeration,
          order.cargo.isHazardous,
          order.cargo.isUrgent,
          vehicle.basePrice,
          vehicle.pricePerKm,
          vehicle.pricePerKg,
          vehicle.pricePerM3,
          vehicle.coolingCoefficient,
          vehicle.hazardousCoefficient,
          vehicle.urgentCoefficient,
          approachDistance,
          vehicle.pricePerApproachKm || 0
        );
        
        setCalculatedPrice(price);
        setProposedPrice(price.toString());
      }
    };
    
    const startPriceProposal = () => {
      if (!userTest) {
        Alert.alert('Authentication Required', 'Please log in to propose a price');
        return;
      }
      
      if (!userTest.vehicles || userTest.vehicles.length === 0) {
        Alert.alert('No Vehicles', 'You need to add a vehicle before you can propose a price');
        return;
      }
      
      // Check if order requires refrigeration and filter vehicles accordingly
      const availableVehicles = userTest.vehicles.filter(v => 
        v.available && 
        (!order?.cargo.requiresRefrigeration || v.isRefrigerated)
      );
      
      if (availableVehicles.length === 0) {
        if (order?.cargo.requiresRefrigeration) {
          Alert.alert('No Suitable Vehicles', 'This order requires a refrigerated vehicle, but you don\'t have any available');
        } else {
          Alert.alert('No Available Vehicles', 'You don\'t have any available vehicles');
        }
        return;
      }
      
      // If there's only one suitable vehicle, select it automatically
      if (availableVehicles.length === 1) {
        setSelectedVehicle(availableVehicles[0]);
        
        // Calculate price automatically
        if (order && distanceKm) {
          // Calculate approach distance from vehicle to pickup location
          let approachDistance = 0;
          if (availableVehicles[0].currentLocation && order.pickupLocation &&
              availableVehicles[0].currentLocation.latitude && availableVehicles[0].currentLocation.longitude &&
              order.pickupLocation.latitude && order.pickupLocation.longitude) {
            approachDistance = calculateDistance(
              availableVehicles[0].currentLocation.latitude,
              availableVehicles[0].currentLocation.longitude,
              order.pickupLocation.latitude,
              order.pickupLocation.longitude
            );
          }
          setApproachDistanceKm(approachDistance);
          
          const price = calculateTransportPrice(
            distanceKm,
            order.cargo.weight,
            order.cargo.volume,
            order.cargo.requiresRefrigeration,
            order.cargo.isHazardous,
            order.cargo.isUrgent,
            availableVehicles[0].basePrice,
            availableVehicles[0].pricePerKm,
            availableVehicles[0].pricePerKg,
            availableVehicles[0].pricePerM3,
            availableVehicles[0].coolingCoefficient,
            availableVehicles[0].hazardousCoefficient,
            availableVehicles[0].urgentCoefficient,
            approachDistance,
            availableVehicles[0].pricePerApproachKm || 0
          );
          
          setCalculatedPrice(price);
          setProposedPrice(price.toString());
        }
        
        setShowPriceInput(true);
      } else {
        // Show vehicle selector if multiple vehicles are available
        setShowVehicleSelector(true);
      }
    };
    
    const handleContinueToPrice = () => {
      if (selectedVehicle) {
        setShowPriceInput(true);
      } else {
        Alert.alert('Vehicle Required', 'Please select a vehicle first');
      }
    };
    
    const renderStatusActions = () => {
      if (!order || !userTest) return null;
      
      // Orderer can cancel pending orders or accept proposed prices
      if (userTest.role === 'orderer' && order.ordererId === userTest.id) {
        if (order.status === 'pending') {
          return (
            <Button 
              title="Cancel Order" 
              variant="outline"
              leftIcon={<XCircle size={20} color={colors.danger} />}
              onPress={() => handleUpdateStatus('cancelled')}
              disabled={isDisabled}
              isLoading={isLoading}
              style={styles.cancelButton}
              textStyle={{ color: colors.danger }}
            />
          );
        } else if (order.status === 'determine_price') {
          return (
            <View style={styles.actionButtonsRow}>
              <Button 
                title="Accept Price" 
                leftIcon={<CheckCircle size={20} color={colors.white} />}
                onPress={handleAcceptPrice}
                isLoading={isLoading}
                style={styles.acceptButton}
              />
              <Button 
                title="Decline" 
                variant="outline"
                leftIcon={<XCircle size={20} color={colors.danger} />}
                onPress={() => handleUpdateStatus('cancelled')}
                disabled={isDisabled}
                isLoading={isLoading}
                style={styles.declineButton}
                textStyle={{ color: colors.danger }}
              />
            </View>
          );
        }
        return null;
      }
      
      // Transporter actions based on current status
      if (userTest.role === 'transporter') {
        switch (order.status) {
          case 'pending':
            return (
                          <View style={styles.actionButtonsRow}>
                            <Button 
                              title="Accept Order" 
                              leftIcon={<CheckCircle size={20} color={colors.white} />}
                              onPress={() => handleUpdateStatus('accepted')}
                              isLoading={isLoading}
                              disabled={isDisabled}
                              style={styles.acceptButton}
                            />
                            <Button 
                              title="Decline" 
                              variant="outline"
                              leftIcon={<XCircle size={20} color={colors.danger} />}
                              onPress={() => handleUpdateStatus('cancelled')}
                              isLoading={isLoading}
                              disabled={isDisabled}
                              style={styles.declineButton}
                              textStyle={{ color: colors.danger }}
                            />
                          </View>
            );
          case 'accepted':
            return (
              <Button 
                title="Mark as Picked Up" 
                leftIcon={<Truck size={20} color={colors.white} />}
                onPress={() => handleUpdateStatus('pickup')}
                disabled={isDisabled}
                isLoading={isLoading}
              />
            );
          case 'pickup':
            return (
              <Button 
                title="Start Transit" 
                leftIcon={<Truck size={20} color={colors.white} />}
                onPress={() => handleUpdateStatus('in_transit')}
                disabled={isDisabled}
                isLoading={isLoading}
              />
            );
          case 'in_transit':
            return (
              <Button 
                title="Mark as Delivered" 
                leftIcon={<CheckCircle size={20} color={colors.white} />}
                onPress={() => handleUpdateStatus('delivered')}
                disabled={isDisabled}
                isLoading={isLoading}
              />
            );
          default:
            return null;
        }
      }
      
      return null;
    };
    
    // Create an order object with geocoded locations for the map
    const getOrderWithGeocodedLocations = () => {
      if (!order) return undefined;
      
      return {
        ...order,
        pickupLocation: geocodedLocations.pickup || order.pickupLocation,
        deliveryLocation: geocodedLocations.delivery || order.deliveryLocation,
        currentLocation: geocodedLocations.current || order.currentLocation,
      };
    };
    
    if (!order) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Loading order details...</Text>
        </View>
      );
    }
    
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>

<View style={styles.section}>
        <View style={styles.demoBanner}>
                            <Text style={styles.demoBannerTitle}>Demo Mode</Text>
                            <Text style={styles.demoBannerText}>
                              This form is pre-filled with sample data.
                            </Text>
                          </View>
                          </View>

        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{order.id.slice(-4)}</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(order.status) }
            ]}>
              <Text style={styles.statusText}>
                {getStatusLabel(order.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.date}>Created on {formatDate(order.createdAt)}</Text>
        </View>
        
        <View style={styles.mapSection}>
          {isGeocodingLoading ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.mapLoadingText}>Loading map data...</Text>
            </View>
          ) : (
            <MapView order={getOrderWithGeocodedLocations()} />
          )}
        </View>

        <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  
                  <View style={styles.card}>
                    {/* Show orderer info to transporters */}
                      <View style={styles.contactItem}>
                        <View style={[styles.contactIcon, { backgroundColor: colors.primaryLight }]}>
                          <User size={20} color={colors.primary} />
                        </View>
                        <View style={styles.contactContent}>
                          <Text style={styles.contactLabel}>Orderer</Text>
                          <Text style={styles.contactName}>{orderer?.name}</Text>
                          <View style={styles.phoneContainer}>
                            <Text style={styles.phoneNumber}>{orderer?.phone}</Text>
                            <TouchableOpacity 
                              style={styles.callButton}
                              onPress={() => handleCallPhone(orderer?.phone)}
                            >
                              <Phone size={16} color={colors.white} />
                              <Text style={styles.callButtonText}>Call</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
        
                    {/* Show transporter info to orderers */}
                      <View style={styles.contactItem}>
                        <View style={[styles.contactIcon, { backgroundColor: colors.secondaryLight }]}>
                          <Truck size={20} color={colors.secondary} />
                        </View>
                        <View style={styles.contactContent}>
                          <Text style={styles.contactLabel}>Transporter</Text>
                          <Text style={styles.contactName}>{transporter?.name}</Text>
                          <View style={styles.phoneContainer}>
                            <Text style={styles.phoneNumber}>{transporter?.phone}</Text>
                            <TouchableOpacity 
                              style={styles.callButton}
                              onPress={() => handleCallPhone(transporter?.phone)}
                            >
                              <Phone size={16} color={colors.white} />
                              <Text style={styles.callButtonText}>Call</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                  </View>
                </View>
        
       <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locations</Text>
          
          <View style={styles.card}>
            <View style={styles.locationItem}>
              <View style={[styles.locationIcon, { backgroundColor: colors.primaryLight }]}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text style={styles.locationAddress}>{order.pickupLocation.address}</Text>
                <Text style={styles.locationTime}>
                  {formatDate(order.scheduledPickup, true)}
                </Text>
              </View>
            </View>
            
            <View style={styles.locationConnector} />
            
            <View style={styles.locationItem}>
              <View style={[styles.locationIcon, { backgroundColor: colors.secondaryLight }]}>
                <MapPin size={20} color={colors.secondary} />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Delivery Location</Text>
                <Text style={styles.locationAddress}>{order.deliveryLocation.address}</Text>
                <Text style={styles.locationTime}>
                  {formatDate(order.estimatedDelivery, true)}
                </Text>
              </View>
            </View>
            
            <View style={styles.distanceContainer}>
              {distanceKm && (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    Transport Distance: {distanceKm} km
                  </Text>
                </View>
              )}
              
              {order.transporterToPickupDistanceKm && order.transporterToPickupDistanceKm > 0 && (
                <View style={[styles.distanceBadge, styles.approachDistanceBadge]}>
                  <Navigation size={16} color={colors.secondary} />
                  <Text style={[styles.distanceText, styles.approachDistanceText]}>
                    Approach Distance: {order.transporterToPickupDistanceKm} km
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Package size={16} color={colors.gray} />
                <Text style={styles.detailText}>
                  {order.cargo.description}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Weight</Text>
                <Text style={styles.gridValue}>{order.cargo.weight} kg</Text>
              </View>
              
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Volume</Text>
                <Text style={styles.gridValue}>{order.cargo.volume.toFixed(2)} m³</Text>
              </View>
              
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Items</Text>
                <Text style={styles.gridValue}>{order.cargo.items}</Text>
              </View>
              
              {order.cargo.dimensions && (
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Dimensions</Text>
                  <Text style={styles.gridValue}>
                    {order.cargo.dimensions.length} × {order.cargo.dimensions.width} × {order.cargo.dimensions.height} cm
                  </Text>
                </View>
              )}
            </View>
            
            {order.price !== undefined && (
              <View style={styles.priceContainer}>
                <View style={styles.priceHeader}>
                  <Text style={styles.priceLabel}>Price</Text>
                  <View style={styles.currencyBadge}>
                    <Globe size={12} color={colors.primary} />
                    <Text style={styles.currencyText}>{order.currency}</Text>
                  </View>
                </View>
                <Text style={styles.priceValue}>
                  {order.status === 'determine_price' && order.proposedPrice !== undefined
                    ? (
                      <Text>
                        <Text style={styles.proposedPrice}>{formatCurrency(order.proposedPrice, order.currency)}</Text>
                        {' '}
                        <Text style={styles.priceProposed}>(proposed)</Text>
                      </Text>
                    )
                    : formatCurrency(order.price, order.currency)}
                </Text>
              </View>
            )}
            
            <View style={styles.specialRequirementsContainer}>
              {order.cargo.requiresRefrigeration && (
                <View style={styles.specialRequirementBadge}>
                  <Snowflake size={16} color={colors.white} />
                  <Text style={styles.specialRequirementText}>Refrigerated</Text>
                </View>
              )}
              
              {order.cargo.isHazardous && (
                <View style={[styles.specialRequirementBadge, { backgroundColor: colors.warning }]}>
                  <AlertTriangle size={16} color={colors.white} />
                  <Text style={styles.specialRequirementText}>Hazardous</Text>
                </View>
              )}
              
              {order.cargo.isUrgent && (
                <View style={[styles.specialRequirementBadge, { backgroundColor: colors.secondary }]}>
                  <Clock size={16} color={colors.white} />
                  <Text style={styles.specialRequirementText}>Urgent</Text>
                </View>
              )}
            </View>
            
            {order.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            )}
          </View>
        </View>
        
        {order.transporterId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transport Details</Text>
            
            <View style={styles.card}>
              <View style={styles.transporterInfo}>
                <View style={styles.transporterIcon}>
                  <Truck size={24} color={colors.white} />
                </View>
                <View>
                  <Text style={styles.transporterLabel}>Transporter</Text>
                  <Text style={styles.transporterName}>
                    {transporter?.name || "Unknown Transporter"}
                  </Text>
                </View>
              </View>
              
              {order.transporterVehicleId && vehicle && (
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleLabel}>Vehicle</Text>
                  <View style={styles.vehicleDetails}>
                    <Text style={styles.vehicleValue}>
                      {vehicle.model} ({vehicle.licensePlate})
                    </Text>
                    {vehicle.isRefrigerated && (
                      <View style={styles.refrigeratedBadge}>
                        <Snowflake size={14} color={colors.white} />
                        <Text style={styles.refrigeratedText}>Refrigerated</Text>
                      </View>
                    )}
                  </View>
                  
                  {vehicle.dimensions && (
                    <View style={styles.vehicleDimensions}>
                      <View style={styles.dimensionItem}>
                        <Ruler size={14} color={colors.textLight} />
                        <Text style={styles.dimensionText}>
                          {vehicle.dimensions.length} × {vehicle.dimensions.width} × {vehicle.dimensions.height} cm
                        </Text>
                      </View>
                      <View style={styles.dimensionItem}>
                        <Box size={14} color={colors.textLight} />
                        <Text style={styles.dimensionText}>
                          {vehicle.maxVolume.toFixed(2)} m³
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        )}
        
        {order.statusUpdates && order.statusUpdates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Timeline</Text>
            
            <View style={styles.card}>
              <StatusTimeline statusUpdates={order.statusUpdates} />
            </View>
          </View>
        )}
      </ScrollView>
      
         <View style={styles.footer}>
         <StepButtons steps={steps} isLoading={isLoading} isDisabled={isLoading} />
         </View>
    </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      backgroundColor: colors.white,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    orderInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    orderId: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginRight: 12,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.white,
    },
    date: {
      fontSize: 14,
      color: colors.textLight,
    },
    mapSection: {
      height: 200,
      width: '100%',
      marginBottom: 16,
    },
    mapLoading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.lightGray,
    },
    mapLoadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textLight,
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    locationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    locationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    locationContent: {
      flex: 1,
    },
    locationLabel: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 4,
    },
    locationAddress: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      marginBottom: 4,
    },
    locationTime: {
      fontSize: 14,
      color: colors.textLight,
    },
    locationConnector: {
      width: 2,
      height: 24,
      backgroundColor: colors.primaryLight,
      marginLeft: 20,
      marginBottom: 16,
    },
    detailRow: {
      marginBottom: 16,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailText: {
      fontSize: 16,
      color: colors.text,
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    gridItem: {
      width: '50%',
      marginBottom: 16,
    },
    gridLabel: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 4,
    },
    gridValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    originalPrice: {
      textDecorationLine: 'line-through',
      color: colors.textLight,
    },
    proposedPrice: {
      color: colors.info,
      fontWeight: '700',
    },
    refrigerationRequirement: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.info + '20',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    refrigerationIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.info,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    refrigerationText: {
      fontSize: 14,
      color: colors.info,
      fontWeight: '500',
      flex: 1,
    },
    notesContainer: {
      backgroundColor: colors.lightGray,
      padding: 12,
      borderRadius: 8,
    },
    notesLabel: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 4,
    },
    notesText: {
      fontSize: 14,
      color: colors.text,
    },
    transporterInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    transporterIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    transporterLabel: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 4,
    },
    transporterName: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    vehicleInfo: {
      backgroundColor: colors.lightGray,
      padding: 12,
      borderRadius: 8,
    },
    vehicleLabel: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 4,
    },
    vehicleValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    vehicleDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    refrigeratedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.info,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      gap: 4,
    },
    refrigeratedText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.white,
    },
    actionsContainer: {
      padding: 16,
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cancelButton: {
      borderColor: colors.danger,
    },
    priceInputContainer: {
      marginBottom: 16,
    },
    selectedVehicleInfo: {
      backgroundColor: colors.primaryLight,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    selectedVehicleText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    priceInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginBottom: 12,
    },
    priceInputIcon: {
      marginHorizontal: 12,
    },
    priceInput: {
      flex: 1,
      height: 48,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 8,
      paddingHorizontal: 12,      
    },
    priceActionButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    proposeButton: {
      flex: 2,
    },
    cancelPriceButton: {
      flex: 1,
    },
    actionButtonsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    acceptButton: {
      flex: 2,
    },
    declineButton: {
      flex: 1,
      borderColor: colors.danger,
    },
    vehicleSelectorContainer: {
      marginBottom: 16,
    },
    vehicleSelectorTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    vehicleList: {
      maxHeight: 300,
      marginBottom: 12,
    },
    continueButton: {
      marginBottom: 8,
    },
    cancelSelectionButton: {
      borderColor: colors.gray,
    },    
    vehicleDimensions: {
      marginTop: 8,
    },
    dimensionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    dimensionText: {
      fontSize: 14,
      color: colors.text,
    },    
    priceContainer: {
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    priceLabel: {
      fontSize: 14,
      color: colors.primary,
      marginBottom: 4,
    },
    priceValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
    },
    priceProposed: {
      fontSize: 14,
      fontStyle: 'italic',
      color: colors.primary,
      opacity: 0.8,
    },    
    noPriceText: {
      fontSize: 14,
      fontStyle: 'italic',
      color: colors.textLight,
    },    
    distanceBadge: {
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
      padding: 8,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    distanceText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
    },
    specialRequirementsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    specialRequirementBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.info,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      gap: 4,
    },
    specialRequirementText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.white,
    },
      Container: {
      backgroundColor: colors.successLight,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    calculatedPriceLabel: {
      fontSize: 14,
      color: colors.success,
      marginBottom: 4,
    },
    calculatedPriceValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.success,
      marginBottom: 4,
    },
    calculatedPriceNote: {
      fontSize: 12,
      color: colors.success,
      opacity: 0.8,
    },
    calculatedPriceContainer: {
      backgroundColor: colors.successLight,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },    
    priceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    currencyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      gap: 4,
    },
    currencyText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.primary,
    },
    selectedVehicleCurrency: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },    
    distanceContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    approachDistanceBadge: {
      backgroundColor: colors.secondaryLight,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    approachDistanceText: {
      color: colors.secondary,
    },    
    approachDistanceInfo: {
      backgroundColor: colors.secondaryLight,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    approachDistanceLabel: {
      fontSize: 14,
      color: colors.secondary,
      fontWeight: '500',
      marginBottom: 4,
    },
    approachDistanceValue: {
      fontSize: 14,
      color: colors.secondary,
      marginBottom: 4,
    },
    approachDistanceNote: {
      fontSize: 12,
      color: colors.secondary,
      opacity: 0.8,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    contactIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    contactContent: {
      flex: 1,
    },
    contactLabel: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 4,
    },
    contactName: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      marginBottom: 4,
    },
    phoneContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    phoneNumber: {
      fontSize: 14,
      color: colors.text,
    },
    callButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 6,
    },
    callButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.white,
    },
    noContactInfo: {
      fontSize: 14,
      color: colors.textLight,
      fontStyle: 'italic',
      textAlign: 'center',
      padding: 12,
    },
    footer: {
      padding: 16,
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: {
      width: '100%',
    },
    demoBanner: {
      backgroundColor: colors.secondaryLight,
      padding: 16,
      //margin: 16,
      marginBottom: 0,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: colors.secondary,
    },
    demoBannerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.secondary,
      marginBottom: 8,
    },
    demoBannerText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });