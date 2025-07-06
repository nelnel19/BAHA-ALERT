import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import WeatherScreen from "./screens/WeatherScreen";
import MapScreen from "./screens/MapScreen";
import CalendarScreen from "./screens/CalendarScreen"; 
import LguScreen from "./screens/LguScreen"; 
import AiScreen from "./screens/AiScreen"; 
import WeatherNewsScreen from "./screens/WeatherNewsScreen"; 
import AlertScreen from "./screens/AlertScreen"; 
import GameScreen from "./screens/GameScreen"; 
import UpdateProfileScreen from "./screens/UpdateProfileScreen"; 
import FloodScreen from "./screens/FloodScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Weather"
          component={WeatherScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Flood"
          component={FloodScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Lgu"
          component={LguScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="Ai"
          component={AiScreen}
          options={{ headerShown: false }} 
        />
          <Stack.Screen
          name="WeatherNews"
          component={WeatherNewsScreen}
          options={{ headerShown: false }} 
        />
          <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ headerShown: false }} 
        />
          <Stack.Screen
          name="Alert"
          component={AlertScreen}
          options={{ headerShown: false }} 
        />
          <Stack.Screen
          name="Profile"
          component={UpdateProfileScreen}
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
