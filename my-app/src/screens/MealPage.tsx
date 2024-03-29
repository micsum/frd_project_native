// Buffer Line
import { Fragment, useState, useMemo, useEffect } from "react";
import { Provider } from "react-redux";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { store } from "../store";
import DateSelectionPanel from "../components/mealPageComponents/DateSelectionPanel";
import MealTypeSelection from "../components/mealPageComponents/MealTypeSelection";
import { FullItemInfo } from "../utils/type";
import { NativeBaseProvider, ScrollView } from "native-base";
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Dialog,
} from "react-native-alert-notification";
import { createStackNavigator } from "@react-navigation/stack";
import { useGet } from "../hooks/use-get";

const MealPage: React.FC = () => {
  const [date, updateSelectedDate] = useState<Date>(new Date());

  const dateString = date.toISOString().split("T")[0];
  const dateMealItem = useGet<{ mealData: FullItemInfo[] }>(
    `/mealItem/foodItems/${dateString}`
  );
  const dateMealData = dateMealItem.json.mealData || [];

  const selectNewDate = (date: Date) => {
    updateSelectedDate(() => {
      return new Date(date.getTime()); // + 8 * 3600000);
    });
  };

  return (
    <SafeAreaProvider>
      <NativeBaseProvider>
        <Provider store={store}>
          <AlertNotificationRoot>
            <SafeAreaView
              style={{
                marginTop: 10,
                paddingBottom: useSafeAreaInsets().bottom,
              }}
            >
              <DateSelectionPanel updateSelectedDate={selectNewDate} />
              <ScrollView>
                <MealTypeSelection
                  date={date}
                  foodItemFullInfo={dateMealData}
                />
              </ScrollView>
            </SafeAreaView>
          </AlertNotificationRoot>
        </Provider>
      </NativeBaseProvider>
    </SafeAreaProvider>
  );
};

export function MealScreen({}) {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeNoStack"
        component={MealPage}
        options={{
          headerShown: true,
          title: "Meal History",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#38668E" },
          headerTintColor: "#a5f3fc",
          headerBackTitle: " ",
        }}
      ></Stack.Screen>
    </Stack.Navigator>
  );
}
