import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, fontSize, font} from '../lib/theme';

import SearchScreen from '../screens/main/SearchScreen';
import OfferRideScreen from '../screens/main/OfferRideScreen';
import MyRidesScreen from '../screens/main/MyRidesScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import RideDetailScreen from '../screens/main/RideDetailScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';

export type SearchStackParamList = {
  SearchList: undefined;
  RideDetail: {rideId: string};
};

export type RidesStackParamList = {
  MyRidesList: undefined;
  RideDetail: {rideId: string};
};

export type BookingsStackParamList = {
  BookingsList: undefined;
  RideDetail: {rideId: string};
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Notifications: undefined;
};

const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const RidesStack = createNativeStackNavigator<RidesStackParamList>();
const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

const stackOpts = {
  headerShown: false,
  contentStyle: {backgroundColor: colors.bgPrimary},
  animation: 'slide_from_right' as const,
};

function SearchTab() {
  return (
    <SearchStack.Navigator screenOptions={stackOpts}>
      <SearchStack.Screen name="SearchList" component={SearchScreen} />
      <SearchStack.Screen name="RideDetail" component={RideDetailScreen} />
    </SearchStack.Navigator>
  );
}

function RidesTab() {
  return (
    <RidesStack.Navigator screenOptions={stackOpts}>
      <RidesStack.Screen name="MyRidesList" component={MyRidesScreen} />
      <RidesStack.Screen name="RideDetail" component={RideDetailScreen} />
    </RidesStack.Navigator>
  );
}

function BookingsTab() {
  return (
    <BookingsStack.Navigator screenOptions={stackOpts}>
      <BookingsStack.Screen name="BookingsList" component={BookingsScreen} />
      <BookingsStack.Screen name="RideDetail" component={RideDetailScreen} />
    </BookingsStack.Navigator>
  );
}

function ProfileTab() {
  return (
    <ProfileStackNav.Navigator screenOptions={stackOpts}>
      <ProfileStackNav.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStackNav.Screen
        name="Notifications"
        component={NotificationsScreen}
      />
    </ProfileStackNav.Navigator>
  );
}

const tabIconMap: Record<string, [string, string]> = {
  Search: ['search-outline', 'search'],
  Offer: ['add-circle-outline', 'add-circle'],
  Rides: ['car-outline', 'car'],
  Bookings: ['ticket-outline', 'ticket'],
  Profile: ['person-outline', 'person'],
};

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: s.tabBar,
        tabBarActiveTintColor: colors.accentMint,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: s.tabLabel,
        tabBarIcon: ({focused, color}) => {
          const [outline, filled] = tabIconMap[route.name] || ['ellipse-outline', 'ellipse'];
          return (
            <Ionicons
              name={focused ? filled : outline}
              size={22}
              color={color}
            />
          );
        },
      })}>
      <Tab.Screen name="Search" component={SearchTab} />
      <Tab.Screen name="Offer" component={OfferRideScreen} />
      <Tab.Screen name="Rides" component={RidesTab} />
      <Tab.Screen name="Bookings" component={BookingsTab} />
      <Tab.Screen name="Profile" component={ProfileTab} />
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgElevated,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    paddingTop: 4,
    height: 80,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: font.medium,
    marginBottom: 6,
  },
});
