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
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  MapPin, 
  Package, 
  Calendar, 
  DollarSign, 
  FileText,
  Weight,
  Box,
  Layers,
  Snowflake
} from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { geocodeAddress } from '@/utils/geocoding';
import Head from "expo-router/head";
import { useFocusEffect } from '@react-navigation/native';

export default function CreateOrderScreen() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { createOrder, isLoading } = useOrderStore();

  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoVolume, setCargoVolume] = useState('');
  const [cargoItems, setCargoItems] = useState('');
  const [requiresRefrigeration, setRequiresRefrigeration] = useState(false);  
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // Properly type the scrollViewRef
  const scrollViewRef = useRef<ScrollView>(null);

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) {
      document.body.style.overflow = "hidden"; // Disable scroll
      setIsFocused(true);
    } else {
      document.body.style.overflow = "auto"; // Enable scroll
    }

    return () => {
      document.body.style.overflow = "auto"; // Ensure cleanup
    };
  }, [isFocused]);
  
  // Fix for mobile web viewport issues with keyboard
  useEffect(() => {
    if (Platform.OS === 'web') {
      const updateViewportHeight = () => {
        setViewportHeight(window.innerHeight);
      };
      
      // Initial height
      updateViewportHeight();
      
      // Update on resize and orientation change
      window.addEventListener('resize', updateViewportHeight);
      window.addEventListener('orientationchange', updateViewportHeight);
      
      // Detect keyboard visibility on mobile web
      const detectKeyboard = () => {
        // If window height significantly decreases, keyboard is likely visible
        const isKeyboardVisible = window.innerHeight < window.outerHeight * 0.8;
        setKeyboardVisible(isKeyboardVisible);
        
        // Apply specific CSS fixes for iOS Safari
        if (typeof document !== 'undefined') {
          setKeyboardVisible(isKeyboardVisible);
        }
      };
      
      window.visualViewport?.addEventListener('resize', detectKeyboard);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', updateViewportHeight);
        window.removeEventListener('orientationchange', updateViewportHeight);
        window.removeEventListener('resize', detectKeyboard);
      };
    } else {
      // For native mobile, use Keyboard API
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

const handleCreateOrder = async () => {
  if (!user) {
    Alert.alert('Authentication Required', 'Please log in to create an order');
    return;
  }
  
  // Basic validation
  if (!pickupAddress || !deliveryAddress || !cargoDescription || !cargoWeight || !cargoVolume || !price) {
    Alert.alert('Missing Information', 'Please fill in all required fields');
    return;
  }
  
  try {
    setIsGeocodingLoading(true);
    
    // Geocode pickup address
    const pickupCoords = await getCoordinates(pickupAddress);
    if (!pickupCoords) {
      Alert.alert('Error', 'Could not geocode pickup address. Please check and try again.');
      setIsGeocodingLoading(false);
      return;
    }
    
    // Geocode delivery address
    const deliveryCoords = await getCoordinates(deliveryAddress);
    if (!deliveryCoords) {
      Alert.alert('Error', 'Could not geocode delivery address. Please check and try again.');
      setIsGeocodingLoading(false);
      return;
    }
    
    setIsGeocodingLoading(false);
    
    // In a real app, we would use proper date pickers and location pickers
    const now = new Date();
    const scheduledPickup = pickupDate ? new Date(pickupDate).toISOString() : new Date(now.getTime() + 86400000).toISOString();
    const estimatedDelivery = new Date(now.getTime() + 172800000).toISOString();
    
    const newOrder = await createOrder({
      ordererId: user.id,
      pickupLocation: {
        address: pickupAddress,
        latitude: pickupCoords.lat,
        longitude: pickupCoords.lon,
      },
      deliveryLocation: {
        address: deliveryAddress,
        latitude: deliveryCoords.lat,
        longitude: deliveryCoords.lon,
      },
      cargo: {
        description: cargoDescription,
        weight: parseFloat(cargoWeight),
        volume: parseFloat(cargoVolume),
        items: parseInt(cargoItems) || 1,
        requiresRefrigeration: requiresRefrigeration,
      },
      price: parseFloat(price),
      currency: 'USD',
      notes,
      scheduledPickup,
      estimatedDelivery,
    });
    
    Alert.alert(
      'Order Created',
      'Your order has been created successfully',
      [
        { 
          text: 'View Order', 
          onPress: () => router.push(`/orders/${newOrder.id}`) 
        },
        { 
          text: 'Back to Orders', 
          onPress: () => router.back() 
        },
      ]
    );
    router.replace('/(tabs)');
  } catch (error) {
    Alert.alert('Error', 'Failed to create order. Please try again.');
    console.error('Create order error:', error);
  }
};
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
    <View style={styles.mainContainer}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingBottom: 100 } // Add padding to ensure content doesn't get hidden behind the footer
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locations</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pickup Address"
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
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Package size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Cargo Description"
              value={cargoDescription}
              onChangeText={setCargoDescription}
              placeholderTextColor={colors.textLight}
            />
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Weight size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Weight (kg)"
                value={cargoWeight}
                onChangeText={setCargoWeight}
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
                placeholder="Volume (m³)"
                value={cargoVolume}
                onChangeText={setCargoVolume}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}>
                <Layers size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Number of Items"
                value={cargoItems}
                onChangeText={setCargoItems}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.inputIcon}>
                <DollarSign size={20} color={colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price (USD)"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
            </View>
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
            />
          </View>
          
          {requiresRefrigeration && (
            <View style={styles.refrigerationNote}>
              <Text style={styles.refrigerationNoteText}>
                Note: Refrigerated transport may incur additional costs.
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pickup Date (YYYY-MM-DD)"
              value={pickupDate}
              onChangeText={setPickupDate}
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
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          title="Create Order" 
          onPress={handleCreateOrder}
          isLoading={isLoading || isGeocodingLoading}
          style={styles.button}
        />
        
        {isGeocodingLoading && (
          <Text style={styles.geocodingText}>Validating addresses...</Text>
        )}
      </View>
    </View>
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
    position: 'relative', // Important for absolute positioning of footer
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
});