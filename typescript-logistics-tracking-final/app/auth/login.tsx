import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  BackHandler
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { 
  ArrowLeft, 
  LogIn, 
  Phone, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  //User,
  UserPlus,
  ChevronRight,
  MapPin
} from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AuthProvider, LoginCredentials, UserRole, User } from '@/types';
import CustomDialog from '@/components/CustomDialog';
import { useDialog } from '@/hooks/useDialog';

export default function LoginScreen() {
  const router = useRouter();

  const navigation = useNavigation();

  const { from } = useLocalSearchParams();

  const { user, login, loginWithProvider, register, error, isLoading } = useAuthStore();

  const [isLoading2, setIsLoading2] = useState(false);

  const { visible, options, showDialog, hideDialog } = useDialog();
  
  // State for login/register mode
  const [mode, setMode] = useState<'provider' | 'email' | 'phone' | 'register'>('provider');
  
  // State for login form
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // State for registration form
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('orderer');

    const [isFocused, setIsFocused] = useState(false);

    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
    const path = sessionStorage.getItem("path");
      if (path === "welcome") {
      //sessionStorage.removeItem("path");
      //router.replace("/profile");
    }
    }, []);

    useEffect(() => {
      if (isFocused) {
        document.body.style.overflow = "hidden"; // Disable scroll
      } else {
        document.body.style.overflow = "auto"; // Enable scroll
      }
  
      return () => {
        document.body.style.overflow = "auto"; // Ensure cleanup
      };
    }, [isFocused]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleProviderLogin = async (provider: AuthProvider) => {
    try {
      await loginWithProvider(provider);
      // Only navigate if no error occurred
      if (!useAuthStore.getState().error) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const validateLogin = () => {
    if (!email.trim()) {
      showDialog({
        title: "Missing Email",
        message: "Please enter your email address.",
        type: "warning",
        buttons: [{ text: "OK" }]
      });
      return false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showDialog({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        type: "error",
        buttons: [{ text: "OK" }]
      });
      return false;
    }
  
    if (!password.trim()) {
      showDialog({
        title: "Missing Password",
        message: "Please enter your password.",
        type: "warning",
        buttons: [{ text: "OK" }]
      });
      return false;
    }
  
    return true;
  };
  
  
  const handleEmailLogin = async () => {
    const routeAtTrigger = navigation.getState().routes.at(-1)?.name;

    if (!validateLogin()) {
      return;
    }

    useAuthStore.setState({
      isLoading: true,
      error: null,
    });

    setEnabled(true);
    
    const credentials: LoginCredentials = {
      email,
      password,
      provider: 'email'
    };
    
    try {
      //await login(credentials);
      // Only navigate if no error occurred

      const response = await axios.post(`/auth/login`, credentials);
      const responseUser = response.data as User;
      if (responseUser) {
        showDialog({ 
          title: "Login Successful",
          message: "You have been logged in successfully.",
          type: "success",
          buttons: []
        });

        setTimeout(() => {
          try {
            //login(credentials);
            // Only navigate if no error occurred
            hideDialog();

            useAuthStore.setState({
              user: responseUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
              const currentRoute = navigation.getState().routes.at(-1)?.name;
              if (currentRoute === routeAtTrigger) {
              if (from !== 'profile') {
                sessionStorage.setItem('path', 'welcome');
                router.replace('/(tabs)');
                setEnabled(false);
              } else {
                sessionStorage.setItem('path', 'welcome');
                router.replace('/(tabs)');
                setEnabled(false);
              }
              }
          } catch (error) {
            useAuthStore.setState({
              isLoading: false,
              error: null,
            });
          }
        }, 2500);      
      } else {
        setEnabled(false);
        useAuthStore.setState({
          isLoading: false,
          error: null,
        });
        showDialog({ 
          title: "Login Failed",
          message: "Invalid email or password. Please try again.",
          type: "error",
          buttons: [{ text: "OK" }]
        });
      }
    } catch (error) {
      setEnabled(false);
      useAuthStore.setState({
        isLoading: false,
        error: null,
      });
      showDialog({ 
        title: "Login Failed",
        message: "Invalid email or password. Please try again.",
        type: "error",
        buttons: [{ text: "OK" }]
      });
    }
  };
  
  const handlePhoneLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Missing Information', 'Please enter both phone number and password');
      return;
    }
    
    const credentials: LoginCredentials = {
      phone,
      password,
      provider: 'phone'
    };
    
    try {
      await login(credentials);
      // Only navigate if no error occurred
      if (!useAuthStore.getState().error) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const validateUserRegistration = () => {
    if (!name.trim()) {
      showDialog({
        title: "Missing Name",
        message: "Please enter your full name.",
        type: "warning",
        buttons: [{ text: "OK" }]
      });
      return false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      showDialog({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        type: "error",
        buttons: [{ text: "OK" }]
      });
      return false;
    }
  
    const phoneRegex = /^[\d\s+()-]{6,20}$/;
    if (!phone.trim() || !phoneRegex.test(phone)) {
      showDialog({
        title: "Invalid Phone Number",
        message: "Please enter a valid phone number.",
        type: "error",
        buttons: [{ text: "OK" }]
      });
      return false;
    }
  
    if (!password.trim()) {
      showDialog({
        title: "Missing Password",
        message: "Please enter your password.",
        type: "warning",
        buttons: [{ text: "OK" }]
      });
      return false;
    }
  
    if (password.length < 6) {
      showDialog({
        title: "Weak Password",
        message: "Password must be at least 6 characters long.",
        type: "error",
        buttons: [{ text: "OK" }]
      });
      return false;
    }
  
    if (password !== confirmPassword) {
      showDialog({
        title: "Passwords Do Not Match",
        message: "Please make sure both passwords match.",
        type: "error",
        buttons: [{ text: "OK" }]
      });
      return false;
    }
  
    return true;
  };  


  const validateUserAddress = (userAddressCoordinates: { lat: number, lon: number }): boolean => {
    // Provjeri ako pickupAddress nije prazan
    if (!userAddressCoordinates || !userAddressCoordinates.lat || !userAddressCoordinates.lon) {
      showDialog({
        title: 'Missing User Address',
        message: 'Please enter a valid user address.',
        type: 'warning',
        buttons: [{ text: 'OK' }]
      });
      return false;
    }
  
    return true;
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
      console.error("Greška pri dobijanju koordinata:", error);
      return null;
  }
}
  
  const handleRegister = async () => {
    const routeAtTrigger = navigation.getState().routes.at(-1)?.name;

    // Validate form
    useAuthStore.setState({
      isLoading: true,
      error: null,
    });

    setIsLoading2(true);

    setEnabled(true);

    if (!validateUserRegistration()) {
      useAuthStore.setState({
      isLoading: false,
      error: null,
    });
    setIsLoading2(false);
    setEnabled(false);
      return;
    }

    const userAddressCoords = await getCoordinates(address);

    if (!validateUserAddress(userAddressCoords)) {
      useAuthStore.setState({
      isLoading: false,
      error: null,
    });
    setEnabled(false);
    setIsLoading2(false);
     return;
    }

    const existingUserResponse = await axios.get(`/api/users/get-by-email/${email}`);
    if (existingUserResponse.data && existingUserResponse.data.email === email) {
      showDialog({
        title: "Email Already Registered",
        message: "A user with this email address already exists. Please use a different email.",
        type: "error",
        buttons: [{ text: "OK" }]
      });

      useAuthStore.setState({
      isLoading: false,
      error: null,
    });
    setEnabled(false);
    setIsLoading2(false);
          
     return;
    }
    
    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        address,
        providers: ['email', 'phone']
      });
      
      // Only navigate if no error occurred
      if (!useAuthStore.getState().error) {
        showDialog({
          title: "Registration Successful",
          message: "Your account has been created successfully.",
          type: "success",
          buttons: []
        });

        useAuthStore.setState({
          isLoading: false,
          error: null,
        });  

        setIsLoading2(false);

        setTimeout(() => {
          const credentials: LoginCredentials = {
            email,
            password,
            provider: 'email'
          };
          
          try {
            login(credentials);
            // Only navigate if no error occurred
            if (!useAuthStore.getState().error) {
              hideDialog();

              const currentRoute = navigation.getState().routes.at(-1)?.name;
              if (currentRoute === routeAtTrigger) {
              if (from !== 'profile') {
                sessionStorage.setItem('path', 'welcome');
                router.replace('/(tabs)');
                setEnabled(false);
              } else {
                sessionStorage.setItem('path', 'welcome');
                router.replace('/(tabs)');
                setEnabled(false);
              }
            }
            }
          } catch (error) {
            setIsLoading2(false);
            setEnabled(false);
            useAuthStore.setState({
              isLoading: false,
              error: null,
            });
            console.error('Login failed:', error);
          }
        }, 2500);
      }
    } catch (error) {
      setIsLoading2(false);
      setEnabled(false);
      useAuthStore.setState({
        isLoading: false,
        error: null,
      });
      console.error('Registration failed:', error);
    }
  };
  
  const renderProviderOptions = () => (
    <View style={styles.providersContainer}>
      <TouchableOpacity 
        style={styles.providerButton}
        onPress={() => handleProviderLogin('google')}
        disabled={isLoading}
      >
        <View style={styles.providerIcon}>
          <Text style={styles.providerIconText}>G</Text>
        </View>
        <Text style={styles.providerText}>Continue with Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.providerButton}
        onPress={() => handleProviderLogin('microsoft')}
        disabled={isLoading}
      >
        <View style={styles.providerIcon}>
          <Text style={styles.providerIconText}>M</Text>
        </View>
        <Text style={styles.providerText}>Continue with Microsoft</Text>
      </TouchableOpacity>
      
      {Platform.OS === 'ios' && (
        <TouchableOpacity 
          style={styles.providerButton}
          onPress={() => handleProviderLogin('apple')}
          disabled={isLoading}
        >
          <View style={styles.providerIcon}>
            <Text style={styles.providerIconText}>A</Text>
          </View>
          <Text style={styles.providerText}>Continue with Apple</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.providerButton}
        onPress={() => setMode('phone')}
        disabled={isLoading}
      >
        <View style={styles.providerIcon}>
          <Phone size={20} color={colors.text} />
        </View>
        <Text style={styles.providerText}>Continue with Phone</Text>
      </TouchableOpacity>
      
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>
      
      <Button 
        title="Continue with Email" 
        variant="outline"
        leftIcon={<Mail size={20} color={colors.primary} />}
        onPress={() => setMode('email')}
        style={styles.emailButton}
      />
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => setMode('register')}
      >
        <Text style={styles.registerText}>New user?</Text>
        <Text style={styles.registerTextBold}>Create an account</Text>
        <ChevronRight size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
  
  const renderEmailForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Login with Email</Text>
      
      <View style={styles.inputContainer}>
        <Mail size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Lock size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={colors.textLight}
        />
        <TouchableOpacity 
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={colors.gray} />
          ) : (
            <Eye size={20} color={colors.gray} />
          )}
        </TouchableOpacity>
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <Button 
        title="Login" 
        onPress={handleEmailLogin}
        isLoading={isLoading}
        style={styles.loginButton}
      />
      
      <TouchableOpacity 
        style={styles.backToOptions}
        onPress={() => setMode('provider')}
      >
        <Text style={styles.backToOptionsText}>Back to login options</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => setMode('register')}
      >
        <Text style={styles.registerText}>New user?</Text>
        <Text style={styles.registerTextBold}>Create an account</Text>
        <ChevronRight size={16} color={colors.primary} />
      </TouchableOpacity>
      
    </View>
  );
  
  const renderPhoneForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Login with Phone</Text>
      
      <View style={styles.inputContainer}>
        <Phone size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Lock size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={colors.textLight}
        />
        <TouchableOpacity 
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={colors.gray} />
          ) : (
            <Eye size={20} color={colors.gray} />
          )}
        </TouchableOpacity>
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <Button 
        title="Login" 
        onPress={handlePhoneLogin}
        isLoading={isLoading}
        style={styles.loginButton}
      />
      
      <TouchableOpacity 
        style={styles.backToOptions}
        onPress={() => setMode('provider')}
      >
        <Text style={styles.backToOptionsText}>Back to login options</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.registerButton}
        onPress={() => setMode('register')}
      >
        <Text style={styles.registerText}>New user?</Text>
        <Text style={styles.registerTextBold}>Create an account</Text>
        <ChevronRight size={16} color={colors.primary} />
      </TouchableOpacity>
      
    </View>
  );
  
  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create an Account</Text>
      
      <View style={styles.inputContainer}>
        <UserPlus size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Mail size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textLight}
        />
      </View>

      <View style={styles.inputContainer}>
        <MapPin size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
          placeholderTextColor={colors.textLight}
        />
      </View>

      <View style={styles.inputContainer}>
        <Phone size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Lock size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
              value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={colors.textLight}
        />
        <TouchableOpacity 
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={colors.gray} />
          ) : (
            <Eye size={20} color={colors.gray} />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <Lock size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor={colors.textLight}
        />
      </View>
      
      <Text style={styles.roleLabel}>I want to:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={[
            styles.roleOption,
            role === 'orderer' && styles.roleOptionSelected
          ]}
          onPress={() => setRole('orderer')}
        >
          <Text style={[
            styles.roleText,
            role === 'orderer' && styles.roleTextSelected
          ]}>
            Ship Goods
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.roleOption,
            role === 'transporter' && styles.roleOptionSelected
          ]}
          onPress={() => setRole('transporter')}
        >
          <Text style={[
            styles.roleText,
            role === 'transporter' && styles.roleTextSelected
          ]}>
            Transport Goods
          </Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <Button 
        title="Register" 
        onPress={handleRegister}
        isLoading={isLoading2}
        style={styles.loginButton}
        leftIcon={<UserPlus size={20} color={colors.white} />}
      />
      
      <TouchableOpacity 
        style={styles.backToOptions}
        onPress={() => setMode('provider')}
      >
        <Text style={styles.backToOptionsText}>Back to login options</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>Welcome to LogiTrack</Text>
            <Text style={styles.subtitle}>
              {mode === 'register' 
                ? 'Create an account to get started' 
                : 'Sign in to continue to the app'}
            </Text>
            
            {mode === 'provider' && renderEmailForm()}
            {mode === 'email' && renderEmailForm()}
            {mode === 'phone' && renderPhoneForm()}
            {mode === 'register' && renderRegisterForm()}
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  header: {
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 32,
  },
  providersContainer: {
    gap: 16,
    marginBottom: 32,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  providerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  providerIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  providerText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    color: colors.textLight,
    fontSize: 14,
  },
  emailButton: {
    width: '100%',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
    gap: 4,
  },
  registerText: {
    color: colors.textLight,
    fontSize: 14,
  },
  registerTextBold: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    gap: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 0,
    width: '100%',
    flex: 1,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
    height: 56,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
  },
  passwordToggle: {
    padding: 8,
  },
  loginButton: {
    width: '100%',
    marginTop: 8,
  },
  backToOptions: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  backToOptionsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  helpText: {
    color: colors.textLight,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  roleOption: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleText: {
    fontSize: 14,
    color: colors.text,
  },
  roleTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    },
});