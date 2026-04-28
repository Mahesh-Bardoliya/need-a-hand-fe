import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HelpRequestDetailScreen from '../screens/HelpRequestDetailScreen';
import CreateHelpRequestScreen from '../screens/CreateHelpRequestScreen';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS, SHADOW } from '../theme';
import { Feather } from '@expo/vector-icons';

const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: styles.headerTitle,
        headerBackTitleVisible: false,
      }}
    >
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="HelpRequestDetail"
        component={HelpRequestDetailScreen}
        options={{ title: 'Help Request' }}
      />
      <HomeStack.Screen
        name="CreateHelpRequest"
        component={CreateHelpRequestScreen}
        options={{ title: 'Ask for Help' }}
      />
    </HomeStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: styles.headerTitle,
        headerBackTitleVisible: false,
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </ProfileStack.Navigator>
  );
}

// Custom tab bar icon component
function TabIcon({ name, focused }) {
  return (
    <View style={[tabStyles.iconWrapper, focused && tabStyles.iconWrapperActive]}>
      <Feather 
        name={name} 
        size={22} 
        color={focused ? COLORS.primary : COLORS.textMuted} 
      />
    </View>
  );
}

function MainTabScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarLabelStyle: tabStyles.tabLabel,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isInitializing } = useContext(AuthContext);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return user ? <MainTabScreen /> : <AuthStackScreen />;
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 17,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
});

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    ...SHADOW.sm,
  },
  tabLabel: {
    fontSize: 11,
    ...FONTS.medium,
  },
  iconWrapper: {
    width: 36,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  iconWrapperActive: {
    backgroundColor: COLORS.primaryLight,
  },
  emoji: {
    fontSize: 20,
  },
});
