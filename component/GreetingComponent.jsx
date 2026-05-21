import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import useSessionStore from "../store/useSessionStore";

export default function GreetingComponent({
  greetingConfig = {},
  backgroundColor = "#ffffff",
}) {

  // Detect dark/light background
  const isDarkColor = (color) => {
    if (!color || typeof color !== "string") return false;

    let hex = color.replace("#", "");

    // Convert short hex to full hex
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }

    if (hex.length !== 6) return false;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Brightness formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness < 155;
  };

  const isDark = isDarkColor(backgroundColor);

  const textColor = isDark ? "#FFFFFF" : "#000000";
  const subTextColor = isDark ? "#DDDDDD" : "#555555";
  const { user } = useSessionStore();

  console.log(user?.name,"useruseruser");
  

  const { message, description } = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return {
        message:
          greetingConfig?.morningMessage ||
          "Good Morning {user?.name}",
        description:
          greetingConfig?.morningMessageDescription ||
          "",
      };
    }

    if (hour >= 12 && hour < 17) {
      return {
        message:
          `${greetingConfig?.afternoonMessage} ${user?.name}` ||
          "Good Afternoon",
        description:
          greetingConfig?.afternoonMessageDescription ||
          "",
      };
    }

    if (hour >= 17 && hour < 21) {
      return {
        message:
          `${greetingConfig?.eveningMessage} ${user?.name}` ||
          "Good Evening",
        description:
          greetingConfig?.eveningMessageDescription ||
          "",
      };
    }

    return {
      message:
        `${greetingConfig?.nightMessage} ${user?.name}` ||
        "Good Night",
      description:
        greetingConfig?.nightMessageDescription ||
        "",
    };
  }, [greetingConfig]);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.greetingText,
          { color: textColor },
        ]}
      >
        {message}
      </Text>

      {description ? (
        <Text
          style={[
            styles.subText,
            { color: subTextColor },
          ]}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginHorizontal: 10
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 13,
    marginTop: 2,
  },
});