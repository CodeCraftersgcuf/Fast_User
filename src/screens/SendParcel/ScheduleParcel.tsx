
"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";
import { colors } from "../../constants/colors";
import { DateTimePicker } from "../../components/DateTimePicker";
import { useOrder } from "../../contexts/OrderContext";
import type { SendParcelStackParamList } from "../../types/navigation";


//Code related to the integration
import { CreateParcelStep1 } from "../../utils/mutations/accountMutations";
import { useMutation } from "@tanstack/react-query";
import { getFromStorage } from "../../utils/storage";
import Toast from "react-native-toast-message";
import moment from "moment"; // make sure moment is installed



type ScheduleParcelNavigationProp = NativeStackNavigationProp<
  SendParcelStackParamList,
  "ScheduleParcel"
>;

export default function ScheduleParcel() {
  const [token, setToken] = useState<string | null>(null); // State to hold the token

  const navigation = useNavigation<ScheduleParcelNavigationProp>();
  const { deliveryDetails, updateDeliveryDetails } = useOrder();
  const [selectedDateTime, setSelectedDateTime] = useState<string>(
    deliveryDetails.scheduleDateTime || ""
  );
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);

  // Fetch the token and user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const fetchedToken = await getFromStorage("authToken");
      setToken(fetchedToken);
      console.log("🔹 Retrieved Token:", fetchedToken);
    };

    fetchUserData();
  }, []);

  console.log("DeliveryDetail: ", deliveryDetails);

  const { mutate: createStepOneParcel, isPending: isCreating } = useMutation({
    mutationFn: async (payload: any) => {
      if (!token) throw new Error("Token not found");
      return await CreateParcelStep1({ data: payload, token });
    },
    onSuccess: (response) => {
      console.log("✅ Raw Response:", response);

      try {
        const parsed =
          typeof response === "string" ? JSON.parse(response.split("\n").pop() || "") : response;

        console.log("✅ Parsed JSON:", parsed);

        const parcelId = parsed?.data?.id;

        console.log("Parcel Step 1 created:", parcelId);

        Toast.show({
          type: "success",
          text1: "Step 1 Completed",
          text2: "Proceeding to sender/receiver details",
        });

        if (parcelId) {
          navigation.navigate("SenderReceiverDetails", { parcelId });
        }
      } catch (e) {
        console.error("❌ Failed to parse response:", e);
      }
    },

    onError: (error: any) => {
      console.error("❌ Parcel Step 1 failed:", error);
      Toast.show({
        type: "error",
        text1: "Failed to create parcel",
        text2: "Please check the form and try again.",
      });
    },
  });


  const handleDateTimeSelect = (dateTime: string) => {
    setSelectedDateTime(dateTime);
    updateDeliveryDetails({ scheduleDateTime: dateTime });
    console.log("The Date:", selectedDateTime);
    setIsDateTimePickerVisible(false);
  };

  const handleProceed = () => {
    if (!selectedDateTime || !token) return;

    // Parse the custom format like: "Thu, Apr 10 - 11:30 AM"
    const parsed = moment(selectedDateTime, "ddd, MMM DD - hh:mm A");

    if (!parsed.isValid()) {
      Toast.show({
        type: "error",
        text1: "Invalid date",
        text2: "Unable to parse selected date",
      });
      return;
    }

    const latestDetails = { ...deliveryDetails };

    console.log("🟡 Live DeliveryDetails:", latestDetails);

    const payload = {
      sender_address: latestDetails.senderAddress,
      receiver_address: latestDetails.receiverAddress,
      is_scheduled: true,
      scheduled_date: parsed.format("YYYY-MM-DD"),
      scheduled_time: parsed.format("HH:mm"),
    };

    console.log("The PayLoad", payload);
    createStepOneParcel(payload);

  };



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Parcel</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          {[1, 2, 3, 4].map((step, index) => (
            <React.Fragment key={step}>
              <View
                style={[
                  styles.stepCircle,
                  step === 1 ? styles.activeStep : styles.inactiveStep,
                ]}
              >
                <Text
                  style={[
                    styles.stepText,
                    step !== 1 && styles.inactiveStepText,
                  ]}
                >
                  {step}
                </Text>
              </View>
              {index < 3 && (
                <View
                  style={[
                    styles.stepLine,
                    step < 1 ? styles.activeLine : styles.inactiveLine,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Choose Date & Time</Text>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setIsDateTimePickerVisible(true)}
        >
          <Text style={styles.dateTimeButtonText}>
            {selectedDateTime || "Select date & time"}
          </Text>
          <Icon
            name="calendar-outline"
            size={24}
            color={colors.text.secondary}
          />
        </TouchableOpacity>

        {/* Sender Location */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.senderIconContainer}>
              <Icon name="locate" size={24} color="white" />
            </View>
            <Text style={styles.locationTitle}>Sender Location</Text>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Location"
              value={deliveryDetails.senderAddress}
              editable={false}
            />
          </View>

          <View style={styles.addressButtons}>
            <TouchableOpacity style={styles.addressButton}>
              <Icon name="home-outline" size={20} color={colors.text.primary} />
              <Text style={styles.addressButtonText}>Choose Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addressButton}>
              <Icon
                name="briefcase-outline"
                size={20}
                color={colors.text.primary}
              />
              <Text style={styles.addressButtonText}>Choose Work</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dotted Line Connector */}
        <View style={styles.connectorContainer}>
          <View style={styles.dottedLine} />
        </View>

        {/* Receiver Location */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.receiverIconContainer}>
              <Icon name="locate" size={24} color="white" />
            </View>
            <Text style={styles.locationTitle}>Receiver Location</Text>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Location"
              value={deliveryDetails.receiverAddress}
              editable={false}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.proceedButton,
          (!selectedDateTime || isCreating) && styles.proceedButtonDisabled, // Disable if no date or loading
        ]}
        onPress={handleProceed}
        disabled={!selectedDateTime || isCreating} // Disable button during mutation
      >
        <Text style={styles.proceedButtonText}>
          {isCreating ? "Creating Parcel..." : "Proceed"}
        </Text>
      </TouchableOpacity>


      <DateTimePicker
        isVisible={isDateTimePickerVisible}
        onClose={() => setIsDateTimePickerVisible(false)}
        onSelect={handleDateTimeSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
  },
  progressTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  activeStep: {
    backgroundColor: "#800080",
  },
  inactiveStep: {
    backgroundColor: "#DDDDDD",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  inactiveStepText: {
    color: "#666666",
  },
  stepLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 4,
  },
  activeLine: {
    backgroundColor: "#800080",
  },
  inactiveLine: {
    backgroundColor: "#DDDDDD",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 10,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 24,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: "#333333",
  },
  locationCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 2,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  senderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00A651",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  receiverIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF0000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#333333",
  },
  addressButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  addressButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  addressButtonText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  connectorContainer: {
    alignItems: "center",
    marginVertical: 8,
    position: "relative",
    left: 20,
  },
  dottedLine: {
    height: 40,
    borderLeftWidth: 1,
    borderStyle: "dashed",
    borderColor: "#AAAAAA",
    marginRight: "90%",
  },
  proceedButton: {
    backgroundColor: "#800080",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
