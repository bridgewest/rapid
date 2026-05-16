import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme";
import { SendHubScreen } from "../screens/send/SendHubScreen";
import { SendAmountScreen } from "../screens/send/SendAmountScreen";
import { SendRecipientScreen } from "../screens/send/SendRecipientScreen";
import { SendReviewScreen } from "../screens/send/SendReviewScreen";
import { SendSuccessScreen } from "../screens/send/SendSuccessScreen";
import { AirtimePhoneScreen } from "../screens/airtime/AirtimePhoneScreen";
import { AirtimeAmountScreen } from "../screens/airtime/AirtimeAmountScreen";
import { AirtimeReviewScreen } from "../screens/airtime/AirtimeReviewScreen";
import { AirtimeSuccessScreen } from "../screens/airtime/AirtimeSuccessScreen";
import { HomeScreen } from "../screens/tabs/HomeScreen";
import { HistoryScreen } from "../screens/tabs/HistoryScreen";
import { WalletScreen } from "../screens/tabs/WalletScreen";
import { ProfileScreen } from "../screens/tabs/ProfileScreen";

export type SendFlowParamList = {
  SendHub: undefined;
  SendAmount: undefined;
  SendRecipient: { usdCents: number };
  SendReview: { usdCents: number; recipientId: string };
  SendSuccess: { publicId: string };
  AirtimePhone: undefined;
  AirtimeAmount: { phoneE164: string; carrier: string };
  AirtimeReview: { phoneE164: string; carrier: string; wholesaleCents: number; margin: number };
  AirtimeSuccess: { publicId: string };
};

const SendStack = createNativeStackNavigator<SendFlowParamList>();

function SendFlow() {
  return (
    <SendStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <SendStack.Screen name="SendHub" component={SendHubScreen} options={{ title: "Send" }} />
      <SendStack.Screen name="SendAmount" component={SendAmountScreen} options={{ title: "Amount" }} />
      <SendStack.Screen name="SendRecipient" component={SendRecipientScreen} />
      <SendStack.Screen name="SendReview" component={SendReviewScreen} />
      <SendStack.Screen name="SendSuccess" component={SendSuccessScreen} options={{ headerShown: false }} />
      <SendStack.Screen name="AirtimePhone" component={AirtimePhoneScreen} />
      <SendStack.Screen name="AirtimeAmount" component={AirtimeAmountScreen} />
      <SendStack.Screen name="AirtimeReview" component={AirtimeReviewScreen} />
      <SendStack.Screen name="AirtimeSuccess" component={AirtimeSuccessScreen} options={{ headerShown: false }} />
    </SendStack.Navigator>
  );
}

export type MainTabParamList = {
  Home: undefined;
  SendFlow: undefined;
  History: undefined;
  Wallet: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen
        name="SendFlow"
        component={SendFlow}
        options={{ title: "Send", headerShown: false }}
      />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
