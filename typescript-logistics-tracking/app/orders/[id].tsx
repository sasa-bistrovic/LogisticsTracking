import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Package, 
  Calendar, 
  Truck, 
  Clock, 
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Snowflake
} from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { StatusTimeline } from '@/components/StatusTimeline';
import { VehicleCard } from '@/components/VehicleCard';
import MapView from '@/components/MapView';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/utils/helpers';
import { geocodeAddress } from '@/utils/geocoding';
import { Order, OrderStatus, User, Vehicle, Location as LocationType } from '@/types';
import { mockUsers } from '@/constants/mockData';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { getOrderById, updateOrderStatus, proposeOrderPrice, acceptProposedPrice, isLoading } = useOrderStore();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [transporter, setTransporter] = useState<User | undefined>(undefined);
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [geocodedLocations, setGeocodedLocations] = useState<{
    pickup?: LocationType;
    delivery?: LocationType;
    current?: LocationType;
  }>({});

  const [proposedPrice, setProposedPrice] = useState<string>('');
  const [showPriceInput, setShowPriceInput] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState<boolean>(false);

  // Use a ref to track initial mount
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const orderData = await getOrderById(id); // dodan await
        setOrder(orderData);
  
        if (orderData) {
          geocodeOrderAddresses(orderData);
        }
      }
    };
    fetchData();
  }, [id, getOrderById]);
  
    useEffect(() => {
      const fetchData = async () => {
        if (order) {
          try {
            const userId = order.transporterId;
            const vehicleId = order.transporterVehicleId;
    
            // Fetch transporter
            if (userId) {
              const response = await axios.get(`/api/users/${userId}`);
              setTransporter(response.data);
            }
    
            // Fetch vehicle
            if (vehicleId) {
              const response2 = await axios.get(`/api/vehicles/${vehicleId}`);
              setVehicle(response2.data);
            }
          } catch (error) {
            console.error("Error fetching transporter or vehicle", error);
          }
        }
      };
    
      fetchData();
    }, [order]);
    
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
      } catch (error) {
        console.error('Error geocoding addresses:', error);
      } finally {
        setIsGeocodingLoading(false);
      }
    };

    const handleUpdateStatus = async (newStatus: OrderStatus) => {
      if (!order || !id) return;
      
      try {
        await updateOrderStatus(id, newStatus);
        // Refresh order data
        const updatedOrder = getOrderById(id);
        setOrder(updatedOrder);
      } catch (error) {
        Alert.alert('Error', 'Failed to update order status');
      }
    };
    
    const handleProposePrice = async () => {
      if (!order || !id || !user || !selectedVehicle) return;
      
      if (!proposedPrice || isNaN(Number(proposedPrice)) || Number(proposedPrice) <= 0) {
        Alert.alert('Invalid Price', 'Please enter a valid price');
        return;
      }
      
      try {
        await proposeOrderPrice(id, Number(proposedPrice), selectedVehicle.id);
        // Refresh order data
        const updatedOrder = getOrderById(id);
        setOrder(updatedOrder);
        setShowPriceInput(false);
        setShowVehicleSelector(false);
        setSelectedVehicle(null);
      } catch (error) {
        Alert.alert('Error', 'Failed to propose price');
      }
    };
    
    const handleAcceptPrice = async () => {
      if (!order || !id) return;
      
      try {
        await acceptProposedPrice(id);
        // Refresh order data
        const updatedOrder = getOrderById(id);
        setOrder(updatedOrder);
      } catch (error) {
        Alert.alert('Error', 'Failed to accept price');
      }
    };
    
    const handleSelectVehicle = (vehicle: Vehicle) => {
      setSelectedVehicle(vehicle);
    };
    
    const startPriceProposal = () => {
      if (!user) {
        Alert.alert('Authentication Required', 'Please log in to propose a price');
        return;
      }
      
      if (!user.vehicles || user.vehicles.length === 0) {
        Alert.alert('No Vehicles', 'You need to add a vehicle before you can propose a price');
        return;
      }
      
      // Check if order requires refrigeration and filter vehicles accordingly
      const availableVehicles = user.vehicles.filter(v => 
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
        setShowPriceInput(true);
      } else {
        // Show vehicle selector if multiple vehicles are available
        setShowVehicleSelector(true);
      }
    };
    
    const handleContinueToPrice = () => {
      if (selectedVehicle) {
        setShowPriceInput(true);
        setShowVehicleSelector(false);
      } else {
      }
    };
    
    const renderStatusActions = () => {
      if (!order || !user) return null;
    
      // Orderer can cancel pending orders or accept proposed prices
      if (user.role === 'orderer' && order.ordererId === user.id) {
        if (order.status === 'pending') {
          return (
            <Button 
              title="Cancel Order" 
              variant="outline"
              leftIcon={<XCircle size={20} color={colors.danger} />}
              onPress={() => handleUpdateStatus('cancelled')}
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
      if (user.role === 'transporter') {
        switch (order.status) {
          case 'pending':
            return (
              <View>
                {showVehicleSelector ? (
                  <View style={styles.vehicleSelectorContainer}>
                    <Text style={styles.vehicleSelectorTitle}>Select a vehicle for this transport:</Text>
                    
                    <ScrollView style={styles.vehicleList} horizontal={false}>
                      {user.vehicles?.filter(v => 
                        v.available && 
                        (!order.cargo.requiresRefrigeration || v.isRefrigerated)
                      ).map(vehicle => (
                        <VehicleCard 
                          key={vehicle.id} 
                          vehicle={vehicle} 
                          onPress={() => handleSelectVehicle(vehicle)}
                          selected={selectedVehicle?.id === vehicle.id}
                        />
                      ))}
                    </ScrollView>
                    
                    {selectedVehicle && (
                      <Button 
                        title="Continue to Price" 
                        onPress={handleContinueToPrice}
                        style={styles.continueButton}
                      />
                    )}
                    
                    <Button 
                      title="Cancel" 
                      variant="outline"
                      onPress={() => {
                        setShowVehicleSelector(false);
                        setSelectedVehicle(null);
                      }}
                      style={styles.cancelSelectionButton}
                    />
                  </View>
                ) : showPriceInput ? (
                  <View style={styles.priceInputContainer}>
                    <View style={styles.selectedVehicleInfo}>
                      <Text style={styles.selectedVehicleText}>
                        Selected vehicle: {selectedVehicle?.model} ({selectedVehicle?.licensePlate})
                        {selectedVehicle?.isRefrigerated && " - Refrigerated"}
                      </Text>
                    </View>
                    
                    <View style={styles.priceInputWrapper}>
                      <DollarSign size={20} color={colors.primary} style={styles.priceInputIcon} />
                      <TextInput
                        style={styles.priceInput}
                        placeholder="Enter your price"
                        value={proposedPrice}
                        onChangeText={setProposedPrice}
                        keyboardType="numeric"
                        placeholderTextColor={colors.textLight}
                      />
                    </View>
                    <View style={styles.priceActionButtons}>
                      <Button 
                        title="Propose Price" 
                        onPress={handleProposePrice}
                        isLoading={isLoading}
                        style={styles.proposeButton}
                      />
                      <Button 
                        title="Cancel" 
                        variant="outline"
                        onPress={() => {
                          setShowPriceInput(false);
                          setSelectedVehicle(null);
                        }}
                        style={styles.cancelPriceButton}
                      />
                    </View>
                  </View>
                ) : (
                  <Button 
                    title="Propose Price" 
                    leftIcon={<DollarSign size={20} color={colors.white} />}
                    onPress={startPriceProposal}
                    isLoading={isLoading}
                  />
                )}
              </View>
            );
          case 'accepted':
            return (
              <Button 
                title="Mark as Picked Up" 
                leftIcon={<Truck size={20} color={colors.white} />}
                onPress={() => handleUpdateStatus('pickup')}
                isLoading={isLoading}
              />
            );
          case 'pickup':
            return (
              <Button 
                title="Start Transit" 
                leftIcon={<Truck size={20} color={colors.white} />}
                onPress={() => handleUpdateStatus('in_transit')}
                isLoading={isLoading}
              />
            );
          case 'in_transit':
            return (
              <Button 
                title="Mark as Delivered" 
                leftIcon={<CheckCircle size={20} color={colors.white} />}
                onPress={() => handleUpdateStatus('delivered')}
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
                <Text style={styles.gridValue}>{order.cargo.volume} m³</Text>
              </View>
              
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Items</Text>
                <Text style={styles.gridValue}>{order.cargo.items}</Text>
              </View>
              
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Price</Text>
                <Text style={styles.gridValue}>
                  {order.status === 'determine_price' && order.proposedPrice !== undefined
                    ? (
                      <Text>
                        <Text style={styles.originalPrice}>{formatCurrency(order.price, order.currency)}</Text>
                        {' → '}
                        <Text style={styles.proposedPrice}>{formatCurrency(order.proposedPrice, order.currency)}</Text>
                      </Text>
                    )
                    : formatCurrency(order.price, order.currency)}
                </Text>
              </View>
            </View>
            
            {order.cargo.requiresRefrigeration && (
              <View style={styles.refrigerationRequirement}>
                <View style={styles.refrigerationIcon}>
                  <Snowflake size={20} color={colors.white} />
                </View>
                <Text style={styles.refrigerationText}>
                  This cargo requires refrigerated transport
                </Text>
              </View>
            )}
            
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
      
      {renderStatusActions() && (
        <View style={styles.actionsContainer}>
          {renderStatusActions()}
        </View>
      )}
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
  });