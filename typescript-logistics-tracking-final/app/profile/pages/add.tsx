import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Truck, 
  MapPin, 
  Weight, 
  Box,
  Check,
  Snowflake,
  Ruler,
  DollarSign,
  AlertTriangle,
  Clock,
  Calculator,
  ChevronDown,
  ChevronUp,
  Globe,
  Navigation,
  Car,
  Bike,
  CheckCircle,
  XCircle, Repeat, ClipboardList, List, PlusCircle, 
  Package, UserCircle, 
  Hand, ThumbsUp, Eye, FileText, LogOut, Search
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuthStore2, Vehicle } from '@/store/authStore2';
import { useOrderStore2 } from '@/store/orderStore2';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { User} from '@/types';
import { currencies, getCurrencySymbol } from '@/constants/currencies';
import { calculateTransportPrice } from '@/utils/helpers';
import CustomDialog from '@/components/CustomDialog';
import { useDialog } from '@/hooks/useDialog';

// Define a type for currency items
type CurrencyItem = {
  code: string;
  symbol: string;
  name: string;
};

export default function AddVehicleScreen() {
  const router = useRouter();

  const navigation = useNavigation();

  const { userTest, no, nonumber, updateUserTest, newLoginVehicleTest } = useAuthStore2();
  const { visible, options, showDialog, hideDialog } = useDialog();
  
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState('truck');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [vehicleLength, setVehicleLength] = useState('');
  const [vehicleWidth, setVehicleWidth] = useState('');
  const [vehicleHeight, setVehicleHeight] = useState('');  
  const [isRefrigerated, setIsRefrigerated] = useState(false);  
  const [currentLocation, setCurrentLocation] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const [basePrice, setBasePrice] = useState('100');
  const [pricePerKm, setPricePerKm] = useState('0.3');
  const [pricePerApproachKm, setPricePerApproachKm] = useState('0.3');
  const [pricePerKg, setPricePerKg] = useState('0.01');
  const [pricePerM3, setPricePerM3] = useState('1');
  const [coolingCoefficient, setCoolingCoefficient] = useState('1.3');
  const [hazardousCoefficient, setHazardousCoefficient] = useState('1.5');
  const [urgentCoefficient, setUrgentCoefficient] = useState('1.8');  

  // Price calculator test parameters
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [testDistanceKm, setTestDistanceKm] = useState('100');
  const [testApproachDistanceKm, setTestApproachDistanceKm] = useState('20');  
  const [testWeightKg, setTestWeightKg] = useState('500');
  const [testVolumeM3, setTestVolumeM3] = useState('5');
  const [testRequiresCooling, setTestRequiresCooling] = useState(false);
  const [testIsHazardous, setTestIsHazardous] = useState(false);
  const [testIsUrgent, setTestIsUrgent] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const steps = [
    { title: "Switch to Transporter Account", action: () => { nonumber();} },
    { title: "Start Vehicle Registration", action: () => { nonumber(); router.replace('/profile/pages/add'); } },
    { title: "Add Vehicle Details", action: () => { nonumber();handleAddVehicle(); } },
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

  // DEMO DATA: Pre-fill form with demo data
  useEffect(() => {
    // Set demo values for vehicle details
    setModel('Volvo FH16');
    setLicensePlate('TR-2023-XYZ');
    setMaxWeight('24000');
    setVehicleLength('1350');
    setVehicleWidth('255');
    setVehicleHeight('280');
    setIsRefrigerated(false);
    setCurrentLocation('Unter den Linden 77, 10117 Berlin, Germany');
    
    // Demo pricing parameters
    setBasePrice('150');
    setPricePerKm('0.45');
    setPricePerApproachKm('0.35');
    setPricePerKg('0.008');
    setPricePerM3('1.2');
    setCoolingCoefficient('1.35');
    setHazardousCoefficient('1.65');
    setUrgentCoefficient('1.9');
    
    // Demo test values for price calculator
    setTestDistanceKm('350');
    setTestApproachDistanceKm('25');
    setTestWeightKg('8500');
    setTestVolumeM3('65');
    setTestRequiresCooling(true);
    setTestIsHazardous(false);
    setTestIsUrgent(true);
    
    // Show price calculator by default for demo
    setShowPriceCalculator(true);
  }, []);

  const calculateVolume = (length: string, width: string, height: string): number => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    return l * w * h / 1000000; // Convert from cm³ to m³
  };  

  const maxVolume = calculateVolume(vehicleLength, vehicleWidth, vehicleHeight); 
  
  // Calculate test price whenever test parameters change
  useEffect(() => {
    calculateTestPrice();
  }, [
    testDistanceKm, 
    testApproachDistanceKm,
    testWeightKg, 
    testVolumeM3, 
    testRequiresCooling, 
    testIsHazardous, 
    testIsUrgent,
    basePrice,
    pricePerKm,
    pricePerApproachKm,    
    pricePerKg,
    pricePerM3,
    coolingCoefficient,
    hazardousCoefficient,
    urgentCoefficient
  ]);
  
  const calculateTestPrice = () => {
    const price = calculateTransportPrice(
      parseFloat(testDistanceKm) || 0,
      parseFloat(testWeightKg) || 0,
      parseFloat(testVolumeM3) || 0,
      testRequiresCooling,
      testIsHazardous,
      testIsUrgent,
      parseFloat(basePrice) || 0,
      parseFloat(pricePerKm) || 0,
      parseFloat(pricePerKg) || 0,
      parseFloat(pricePerM3) || 0,
      parseFloat(coolingCoefficient) || 1,
      parseFloat(hazardousCoefficient) || 1,
      parseFloat(urgentCoefficient) || 1,
      parseFloat(testApproachDistanceKm) || 0,
      parseFloat(pricePerApproachKm) || 0
    );
    
    setCalculatedPrice(price);
  };

  // Disable scroll on web when modal is open
  useEffect(() => {
    if (Platform.OS === 'web' && showCurrencyModal) {
      document.body.style.overflow = "hidden"; // Disable scroll
      return () => {
        document.body.style.overflow = "auto"; // Enable scroll
      };
    }
  }, [showCurrencyModal]);
  
  const getVehicleIcon = (type: string, selected: boolean) => {
    const color = selected ? colors.white : colors.primary;
    const size = 24;
    
    switch(type) {
      case 'car':
        return <Car size={size} color={color} />;
      case 'motorcycle':
        return <Bike size={size} color={color} />;
      case 'van':
        return <Truck size={size} color={color} />;
      case 'truck':
      default:
        return <Truck size={size} color={color} />;
    }
  };

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
    
  const handleAddVehicle = async () => {

    const routeAtTrigger = navigation.getState().routes.at(-1)?.name;

    if (!userTest) {
      Alert.alert('Authentication Error', 'You must be logged in to add a vehicle');
      return;
    }
    
    if (!model || !licensePlate || !maxWeight || !vehicleLength || !vehicleWidth || !vehicleHeight || !currentLocation) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    try {

      setIsLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock coordinates for demo
      const currentCoords =  await getCoordinates(currentLocation);

      const newVehicle = {
        id: `v${Date.now()}`,
        type: vehicleType,
        model,
        licensePlate,
        maxWeight: parseFloat(maxWeight),
        dimensions: {
          length: parseFloat(vehicleLength),
          width: parseFloat(vehicleWidth),
          height: parseFloat(vehicleHeight)
        },
        maxVolume,
        isRefrigerated,
        currentLocation: {
          address: currentLocation,
          latitude: currentCoords?.lat,
          longitude: currentCoords?.lon,
        },
        available: isAvailable,
        // Currency and pricing parameters
        currency,
        basePrice: parseFloat(basePrice),
        pricePerKm: parseFloat(pricePerKm),
        pricePerApproachKm: parseFloat(pricePerApproachKm),
        pricePerKg: parseFloat(pricePerKg),
        pricePerM3: parseFloat(pricePerM3),
        coolingCoefficient: parseFloat(coolingCoefficient),
        hazardousCoefficient: parseFloat(hazardousCoefficient),
        urgentCoefficient: parseFloat(urgentCoefficient),
      };

      // DEMO: Show what would be sent to the API
      //console.log('Vehicle data to be submitted:', newVehicle);

      // For demo purposes, we'll just show a success message
      setTimeout(() => {
        Alert.alert(
          "Vehicle Added", 
          "Your vehicle has been added successfully", 
          [{ text: "OK", onPress: () => router.back() }]
        );
      }, 1000);
      setIsLoading(false);

      const updateduserTest = {
        ...userTest,
        vehicles: [...(userTest.vehicles || []), newVehicle]
      };
      
      updateUserTest(updateduserTest);

      newLoginVehicleTest(newVehicle as Vehicle);
    
      showDialog({
        title: "Vehicle Added",
        message: "Your vehicle has been added successfully.",
        type: "success",
        buttons: []
      });

      setTimeout(() => {
        const currentRoute = navigation.getState().routes.at(-1)?.name;
        if (currentRoute === routeAtTrigger) {
        router.replace('/profile/pages/profile');
        }
        //setIsDisabled(false);
      }, 2500);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Failed to add vehicle. Please try again.");
    }
  };
    
  const vehicleTypes = ['truck', 'van', 'car', 'motorcycle'];

  // DEMO: Sample locations for demonstration
  const demoLocations = [
    'Berlin, Germany',
    'Hamburg, Germany',
    'Munich, Germany',
    'Frankfurt, Germany',
    'Cologne, Germany'
  ];

  const renderCurrencyItem = ({ item }: { item: CurrencyItem }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        currency === item.code && styles.currencyItemSelected
      ]}
      onPress={() => {
        //setCurrency(item.code);
        //setShowCurrencyModal(false);
      }}
    >
      <Text style={styles.currencySymbol}>{item.symbol}</Text>
      <View style={styles.currencyInfo}>
        <Text style={styles.currencyCode}>{item.code}</Text>
        <Text style={styles.currencyName}>{item.name}</Text>
      </View>
      {currency === item.code && (
        <View style={styles.currencyCheckIcon}>
          <Check size={16} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* DEMO BANNER */}
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerTitle}>Demo Mode</Text>
          <Text style={styles.demoBannerText}>
            This form is pre-filled with sample data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          
          <View style={styles.vehicleTypesContainer}>
            {vehicleTypes.map((type) => (
              <TouchableOpacity 
                key={type}
                style={[
                  styles.vehicleTypeOption,
                  vehicleType === type && styles.vehicleTypeSelected
                ]}
                
                >
                <View style={[
                  styles.vehicleTypeIcon,
                  vehicleType === type && styles.vehicleTypeIconSelected
                ]}>
                  {getVehicleIcon(type, vehicleType === type)}
                </View>
                
                <Text style={[
                  styles.vehicleTypeText,
                  vehicleType === type && styles.vehicleTypeTextSelected
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                
                {vehicleType === type && (
                  <View style={styles.checkIcon}>
                    <Check size={16} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Truck size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Vehicle Model"
              value={model}
              editable={false}
              onChangeText={setModel}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Truck size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="License Plate"
              value={licensePlate}
              editable={false}
              onChangeText={setLicensePlate}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Weight size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Max Weight (kg)"
              value={maxWeight}
              editable={false}
              onChangeText={setMaxWeight}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <Text style={styles.dimensionsLabel}>Vehicle Dimensions (cm)</Text>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Ruler size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Length"
                editable={false}
                value={vehicleLength}
                onChangeText={setVehicleLength}
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
                value={vehicleWidth}
                onChangeText={setVehicleWidth}
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
                value={vehicleHeight}
                onChangeText={setVehicleHeight}
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
                  {maxVolume.toFixed(2)} m³
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchIcon}>
              <Snowflake size={20} color={isRefrigerated ? colors.primary : colors.gray} />
            </View>
            <Text style={styles.switchLabel}>Refrigerated Vehicle</Text>
            <Switch
              value={isRefrigerated}
              onValueChange={setIsRefrigerated}
              disabled={true}
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={isRefrigerated ? colors.primary : colors.gray}
            />
          </View>
          <View style={styles.switchContainer}>
                      <View style={styles.switchIcon}>
                        <Truck size={20} color={isAvailable ? colors.success : colors.gray} />
                      </View>
                      <Text style={styles.switchLabel}>Vehicle Available</Text>
                      <Switch
                        value={isAvailable}
                        onValueChange={setIsAvailable}
                        disabled={true}
                        trackColor={{ false: colors.lightGray, true: colors.successLight }}
                        thumbColor={isAvailable ? colors.success : colors.gray}
                      />
                    </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Parameters</Text>
          
          <TouchableOpacity 
            style={styles.currencySelector}
          >
            <View style={styles.currencySelectorIcon}>
              <Globe size={20} color={colors.white} />
            </View>
            <View style={styles.currencySelectorContent}>
              <Text style={styles.currencySelectorLabel}>Currency</Text>
              <Text style={styles.currencySelectorValue}>
                {getCurrencySymbol(currency)} {currency}
              </Text>
            </View>
            <ChevronDown size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <DollarSign size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Base Price"
              value={basePrice}
              editable={false}
              onChangeText={setBasePrice}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price per km"
                value={pricePerKm}
                editable={false}
                onChangeText={setPricePerKm}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <Navigation size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price per approach km"
                value={pricePerApproachKm}
                editable={false}
                onChangeText={setPricePerApproachKm}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Weight size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price per kg"
                value={pricePerKg}
                editable={false}
                onChangeText={setPricePerKg}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <Box size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price per m³"
                value={pricePerM3}
                editable={false}
                onChangeText={setPricePerM3}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          <Text style={styles.coefficientsLabel}>Price Multipliers</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Snowflake size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Cooling"
                value={coolingCoefficient}
                editable={false}
                onChangeText={setCoolingCoefficient}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <AlertTriangle size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Hazardous"
                value={hazardousCoefficient}
                editable={false}
                onChangeText={setHazardousCoefficient}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Clock size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Urgent"
              editable={false}
              value={urgentCoefficient}
              onChangeText={setUrgentCoefficient}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.pricingInfo}>
            <Text style={styles.pricingInfoText}>
              These parameters will be used to automatically calculate transport prices based on distance, weight, volume, and special requirements.
            </Text>
          </View>
          
          {/* Price Calculator Testing Section */}
          <TouchableOpacity 
            style={styles.calculatorHeader}
            onPress={() => setShowPriceCalculator(!showPriceCalculator)}
          >
            <View style={styles.calculatorHeaderLeft}>
              <Calculator size={20} color={colors.primary} />
              <Text style={styles.calculatorTitle}>Test Price Calculator</Text>
            </View>
            {showPriceCalculator ? (
              <ChevronUp size={20} color={colors.primary} />
            ) : (
              <ChevronDown size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          {showPriceCalculator && (
            <View style={styles.calculatorContainer}>
              <Text style={styles.calculatorSubtitle}>
                Test your pricing parameters with sample cargo data
              </Text>
              
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <View style={styles.inputIcon}>
                    <MapPin size={20} color={colors.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Distance (km)"
                    value={testDistanceKm}
                    editable={false}
                    onChangeText={setTestDistanceKm}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
                
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <View style={styles.inputIcon}>
                    <Navigation size={20} color={colors.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Approach Distance (km)"
                    value={testApproachDistanceKm}
                    editable={false}
                    onChangeText={setTestApproachDistanceKm}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <View style={styles.inputIcon}>
                    <Weight size={20} color={colors.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Weight (kg)"
                    editable={false}
                    value={testWeightKg}
                    onChangeText={setTestWeightKg}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
                
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <View style={styles.inputIcon}>
                    <Box size={20} color={colors.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Volume (m³)"
                    editable={false}
                    value={testVolumeM3}
                    onChangeText={setTestVolumeM3}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchIcon}>
                  <Snowflake size={20} color={testRequiresCooling ? colors.primary : colors.gray} />
                </View>
                <Text style={styles.switchLabel}>Requires Refrigeration</Text>
                <Switch
                  value={testRequiresCooling}
                  onValueChange={setTestRequiresCooling}
                  disabled={true}
                  trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
                  thumbColor={testRequiresCooling ? colors.primary : colors.gray}
                />
              </View>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchIcon}>
                  <AlertTriangle size={20} color={testIsHazardous ? colors.warning : colors.gray} />
                </View>
                <Text style={styles.switchLabel}>Hazardous Materials</Text>
                <Switch
                  value={testIsHazardous}
                  onValueChange={setTestIsHazardous}
                  disabled={true}
                  trackColor={{ false: colors.lightGray, true: colors.warningLight }}
                  thumbColor={testIsHazardous ? colors.warning : colors.gray}
                />
              </View>
              
              <View style={styles.switchContainer}>
                <View style={styles.switchIcon}>
                  <Clock size={20} color={testIsUrgent ? colors.secondary : colors.gray} />
                </View>
                <Text style={styles.switchLabel}>Urgent Delivery</Text>
                <Switch
                  value={testIsUrgent}
                  onValueChange={setTestIsUrgent}
                  disabled={true}
                  trackColor={{ false: colors.lightGray, true: colors.secondaryLight }}
                  thumbColor={testIsUrgent ? colors.secondary : colors.gray}
                />
              </View>
              
              <View style={styles.calculatedPriceContainer}>
                <Text style={styles.calculatedPriceLabel}>Calculated Price:</Text>
                <Text style={styles.calculatedPriceValue}>
                  {getCurrencySymbol(currency)}{calculatedPrice.toFixed(2)}
                </Text>
                
                <View style={styles.priceBreakdown}>
                  <Text style={styles.priceBreakdownTitle}>Price Breakdown:</Text>
                  <Text style={styles.priceBreakdownItem}>
                    Base Price: {getCurrencySymbol(currency)}{parseFloat(basePrice).toFixed(2)}
                  </Text>
                  <Text style={styles.priceBreakdownItem}>
                    Transport Distance: {testDistanceKm} km × {getCurrencySymbol(currency)}{pricePerKm} = {getCurrencySymbol(currency)}{(parseFloat(testDistanceKm) * parseFloat(pricePerKm)).toFixed(2)}
                  </Text>
                  <Text style={styles.priceBreakdownItem}>
                    Approach Distance: {testApproachDistanceKm} km × {getCurrencySymbol(currency)}{pricePerApproachKm} = {getCurrencySymbol(currency)}{(parseFloat(testApproachDistanceKm) * parseFloat(pricePerApproachKm)).toFixed(2)}
                  </Text>
                  <Text style={styles.priceBreakdownItem}>
                    Weight: {testWeightKg} kg × {getCurrencySymbol(currency)}{pricePerKg} = {getCurrencySymbol(currency)}{(parseFloat(testWeightKg) * parseFloat(pricePerKg)).toFixed(2)}
                  </Text>
                  <Text style={styles.priceBreakdownItem}>
                    Volume: {testVolumeM3} m³ × {getCurrencySymbol(currency)}{pricePerM3} = {getCurrencySymbol(currency)}{(parseFloat(testVolumeM3) * parseFloat(pricePerM3)).toFixed(2)}
                  </Text>
                  
                  {testRequiresCooling && (
                    <Text style={styles.priceBreakdownItem}>
                      Refrigeration: ×{coolingCoefficient} multiplier
                    </Text>
                  )}
                  
                  {testIsHazardous && (
                    <Text style={styles.priceBreakdownItem}>
                      Hazardous: ×{hazardousCoefficient} multiplier
                    </Text>
                  )}
                  
                  {testIsUrgent && (
                    <Text style={styles.priceBreakdownItem}>
                      Urgent: ×{urgentCoefficient} multiplier
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              editable={false}
              placeholder="Current Location"
              value={currentLocation}
              onChangeText={setCurrentLocation}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
      <StepButtons steps={steps} isLoading={isLoading} isDisabled={isLoading} />
      </View>
      
      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowCurrencyModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={currencies}
              renderItem={renderCurrencyItem}
              keyExtractor={(item) => item.code}
              style={styles.currencyList}
            />
          </View>
        </View>
      </Modal>
      {/* Custom Dialog */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
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
  vehicleTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  vehicleTypeOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  vehicleTypeSelected: {
    borderColor: colors.primary,
  },
  vehicleTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vehicleTypeIconSelected: {
    backgroundColor: colors.primary,
  },
  vehicleTypeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  vehicleTypeTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  inputIcon: {
    padding: 12,
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
  deleteSection: {
    padding: 16,
    marginBottom: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  deleteButtonText: {
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
  dimensionsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },    
  pricingInfo: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  pricingInfoText: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
  coefficientsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  calculatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  calculatorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  calculatorContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  calculatorSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  calculatedPriceContainer: {
    backgroundColor: colors.successLight,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  calculatedPriceLabel: {
    fontSize: 14,
    color: colors.success,
    marginBottom: 4,
  },
  calculatedPriceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 16,
  },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: colors.success,
    paddingTop: 12,
  },
  priceBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 8,
  },
  priceBreakdownItem: {
    fontSize: 14,
    color: colors.success,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
  currencyList: {
    padding: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currencyItemSelected: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    width: 40,
    textAlign: 'center',
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  currencyName: {
    fontSize: 14,
    color: colors.textLight,
  },
  currencyCheckIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },  
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  currencySelectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currencySelectorContent: {
    flex: 1,
  },
  currencySelectorLabel: {
    fontSize: 12,
    color: colors.primary,
    opacity: 0.8,
  },
  currencySelectorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  demoBanner: {
    backgroundColor: colors.secondaryLight,
    padding: 16,
    margin: 16,
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