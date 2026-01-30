import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, Animated, InteractionManager } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Filter, MapPin, Search, RefreshCw } from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { OrderCards } from '@/components/OrderCards'; // promjena ovdje!
import { Order, UserRole } from '@/types';
import { Button } from '@/components/Button';
import { useFocusEffect } from '@react-navigation/native';

export default function OrdersScreen() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { orders, isLoading, fetchOrders, getOrdersByUser, getAvailableOrders, getAvailableOrders2, getAvailableOrders3 } = useOrderStore();
  const [activeTab, setActiveTab] = useState<'my' | 'available'>('my');
  const [displayOrders, setDisplayOrders] = useState<Order[]>([]);
  const [maxDistance, setMaxDistance] = useState<string>('');
  const [showDistanceFilter, setShowDistanceFilter] = useState(false);
  const [tabBarBottom] = useState(new Animated.Value(0));
  const [isFocused, setIsFocused] = useState(false);

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
      animateTabBar();
      return () => {
        Animated.timing(tabBarBottom, {
          toValue: 60,
          duration: 300,
          useNativeDriver: false,
        }).start();
      };
    }, [animateTabBar])
  );

  useEffect(() => {
    if (isFocused) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFocused]);

  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (user) {
      if (activeTab === 'my') {
        if (user.role === "transporter") {
          setDisplayOrders(getAvailableOrders2());
        } else {
          setDisplayOrders(getAvailableOrders3());
        }
      } else {
        fetchAvailableOrders();
      }
    }
  }, [user, activeTab, orders]);

  const fetchAvailableOrders = () => {
    if (!user) return;
    const transporterVehicle = user.vehicles?.find(v => v.available);
    const transporterLocation = transporterVehicle?.currentLocation;
    const distanceLimit = maxDistance ? parseInt(maxDistance) : undefined;

    const availableOrders = getAvailableOrders(
      transporterLocation,
      transporterVehicle,
      distanceLimit
    );

    setDisplayOrders(availableOrders);

    if (distanceLimit && availableOrders.length === 0) {
      Alert.alert(
        "No Orders Found",
        `No available orders found within ${distanceLimit} km of your location.`
      );
    }
  };

  const navigateToCreateOrder = () => {
    router.push('/orders/create?from=main');
  };

  const toggleDistanceFilter = () => {
    setShowDistanceFilter(!showDistanceFilter);
  };

  const handleTabChange = (tab: 'my' | 'available') => {
    setActiveTab(tab);
    setDisplayOrders([]);
  };

  return (
    <SafeAreaView style={[styles.container, { top: tabBarBottom }]} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'my' && styles.activeTab]}
            onPress={() => handleTabChange('my')}
          >
            <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
              My Orders
            </Text>
          </TouchableOpacity>

          {user?.role === 'transporter' && (
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'available' && styles.activeTab]}
              onPress={() => handleTabChange('available')}
            >
              <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
                Available Orders
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsContainer}>
          {user?.role === 'transporter' && activeTab === 'available' && (
            <TouchableOpacity 
              style={[styles.iconButton, showDistanceFilter && styles.activeIconButton]}
              onPress={toggleDistanceFilter}
            >
              <Filter size={20} color={showDistanceFilter ? colors.white : colors.text} />
            </TouchableOpacity>
          )}

          {user?.role === 'orderer' && (
            <TouchableOpacity 
              style={[styles.iconButton, styles.primaryIconButton]}
              onPress={navigateToCreateOrder}
            >
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {user?.role === 'transporter' && activeTab === 'available' && showDistanceFilter && (
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
        <OrderCards 
          orders={displayOrders} 
          showDistance={activeTab === 'available' && user?.role === 'transporter'}
          emptyTitle="No orders found"
          emptySubtitle={
            activeTab === 'my' 
              ? "You don't have any orders yet" 
              : "No available orders at the moment"
          }
          onCreateOrderPress={user?.role === 'orderer' && activeTab === 'my' ? navigateToCreateOrder : undefined}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexGrow: 1, alignItems: 'stretch', backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabsContainer: { flexDirection: 'row', gap: 16 },
  tab: { paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.primary },
  tabText: { fontSize: 16, fontWeight: '500', color: colors.textLight },
  activeTabText: { color: colors.primary, fontWeight: '600' },
  actionsContainer: { flexDirection: 'row', gap: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lightGray, alignItems: 'center', justifyContent: 'center' },
  activeIconButton: { backgroundColor: colors.primary },
  primaryIconButton: { backgroundColor: colors.primary },
  filterContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8, flexWrap: 'nowrap' },
  filterInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGray, borderRadius: 8, flex: 1, flexShrink: 1, paddingHorizontal: 0 },
  filterIcon: { width: 16, marginHorizontal: 8 },
  filterInput: { flex: 1, minWidth: 0, height: 40, color: colors.text, paddingVertical: 8, paddingHorizontal: 12 },
  filterButton: { height: 40, width: 'auto', flexShrink: 1 },
  refreshButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
