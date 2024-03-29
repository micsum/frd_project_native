import {
  View,
  StyleSheet,
  Text,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Progress from "react-native-progress";
import {
  AuthorizationPermissions,
  FitnessDataType,
  FitnessTracker,
  GoogleFitDataType,
  HealthKit,
  HealthKitDataType,
} from "@kilohealth/rn-fitness-tracker";
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Dialog,
} from "react-native-alert-notification";
import {
  AlertDialog,
  Button,
  Center,
  Input,
  ScrollView,
  useToken,
} from "native-base";
import axios from "axios";
import { Domain } from "@env";
import { handleToken } from "../../hooks/use-token";
import { store } from "../../store";
import DatePicker from "react-native-date-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { ExHist, ExInfo } from "../../utils/type";
const permissions: AuthorizationPermissions = {
  healthReadPermissions: [HealthKitDataType.StepCount],
  googleFitReadPermissions: [GoogleFitDataType.Steps],
};

export const GetStepsToday = ({
  onStepsUpdate,
}: {
  onStepsUpdate: (steps: number) => void;
}) => {
  const [steps, setSteps] = useState<number | undefined>();
  useEffect(() => {
    const getStepsToday = async () => {
      try {
        const authorized = await FitnessTracker.authorize(permissions);

        if (!authorized) return;

        const stepsToday = await FitnessTracker.getStatisticTodayTotal(
          FitnessDataType.Steps
        );

        // returns the number of steps walked today, e.g. 320
        console.log("stepToday", stepsToday);
        setSteps(stepsToday);
        onStepsUpdate(stepsToday);
      } catch (error) {
        // Handle error here
        console.log("error", error);

        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: `${error}`,
          textBody: "Please try again",
          button: "close",
          autoClose: 5000,
        });
      }
    };

    getStepsToday();
  }, [onStepsUpdate]);

  return steps ? (
    <Text className="mx-2 mt-1 text-lg font-bold">{steps}</Text>
  ) : (
    <Text className="mx-2 mt-1 text-lg font-bold">0</Text>
  );
};
const GoalDialog = ({
  isOpen,
  onClose,
  setStepGoal,
}: {
  isOpen: boolean;
  onClose: () => void;
  setStepGoal: Function;
}) => {
  const cancelRef = useRef(null);

  const updateStepGoal = async (goalInput: string) => {
    await axios.post(`${Domain}/user/stepsGoal`, { goalInput }).then(
      (response) => {
        if (response.data) {
          console.log("goal set");
          const dailyStepGoal: any = response.data;

          setStepGoal(goalInput);

          return Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: `Steps Goal Set`,
            textBody: "",
            button: "close",
            autoClose: 5000,
          });
        } else if (response.data.error) {
          console.log("error", response.data.error);
          return Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: `${response.data.error}`,
            textBody: "Please try again",
            button: "close",
            autoClose: 5000,
          });
        }
        return;
      },
      (error) => {
        console.log(error.response.data.message);
        return Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Error",
          textBody: `${error.response.data.message}`,
          button: "close",
          autoClose: 5000,
        });
      }
    );
  };

  const [goalInput, setGoalInput] = useState<string>("");
  const handleChange = (input: string) => {
    setGoalInput(input);
  };

  const handleSetGoal = () => {
    updateStepGoal(goalInput);
    setGoalInput("");
    onClose();
  };

  return (
    <View>
      <AlertNotificationRoot>
        <AlertDialog
          leastDestructiveRef={cancelRef}
          isOpen={isOpen}
          onClose={onClose}
        >
          <AlertDialog.Content>
            <AlertDialog.CloseButton />
            <AlertDialog.Header borderBottomWidth={0}>
              Set Steps Daily Goal
            </AlertDialog.Header>
            <AlertDialog.Body>
              <Input
                variant="rounded"
                placeholder="Steps"
                className="items-center justify-center text-center"
                value={goalInput}
                onChangeText={handleChange}
              />
            </AlertDialog.Body>
            <AlertDialog.Footer borderTopWidth={0}>
              <Button.Group space={2}>
                <Button
                  variant="unstyled"
                  colorScheme="coolGray"
                  onPress={onClose}
                  ref={cancelRef}
                >
                  Cancel
                </Button>
                <Button colorScheme="cyan" onPress={handleSetGoal}>
                  Set Goal
                </Button>
              </Button.Group>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      </AlertNotificationRoot>
    </View>
  );
};

export const CardFitnessData = () => {
  const [stepsProgress, setStepsProgress] = useState<number>(0);
  const [stepGoal, setStepGoal] = useState<number | null>(0);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const handleStepsUpdate = (steps: number) => {
    setStepsProgress(steps);
    // setStepGoal(steps);
  };

  const handleOpenGoalDialog = () => {
    setIsGoalDialogOpen(true);
  };

  const handleCloseGoalDialog = () => {
    setIsGoalDialogOpen(false);
  };

  const getStepGoal = async () => {
    const token = store.getState().auth?.token;
    let dbstep = await axios
      .get(`${Domain}/user/stepsGoal`, {
        headers: { authorization: `Bearer ${token}` },
      })
      .catch(async function (error) {
        console.log(error);
      });

    console.log(dbstep?.data);
    const dailyStepGoal: number = dbstep?.data.getStep[0].steps_dailygoal;

    //console.log("stepdb", dbstep.data.getStep[0].steps_dailygoal);

    setStepGoal(dailyStepGoal);
  };

  useEffect(() => {
    getStepGoal();
  }, []);

  useEffect(() => {
    const progress = stepGoal ? stepsProgress / stepGoal : 0;
    setProgress(progress);
    //console.log("%", progress);
  }, [stepGoal, stepsProgress]);

  return (
    <View style={styles.card}>
      <View style={styles.header} className="justify-between">
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Steps Today</Text>
        <FontAwesome5
          name="plus"
          size={20}
          color="black"
          onPress={() => {
            handleOpenGoalDialog();
          }}
        />
      </View>
      <View className="flex-col justify-center items-center">
        <View className="mt-6 flex-row mx-5 items-center justify-center">
          <FontAwesome5 name="shoe-prints" size={32} color="green" />
          <GetStepsToday onStepsUpdate={handleStepsUpdate} />
        </View>
        <View className="mx-3">
          <Progress.Bar
            className="mt-3"
            progress={progress}
            width={150}
            animated
            unfilledColor="#eee"
            color="#369967"
          />
        </View>
      </View>
      <GoalDialog
        isOpen={isGoalDialogOpen}
        onClose={handleCloseGoalDialog}
        setStepGoal={setStepGoal}
      />
      <View className="flex-row justify-center items-center mt-2">
        {stepGoal !== null ? (
          <Text className="text-slate-500">Daily Goal: {stepGoal}</Text>
        ) : (
          <Text className="text-slate-500">Loading...</Text>
        )}
      </View>
    </View>
  );
};

const ExerciseDialog = (props: {
  isOpen: boolean;
  onClose: () => void;
  addNewExercise: (exercise: ExInfo) => void;
}) => {
  const { isOpen, onClose, addNewExercise } = props;
  const cancelRef = useRef(null);
  const [startDate, setStartDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [endDate, setEndDate] = useState(
    new Date(startDate.getTime() + 3600 * 1000)
  );
  const [openEnd, setOpenEnd] = useState(false);

  const handleStartDate = (startDate: Date) => {
    setOpen(false);
    setStartDate(startDate);
    setExHist({ ...exHist, start_time: startDate });
  };

  const handleEndDate = (endDate: Date) => {
    setOpenEnd(false);
    setEndDate(endDate);
    setExHist({ ...exHist, end_time: endDate });
  };

  const [exInput, setExInput] = useState<string>("");
  const handleChange = (input: string) => {
    setExInput(input);
    setExHist({ ...exHist, event_name: input });
  };

  const [exHist, setExHist] = useState<ExHist>({
    event_name: "",
    start_time: new Date(),
    end_time: new Date(startDate.getTime() + 3600 * 1000),
  });

  const handleSetEx = async () => {
    let exHistData = exHist;
    const { event_name, start_time, end_time } = exHist;
    const event_duration = Math.ceil(
      (new Date(end_time).getTime() - new Date(start_time).getTime()) / 3600000
    );

    if (exHistData.end_time.getTime() < exHistData.start_time.getTime()) {
      return Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: `Wrong Date Input`,
        textBody: "please check your end time and start time",
        button: "close",
        autoClose: 5000,
      });
    }
    await axios.post(`${Domain}/user/exerciseHistory`, exHistData).then(
      (response) => {
        if (response.data.error) {
          return Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: `Error`,
            textBody: `${response.data.error}`,
            button: "close",
            autoClose: 5000,
          });
        } else if (response.data) {
          console.log("exHist", response.data);
          console.log({
            event_name,
            event_duration,
            burnt_calories: response.data.burntCalories,
          });
          addNewExercise({
            event_name,
            event_duration,
            burnt_calories: response.data.burntCalories,
          });
          return Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: `Burnt Calories Calculated`,
            textBody: "",
            button: "close",
            autoClose: 5000,
          });
        }
      },
      (error: any) => {
        //console.log("error", error.response.data.message);
        return Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: `Error`,
          textBody: `Activity should not be empty`,
          button: "close",
          autoClose: 5000,
        });
      }
    );
    onClose();
    setExInput("");
    setStartDate(new Date());
    setEndDate(new Date(startDate.getTime() + 3600 * 1000));
  };

  return (
    <View>
      <AlertNotificationRoot>
        <AlertDialog
          leastDestructiveRef={cancelRef}
          isOpen={isOpen}
          onClose={onClose}
          size="xl"
        >
          <AlertDialog.Content>
            <AlertDialog.CloseButton />
            <AlertDialog.Header borderBottomWidth={0} className="flex-row">
              Exercise History
              <View className="mx-2">
                <MaterialIcons name="fitness-center" size={24} color="black" />
              </View>
            </AlertDialog.Header>
            <AlertDialog.Body className="mb-3">
              <Input
                variant="rounded"
                size="xl"
                placeholder="Your activity"
                className="items-center justify-center text-center"
                value={exInput}
                onChangeText={handleChange}
              />
              <View className="flex-col items-center justify-center">
                <View className="flex-row mt-3 mb-3">
                  <Text className="text-lg">Start Time: </Text>
                  <TouchableOpacity onPress={() => setOpen(true)}>
                    <Text className="text-blue-400 text-2xl">{`${startDate.toLocaleTimeString()}`}</Text>
                  </TouchableOpacity>
                </View>
                <DatePicker
                  modal
                  open={open}
                  date={startDate}
                  onConfirm={handleStartDate}
                  onCancel={() => {
                    setOpen(false);
                  }}
                  title={"Start Time"}
                />
                <View className="flex-row ml-1">
                  <Text className="text-lg">End Time: </Text>
                  <TouchableOpacity onPress={() => setOpenEnd(true)}>
                    <Text className="text-pink-400 text-2xl ml-1">{`${endDate.toLocaleTimeString()}`}</Text>
                  </TouchableOpacity>
                </View>
                <DatePicker
                  modal
                  open={openEnd}
                  date={endDate}
                  onConfirm={handleEndDate}
                  onCancel={() => {
                    setOpenEnd(false);
                  }}
                  title={"End Time"}
                />
              </View>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button onPress={handleSetEx}>Update</Button>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      </AlertNotificationRoot>
    </View>
  );
};

export const CardExercise = (props: {
  exInfo: ExInfo[];
  addNewExercise: (exercise: ExInfo) => void;
}) => {
  const { exInfo, addNewExercise } = props;
  const [isExDialogOpen, setIsExDialogOpen] = useState(false);

  const handleOpenExDialog = () => {
    setIsExDialogOpen(true);
  };

  const handleCloseExDialog = () => {
    setIsExDialogOpen(false);
  };

  const ExerciseItem = (props: { exercise: ExInfo }) => {
    const { event_name, event_duration, burnt_calories } = props.exercise;
    return (
      <View>
        <Text>
          {event_name} {"     "}
          <MaterialIcons name="timer" size={12} color="#5488a5" />
          {event_duration}hr {"     "}{" "}
          <MaterialIcons
            name="local-fire-department"
            size={15}
            color="#ed7377"
          />
          {parseFloat(burnt_calories).toFixed(2)}
          cal
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.card} className="mx-auto">
      <View style={styles.header} className="justify-between">
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>Exercise</Text>
        <View className="mx-1">
          <FontAwesome5
            name="plus"
            size={20}
            color="black"
            onPress={() => {
              handleOpenExDialog();
            }}
          />
        </View>
      </View>
      {exInfo.length === 0 ? (
        <Text className="mt-10 self-center">
          No Exercise Today{" "}
          <FontAwesome5 name="grin-beam-sweat" size={18} color="black" />
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {exInfo.map((exercise) => {
            return (
              <View className="flex self-center ml-6 mb-5 mt-1">
                <ExerciseItem
                  key={exInfo.indexOf(exercise)}
                  exercise={exercise}
                />
              </View>
            );
          })}
        </ScrollView>
      )}
      <ExerciseDialog
        isOpen={isExDialogOpen}
        onClose={handleCloseExDialog}
        addNewExercise={addNewExercise}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 150,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 15,
    elevation: 15,
    padding: 10,
    //shadowColor: "#000",
    //shadowOffset: { width: 0, height: 3 },
    //shadowOpacity: 0.5,
    //shadowRadius: 5,
  },

  header: {
    flexDirection: "row",
  },

  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
  },
});
