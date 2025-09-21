import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Truck, LogOut, Settings, ChevronRight, MapPin, Package, UserCog, XCircle, CheckCircle, Repeat, Car, ClipboardList, List, PlusCircle, 
  Calculator, UserCircle, 
  Hand, ThumbsUp, Eye, Clock, FileText, Search } from 'lucide-react-native';
import { useAuthStore2 } from '@/store/authStore2';
import { colors } from '@/constants/colors';
import { VehicleCard } from '@/components/VehicleCardA';
import { Vehicle } from '@/types';
import { Button } from '@/components/Button';

export default function ProfileScreen() {
  const { userTest, logout, no, nonumber, loginTest, updateLoginVehicle } = useAuthStore2();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const steps = [
    { title: "Switch to Transporter Account", action: () => { setIsLoading(true);nonumber(); loginTest('orderer');setIsLoading(false);} },
    { title: "Start Vehicle Registration", action: () => { nonumber(); router.replace('/profile/pages/add'); } },
    { title: "Add Vehicle Details", action: () => { nonumber(); } },
    { title: "Switch to Orderer Account", action: () => { setIsLoading(true);nonumber(); loginTest('transporter');setIsLoading(false); } },
    { title: "View Your Orders", action: () => { nonumber(); router.replace('/profile/pages/list'); } },
    { title: "Create a New Transport Order", action: () => { nonumber(); } },
    { title: "Enter Cargo Information", action: () => { nonumber(); } },
    { title: "Enter Pickup and Delivery Locations", action: () => { nonumber(); } },
    { title: "Calculate the Transport Price", action: () => { nonumber(); } },
    { title: "Confirm and Create the Order", action: () => { nonumber(); } },
    { title: "Go to Your Profile Page", action: () => { nonumber(); router.replace('/profile/pages/profile'); } },
    { title: "Switch Back to Transporter Account", action: () => {setIsLoading(true);nonumber(); loginTest('orderer');setIsLoading(false); } },
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

  useEffect(() => {
    //login("john.smith@email.com", "password");
  }, []);

  useEffect(() => {
    if (userTest?.vehicles) {
      setVehicles(userTest.vehicles);
    }
  }, [userTest]);
  
  if (!userTest) {
    return (
      <View style={styles.container}>
        <Text>Please log in to view your profile</Text>
      </View>
    );
  }

  //const handleEditProfile = () => {
  //  router.push('/profile/add');
  //};

  const handleManageVehicles = () => {
    if (userTest?.vehicles && userTest?.vehicles?.length > 0) {
      //router.push('/profile/vehicles/edit');
    } else {
      router.push('/profile/pages/add');
    }
  };

  const handleCreateOrder = () => {
    if (userTest?.vehicles && userTest?.vehicles?.length > 0) {
      //router.push('/profile/vehicles/edit');
      router.push('/profile/pages/list');
    } else {
      router.push('/profile/pages/list');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No vehicle registered</Text>
      <Text style={styles.emptySubtitle}>
        Add your vehicle to start accepting transport orders
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>Add Vehicle</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSwitchuserTest = async () => {
    await loginTest(userTest.role);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
      <View style={styles.section}>
        <View style={styles.demoBanner}>
                            <Text style={styles.demoBannerTitle}>Demo Mode</Text>
                            <Text style={styles.demoBannerText}>
                              This form is pre-filled with sample data.
                            </Text>
                          </View>
                          </View>
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatarPlaceholder}>
                <User size={40} color={colors.white} />
              </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{userTest.name}</Text>
              <Text style={styles.email}>{userTest.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {userTest.role === 'orderer' ? 'Transport Orderer' : 'Transporter'}
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
          >
            <UserCog size={20} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.card}>
            <View style={styles.cardItem}>
              <View style={styles.cardItemIcon}>
                <User size={20} color={colors.primary} />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Full Name</Text>
                <Text style={styles.cardItemValue}>{userTest.name}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardItem}>
              <View style={styles.cardItemIcon}>
                <Package size={20} color={colors.primary} />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Role</Text>
                <Text style={styles.cardItemValue}>
                  {userTest.role === 'orderer' ? 'Transport Orderer' : 'Transporter'}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardItem}>
              <View style={styles.cardItemIcon}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={styles.cardItemContent}>
                <Text style={styles.cardItemLabel}>Address</Text>
                <Text style={styles.cardItemValue}>{userTest.address || 'Not provided'}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {userTest.role === 'transporter' && (
          <View style={styles.section2}>
            <Text style={styles.sectionTitle}>Transport Information</Text>
            <View style={styles.card2}>
            <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VehicleCard 
            vehicle={item} 
            showEditButton={true}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
      </View>
          </View>
        )}

        <View style={styles.logoutContainer}>
          <Button 
            title="Log Out" 
            variant="outline"
            leftIcon={<LogOut size={20} color={colors.danger} />}
            style={styles.logoutButton}
            textStyle={{ color: colors.danger }}
          />
        </View>
        
      </ScrollView>
          <View style={styles.footer}>
          <StepButtons steps={steps} isLoading={isLoading} isDisabled={isLoading} />
         </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  vehiclePlate: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  vehicleSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleSpec: {
    fontSize: 14,
    color: colors.primary,
  },
  vehicleSpecDivider: {
    fontSize: 14,
    color: colors.primary,
    marginHorizontal: 8,
  },
  vehicleStatus: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusAvailable: {
    backgroundColor: colors.success,
  },
  statusUnavailable: {
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: 12,
    color: colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutItem: {
    borderColor: colors.dangerLight,
  },
  logoutText: {
    color: colors.danger,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  section2: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  card2: {
    backgroundColor: colors.white,
    borderRadius: 12,
    //padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cardItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardItemContent: {
    flex: 1,
  },
  cardItemLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
  },
  cardItemValue: {
    fontSize: 16,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  menuItemSubtext: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  logoutContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    borderColor: colors.danger,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  addIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    //padding: 16,
    //paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    //marginTop: 24,
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
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
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
});