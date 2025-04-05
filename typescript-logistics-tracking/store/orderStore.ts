import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderStatus, StatusUpdate, Location, Vehicle } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { calculateDistance } from '@/utils/helpers';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  updateOrderLocation: (orderId: string, location: Location) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByUser: (userId: string, role?: 'orderer' | 'transporter') => Order[];
  getAvailableOrders: (transporterLocation?: Location, transporterVehicle?: Vehicle, maxDistance?: number) => Order[];
  proposeOrderPrice: (orderId: string, price: number, vehicleId: string) => Promise<void>;
  acceptProposedPrice: (orderId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      error: null,
      
      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const user = useAuthStore.getState().user;
          
          const userId = user.id;          

          const response = await axios.get(`/logistics/eligible-orders/${userId}`);
          set({ orders: response.data, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch orders. Please try again.', isLoading: false });
        }
      },
      
      createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          //await new Promise(resolve => setTimeout(resolve, 1000));

          const response = await axios.post('/orders', orderData);
          set(state => ({
            orders: [...state.orders, response.data],
            isLoading: false
          }));
          return response.data;
        } catch (error) {
          set({ error: 'Failed to create order. Please try again.', isLoading: false });
          throw error;
        }
      },
      
      updateOrderStatus: async (orderId, status, note) => {
        set({ isLoading: true, error: null });
        try {

    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = useAuthStore.getState().user;

    //if (!user || user.role !== 'transporter') {
    //  throw new Error('Only transporters can update order status');
    //}

    const order = get().orders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    //if (!user.vehicles || user.vehicles.length === 0) {
    //  throw new Error('Transporter has no vehicles available');
    //}
/*
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const toRad = deg => (deg * Math.PI) / 180;
      const R = 6371; // Earth radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    let closestVehicle = user.vehicles.reduce((prev, curr) => {
      const prevDist = getDistance(
        order.pickupLocation.latitude,
        order.pickupLocation.longitude,
        prev.currentLocation.latitude,
        prev.currentLocation.longitude
      );
      const currDist = getDistance(
        order.pickupLocation.latitude,
        order.pickupLocation.longitude,
        curr.currentLocation.latitude,
        curr.currentLocation.longitude
      );
      return currDist < prevDist ? curr : prev;
    });

          const statusUpdate: StatusUpdate = {
            status,
            timestamp: new Date().toISOString(),
            note: note || `Status updated to ${status}`,
          };
*/
     const userId = user.id;

     const vehicleId=order.transporterVehicleId;

     let vehicle = null;

     if (vehicleId) {
       const responseVehicle = await axios.get(`/api/vehicles/${vehicleId}`);
       vehicle = responseVehicle.data;
     }
     
     const response = await axios.put(`/orders/${orderId}/status`, { 
       status: status,
       statusUpdate: status,
       timestamp: new Date().toISOString(),
       note: note || `Status updated to ${status}`,
       currentLocation: vehicle?.currentLocation || null,
       transporterId: userId,
       transporterVehicleId: vehicle?.id || null
     });

          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId ? response.data : order
            ),
            isLoading: false
          }));

          
        } catch (error) {
          set({ error: 'Failed to update order status. Please try again.', isLoading: false });
        }
      },
      
      updateOrderLocation: async (orderId, location) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          const response = await axios.patch(`/orders/${orderId}/location`, location);
          set(state => ({
            orders: state.orders.map(order => 
              order.id === orderId ? response.data : order
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: 'Failed to update location. Please try again.', isLoading: false });
        }
      },
      
      getOrderById: (orderId) => {
        return get().orders.find(order => order.id === orderId);
      },
      
      getOrdersByUser: (userId, role) => {
        return get().orders.filter(order => {
          if (role === 'orderer') {
            return order.ordererId === userId;
          } else if (role === 'transporter') {
            return order.transporterId === userId;
          }
          return order.ordererId === userId || order.transporterId === userId;
        });
      },
      
      getAvailableOrders: (transporterLocation, transporterVehicle, maxDistance) => {
        const pendingOrders = get().orders.filter(order => order.status === 'pending');
        
        // If no transporter location provided, just return all pending orders
        if (!transporterLocation || !transporterLocation.latitude || !transporterLocation.longitude) {
          return pendingOrders;
        }
        
        // Calculate distance for each order and add it as a property
        const ordersWithDistance = pendingOrders.map(order => {
          // Skip if pickup location doesn't have coordinates
          if (!order.pickupLocation.latitude || !order.pickupLocation.longitude) {
            return { ...order, distance: Number.MAX_VALUE };
          }
          
          const distance = calculateDistance(
            transporterLocation.latitude,
            transporterLocation.longitude,
            order.pickupLocation.latitude,
            order.pickupLocation.longitude
          );
          
          return { ...order, distance };
        });
        
        // Filter by distance if maxDistance is provided
        let filteredOrders = ordersWithDistance;
        if (maxDistance && maxDistance > 0) {
          filteredOrders = ordersWithDistance.filter(order => 
            (order as any).distance <= maxDistance
          );
        }
        
        // Filter by vehicle capacity if provided
        if (transporterVehicle) {
          filteredOrders = filteredOrders.filter(order => 
            order.cargo.weight <= transporterVehicle.maxWeight &&
            order.cargo.volume <= transporterVehicle.maxVolume
          );
        }
        
        // Sort by distance (closest first)
        return filteredOrders.sort((a, b) => {
          const distanceA = (a as any).distance || Number.MAX_VALUE;
          const distanceB = (b as any).distance || Number.MAX_VALUE;
          return distanceA - distanceB;
        });
      },


      proposeOrderPrice: async (orderId, price, vehicleId) => {
        set({ isLoading: true, error: null });
        try {
          const user = useAuthStore.getState().user;
          
          const userId = user.id;

          const responseVehicle = await axios.get(`/logistics/user-vehicle/${userId}`, {
          params: {
           orderId,
           vehicleId,
           },
          });           

          const vehicle = responseVehicle.data;

          if (vehicle) {

          const transporterId = user.id;

          const transporterVehicleId = vehicle.id;

          const currentLocation = vehicle.currentLocation;

          const response = await fetch(`/orders/${orderId}/propose-price`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              price,
              transporterId,
              transporterVehicleId,
              currentLocation
            }),
          });

          if (!response.ok) throw new Error('Failed to propose price');

          const statusUpdate: StatusUpdate = {
            status: 'determine_price',
            timestamp: new Date().toISOString(),
            note: `Transporter proposed price: ${price}`,
          };

          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId
                ? {
                    ...order,
                    status: 'determine_price',
                    proposedPrice: price,
                    transporterId,
                    transporterVehicleId,
                    currentLocation,
                    statusUpdates: [...(order.statusUpdates || []), statusUpdate],
                  }
                : order
            ),
            isLoading: false,
          }));
          } else {
            set(state => ({
              orders: state.orders.map(order =>
                order.id === orderId
                  ? {
                      ...order,
                    }
                  : order
              ),
              isLoading: false,
            }));
          }
        } catch (error) {
          set({
            error: 'Failed to propose price. Please try again.',
            isLoading: false,
          });
        }
      },

      acceptProposedPrice: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/orders/${orderId}/accept-price`, {
            method: 'POST',
          });

          if (!response.ok) throw new Error('Failed to accept price');

          const order = get().orders.find(o => o.id === orderId);
          if (!order || order.proposedPrice === undefined) {
            throw new Error('No proposed price to accept');
          }

          const statusUpdate: StatusUpdate = {
            status: 'accepted',
            timestamp: new Date().toISOString(),
            note: `Orderer accepted price: ${order.proposedPrice}`,
          };

          set(state => ({
            orders: state.orders.map(order =>
              order.id === orderId
                ? {
                    ...order,
                    status: 'accepted',
                    price: order.proposedPrice || order.price,
                    statusUpdates: [...(order.statusUpdates || []), statusUpdate],
                  }
                : order
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: 'Failed to accept price. Please try again.',
            isLoading: false,
          });
        }
      },
    }),
    { name: 'order-storage' }
  )
); 
