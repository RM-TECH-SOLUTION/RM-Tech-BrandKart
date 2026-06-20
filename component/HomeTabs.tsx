import React from "react";
import { View, Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "./CustomHeader";
import HomeScreen from "./HomeScreen";
import CategoryContainer from "../container/CategoryContainer";
import AccountComponent from "./AccountComponent";

const Tab = createBottomTabNavigator();

export default function HomeTabs({
  uiConfig = {},
  homeBanner,
  homeSlider,
  greetingConfig,
}) {
  return (
    <Tab.Navigator
      screenOptions={{
        header: () => (
          <CustomHeader uiConfig={uiConfig} />
        ),
        tabBarStyle: {
          backgroundColor:
            uiConfig?.tabBgColor || "#111",
          height: 65,
        },
        tabBarActiveTintColor:
          uiConfig?.tabActiveColor || "#E50914",
        tabBarInactiveTintColor:
          uiConfig?.tabInactiveColor || "#777",
      }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="home-outline"
              size={22}
              color={color}
            />
          ),
        }}
      >
        {() => (
          <HomeScreen
            uiConfig={uiConfig}
            homeBanner={homeBanner}
            homeSlider={homeSlider}
            greetingConfig={greetingConfig}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Order"
        component={CategoryContainer}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="grid-outline"
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Account"
        component={AccountComponent}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="person-outline"
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}