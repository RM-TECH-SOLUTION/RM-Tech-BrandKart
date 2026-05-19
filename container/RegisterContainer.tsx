import React from "react";
import { View } from "react-native";
import RegistrationScreen from "../component/RegistrationScreen";
import useAuthStore from "../store/useAuthStore";

const RegisterContainer = ({ navigation }) => {

  const registerUser = useAuthStore((state) => state.registerUser);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const clearError = useAuthStore((state) => state.clearError);

  return (
    <View style={{ flex: 1 }}>
      <RegistrationScreen
        onLogin={() => navigation.replace("Auth")}
        navigation={navigation}
        registerUser={registerUser}
        authError={errorMessage}
        clearAuthError={clearError}
      />
    </View>
  );
};

export default RegisterContainer;