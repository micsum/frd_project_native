import React, { Fragment, useEffect } from "react";
import { StyleSheet, View, Text, Button, Platform } from "react-native";
import * as Calendar from "expo-calendar";
import GoalInputDisplayPanel from "../components/goalPageComponents/weightCalorieGoal";
import { AlertNotificationRoot } from "react-native-alert-notification";

export function CalendarScreen() {
  // useEffect(() => {
  //   (async () => {
  //     const { status } = await Calendar.requestCalendarPermissionsAsync();
  //     if (status === "granted") {
  //       const calendars = await Calendar.getCalendarsAsync(
  //         Calendar.EntityTypes.EVENT
  //       );
  //       console.log("Here are all your calendars:");
  //       console.log({ calendars });
  //     }
  //   })();
  // }, []);

  return (
    <Fragment>
      <AlertNotificationRoot>
        <View style={styles.container}>
          <Text>Calendar Module Example</Text>
          <Button title="Create a new calendar" onPress={createCalendar} />
        </View>
        <GoalInputDisplayPanel />
      </AlertNotificationRoot>
    </Fragment>
  );
}

async function getDefaultCalendarSource() {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

async function createCalendar() {
  const defaultCalendarSource =
    Platform.OS === "ios"
      ? await getDefaultCalendarSource()
      : { isLocalAccount: true, name: "Expo Calendar" };
  const newCalendarID = await Calendar.createCalendarAsync({
    title: "Expo Calendar",
    color: "blue",
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendarSource.id,
    source: defaultCalendarSource,
    name: "internalCalendarName",
    ownerAccount: "personal",
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  console.log(`Your new calendar ID is: ${newCalendarID}`);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
  },
});
