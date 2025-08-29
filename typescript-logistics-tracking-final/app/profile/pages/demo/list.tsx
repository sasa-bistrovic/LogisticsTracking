import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert, Animated, InteractionManager } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Filter, MapPin, Search, RefreshCw, CheckCircle, Truck, XCircle,Repeat, Car, ClipboardList, List, PlusCircle, 
  Package, Calculator, UserCircle, 
  Hand, ThumbsUp, Eye, Clock, FileText, LogOut  } from 'lucide-react-native';
import { useOrderStore2 } from '@/store/orderStore2';
import { useAuthStore2 } from '@/store/authStore2';
import { colors } from '@/constants/colors';
import { OrderCard } from '@/components/OrderCardA';
import { Order, UserRole } from '@/types';
import { Button } from '@/components/Button';
import { useFocusEffect } from '@react-navigation/native';

export default function ListScreen() {
  const router = useRouter();
  const { userTest, loginTest, no, nonumber } = useAuthStore2();
  const { getOrders2, setOrders2, getAvailableOrders, getPendingOrders, removeCancelledOrders, removeCancelledAndPendingOrders } = useOrderStore2();
  const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');
  const [displayOrders, setDisplayOrders] = useState<Order[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [maxDistance, setMaxDistance] = useState<string>('');
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const steps = [
    { title: "Switch to Transporter Account", action: () => { nonumber(); loginTest('orderer'); } },
    { title: "Start Vehicle Registration", action: () => { nonumber(); router.replace('/profile/pages/add'); } },
    { title: "Add Vehicle Details", action: () => { nonumber(); /* continue logic */ } },
    { title: "Switch to Orderer Account", action: () => { nonumber(); loginTest('transporter'); } },
    { title: "View Your Orders", action: () => { nonumber(); router.replace('/profile/pages/list'); } },
    { title: "Create a New Transport Order", action: () => { nonumber(); navigateToCreateOrder(); } },
    { title: "Enter Cargo Information", action: () => { nonumber(); } },
    { title: "Enter Pickup and Delivery Locations", action: () => { nonumber(); } },
    { title: "Calculate the Transport Price", action: () => { nonumber(); } },
    { title: "Confirm and Create the Order", action: () => { nonumber(); } },
    { title: "Go to Your Profile Page", action: () => { nonumber(); router.replace('/profile/pages/profile'); } },
    { title: "Switch Back to Transporter Account", action: () => { nonumber(); } },
    { title: "Browse Available Orders", action: () => { nonumber(); router.replace('/profile/pages/list'); } },
    { title: "Select an Order to Manage", action: () => { nonumber(); router.replace(`/profile/pages/${displayOrders[0].id}`); } },
    { title: "Accept the Selected Order", action: () => { nonumber(); } },
    { title: "View the Accepted Order", action: () => { nonumber(); router.replace(`/profile/pages/${displayOrders[0].id}`); } },
    { title: "Pickup the Cargo", action: () => { nonumber(); } },
    { title: "View Ongoing Orders", action: () => { nonumber(); router.replace(`/profile/pages/${displayOrders[0].id}`); } },
    { title: "Mark as In Transit", action: () => { nonumber(); } },
    { title: "Open the Order Details", action: () => { nonumber(); router.replace(`/profile/pages/${displayOrders[0].id}`); } },
    { title: "Complete Delivery and Confirm", action: () => { nonumber(); } },
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

  useEffect(() => {
    const loadOrders = () => {
      if (userTest) {
        if (activeTab === 'my') {
          if (userTest.role==="transporter") {
            const respond = removeCancelledOrders();
            setDisplayOrders(respond);
            } else {
              const respond = removeCancelledOrders();
              setDisplayOrders(respond);
            }
        } else {
          fetchAvailableOrders();
        }
        setIsLoading(false);
      }
    };
  
    loadOrders(); // kada se komponenta mounta
  
    window.addEventListener('focus', loadOrders);
    window.addEventListener('popstate', loadOrders);
  
    return () => {
      window.removeEventListener('focus', loadOrders);
      window.removeEventListener('popstate', loadOrders);
    };
  }, [userTest, activeTab]);

  const [tabBarBottom] = useState(new Animated.Value(0));
const [rerenderKey, setRerenderKey] = useState(0); // Add rerenderKey state
const rerenderRef = useRef(0);

const animateTabBar = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      Animated.timing(tabBarBottom, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [tabBarBottom]);

  useFocusEffect(
    useCallback(() => {
      animateTabBar(); // Animate in when the screen is focused
  
      return () => {
        Animated.timing(tabBarBottom, {
          toValue: 60, // Animate out when leaving
          duration: 300,
          useNativeDriver: false,
        }).start();
      };
    }, [animateTabBar])
  );

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

 
  // Use a ref to track initial mount
  const isInitialMount = React.useRef(true);
  
  useEffect(() => {
    
  }, []);
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (userTest) {
      if (activeTab === 'my') {
        //const userOrders = getOrdersByUser(user.id, user.role);
        if (userTest.role==="transporter") {
        } else {
    
    
        }
      } else {
      }
    }
  }, [userTest, activeTab]);
/*
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (user) {
      if (activeTab === 'my') {
        //const userOrders = getOrdersByUser(user.id, user.role);
        if (user.role==="transporter") {
        const respond = removeCancelledAndPendingOrders();
        setDisplayOrders(respond);
        } else {
          const respond = removeCancelledOrders();
          setDisplayOrders(respond);
        }
      } else {
        fetchAvailableOrders();
      }
    }
  }, [user, activeTab]);
  */
  const fetchAvailableOrders = () => {
    if (!userTest) return;
    
    // For transporters, get available orders sorted by distance from their location
    const transporterVehicle = userTest.vehicles && userTest.vehicles.length > 0 
      ? userTest.vehicles.find(v => v.available) 
      : undefined;
    
    const transporterLocation = transporterVehicle?.currentLocation;
    
    // Convert maxDistance to number if provided, otherwise use undefined
    const distanceLimit = maxDistance ? parseInt(maxDistance) : undefined;
    
    const availableOrders = getAvailableOrders(
      transporterLocation, 
      transporterVehicle,
      distanceLimit
    );
    
    setDisplayOrders(availableOrders);
    
    // Show feedback if no orders found within the distance
    if (distanceLimit && availableOrders.length === 0) {
      Alert.alert(
        "No Orders Found", 
        `No available orders found within ${distanceLimit} km of your location.`
      );
    }
  };
  
  const navigateToCreateOrder = () => {
    router.replace('/profile/pages/create');
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'my' 
          ? "You don't have any orders yet" 
          : "No available orders at the moment"}
      </Text>
      {userTest?.role === 'orderer' && activeTab === 'my' && (
        <TouchableOpacity 
          style={styles.createButton}
          //onPress={navigateToCreateOrder}
        >
          <Text style={styles.createButtonText}>Create New Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Handle tab change
  const handleTabChange = (tab: 'my' | 'available') => {
    setActiveTab(tab);

    //if (tab==='available') {
    //  const respond = getPendingOrders();
    //  setDisplayOrders(respond);
    //}
    //if (tab==='my') {
    //  const respond = removeCancelledOrders();
    //  setDisplayOrders(respond);
    //}
    // Reset display orders to prevent flashing old data
    //setDisplayOrders([]);
  };
  
  return (
    <SafeAreaView style={[styles.container, { top: tabBarBottom }]} edges={['bottom']}>
      <View style={styles.section}>
              <View style={styles.demoBanner}>
                                  <Text style={styles.demoBannerTitle}>Demo Mode</Text>
                                  <Text style={styles.demoBannerText}>
                                    This form is pre-filled with sample data.
                                  </Text>
                                </View>
                                </View>
                                
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'my' && styles.activeTab
            ]}
            onPress={() => handleTabChange('my')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'my' && styles.activeTabText
            ]}>
              My Orders
            </Text>
          </TouchableOpacity>
          
          {userTest?.role === 'transporter' && (
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'available' && styles.activeTab
              ]}
              onPress={() => handleTabChange('available')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'available' && styles.activeTabText
              ]}>
                Available Orders
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          {userTest?.role === 'transporter' && activeTab === 'available' && (
            <TouchableOpacity 
              style={[
                styles.iconButton, 
                showDistanceFilter && styles.activeIconButton
              ]}
            >
              <Filter size={20} color={showDistanceFilter ? colors.white : colors.text} />
            </TouchableOpacity>
          )}
          
          {userTest?.role === 'orderer' && (
            <TouchableOpacity 
              style={[styles.iconButton, styles.primaryIconButton]}
              onPress={navigateToCreateOrder}
            >
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {userTest?.role === 'transporter' && activeTab === 'available' && showDistanceFilter && (
        <View style={styles.filterContainer}>
          <View style={styles.filterInputContainer}>
            <MapPin size={16} color={colors.primary} style={styles.filterIcon} />
            <TextInput
              style={styles.filterInput}
              placeholder="Max distance in km"
              value={maxDistance}
              onChangeText={setMaxDistance}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          <Button
            title="Find Orders"
            size="small"
            leftIcon={<Search size={16} color={colors.white} />}
            onPress={fetchAvailableOrders}
            style={styles.filterButton}
          />
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {
              setMaxDistance('');
              fetchAvailableOrders();
            }}
          >
            <RefreshCw size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard 
              order={item} 
              showDistance={activeTab === 'available' && userTest?.role === 'transporter'}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      <View style={styles.footer}>
      <StepButtons steps={steps} isLoading={isLoading} isDisabled={isLoading} />
   </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    alignItems: 'stretch',    
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textLight,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconButton: {
    backgroundColor: colors.primary,
  },
  primaryIconButton: {
    backgroundColor: colors.primary,
  },
  filterContainer: {  
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
    flexWrap: 'nowrap',
  },
  filterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    flex: 1, 
    flexShrink: 1, 
    paddingHorizontal: 0,
  },
  filterIcon: {
    width: 16,
    marginHorizontal: 8,
  },
  filterInput: {
    flex: 1, 
    minWidth: 0,
    height: 40,
    color: colors.text,
    paddingVertical: 8,
    paddingHorizontal: 12, 
  },
  filterButton: {
    height: 40,
    width: 'auto',
    flexShrink: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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
  section: {
    padding: 16,
    marginBottom: 8,
  },
});