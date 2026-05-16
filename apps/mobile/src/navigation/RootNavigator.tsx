import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { MainTabNavigator } from "./MainTabNavigator";
import { WelcomeScreen } from "../screens/onboarding/WelcomeScreen";
import { RegisterScreen } from "../screens/onboarding/RegisterScreen";
import { LoginScreen } from "../screens/onboarding/LoginScreen";
import { OtpScreen } from "../screens/onboarding/OtpScreen";
import { KycIntroScreen } from "../screens/onboarding/KycIntroScreen";
import { ProfileSetupScreen } from "../screens/onboarding/ProfileSetupScreen";
import { colors } from "../theme";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type OnboardingStackParamList = {
  Otp: { phoneE164?: string };
  KycIntro: undefined;
  ProfileSetup: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <OnboardingStack.Screen name="Otp" component={OtpScreen} />
      <OnboardingStack.Screen name="KycIntro" component={KycIntroScreen} />
      <OnboardingStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </OnboardingStack.Navigator>
  );
}

function Gate() {
  const { user, loading, onboardingDone } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center" }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!user) return <AuthNavigator />;
  if (!onboardingDone) return <OnboardingNavigator />;
  return <MainTabNavigator />;
}

export function RootNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Gate />
      </NavigationContainer>
    </AuthProvider>
  );
}
