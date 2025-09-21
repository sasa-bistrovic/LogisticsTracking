import React, { useRef, useEffect, useState, useCallback  } from 'react';
import { Tabs } from 'expo-router';
import { 
  Package, 
  Map, 
  User
} from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { colors } from '@/constants/colors';
import { View, StyleSheet, Animated, InteractionManager } from 'react-native';
import { useFocusEffect, useNavigation, NavigationProp, useNavigationContainerRef } from '@react-navigation/native';

export default function TabLayout() {
  const [tabBarBottom] = useState(new Animated.Value(0));
  const [rerenderKey, setRerenderKey] = useState(0); // Add rerenderKey state
  const rerenderRef = useRef(0);

  const router = useRouter();

  const navigationRef = useNavigationContainerRef();

  const pathname = usePathname();

    const initialNavigationDone = useRef(false);

  // Effect to simulate a click on the index tab when component mounts
  useEffect(() => {
      // Small delay to ensure navigation happens after component is fully mounted
      /*
    const path = sessionStorage.getItem("path2");
    if (path === "welcome") {
      sessionStorage.removeItem("path2");
      const timer = setTimeout(() => {
        console.log("tabs welcome");
        //router.replace('/(tabs)?from=main');
        initialNavigationDone.current = true;
      }, 1100);
      
      return () => clearTimeout(timer);
    }
      */
  }, [pathname]);

  const animateTabBar = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      Animated.timing(tabBarBottom, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [tabBarBottom]);

  useFocusEffect(
    useCallback(() => {
      animateTabBar(); // Animate in when the screen is focused
  
      return () => {
        Animated.timing(tabBarBottom, {
          toValue: 60, // Animate out when leaving
          duration: 300,
          useNativeDriver: false,
        }).start();
      };
    }, [animateTabBar])
  );

  return (
    <Tabs
    //backBehavior="none"
    screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray,
      tabBarStyle: {
        backgroundColor: colors.white,
        borderTopColor: colors.border,
        height: 60,
        paddingBottom: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      headerStyle: {
        backgroundColor: colors.white,
      },
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
      },
      headerShadowVisible: false,
    }}
  >
    <Tabs.Screen
      name="index"
      options={{
        title: "Orders",
        tabBarLabel: "Orders",
        tabBarIcon: ({ color, size }) => (
          <Package size={size} color={color} />
        ),
      }}
    />
    
    <Tabs.Screen
      name="tracking"
      options={{
        title: "Tracking",
        tabBarLabel: "Tracking",
        tabBarIcon: ({ color, size }) => (
          <Map size={size} color={color} />
        ),
      }}
    />
    
    <Tabs.Screen
      name="profile"
      options={{
        title: "Profile",
        tabBarLabel: "Profile",
        tabBarIcon: ({ color, size }) => (
          <User size={size} color={color} />
        ),
      }}
    />
  </Tabs>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 8,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 18,
  },
});
