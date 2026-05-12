import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0ea5e9",
        headerShown: false,
        tabBarStyle: {
          // Adjust height based on platform
          height: Platform.OS === "android" ? 70 : 88,
          // Add padding to the bottom for Android labels
          paddingBottom: Platform.OS === "android" ? 12 : 30,
          // Optional: Add top padding for the icons
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          // Extra margin for Android text
          marginBottom: Platform.OS === "android" ? 0 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      {/* ... other screens stay the same */}
      <Tabs.Screen
        name="calls"
        options={{
          title: "Calls",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="call" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Communities",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
