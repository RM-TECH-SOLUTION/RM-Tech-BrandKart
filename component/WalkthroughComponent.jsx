import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
  Animated,
} from "react-native";

const { width, height } = Dimensions.get("window");

const WalkthroughComponent = ({
  walkthroughData,
  walkthroughConfig,
  currentIndex,
  fadeAnim,
  flatListRef,
  handleScroll,
  handleNext,
  onFinish,
}) => {
  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={[styles.title, { color: walkthroughConfig?.walkthroughTitleColor || "#FFFFFF" }]}>
          {item.title}
        </Text>
        <Text style={[styles.description, { color: walkthroughConfig?.walkthroughDescriptionColor || "#E0E0E0" }]}>
          {item.description}
        </Text>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={walkthroughData}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={onFinish}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.pagination}>
        {walkthroughData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationBar,
              {
                width: index === currentIndex ? 28 : 10,
                backgroundColor:
                  index === currentIndex
                    ? walkthroughConfig?.walkthroughButtonColor ||
              walkthroughConfig?.buttonColor ||
              "#E50914"
                    : "rgba(255,255,255,0.3)",
              },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor:
              walkthroughConfig?.walkthroughButtonColor ||
              walkthroughConfig?.buttonColor ||
              "#E50914",
          },
        ]}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color:
                walkthroughConfig?.walkthroughButtonTextColor ||
                walkthroughConfig?.buttonTextColor ||
                "#FFFFFF",
            },
          ]}
        >
          {currentIndex === walkthroughData.length - 1
            ? "Get Started"
            : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default WalkthroughComponent;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  slide: { width, height },
  image: { width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: "rgba(0,0,0,0.30)",
  },
  content: {
    position: "absolute",
    bottom: 180,
    width: "100%",
    paddingHorizontal: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    color: "#E0E0E0",
    textAlign: "center",
    lineHeight: 24,
  },
  skipBtn: {
    position: "absolute",
    top: 60,
    right: 20,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  pagination: {
    position: "absolute",
    bottom: 130,
    flexDirection: "row",
    alignSelf: "center",
  },
  paginationBar: {
    height: 6,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  button: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    backgroundColor: "#E50914",
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 30,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});