import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme";
import type { Point } from "../ride/types";
import { RideHomeScreen } from "../screens/ride/RideHomeScreen";
import { RideOptionsScreen } from "../screens/ride/RideOptionsScreen";
import { RideTrackingScreen } from "../screens/ride/RideTrackingScreen";
import { DriverHubScreen } from "../screens/driver/DriverHubScreen";

export type RideFlowParamList = {
  RideHome: undefined;
  RideOptions: { pickup: Point; dropoff: Point };
  RideTracking: { rideId: string };
  DriverHub: undefined;
};

const Stack = createNativeStackNavigator<RideFlowParamList>();

export function RideNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="RideHome" component={RideHomeScreen} options={{ title: "Ride" }} />
      <Stack.Screen name="RideOptions" component={RideOptionsScreen} options={{ title: "Choose a ride" }} />
      <Stack.Screen
        name="RideTracking"
        component={RideTrackingScreen}
        options={{ title: "Your trip", headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen name="DriverHub" component={DriverHubScreen} options={{ title: "Drive with Rapid" }} />
    </Stack.Navigator>
  );
}
