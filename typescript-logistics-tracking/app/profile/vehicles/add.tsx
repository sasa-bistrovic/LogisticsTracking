import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Truck, 
  MapPin, 
  Weight, 
  Box,
  Check,
  Snowflake
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { VehicleType, User } from '@/types';

export default function AddVehicleScreen() {
  const router = useRouter();
  const { user, updateUser, isLoading } = useAuthStore();
  
  const [vehicleType, setVehicleType] = useState<VehicleType>('truck');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [maxWeight, setMaxWeight] = useState('');
  const [maxVolume, setMaxVolume] = useState('');
  const [isRefrigerated, setIsRefrigerated] = useState(false);  
  const [currentLocation, setCurrentLocation] = useState('');

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
          console.error("Greška pri dobijanju koordinata:", error);
          return null;
      }
    }
    
    const handleAddVehicle = async () => {
      if (!user) return;
    
      if (!model || !licensePlate || !maxWeight || !maxVolume || !currentLocation) {
        Alert.alert("Missing Information", "Please fill in all required fields");
        return;
      }
    
      try {
  
        const currentCoords = await getCoordinates(currentLocation);
  
        const newVehicle = {
          id: `v${Date.now()}`,
          type: vehicleType,
          model,
          licensePlate,
          maxWeight: parseFloat(maxWeight),
          maxVolume: parseFloat(maxVolume),
          isRefrigerated,
          currentLocation: {
            address: currentLocation,
            latitude: currentCoords.lat, // Mock coordinates
            longitude: currentCoords.lon,
          },
          available: true,
        };
    
        const response = await fetch(`/api/users/${user.id}/vehicles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newVehicle),
        });
    
        if (!response.ok) {
          throw new Error("Failed to add vehicle");
        }
    
        const updatedUser = (await response.json()) as User;
        updateUser(updatedUser); // Ažuriraj lokalnog korisnika
    
        router.replace('/profile');
        /*
        Alert.alert("Vehicle Added", "Your vehicle has been added successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
        */
      } catch (error) {
        Alert.alert("Error", "Failed to add vehicle. Please try again.");
      }
    };
    
    const vehicleTypes: VehicleType[] = ['truck', 'van', 'car', 'motorcycle'];
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
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
                onPress={() => setVehicleType(type)}
              >
                <View style={[
                  styles.vehicleTypeIcon,
                  vehicleType === type && styles.vehicleTypeIconSelected
                ]}>
                  <Truck 
                    size={24} 
                    color={vehicleType === type ? colors.white : colors.primary} 
                  />
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
              onChangeText={setLicensePlate}
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
                placeholder="Max Weight (kg)"
                value={maxWeight}
                onChangeText={setMaxWeight}
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
                placeholder="Max Volume (m³)"
                value={maxVolume}
                onChangeText={setMaxVolume}
                keyboardType="numeric"
                placeholderTextColor={colors.textLight}
              />
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
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={isRefrigerated ? colors.primary : colors.gray}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Current Location"
              value={currentLocation}
              onChangeText={setCurrentLocation}
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          title="Add Vehicle" 
          onPress={handleAddVehicle}
          isLoading={isLoading}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    width: '100%',
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
});