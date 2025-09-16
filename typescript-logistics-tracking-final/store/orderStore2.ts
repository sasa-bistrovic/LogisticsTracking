import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Order, Vehicle } from '@/types';
import { calculateDistance } from '@/utils/helpers';

interface OrderState {
  orders: Order[];
  orders2: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  setOrders2: (newOrders: Order[]) => void;
  getOrders2: () => Order[];
  getPendingOrders: () => Order[];
  clearOrders: () => Promise<void>;
  removeCancelledOrders: () => Order[];
  removeCancelledAndPendingOrders: () => Order[];
  getAvailableOrders: (transporterLocation?: Location, transporterVehicle?: Vehicle, maxDistance?: number) => Order[];
  updateOrderById: (id: string, updateOrder: Order) => Promise<void>;
  newVehicleData: (userId: string, vehicleData: any) => Promise<any>;
}

export const useOrderStore2 = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      orders2: [],
      isLoading: false,
      error: null,

      setOrders2: (newOrders: Order[]) => set({ orders2: newOrders }),

      getOrders2: () => {
        return get().orders2;
      },

      getPendingOrders: () => {
        return get().orders2.filter(order => order.status === 'pending');
      },

      clearOrders: async () => {
        set({ orders2: [] });
      },

      removeCancelledOrders: () => {
        const updatedOrders = get().orders2.filter(order => order.status !== 'cancelled');
        set({ orders2: updatedOrders });
        return updatedOrders;
      },

      removeCancelledAndPendingOrders: () => {
        const updatedOrders = get().orders2.filter(order => order.status !== 'cancelled' && order.status !== 'pending');
        set({ orders2: updatedOrders });
        return updatedOrders;
      },      

      updateOrderById: async (id, updatedOrder) => {
        const updatedOrders = get().orders2.map(order => 
          order.id === id ? { ...order, ...updatedOrder } : order
        );
          set({ orders2: updatedOrders });
      },
      
      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        /*
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock data
          const mockOrders = [
            { id: 'order1', status: 'pending', price: 120 },
            { id: 'order2', status: 'completed', price: 85 },
          ];
          
          set({ 
            orders: mockOrders,
            isLoading: false
          });
        } catch (error) {
          set({ 
            error: 'Failed to fetch orders',
            isLoading: false
          });
        }
          */
      },

      getAvailableOrders: (transporterLocation, transporterVehicle, maxDistance) => {

        const pendingOrders = get().orders2.filter(order => order.status === 'pending');
        
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
      
      newVehicleData: async (userId, vehicleData) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock response
          const response = {
            ok: true,
            json: () => Promise.resolve({
              id: userId,
              name: 'John Doe',
              email: 'john@example.com',
              vehicles: [vehicleData]
            })
          };
          
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ 
            error: 'Failed to add vehicle',
            isLoading: false
          });
          throw error;
        }
      }
    }),
    {
      name: 'order-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);