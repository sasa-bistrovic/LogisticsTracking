import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthProvider, LoginCredentials } from '@/types';
import { useOrderStore }  from '@/store/orderStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  login2: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  getAllUsers: () => Promise<User[]>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const response = await axios.post(`/auth/login`, credentials);
          const responseUser = response.data as User;
          //console.log(responseUser);
          if (responseUser) {
            set({
              user: responseUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({ error: 'Login failed', isLoading: false, isAuthenticated: false });
          }
        } catch (error) {
          set({ error: 'Login failed', isLoading: false, isAuthenticated: false });
        }
      },
      login2: async (credentials: LoginCredentials) => {
        try {
          //const { fetchOrders2 } = useOrderStore();

          //await fetchOrders2();

          const store = useOrderStore.getState();
          await store.fetchOrders2();

          const response = await axios.post(`/auth/login`, credentials);
          const responseUser = response.data as User;

          //console.log(responseUser);
          if (responseUser) {
            set({
              user: responseUser,
              isAuthenticated: true,
              //isLoading: false,
              error: null,
            });
          } else {
            //set({ error: 'Login failed', isLoading: false, isAuthenticated: false });
          }
        } catch (error) {
          //set({ error: 'Login failed', isLoading: false, isAuthenticated: false });
        }
      },      
      logout: async () => {
        set({ isLoading: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        } catch (error) {
          set({ error: 'Logout failed', isLoading: false });
        }
      },
      register: async (userData: Partial<User>) => {
        set({ isLoading: true });

    try {
        const email = userData.email;
        
        // Proveri da li korisnik već postoji
        const existingUserResponse = await axios.get(`/api/users/get-by-email/${email}`);
        if (existingUserResponse.data && existingUserResponse.data.email === email) {
            set({ error: 'User with this email already exists', isLoading: false });
            return;
        }

        // Ako korisnik ne postoji, nastavi s registracijom
        const response = await axios.post(`/auth/register`, userData);
        const newUser = response.data as User;

        set({
            //user: newUser,
            //isAuthenticated: true,
            isLoading: false,
            error: null,
        });

        return newUser; // Opcionalno vraćanje korisnika ako je potrebno

    } catch (error) {
        set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
    }
},
      updateUser: async (userData: Partial<User>) => {
        set({ isLoading: true });
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    const user2 = useAuthStore.getState().user;
    const userId2 = user2.id;
    const response = await axios.put(`/api/users/${userId2}`, userData);
    //return response.data;
  } catch (error) {
    console.error("Failed to update user", error);
  }
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
        set({ isLoading: false });
      },
      getAllUsers: async (): Promise<User[]> => {
        try {
          const response = await axios.get('/api/users/all');
          return response.data as User[];
        } catch (err) {
          console.error('Failed to fetch users:', err);
          return [];
        }
      },
    }),
    //{ name: 'auth-storage' }
  )
);