import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Switch,
  Modal,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderStore2 } from '@/store/orderStore2';
import { Order } from '@/types/index';
import { useAuthStore2 } from '@/store/authStore2';
import { Button } from '@/components/Button';
import { 
  MapPin, 
  Package, 
  Calendar, 
  FileText,
  Weight,
  Box,
  Layers,
  Snowflake,
  Ruler,
  AlertTriangle,
  Clock,
  Truck,
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Navigation, Repeat, Car, ClipboardList, List, PlusCircle, 
  Calculator, UserCircle, 
  Hand, ThumbsUp, Eye, LogOut
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { isLoaded } from 'expo-font';
import CustomDialog from '@/components/CustomDialog';
import { useDialog } from '@/hooks/useDialog';

// Demo data and constants
const colors = {
  primary: '#4361ee',
  primaryLight: '#eef0fd',
  secondary: '#3f37c9',
  secondaryLight: '#e8e7f7',
  success: '#4caf50',
  successLight: '#e8f5e9',
  danger: '#f44336',
  dangerLight: '#ffebee',
  warning: '#ff9800',
  warningLight: '#fff3e0',
  info: '#2196f3',
  infoLight: '#e3f2fd',
  
  text: '#333333',
  textLight: '#757575',
  background: '#f5f7fa',
  white: '#ffffff',
  black: '#000000',
  gray: '#9e9e9e',
  lightGray: '#e0e0e0',
  border: '#eeeeee',
  shadow: '#000000',
  
  // Status colors
  pending: '#ff9800',
  determine_price: '#2196f3',
  accepted: '#4caf50',
  pickup: '#9c27b0',
  in_transit: '#3f51b5',
  delivered: '#4caf50',
  cancelled: '#f44336',
};

// Types for our data
interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  type: string;
  maxWeight: number;
  maxVolume: number;
  isRefrigerated: boolean;
  available: boolean;
  basePrice: number;
  pricePerKm: number;
  pricePerKg: number;
  pricePerM3: number;
  coolingCoefficient: number;
  hazardousCoefficient: number;
  urgentCoefficient: number;
  pricePerApproachKm: number;
  currency: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  currentLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
}

interface Transporter {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MatchedVehicle {
  vehicle: Vehicle;
  user2: User;
  price: number;
  approachDistance: number;
}

// Mock data for vehicles
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    model: 'Mercedes Sprinter',
    licensePlate: 'ABC123',
    type: 'van',
    maxWeight: 1500,
    maxVolume: 12,
    isRefrigerated: true,
    available: true,
    basePrice: 50,
    pricePerKm: 1.2,
    pricePerKg: 0.05,
    pricePerM3: 2,
    coolingCoefficient: 1.3,
    hazardousCoefficient: 1.5,
    urgentCoefficient: 1.4,
    pricePerApproachKm: 0.8,
    currency: 'USD',
    dimensions: {
      length:1000,
      width:1000,
      height:1000,
    },
    currentLocation: {
      address: "ABC",
      latitude: 45.8150,
      longitude: 15.9819,
    },
    imageUrl: 'https://images.unsplash.com/photo-1566207474742-0fa4e3af9bee?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    model: 'Volvo FH16',
    licensePlate: 'XYZ789',
    type: 'truck',
    maxWeight: 24000,
    maxVolume: 80,
    isRefrigerated: false,
    available: true,
    basePrice: 120,
    pricePerKm: 1.8,
    pricePerKg: 0.03,
    pricePerM3: 1.5,
    coolingCoefficient: 0,
    hazardousCoefficient: 1.6,
    urgentCoefficient: 1.3,
    pricePerApproachKm: 1.2,
    currency: 'USD',
    dimensions: {
      length:1000,
      width:1000,
      height:1000,
    },
    currentLocation: {
      address: "ABC",
      latitude: 45.8250,
      longitude: 15.9719,
    },
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '3',
    model: 'Ford Transit',
    licensePlate: 'DEF456',
    type: 'van',
    maxWeight: 1200,
    maxVolume: 10,
    isRefrigerated: false,
    available: true,
    basePrice: 40,
    pricePerKm: 1.0,
    pricePerKg: 0.04,
    pricePerM3: 1.8,
    coolingCoefficient: 0,
    hazardousCoefficient: 1.4,
    urgentCoefficient: 1.3,
    pricePerApproachKm: 0.7,
    currency: 'USD',
    dimensions: {
      length:1000,
      width:1000,
      height:1000,
    },
    currentLocation: {
      address: "ABC",
      latitude: 45.8050,
      longitude: 15.9919,
    },
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop'
  }
];

// Mock data for transporters
const mockTransporters: Transporter[] = [
  {
    id: '1',
    name: 'Express Logistics',
    email: 'contact@expresslogistics.com',
    phone: '+1234567890',
    role: 'transporter',
  },
  {
    id: '2',
    name: 'Global Transport Inc.',
    email: 'info@globaltransport.com',
    phone: '+0987654321',
    role: 'transporter',
  },
  {
    id: '3',
    name: 'City Delivery Services',
    email: 'support@citydelivery.com',
    phone: '+1122334455',
    role: 'transporter',
  }
];

// Mock user data
const mockUser: User = {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'customer'
};

// Helper functions
const formatDate = (dateString: string, includeTime: boolean = false): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };
  
  return date.toLocaleDateString('en-US', options);
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  // Simple mock distance calculation (not accurate)
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return Math.round(distance);
};

const calculateTransportPrice = (
  distanceKm: number,
  weightKg: number,
  volumeM3: number,
  requiresRefrigeration: boolean,
  isHazardous: boolean,
  isUrgent: boolean,
  basePrice: number,
  pricePerKm: number,
  pricePerKg: number,
  pricePerM3: number,
  coolingCoefficient: number,
  hazardousCoefficient: number,
  urgentCoefficient: number,
  approachDistanceKm: number,
  pricePerApproachKm: number
): number => {
  // Base calculation
  let price = basePrice + (distanceKm * pricePerKm) + (weightKg * pricePerKg) + (volumeM3 * pricePerM3);
  
  // Add approach distance cost
  price += approachDistanceKm * pricePerApproachKm;
  
  // Apply special requirements multipliers
  if (requiresRefrigeration && coolingCoefficient > 0) {
    price *= coolingCoefficient;
  }
  
  if (isHazardous && hazardousCoefficient > 0) {
    price *= hazardousCoefficient;
  }
  
  if (isUrgent && urgentCoefficient > 0) {
    price *= urgentCoefficient;
  }
  
  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Mock geocoding function
const mockGeocode = async (address: string): Promise<{ lat: number, lon: number } | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock coordinates based on address
  if (address.toLowerCase().includes('zagreb')) {
    return { lat: 45.8150, lon: 15.9819 };
  } else if (address.toLowerCase().includes('split')) {
    return { lat: 43.5081, lon: 16.4402 };
  } else if (address.toLowerCase().includes('rijeka')) {
    return { lat: 45.3271, lon: 14.4422 };
  } else if (address.toLowerCase().includes('osijek')) {
    return { lat: 45.5550, lon: 18.6955 };
  } else {
    // Generate random coordinates for other addresses
    const lat = 45 + Math.random() * 2;
    const lon = 15 + Math.random() * 2;
    return { lat, lon };
  }
};

// VehicleCard component
const VehicleCard = ({ vehicle, showPricing = false }: { vehicle: Vehicle, showPricing?: boolean }) => {

  type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY' | 'INR';

  const getVehicleIcon = () => {
    switch (vehicle.type) {
      case 'truck':
        return <Truck size={24} color={colors.primary} />;
      case 'van':
        return <Truck size={24} color={colors.primary} />;
      case 'car':
        return <Truck size={24} color={colors.primary} />;
      case 'motorcycle':
        return <Truck size={24} color={colors.primary} />;
      default:
        return <Truck size={24} color={colors.primary} />;
    }
  };

  const currencies: { code: Currency; symbol: string; name: string }[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  ];
  
  const getCurrencySymbol = (currencyCode: Currency | string): string => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$';
  };

  const currencySymbol = getCurrencySymbol(vehicle.currency || 'USD');

  return (
    <View  
  style={[
    vehicleCardStyles.container,
    !vehicle.available && vehicleCardStyles.unavailableContainer
  ]}
>
      <View style={vehicleCardStyles.header}>
        <View style={vehicleCardStyles.iconContainer}>
          {getVehicleIcon()}
        </View>
        <View>
          <Text style={vehicleCardStyles.model}>{vehicle.model}</Text>
          <Text style={vehicleCardStyles.licensePlate}>{vehicle.licensePlate}</Text>
        </View>
        <View style={vehicleCardStyles.rightSection}>
          <View style={[
            vehicleCardStyles.statusBadge, 
            { backgroundColor: vehicle.available ? colors.success : colors.gray }
          ]}>
            <Text style={vehicleCardStyles.statusText}>
              {vehicle.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={vehicleCardStyles.detailsContainer}>
        <View style={vehicleCardStyles.detailItem}>
          <Weight size={16} color={colors.gray} />
          <Text style={vehicleCardStyles.detailText}>
            Max: {vehicle.maxWeight} kg
          </Text>
        </View>
        <View style={vehicleCardStyles.detailItem}>
          <Box size={16} color={colors.gray} />
          <Text style={vehicleCardStyles.detailText}>
            Vol: {vehicle.maxVolume.toFixed(2)} m³
          </Text>
        </View>
        {vehicle.dimensions && (
          <View style={vehicleCardStyles.detailItem}>
            <Ruler size={16} color={colors.gray} />
            <Text style={vehicleCardStyles.detailText}>
              {vehicle.dimensions.length}×{vehicle.dimensions.width}×{vehicle.dimensions.height} cm
            </Text>
          </View>
        )}
        {vehicle.isRefrigerated && (
          <View style={vehicleCardStyles.refrigeratedBadge}>
            <Snowflake size={14} color={colors.white} />
            <Text style={vehicleCardStyles.refrigeratedText}>Refrigerated</Text>
          </View>
        )}
      </View>
      
      {showPricing && (
        <View style={vehicleCardStyles.pricingContainer}>
          <View style={vehicleCardStyles.pricingRow}>
            <View style={vehicleCardStyles.pricingItem}>
              <DollarSign size={14} color={colors.primary} />
              <Text style={vehicleCardStyles.pricingText}>
                Base: {currencySymbol}{vehicle.basePrice}
              </Text>
            </View>
            <View style={vehicleCardStyles.pricingItem}>
              <MapPin size={14} color={colors.primary} />
              <Text style={vehicleCardStyles.pricingText}>
                Per km: {currencySymbol}{vehicle.pricePerKm}
              </Text>
            </View>
          </View>
          <View style={vehicleCardStyles.pricingRow}>
            <View style={vehicleCardStyles.pricingItem}>
              <Weight size={14} color={colors.primary} />
              <Text style={vehicleCardStyles.pricingText}>
                Per kg: {currencySymbol}{vehicle.pricePerKg}
              </Text>
            </View>
            <View style={vehicleCardStyles.pricingItem}>
              <Box size={14} color={colors.primary} />
              <Text style={vehicleCardStyles.pricingText}>
                Per m³: {currencySymbol}{vehicle.pricePerM3}
              </Text>
            </View>
          </View>
          <View style={vehicleCardStyles.currencyBadge}>
            <Text style={vehicleCardStyles.currencyText}>{vehicle.currency || 'USD'}</Text>
          </View>
        </View>
      )}
      
      <View style={vehicleCardStyles.locationContainer}>
        <MapPin size={16} color={colors.primary} />
        <Text style={vehicleCardStyles.locationText} numberOfLines={1}>
          {vehicle.currentLocation.address}
        </Text>
      </View>
    </View>
  );
};

const vehicleCardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    //marginBottom: 16,
    //shadowColor: colors.shadow,
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.1,
    //shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: colors.primary,
  },
  unavailableContainer: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  model: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  licensePlate: {
    fontSize: 14,
    color: colors.textLight,
  },
  rightSection: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
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
  pricingContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    position: 'relative',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pricingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  currencyBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  currencyText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});

// Button component
interface ButtonProps {
  title: string;
  onPress: () => void;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  style?: any;
}
/*
const Button = ({ title, onPress, rightIcon, isLoading, style }: ButtonProps) => {
  return (
    <TouchableOpacity 
      style={[buttonStyles.button, style, isLoading && buttonStyles.buttonDisabled]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <>
          <Text style={buttonStyles.buttonText}>{title}</Text>
          {rightIcon && <View style={buttonStyles.rightIcon}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};
*/
const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.7,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

// Order creation steps enum
enum OrderCreationStep {
  CARGO_DETAILS = 0,
  LOCATIONS = 1,
  FIND_VEHICLE = 2,
  REVIEW_PRICE = 3,
}

export default function CreateOrderScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { visible, options, showDialog, hideDialog } = useDialog();

  const navigation = useNavigation();

  const { userTest, no, nonumber, getTransporterTest } = useAuthStore2();
  
  // Form state
  const { getOrders2, setOrders2 } = useOrderStore2();
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoLength, setCargoLength] = useState('');
  const [cargoWidth, setCargoWidth] = useState('');
  const [cargoHeight, setCargoHeight] = useState('');
  const [cargoItems, setCargoItems] = useState('1');
  const [requiresRefrigeration, setRequiresRefrigeration] = useState(false);
  const [isHazardous, setIsHazardous] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Process state
  const [currentStep, setCurrentStep] = useState<OrderCreationStep>(OrderCreationStep.CARGO_DETAILS);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [searchRadius, setSearchRadius] = useState('50');
  const [matchedVehicles, setMatchedVehicles] = useState<MatchedVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<MatchedVehicle | null>(null);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isSearchingVehicles, setIsSearchingVehicles] = useState(false);
  const [scheduledPickup, setScheduledPickup] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  async function getCoordinates(address: string): Promise<{ lat: number, lon: number } | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}

  const steps = [
    { title: "Switch to Transporter Account", action: () => { nonumber();} },
    { title: "Start Vehicle Registration", action: () => { nonumber(); router.replace('/profile/pages/add'); } },
    { title: "Add Vehicle Details", action: () => { nonumber(); } },
    { title: "Switch to Orderer Account", action: () => { nonumber(); } },
    { title: "View Your Orders", action: () => { nonumber(); router.replace('/profile/pages/list'); } },
    { title: "Create a New Transport Order", action: () => { nonumber(); } },
    { title: "Enter Cargo Information", action: () => { nonumber();goToNextStep(); } },
    { title: "Enter Pickup and Delivery Locations", action: () => { nonumber();goToNextStep(); } },
    { title: "Calculate the Transport Price", action: () => { nonumber();goToNextStep(); } },
    { title: "Confirm and Create the Order", action: () => { nonumber();goToNextStep(); } },
    { title: "Go to Your Profile Page", action: () => { nonumber(); router.replace('/profile/pages/profile'); } },
    { title: "Switch Back to Transporter Account", action: () => { nonumber(); } },
    { title: "Browse Available Orders", action: () => { nonumber(); router.replace('/profile/pages/list'); } },
    { title: "Select an Order to Manage", action: () => { nonumber(); } },
    { title: "Accept the Selected Order", action: () => { nonumber(); } },
    { title: "View the Accepted Order", action: () => { nonumber(); } },
    { title: "Pickup the Cargo", action: () => { nonumber(); } },
    { title: "View Ongoing Orders", action: () => { nonumber();  } },
    { title: "Mark as In Transit", action: () => { nonumber(); } },
    { title: "Open the Order Details", action: () => { nonumber();  } },
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
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Calculate cargo volume from dimensions
  const calculateVolume = (length: string, width: string, height: string): number => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    return l * w * h / 1000000; // Convert from cm³ to m³
  };
  
  // Get calculated cargo volume
  const cargoVolume = calculateVolume(cargoLength, cargoWidth, cargoHeight);

  // Set demo values for quick testing
  useEffect(() => {
    // Pre-fill form with demo values
    setCargoDescription('Electronics and Computer Parts');
    setCargoWeight('120');
    setCargoLength('80');
    setCargoWidth('60');
    setCargoHeight('50');
    setCargoItems('2');
    setPickupAddress('Ilica 10, 10000 Zagreb, Croatia');
    setDeliveryAddress('Obala Hrvatskog narodnog preporoda 12, 21000 Split, Croatia');
  }, []);

  // Keyboard visibility detection for mobile
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const keyboardDidShow = () => setKeyboardVisible(true);
      const keyboardDidHide = () => setKeyboardVisible(false);
      
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHide);
      
      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
  }, []);

  // Validate the current step and move to the next one
  const goToNextStep = async () => {
    if (currentStep === OrderCreationStep.CARGO_DETAILS) {
      // Validate cargo details
      if (!cargoDescription || !cargoWeight || !cargoLength || !cargoWidth || !cargoHeight) {
        Alert.alert('Missing Information', 'Please fill in all required cargo details');
        return;
      }
      
      // Move to locations step
      setCurrentStep(OrderCreationStep.LOCATIONS);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } 
    else if (currentStep === OrderCreationStep.LOCATIONS) {
      // Validate locations
      if (!pickupAddress || !deliveryAddress) {
        Alert.alert('Missing Information', 'Please fill in both pickup and delivery addresses');
        return;
      }
      setIsLoading(true);
      setIsGeocodingLoading(true);
      
      try {
        // Geocode pickup address
        const pickup = await getCoordinates(pickupAddress);
        if (pickup) {
          setPickupCoords(pickup);
        } else {
          setIsLoading(false);
          throw new Error('Failed to geocode pickup address');
        }

        // Geocode delivery address
        const delivery = await getCoordinates(deliveryAddress);
        if (delivery) {
          setDeliveryCoords(delivery);
        } else {
          setIsLoading(false);
          throw new Error('Failed to geocode delivery address');
        }
        
        // Calculate distance between pickup and delivery
        //if (pickup && delivery) {
          const distance = calculateDistance(
            pickup.lat,
            pickup.lon,
            delivery.lat,
            delivery.lon
          );
          setDistanceKm(distance);
        //}
        // Find matching vehicles
        const matches: MatchedVehicle[] = [];

        //const user2 = getTransporterTest();
        
        const user2 = await getTransporterTest();  // Use await here to get the result of getTransporter

        if (user2) {
          for (const vehicle of user2?.vehicles ?? []) {
            // Skip unavailable vehicles
            if (!vehicle.available) continue;
            
            // Skip vehicles that don't meet refrigeration requirements
            if (requiresRefrigeration && !vehicle.isRefrigerated) continue;
            
            // Check if vehicle has enough capacity
            //const totalWeight = parseFloat(cargoWeight) * parseInt(cargoItems || '1');
            //const totalVolume = cargoVolume * parseInt(cargoItems || '1');

            const orders = getOrders2();

            let totalWeight = 0;
            let totalVolume = 0;
          
            orders.forEach(order => { 
              if (order.status !== 'cancelled' && order.status !== 'delivered' && order.cargo) {
                totalWeight += (order.cargo.weight || 0) * (order.cargo.items || 0);
                totalVolume += (order.cargo.volume || 0) * (order.cargo.items || 0);
              }
            });

            if (totalWeight+parseFloat(cargoWeight)*parseInt(cargoItems) > vehicle.maxWeight || totalVolume+cargoVolume*parseInt(cargoItems) > vehicle.maxVolume) continue;
            
            // Calculate distance from vehicle to pickup location
            const vehicleToPickupDistance = calculateDistance(
              vehicle.currentLocation.latitude,
              vehicle.currentLocation.longitude,
              pickup.lat,
              pickup.lon
            );
            
            // Skip vehicles outside the search radius
            const radius = parseInt(searchRadius);
            if (vehicleToPickupDistance > 1000000) continue;
    
            // Calculate price
            const price = calculateTransportPrice(
              distance,
              totalWeight,
              totalVolume,
              requiresRefrigeration,
              isHazardous,
              isUrgent,
              vehicle.basePrice,
              vehicle.pricePerKm,
              vehicle.pricePerKg,
              vehicle.pricePerM3,
              vehicle.coolingCoefficient,
              vehicle.hazardousCoefficient,
              vehicle.urgentCoefficient,
              vehicleToPickupDistance,
              vehicle.pricePerApproachKm
            );
    
            matches.push({
              vehicle,
              user2,  // User2 is now valid here
              price,
              approachDistance: vehicleToPickupDistance
            });

          }
        } else {
          console.log("User not found or transporter failed to load.");
        }
        
        // Sort matches by price (lowest first)
        matches.sort((a, b) => a.price - b.price);
        setMatchedVehicles(matches);
        
        // Calculate estimated times
        const now = new Date();
        const avgSpeedKmH = 60; // Average speed in km/h
        
        if (matches.length > 0) {
          setSelectedVehicle(matches[0]);
          const distanceKm2 = matches[0].approachDistance;
          const avgSpeedKmH2 = 100 / 48;
          const travelTimeMs2 = (distanceKm2 / avgSpeedKmH2) * 3600000;

          const distanceKm3 = distance;
          const avgSpeedKmH3 = 100 / 48;
          const travelTimeMs3 = (distanceKm3 / avgSpeedKmH3) * 3600000;
 
          const now = new Date();

          const scheduledPickup2 = new Date(now.getTime() + travelTimeMs2).toISOString();
          const estimatedDelivery2 = new Date(now.getTime() + travelTimeMs2 + travelTimeMs3).toISOString();

          setScheduledPickup(scheduledPickup2);
          setEstimatedDelivery(estimatedDelivery2);
        }
        
        setIsGeocodingLoading(false);
        setCurrentStep(OrderCreationStep.FIND_VEHICLE);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        setIsLoading(false);
      } catch (error) {
        setIsGeocodingLoading(false);
        Alert.alert('Error', 'Failed to geocode addresses. Please try again.');
        console.error('Geocoding error:', error);
      }
    }
    else if (currentStep === OrderCreationStep.FIND_VEHICLE) {
      // Move to review price step
      if (matchedVehicles.length > 0) {
        setCurrentStep(OrderCreationStep.REVIEW_PRICE);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        Alert.alert(
          'No Matching Vehicles',
          'No vehicles found that match your requirements within the specified radius. Try increasing the search radius or modifying your cargo details.'
        );
      }
    }
    else if (currentStep === OrderCreationStep.REVIEW_PRICE) {

      const routeAtTrigger = navigation.getState().routes.at(-1)?.name;

      // Create the order
      setIsLoading(true);

      const newOrder: Order = {
        id: `o${Date.now()}`,
        ordererId: userTest?.id,
        transporterId: selectedVehicle?.user2.id,
        transporterVehicleId: selectedVehicle?.vehicle.id,
        currentLocation: selectedVehicle?.vehicle.currentLocation,
        status: 'pending',
        pickupLocation: {
          address: pickupAddress,
          latitude: pickupCoords?.lat,
          longitude: pickupCoords?.lon,
        },
        deliveryLocation: {
          address: deliveryAddress,
          latitude: deliveryCoords?.lat,
          longitude: deliveryCoords?.lon,
        },
        cargo: {
          description: cargoDescription,
          weight: parseFloat(cargoWeight),
          dimensions: {
            length: parseFloat(cargoLength),
            width: parseFloat(cargoWidth),
            height: parseFloat(cargoHeight)
          },
          volume: cargoVolume,
          items: parseInt(cargoItems) || 1,
          requiresRefrigeration,
          isHazardous,
          isUrgent,
        },
        statusUpdates: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: "Transporter is determining the price based on cargo details.",
          },
          {
            status: 'created',
            timestamp: new Date().toISOString(),
            note: "Order automatically created with price: " + selectedVehicle?.price + " " + selectedVehicle?.vehicle.currency,
          },
        ],
        price: selectedVehicle?.price,
        proposedPrice: selectedVehicle?.price,
        currency: selectedVehicle?.vehicle.currency,
        createdAt: new Date().toISOString(),
        notes,
        scheduledPickup,
        estimatedDelivery,
        distanceKm,
        transporterToPickupDistanceKm: selectedVehicle?.approachDistance,
     };

      const existing = getOrders2();
      setOrders2([...existing, newOrder]);
      
      // Simulate API call delay
      
      showDialog({
        title: "Order Created",
        message: "Your order has been created successfully.",
        type: "success",
        buttons: []
      });

      setIsLoading(false);

      setTimeout(() => {
        const currentRoute = navigation.getState().routes.at(-1)?.name;
        if (currentRoute === routeAtTrigger) {
        router.replace('/profile/pages/list');
        }
        //setIsDisabled(false);
      }, 2500);
    }
  };
  
  // Go back to the previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };
  
  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case OrderCreationStep.CARGO_DETAILS:
        return renderCargoDetailsStep();
      case OrderCreationStep.LOCATIONS:
        return renderLocationsStep();
      case OrderCreationStep.FIND_VEHICLE:
        return renderFindVehicleStep();
      case OrderCreationStep.REVIEW_PRICE:
        return renderReviewPriceStep();
      default:
        return renderCargoDetailsStep();
    }
  };
  
  // Render the cargo details step
  const renderCargoDetailsStep = () => {
    return (
      <>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Cargo Details</Text>
          <Text style={styles.stepDescription}>
            Provide information about the cargo you need to transport
          </Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Package size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Cargo Description"
              value={cargoDescription}
              editable={false}
              onChangeText={setCargoDescription}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Weight size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              value={cargoWeight}
              editable={false}
              onChangeText={setCargoWeight}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <Text style={styles.dimensionsLabel}>Cargo Dimensions (cm)</Text>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Ruler size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Length"
                value={cargoLength}
                editable={false}
                onChangeText={setCargoLength}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <Ruler size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Width"
                editable={false}
                value={cargoWidth}
                onChangeText={setCargoWidth}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Ruler size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Height"
                editable={false}
                value={cargoHeight}
                onChangeText={setCargoHeight}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.volumeContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.volumeIcon}>
                <Box size={20} color={colors.white} />
              </View>
              <View style={styles.volumeContent}>
                <Text style={styles.volumeLabel}>Volume</Text>
                <Text style={styles.volumeValue}>
                  {cargoVolume.toFixed(2)} m³
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Layers size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Number of Items"
              value={cargoItems}
              editable={false}
              onChangeText={setCargoItems}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchIcon}>
              <Snowflake size={20} color={requiresRefrigeration ? colors.primary : colors.gray} />
            </View>
            <Text style={styles.switchLabel}>Requires Refrigeration</Text>
            <Switch
              value={requiresRefrigeration}
              onValueChange={setRequiresRefrigeration}
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={requiresRefrigeration ? colors.primary : colors.gray}
              disabled={true}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchIcon}>
              <AlertTriangle size={20} color={isHazardous ? colors.warning : colors.gray} />
            </View>
            <Text style={styles.switchLabel}>Hazardous Materials</Text>
            <Switch
              value={isHazardous}
              onValueChange={setIsHazardous}
              trackColor={{ false: colors.lightGray, true: colors.warningLight }}
              thumbColor={isHazardous ? colors.warning : colors.gray}
              disabled={true}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchIcon}>
              <Clock size={20} color={isUrgent ? colors.secondary : colors.gray} />
            </View>
            <Text style={styles.switchLabel}>Urgent Delivery</Text>
            <Switch
              value={isUrgent}
              onValueChange={setIsUrgent}
              trackColor={{ false: colors.lightGray, true: colors.secondaryLight }}
              thumbColor={isUrgent ? colors.secondary : colors.gray}
              disabled={true}
            />
          </View>
          
          {requiresRefrigeration && (
            <View style={styles.specialRequirementNote}>
              <Text style={styles.specialRequirementText}>
                Note: Refrigerated transport may incur additional costs.
              </Text>
            </View>
          )}
          
          {isHazardous && (
            <View style={[styles.specialRequirementNote, { backgroundColor: colors.warningLight }]}>
              <Text style={[styles.specialRequirementText, { color: colors.warning }]}>
                Note: Hazardous materials require special handling and may incur additional costs.
              </Text>
            </View>
          )}
          
          {isUrgent && (
            <View style={[styles.specialRequirementNote, { backgroundColor: colors.secondaryLight }]}>
              <Text style={[styles.specialRequirementText, { color: colors.secondary }]}>
                Note: Urgent deliveries are prioritized and may incur additional costs.
              </Text>
            </View>
          )}
        </View>
      </>
    );
  };
  
  // Render the locations step
  const renderLocationsStep = () => {
    return (
      <>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Pickup & Delivery Locations</Text>
          <Text style={styles.stepDescription}>
            Specify where the cargo will be picked up and delivered
          </Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pickup Address"
              editable={false}
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.secondary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Delivery Address"
              editable={false}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.textAreaContainer}>
            <View style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 12 }]}>
              <FileText size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="Additional Notes"
              editable={false}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
      </>
    );
  };
  
  // Render the find vehicle step
  const renderFindVehicleStep = () => {
    return (
      <>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Nearest Available Vehicle</Text>
          <Text style={styles.stepDescription}>
            Review your cargo and location details
          </Text>
        </View>
        
        <View style={styles.section}>
          {selectedVehicle && (
            <View style={styles.distanceInfo}>
              <Text style={styles.distanceInfoText}>
                {selectedVehicle.approachDistance} km from transporter to pickup location
              </Text>
            </View>
          )}
          
          <View style={styles.cargoSummary}>
            <Text style={styles.cargoSummaryTitle}>Cargo Summary</Text>
            
            <View style={styles.cargoSummaryItem}>
              <Package size={16} color={colors.gray} />
              <Text style={styles.cargoSummaryText}>{cargoDescription}</Text>
            </View>
            
            <View style={styles.cargoSummaryItem}>
              <Weight size={16} color={colors.gray} />
              <Text style={styles.cargoSummaryText}>
                {(parseFloat(cargoWeight) * parseInt(cargoItems || '1')).toFixed(2)} kg
              </Text>
            </View>
            
            <View style={styles.cargoSummaryItem}>
              <Box size={16} color={colors.gray} />
              <Text style={styles.cargoSummaryText}>
                {(cargoVolume * parseInt(cargoItems || '1')).toFixed(2)} m³
              </Text>
            </View>
            
            <View style={styles.cargoSummaryItem}>
              <Ruler size={16} color={colors.gray} />
              <Text style={styles.cargoSummaryText}>
                {cargoLength} × {cargoWidth} × {cargoHeight} cm * {parseInt(cargoItems || '1')} items
              </Text>
            </View>
            
            <View style={styles.specialRequirementsContainer}>
              {requiresRefrigeration && (
                <View style={styles.specialRequirementBadge}>
                  <Snowflake size={14} color={colors.white} />
                  <Text style={styles.specialRequirementText}>Refrigerated</Text>
                </View>
              )}
              
              {isHazardous && (
                <View style={[styles.specialRequirementBadge, { backgroundColor: colors.warning }]}>
                  <AlertTriangle size={14} color={colors.white} />
                  <Text style={styles.specialRequirementText}>Hazardous</Text>
                </View>
              )}
              
              {isUrgent && (
                <View style={[styles.specialRequirementBadge, { backgroundColor: colors.secondary }]}>
                  <Clock size={14} color={colors.white} />
                  <Text style={styles.specialRequirementText}>Urgent</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.locationsSummary}>
            <Text style={styles.locationsSummaryTitle}>Locations</Text>
            
            <View style={styles.locationItem}>
              <View style={[styles.locationIcon, { backgroundColor: colors.primaryLight }]}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Pickup</Text>
                <Text style={styles.locationAddress}>{pickupAddress}</Text>
                {scheduledPickup && !isNaN(new Date(scheduledPickup).getTime()) && (
                  <Text style={styles.locationTime}>
                    {formatDate(scheduledPickup, true)}
                  </Text>
                )}
              </View>
            </View>
            
            <View style={styles.locationConnector} />
            
            <View style={styles.locationItem}>
              <View style={[styles.locationIcon, { backgroundColor: colors.secondaryLight }]}>
                <MapPin size={20} color={colors.secondary} />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>Delivery</Text>
                <Text style={styles.locationAddress}>{deliveryAddress}</Text>
                  {estimatedDelivery && !isNaN(new Date(estimatedDelivery).getTime()) && (
                  <Text style={styles.locationTime}>
                    {formatDate(estimatedDelivery, true)}
                  </Text>
                )}
              </View>
            </View>
            
            <View style={styles.distanceContainer}>
              {typeof distanceKm === 'number' && distanceKm >= 0 && (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    Transport Distance: {distanceKm} km
                  </Text>
                </View>
              )}
              
              {selectedVehicle && typeof selectedVehicle.approachDistance === 'number' && (
                <View style={[styles.distanceBadge, styles.approachDistanceBadge]}>
                  <Navigation size={16} color={colors.secondary} />
                  <Text style={[styles.distanceText, styles.approachDistanceText]}>
                    Approach Distance: {selectedVehicle.approachDistance} km
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </>
    );
  };
  
  // Render the review price step
  const renderReviewPriceStep = () => {
    if (!selectedVehicle) {
      return (
        <View style={styles.noVehicleContainer}>
          <Text style={styles.noVehicleText}>No vehicle selected. Please go back and try again.</Text>
        </View>
      );
    }
    
    return (
      <View key={currentStep}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Review & Confirm</Text>
          <Text style={styles.stepDescription}>
            Review the selected vehicle and price before creating your order
          </Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Transport Price</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(selectedVehicle.price, selectedVehicle.vehicle.currency)}
            </Text>
            <Text style={styles.priceBreakdown}>
              Base price + distance ({distanceKm} km) + approach ({selectedVehicle.approachDistance} km) + weight ({(parseFloat(cargoWeight) * parseInt(cargoItems || '1')).toFixed(2)} kg) + volume ({(cargoVolume * parseInt(cargoItems || '1')).toFixed(2)} m³)
              {requiresRefrigeration ? ' + refrigeration' : ''}
              {isHazardous ? ' + hazardous materials' : ''}
              {isUrgent ? ' + urgent delivery' : ''}
            </Text>
          </View>
          
          <Text style={styles.selectedVehicleTitle}>Selected Vehicle</Text>
          <VehicleCard 
            vehicle={selectedVehicle.vehicle}
            showPricing={true}
          />
          
          <View style={styles.approachDistanceContainer}>
            <View style={styles.approachDistanceIcon}>
              <Navigation size={20} color={colors.white} />
            </View>
            <View style={styles.approachDistanceContent}>
              <Text style={styles.approachDistanceLabel}>Approach Distance</Text>
              <Text style={styles.approachDistanceValue}>
                {selectedVehicle.approachDistance} km from transporter to pickup location
              </Text>
              <Text style={styles.approachDistanceNote}>
                {selectedVehicle.vehicle.pricePerApproachKm > 0 
                  ? `Charged at ${formatCurrency(selectedVehicle.vehicle.pricePerApproachKm, selectedVehicle.vehicle.currency)}/km`
                  : "No additional charge for approach distance"}
              </Text>
            </View>
          </View>
          
          <View style={styles.transporterInfo}>
            <View style={styles.transporterIcon}>
              <Truck size={24} color={colors.white} />
            </View>
            <View>
              <Text style={styles.transporterLabel}>Transporter</Text>
              <Text style={styles.transporterName}>
                {selectedVehicle.transporter ? selectedVehicle.transporter.name : 'Express Logistics'}
              </Text>
            </View>
          </View>
          
          <View style={styles.orderSummary}>
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Cargo</Text>
              <Text style={styles.orderSummaryValue}>{cargoDescription}</Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Weight</Text>
              <Text style={styles.orderSummaryValue}>
                {(parseFloat(cargoWeight) * parseInt(cargoItems || '1')).toFixed(2)} kg
              </Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Volume</Text>
              <Text style={styles.orderSummaryValue}>
                {(cargoVolume * parseInt(cargoItems || '1')).toFixed(2)} m³
              </Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Pickup</Text>
              <Text style={styles.orderSummaryValue}>{pickupAddress}</Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Delivery</Text>
              <Text style={styles.orderSummaryValue}>{deliveryAddress}</Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Distance</Text>
              <Text style={styles.orderSummaryValue}>{distanceKm} km</Text>
            </View>
            
            <View style={styles.orderSummaryItem}>
              <Text style={styles.orderSummaryLabel}>Price</Text>
              <Text style={styles.orderSummaryValue}>
                {formatCurrency(selectedVehicle.price, selectedVehicle.vehicle.currency)}
              </Text>
            </View>
          </View>
          
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationText}>
              By creating this order, you agree to the price and terms. The price will be automatically generated and will remain pending until it is accepted by the transporter prior to shipment.
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Render the footer with navigation buttons
  const renderFooter = () => {
    return (
      <View key={currentStep} style={styles.footer}>
        <View style={styles.footerButtons}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.backButton}
              //onPress={goToPreviousStep}
              disabled={isLoading || isGeocodingLoading || isSearchingVehicles}
            >
              <ArrowLeft size={20} color={colors.primary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <Button 
            title={
              currentStep === OrderCreationStep.REVIEW_PRICE 
                ? "Create Order" 
                : "Continue"
            }
            rightIcon={
              currentStep < OrderCreationStep.REVIEW_PRICE 
                ? <ArrowRight size={20} color={colors.white} />
                : <CheckCircle size={20} color={colors.white} />
            }
            //onPress={}
            isLoading={isLoading || isGeocodingLoading || isSearchingVehicles}
            style={{
              ...styles.continueButton,
              ...(currentStep === 0 ? styles.fullWidthButton : {})
            }}
          />
        </View>
        
        {isGeocodingLoading && (
          <Text style={styles.geocodingText}>Validating addresses...</Text>
        )}
        
        {isSearchingVehicles && (
          <Text style={styles.geocodingText}>Searching for available vehicles...</Text>
        )}
        
        <View style={styles.progressContainer}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View 
              key={index}
              style={[
                styles.progressDot,
                currentStep >= index && styles.progressDotActive
              ]}
            />
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.section}>
                    <View style={styles.demoBanner}>
                                        <Text style={styles.demoBannerTitle}>Demo Mode</Text>
                                        <Text style={styles.demoBannerText}>
                                          This form is pre-filled with sample data.
                                        </Text>
                                      </View>
                                      </View>
      <View style={styles.mainContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: 100 }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentStep()}
        </ScrollView>
        
      </View>
         <View style={styles.footer}>
         <StepButtons steps={steps} isLoading={isLoading} isDisabled={isLoading} />
         </View>
      <CustomDialog
        visible={visible}
        title={options.title}
        message={options.message}
        buttons={options.buttons || []}
        type={options.type}
        onDismiss={hideDialog}
        showCloseButton={false}
      />         
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flex: 1,
    //position: 'relative', // Important for absolute positioning of footer
  },  
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {  
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    flex: 1,
    flexShrink: 1,
    borderColor: colors.border,
    paddingHorizontal: 0,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 48,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  textAreaContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    flex: 1,
    height: 100,
    color: colors.text,
    fontSize: 16,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  keyboardAvoidingContainer: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    }),
  },
  scrollViewContent: {
    flexGrow: 1,
    ...(Platform.OS === 'web' && {
      //paddingBottom: 100, // Extra padding for web
    }),
  },
  geocodingText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: colors.textLight,
  },
  keyboardVisibleContent: {
    //paddingBottom: 200, // Extra padding when keyboard is visible
  },  
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchIcon: {
    marginRight: 12,
  },
  switchLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  refrigerationNote: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  refrigerationNoteText: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
  },  
  dimensionsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    flex: 1,
    flexShrink: 1,
    paddingHorizontal: 0,
  },
  volumeIcon: {
    marginLeft: 12,
    marginRight: 12,
  },
  volumeContent: {
    flex: 1,
  },
  volumeLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  volumeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },    
  specialRequirementNote: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  specialRequirementText: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
  },  
  stepHeader: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
  orderSummary: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  orderSummaryItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderSummaryLabel: {
    fontSize: 14,
    color: colors.textLight,
    width: 80,
  },
  orderSummaryValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightGray,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  continueButton: {
    flex: 1,
  },
  fullWidthButton: {
    width: '100%',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  confirmationContainer: {
    backgroundColor: colors.successLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  confirmationText: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
  },
  otherVehiclesContainer: {
    marginBottom: 24,
  },
  otherVehiclesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  otherVehiclesList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  otherVehicleItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    width: 200,
  },
  otherVehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  otherVehicleModel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  otherVehiclePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  otherVehicleTransporter: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  otherVehicleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  otherVehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  otherVehicleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  otherVehicleCapacity: {
    fontSize: 12,
    color: colors.text,
  },
  otherVehicleApproach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  otherVehicleApproachText: {
    fontSize: 12,
    color: colors.textLight,
  },
  noOtherVehiclesText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  transporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontWeight: '600',
    color: colors.text,
  },
  approachDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  approachDistanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  approachDistanceContent: {
    flex: 1,
  },
  approachDistanceLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 4,
  },
  approachDistanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 4,
  },
  approachDistanceNote: {
    fontSize: 12,
    color: colors.secondary,
    opacity: 0.8,
  },  
  priceContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  priceBreakdown: {
    fontSize: 12,
    color: colors.primary,
    opacity: 0.8,
  },
  selectedVehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  noVehicleContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVehicleText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  locationsSummary: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationsSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
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
  },
  locationConnector: {
    width: 2,
    height: 24,
    backgroundColor: colors.primaryLight,
    marginLeft: 20,
    marginBottom: 16,
  },
  searchRadiusContainer: {
    marginBottom: 16,
  },
  searchRadiusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  searchRadiusInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distanceInfo: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  distanceInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  cargoSummary: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cargoSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  cargoSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cargoSummaryText: {
    fontSize: 14,
    color: colors.text,
  },
  specialRequirementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
  locationTime: {
    fontSize: 14,
    color: colors.textLight,
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
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
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