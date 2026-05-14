import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions } from "react-native";
import WalkthroughComponent2 from "../component/WalkthroughComponent";
import useCmsStore from "../store/useCmsStore";

const { width } = Dimensions.get("window");

const WalkthroughContainer2 = ({ navigation }) => {
  const { cmsData } = useCmsStore();

  const [walkthroughData, setWalkthroughData] = useState([]);
  const [walkthroughConfig, setWalkthroughConfig] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef(null);

  /* ---------------- FORMAT CMS ---------------- */
  useEffect(() => {
    if (!Array.isArray(cmsData)) return;

    const walkthroughItem = cmsData.find(
      (item) => item.modelSlug === "walkthroughSliders"
    );

    const configItem = cmsData.find(
      (item) => item.modelSlug === "walkthroughConfiguration"
    );

    if (walkthroughItem && Array.isArray(walkthroughItem.cms)) {
      const formattedData = walkthroughItem.cms.map((slide) => ({
        title: slide.title?.fieldValue || "",
        description: slide.discription?.fieldValue || "",
        image:
          slide.walkthroughImage?.fieldValue ||
          slide.walkthroughContantImage?.fieldValue ||
          null,
      }));

      setWalkthroughData(formattedData);
    } else {
      setWalkthroughData([]);
    }

    const formattedConfig = configItem?.cms
      ? Object.values(configItem.cms).reduce((acc, field) => {
          acc[field.fieldKey] = field.fieldValue;
          return acc;
        }, {})
      : {};

    setWalkthroughConfig(formattedConfig);
  }, [cmsData]);

  /* ---------------- SCROLL LOGIC ---------------- */
  const handleScroll = (event) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / width
    );
    setCurrentIndex(index);
  };

  /* ---------------- NEXT BUTTON ---------------- */
  const handleNext = () => {
    if (currentIndex < walkthroughData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.replace("Auth");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <WalkthroughComponent2
        walkthroughData={walkthroughData}
        walkthroughConfig={walkthroughConfig}
        currentIndex={currentIndex}
        flatListRef={flatListRef}
        handleScroll={handleScroll}
        handleNext={handleNext}
      />
    </View>
  );
};

export default WalkthroughContainer2;