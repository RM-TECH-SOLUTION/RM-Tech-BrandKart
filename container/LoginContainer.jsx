import React, { useEffect, useState } from "react";
import { View } from "react-native";
import LoginComponent from "../component/LoginComponent";
import useAuthStore from "../store/useAuthStore";
import useSessionStore from "../store/useSessionStore";
import useCmsStore from "../store/useCmsStore";

const LoginContainer = ({ navigation }) => {
  const loginUser = useAuthStore((state) => state.loginUser);
  const loading = useAuthStore((state) => state.loading);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const clearError = useAuthStore((state) => state.clearError);

  const { isLoggedIn } = useSessionStore();
  const { cmsData } = useCmsStore();

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [cmsConfig, setCmsConfig] = useState({});

  /* -------- Redirect if already logged in -------- */
  useEffect(() => {
    if (isLoggedIn) {
      navigation.replace("Home");
    }
  }, [isLoggedIn]);

  /* -------- Format CMS -------- */
  useEffect(() => {
    if (!Array.isArray(cmsData)) return;

    const loginConfig = cmsData.find(
      (item) => item.modelSlug === "loginConfiguration"
    );

    if (!loginConfig?.cms) return;

    const formatted = Object.keys(loginConfig.cms).reduce(
      (acc, key) => {
        acc[key] = loginConfig.cms[key]?.fieldValue;
        return acc;
      },
      {}
    );

    setCmsConfig(formatted);
  }, [cmsData]);

  const handleLogin = () => {
    clearError();
    loginUser(identity, password);
  };

  return (
    <View style={{ flex: 1 }}>
      <LoginComponent
        identity={identity}
        password={password}
        setIdentity={setIdentity}
        setPassword={setPassword}
        onLogin={handleLogin}
        onRegister={() => navigation.replace("Register")}
        onSkip={() => navigation.replace("Home")}
        loading={loading}
        cmsConfig={cmsConfig}
        errorMessage={errorMessage}
        onClearError={clearError}
      />
    </View>
  );
};

export default LoginContainer;