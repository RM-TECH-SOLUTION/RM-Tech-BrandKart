import { StatusBar } from 'expo-status-bar';
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import SplashContainer from "./container/SplashContainer";
import { StyleSheet, View } from 'react-native';
import HomeTabs from "./component/HomeTabs";
import RegistrationScreen from "./component/RegistrationScreen"
import WalkthroughContainer from './container/WalkthroughContainer';
import LoginContainer from './container/LoginContainer'
import RegisterContainer from './container/RegisterContainer';
import HomeContainer from './container/HomeContainer';
import CheckoutContainer from './container/CheckoutContainer'
import SavedAddressComponent from './component/SavedAddressComponent'
import OrderHistoryContainer from './container/OrderHistoryContainer';
import MerchantInfoContainer from './container/MerchantInfoContainer';
import MerchantSetupScreen from './component/MerchantSetupScreen';
import NetworkLostComponent from './component/NetworkLostComponent';
import useNetworkStatus from './hooks/useNetworkStatus';

const Stack = createStackNavigator();
const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#111"
  }
};

export default function App() {
  const { isNetworkLost } = useNetworkStatus();

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer theme={appTheme}>
        <StatusBar style="light" backgroundColor="#111" />
        <Stack.Navigator
          initialRouteName="MerchantSetup"
          detachInactiveScreens={false}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: "#111" },
            cardOverlayEnabled: false
          }}
        >
          <Stack.Screen name="MerchantSetup" component={MerchantSetupScreen} />
          <Stack.Screen name="Splash" component={SplashContainer} />
          <Stack.Screen name="Walkthrough" component={WalkthroughContainer} />
          <Stack.Screen name="Auth" component={LoginContainer} />
          <Stack.Screen name="Register" component={RegisterContainer} />
          <Stack.Screen name="Home" component={HomeContainer} />
          <Stack.Screen
            name="Checkout"
            component={CheckoutContainer}
            options={{
              gestureEnabled: true,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              cardOverlayEnabled: false,
              cardStyle: { backgroundColor: "#111" }
            }}
          />
          <Stack.Screen
            name="SavedAddressComponent"
            component={SavedAddressComponent}
            options={{
              headerShown: false,
              gestureEnabled: true,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              cardOverlayEnabled: false,
              cardStyle: { backgroundColor: "#111" }
            }}
          />
          <Stack.Screen
            name="OrderHistoryContainer"
            component={OrderHistoryContainer}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MerchantInfoContainer"
            component={MerchantInfoContainer}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <NetworkLostComponent isVisible={isNetworkLost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    height: "100%"
  },
});