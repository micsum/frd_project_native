import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
  PixelRatio,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Button, NativeBaseProvider } from "native-base";
import { Register } from "./RegisterPage";
import { Login } from "./LoginPage";
import { color } from "@rneui/themed/dist/config";

export const WelcomeScreenNoStack = () => {
  const navigation = useNavigation();
  const [sliderState, setSliderState] = useState({ currentPage: 0 });
  const { width, height } = Dimensions.get("window");

  const setSliderPage = (event: any) => {
    const { currentPage } = sliderState;
    const { x } = event.nativeEvent.contentOffset;
    const indexOfNextScreen = Math.floor(x / width);
    if (indexOfNextScreen !== currentPage) {
      setSliderState({
        ...sliderState,
        currentPage: indexOfNextScreen,
      });
    }
  };

  const { currentPage: pageIndex } = sliderState;

  return (
    <NativeBaseProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }} className="bg-[#38668E]">
        <ScrollView
          style={{ flex: 1 }}
          horizontal={true}
          scrollEventThrottle={16}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onScroll={(event: any) => {
            setSliderPage(event);
          }}
        >
          <View style={{ width, height }}>
            <ImageBackground
              style={styles.imageStyle}
              resizeMode="cover"
              source={require("../assets/images/3864158.jpg")}
            ></ImageBackground>
            <View style={styles.wrapper}>
              <Text style={styles.header}>beHealthy</Text>
            </View>
          </View>
          <View style={{ width, height }}>
            <ImageBackground
              style={styles.imageStyle}
              resizeMode="cover"
              source={require("../assets/images/Chatbot-pana.png")}
            ></ImageBackground>
            <View style={styles.wrapper}>
              <Text style={styles.header}>Live Chat</Text>
              <Text style={styles.paragraph}>Ask the advice from AI</Text>
            </View>
          </View>
          <View style={{ width, height }}>
            <ImageBackground
              style={styles.imageStyle}
              resizeMode="cover"
              source={require("../assets/images/Diet-amico.png")}
            ></ImageBackground>
            <View style={styles.wrapper}>
              <Text style={styles.header}>Meal Track</Text>
              <Text style={styles.paragraph}>
                Check your meal nutrients and have a well plan
              </Text>
            </View>
          </View>
          <View style={{ width, height }}>
            <ImageBackground
              style={styles.imageStyle}
              resizeMode="cover"
              source={require("../assets/images/Onlinecalendar-cuate.png")}
            ></ImageBackground>
            <View style={styles.wrapper}>
              <Text style={styles.header}>Calender</Text>
              <Text style={styles.paragraph}>Record your scheme</Text>
            </View>
          </View>
          <View style={{ width, height }}>
            <ImageBackground
              style={styles.imageStyle}
              resizeMode="cover"
              source={require("../assets/images/Personalizedworkouts-amico.png")}
            ></ImageBackground>
            <View style={styles.wrapper}>
              <Text style={styles.header}>Plans</Text>
              <Text style={styles.paragraph}>
                Full of nutrients and workout plans for you
              </Text>
            </View>
          </View>
        </ScrollView>
        <View style={styles.paginationWrapper}>
          {Array.from(Array(5).keys()).map((key, index) => (
            <View
              style={[
                styles.paginationDots,
                { opacity: pageIndex === index ? 1 : 0.2 },
              ]}
              key={index}
            />
          ))}
        </View>
        <View className="mb-20">
          <Button
            onPress={() => {
              //@ts-ignore
              navigation.navigate("SignUpPage");
            }}
            size="md"
            style={{ width: 150, alignSelf: "center", borderRadius: 20 }}
          >
            <Text style={{ fontSize: 16 }}>Sign Up</Text>
          </Button>
          <TouchableOpacity
            onPress={() => {
              //@ts-ignore
              navigation.navigate("LogInPage");
            }}
            className="flex-row justify-center items-center px-6"
          >
            <View className="flex-1 flex items-center">
              <Text className="text-white text-base font-medium">Log In</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </NativeBaseProvider>
  );
};
const Stack = createStackNavigator();

export const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="WelcomePage"
        component={WelcomeScreenNoStack}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="SignUpPage"
        component={Register}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LogInPage"
        component={Login}
        options={{
          title: "Log In",
          headerShown: true,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#38668E" },
          headerTintColor: "#a5f3fc",
          headerBackTitle: " ",
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    height: PixelRatio.getPixelSizeForLayoutSize(120),
    width: "100%",
    alignSelf: "center",
  },
  wrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 70,
  },
  header: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  paragraph: {
    color: "#fff",
    fontSize: 17,
  },
  paginationWrapper: {
    position: "absolute",
    bottom: 200,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  paginationDots: {
    height: 10,
    width: 10,
    borderRadius: 10 / 2,
    backgroundColor: "#0898A0",
    marginLeft: 10,
    marginBottom: 45,
  },
});
