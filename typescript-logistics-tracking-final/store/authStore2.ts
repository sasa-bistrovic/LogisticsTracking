import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'orderer' | 'transporter';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  role: UserRole;
  vehicles: any[];
}

export type Location = {
  latitude: number;
  longitude: number;
  address: string;
  updatedAt?: string;
};

export type Dimensions = {
  length: number;
  width: number;
  height: number;
};

export type VehicleType = 'truck' | 'van' | 'car' | 'motorcycle';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'INR';

export type Vehicle = {
  id: string;
  type: VehicleType;
  model: string;
  licensePlate: string;
  maxWeight: number;
  dimensions: Dimensions;
  maxVolume: number; // Calculated from dimensions
  isRefrigerated: boolean;
  currentLocation: Location;
  available: boolean;
  // Pricing parameters
  currency: Currency;
  basePrice: number;
  pricePerKm: number;
  pricePerKg: number;
  pricePerM3: number;
  pricePerApproachKm: number; // Price per km for transporter to reach pickup location
  coolingCoefficient: number;
  hazardousCoefficient: number;
  urgentCoefficient: number;
};

interface AuthState {
  no : number;
  user: User | null;
  userTest: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  nonumber: () => Promise<void>;
  clearnonumber: () => Promise<void>;
  resetUsers: () => Promise<void>;
  login: (role: string) => Promise<void>;
  getTransporter: () => Promise<void>;
  getOrderer: () => Promise<void>;
  getVehicle: () => Promise<void>;
  newLoginVehicle: (newVehicle: Vehicle) => Promise<void>;
  updateLoginVehicle: (updateVehicle: Vehicle) => Promise<void>;
  loginTest: (role: string) => Promise<void>;
  getTransporterTest: () => Promise<void>;
  getOrdererTest: () => Promise<void>;
  getVehicleTest: () => Promise<void>;
  newLoginVehicleTest: (newVehicle: Vehicle) => Promise<void>;
  updateLoginVehicleTest: (updateVehicle: Vehicle) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  updateUserTest: (userTest: User) => void;
}

// Mock user data
/*
const mockUser: User = {
  id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'transporter',
  address: 'my Home Address',
  vehicles: []
};
*/

const mockUsers: Record<string, User> = {
  transporter: {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    role: 'transporter',
    address: 'Transporter HQ',
    vehicles: [],
  },
  orderer: {
    id: 'user456',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+0987654321',
    role: 'orderer',
    address: 'Orderer Street 456',
    vehicles: [],
  }
};


export const useAuthStore2 = create<AuthState>()(
  persist(
    (set) => ({
      no: 0,
      user: mockUsers.orderer, // For demo purposes, we'll start with a logged-in user
      userTest: mockUsers.orderer, // For demo purposes, we'll start with a logged-in user
      isAuthenticated: true, // For demo purposes
      isLoading: false,
      error: null,

      resetUsers: async () => {
          mockUsers.transporter.vehicles = [];
      },

      nonumber: async () => {
        set(state => ({ no: state.no + 1 }));
      },

      clearnonumber: async () => {
        set(state => ({ no: 0}));
      },
      
      login: async (role: string) => {
        set({ isLoading: true, error: null });
      
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (role==='transporter') {
            role = 'orderer';
          } else if (role==='orderer') {
            role = 'transporter';
          }
          
          const user = mockUsers[role];
      
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({
            error: 'An error occurred during login',
            isLoading: false
          });
        }
      },

      newLoginVehicle: async (newVehicle: Vehicle) => {
        set({ isLoading: true, error: null });
      
        try {
          const transporter = mockUsers.transporter;
      
          if (!transporter) {
            throw new Error('Transporter not found');
          }
      
          if (!transporter.vehicles) {
            transporter.vehicles = [];
          }
      
          transporter.vehicles.push(newVehicle);
      
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: 'An error occurred while adding a vehicle',
            isLoading: false
          });
        }
      },

      getTransporter: async () => {
        set({ isLoading: true, error: null });
      
        try {
          const transporter = mockUsers.transporter;
      
          return transporter;
        } catch (error) {
          set({ 
            error: 'An error occurred while adding a vehicle',
            isLoading: false
          });
        }
      },

      getOrderer: async () => {
        set({ isLoading: true, error: null });
      
        try {
          const orderer = mockUsers.orderer;
      
          return orderer;
        } catch (error) {
          set({ 
            error: 'An error occurred while adding a vehicle',
            isLoading: false
          });
        }
      },

      getVehicle: async () => {
        set({ isLoading: true, error: null });
      
        try {
          const vehicle = mockUsers.transporter.vehicles[0];
      
          return vehicle;
        } catch (error) {
          set({ 
            error: 'An error occurred while adding a vehicle',
            isLoading: false
          });
        }
      },

      updateLoginVehicle: async (updatedVehicle: Vehicle) => {
        set({ isLoading: true, error: null });
      
        try {
          const transporter = mockUsers.transporter;
      
          if (!transporter) {
            throw new Error('Transporter not found');
          }
      
          if (!transporter.vehicles) {
            transporter.vehicles = [];
          }
      
          const index = transporter.vehicles.findIndex(v => v.id === updatedVehicle.id);
      
          if (index === -1) {
            throw new Error('Vehicle not found');
          }
      
          // Update the vehicle
          transporter.vehicles[index] = { ...transporter.vehicles[index], ...updatedVehicle };
      
          set({ isLoading: false });
        } catch (error) {
          set({
            error: 'An error occurred while updating the vehicle',
            isLoading: false
          });
        }
      },

      loginTest: async (role: string) => {
        set({ isLoading: true, error: null });
      
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (role==='transporter') {
            role = 'orderer';
          } else if (role==='orderer') {
            role = 'transporter';
          }
          
          const userTest = mockUsers[role];
      
          set({
            userTest,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({
            error: 'An error occurred during login',
            isLoading: false
          });
        }
      },

      newLoginVehicleTest: async (newVehicle: Vehicle) => {
        set({ isLoading: true, error: null });
      
        try {
          const transporter = mockUsers.transporter;
      
          if (!transporter) {
            throw new Error('Transporter not found');
          }
      
          if (!transporter.vehicles) {
            transporter.vehicles = [];
          }
      
          transporter.vehicles.push(newVehicle);
      
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: 'An error occurred while adding a vehicle',
            isLoading: false
          });
        }
      },

      getTransporterTest: async () => {
        set({ isLoading: true, error: null });
      
        try {
          const transporter = mockUsers.transporter;
      
          return transporter;
        } catch (error) {
          set({ 
            error: 'An error occurred while adding a vehicle',
            isLoading: false
          });
        }
      },

      getOrdererTest: async () => {
        set({ isLoading: true, error: null });
      
        try {
          const orderer = mockUsers.orderer;
      
          return orderer;
        } catch (error) {
          set({ 
            error: 'An error occurred while adding a vehicle',
            isLoading: false
          });
        }
      },

      getVehicleTest: async () => {
        set({ isLoading: true, error: null });
      
        try {
          const vehicle = mockUsers.transporter.vehicles[0];
      
          return vehicle;
        } catch (error) {
          set({ 
            error: 'An error occurred while adding a vehicle',
            isLoading: false
          });
        }
      },

      updateLoginVehicleTest: async (updatedVehicle: Vehicle) => {
        set({ isLoading: true, error: null });
      
        try {
          const transporter = mockUsers.transporter;
      
          if (!transporter) {
            throw new Error('Transporter not found');
          }
      
          if (!transporter.vehicles) {
            transporter.vehicles = [];
          }
      
          const index = transporter.vehicles.findIndex(v => v.id === updatedVehicle.id);
      
          if (index === -1) {
            throw new Error('Vehicle not found');
          }
      
          // Update the vehicle
          transporter.vehicles[index] = { ...transporter.vehicles[index], ...updatedVehicle };
      
          set({ isLoading: false });
        } catch (error) {
          set({
            error: 'An error occurred while updating the vehicle',
            isLoading: false
          });
        }
      },      
      
      logout: () => {
        set({ 
          user: null,
          isAuthenticated: false
        });
      },
      
      updateUser: (user) => {
        set({ user });
      },

      updateUserTest: (userTest) => {
        set({ userTest });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);