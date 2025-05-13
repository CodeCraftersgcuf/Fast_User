
"use client"

import React from "react"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Modal } from "react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import Icon from "react-native-vector-icons/Ionicons"
import type { SendParcelStackParamList } from "../../types/navigation"
import { DeliveryFeeModal } from "../../components/Delivery/DeliveryFeeModal"
import { FeeModal } from "../../components/Delivery/FeeModal"
import { ReceiverModal } from "../../components/Delivery/ReceiverModal"
import { useOrder } from "../../contexts/OrderContext"
import { useRoute } from "@react-navigation/native"

type PaymentDetailsNavigationProp = NativeStackNavigationProp<SendParcelStackParamList, "PaymentDetails">

//Code realted to the integration
import { CreateParcelStep4 } from "../../utils/mutations/accountMutations"
import { useMutation } from "@tanstack/react-query"
import Toast from "react-native-toast-message";
import { getFromStorage } from "../../utils/storage";
import { parcelBidCreate } from "../../utils/mutations/accountMutations"


interface SelectionOption {
  label: string
  value: string
  icon?: string
}

export default function PaymentDetails() {
  const [token, setToken] = useState<string | null>(null); // State to hold the token
  const route = useRoute();
  const { parcelId } = route.params as { parcelId: number }; // 👈 Get parcelId from navigation
  const navigation = useNavigation<PaymentDetailsNavigationProp>()
  const { deliveryDetails, updateDeliveryDetails } = useOrder()

  const [payer, setPayer] = useState(deliveryDetails.payer || "")
  const [paymentMethod, setPaymentMethod] = useState(deliveryDetails.paymentMethod || "")
  const [isPayOnDelivery, setIsPayOnDelivery] = useState(deliveryDetails.payOnDelivery || false)
  const [amount, setAmount] = useState(deliveryDetails.amount ? deliveryDetails.amount.toString() : "2,500")
  const [deliveryFee, setDeliveryFee] = useState("0")

  const [isPayerModalVisible, setIsPayerModalVisible] = useState(false)
  const [isPaymentMethodModalVisible, setIsPaymentMethodModalVisible] = useState(false)
  const [isDeliverySummaryExpanded, setIsDeliverySummaryExpanded] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isDeliveryFeeModalVisible, setIsDeliveryFeeModalVisible] = useState(false)
  const [isFeeModalVisible, setIsFeeModalVisible] = useState(false)
  const [isReceiverModalVisible, setIsReceiverModalVisible] = useState(false)


  useEffect(() => {
    const fetchUserData = async () => {
      const fetchedToken = await getFromStorage("authToken");
      setToken(fetchedToken);
      console.log("🔹 Retrieved Token:", fetchedToken);
    };

    fetchUserData();
  }, []);

  const { mutate: submitStep4, isPending: isSubmittingStep4 } = useMutation({
    mutationFn: (data: any) =>
      CreateParcelStep4({
        id: parcelId,
        data,
        token: token!,
      }),
    onSuccess: (response) => {
      console.log("✅ Step 4 Response:", response);
      Toast.show({
        type: "success",
        text1: "Payment Info Submitted",
      });

      // 👉 Open modals based on payer/payment method logic
      if (payer === "sender") {
        if (paymentMethod === "wallet") {
          setIsDeliveryFeeModalVisible(true);
        } else if (paymentMethod === "bank_transfer") {
          setIsFeeModalVisible(true);
        }
      } else if (payer === "receiver") {
        setIsReceiverModalVisible(true);
      }
    },
    onError: (error) => {
      console.error("❌ Step 4 Failed:", error);
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: "Please check your payment info and try again.",
      });
    },
  });



  // Update the handleProceed function to navigate to different paths based on payment method
  const handleProceed = () => {
    const parsedAmount = Number.parseFloat(amount.replace(/,/g, ""));
    const parsedDeliveryFee = Number.parseFloat(deliveryFee.replace(/,/g, ""));
    console.log("Inside the Handle Proceed", parsedDeliveryFee);
    // Save to context
    updateDeliveryDetails({
      payer,
      paymentMethod,
      payOnDelivery: isPayOnDelivery,
      amount: isPayOnDelivery ? parsedAmount : 0,
      delivery: parsedDeliveryFee,
    });

    // Just show appropriate modal – mutation will happen after confirm
    if (payer === "sender") {
      if (paymentMethod === "wallet") {
        setIsDeliveryFeeModalVisible(true);
      } else if (paymentMethod === "bank_transfer") {
        setIsFeeModalVisible(true);
      }
    } else if (payer === "receiver") {
      setIsReceiverModalVisible(true);
    }
  };



  // Handle payment method selection
  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method)
    setIsPaymentMethodModalVisible(false)
  }

  // Update the handleDeliveryFeeConfirm function to navigate to SearchRiders

  const handleDeliveryFeeConfirm = () => {
    console.log("🚀 Delivery Fee Confirmed:", amount);
    const parsedAmount = Number.parseFloat(amount.replace(/,/g, ""));
    const parsedDeliveryFee = Number.parseFloat(deliveryFee.replace(/,/g, ""));

    console.log("Hanlde Delivery Fee", parsedDeliveryFee);

    const payload = {
      payer: payer as "sender" | "receiver" | "third-party",
      payment_method: paymentMethod === "bank_transfer" ? "bank" : "wallet",
      pay_on_delivery: isPayOnDelivery,
      amount: isPayOnDelivery ? parsedAmount : 0,  // ✅ This is for POD
      delivery_fee: parsedDeliveryFee,             // ✅ This is what rider earns
    };

    submitStep4(payload, {
      onSuccess: async () => {
        setIsDeliveryFeeModalVisible(false);

        try {
          await parcelBidCreate({
            data: {
              send_parcel_id: parcelId,
              bid_amount: parsedAmount,
            },
            token: token!,
          });

          const navigationParams = {
            amount: amount,
            send_parcel_id: parcelId.toString(),
          };

          console.log("🚀 Navigating to SearchRiders with:", navigationParams);

          navigation.navigate("SearchRiders", navigationParams);
        } catch (error) {
          console.error("❌ Parcel bid creation failed:", error);
        }
      },
    });
  };


  // Update the handleFeeConfirm function to navigate to SearchRider (not SearchRiders)
  const handleFeeConfirm = () => {
    const parsedAmount = Number.parseFloat(amount.replace(/,/g, ""));
    const parsedDeliveryFee = Number.parseFloat(deliveryFee.replace(/,/g, ""));

    console.log("Handle Fee Confirm Inside.", parsedDeliveryFee);

    const payload = {
      payer: payer as "sender" | "receiver" | "third-party",
      payment_method: paymentMethod === "bank_transfer" ? "bank" : "wallet",
      pay_on_delivery: isPayOnDelivery,
      amount: isPayOnDelivery ? parsedAmount : 0,
      delivery_fee: parsedDeliveryFee,
    };

    submitStep4(payload, {
      onSuccess: async () => {
        setIsFeeModalVisible(false);

        try {
          await parcelBidCreate({
            data: {
              send_parcel_id: parcelId,
              bid_amount: parsedDeliveryFee,
            },
            token: token!,
          });

          navigation.navigate("SearchRiders", {
            amount: deliveryFee,
            send_parcel_id: parcelId.toString(),
          });
        } catch (error) {
          console.error("❌ Parcel bid creation failed:", error);
        }
      },
    });
  };



  // Update the handleReceiverConfirm function to navigate to SearchRider
  const handleReceiverConfirm = () => {
    console.log("🚀 Delivery Fee Confirmed:", amount);
    const parsedAmount = Number.parseFloat(amount.replace(/,/g, ""));
    const parsedDeliveryFee = Number.parseFloat(deliveryFee.replace(/,/g, ""));


    console.log("This is being called:", parsedDeliveryFee);
    const payload = {
      payer: payer as "sender" | "receiver" | "third-party",
      payment_method: paymentMethod === "bank_transfer" ? "bank" : "wallet",
      pay_on_delivery: isPayOnDelivery,
      amount: parsedAmount,
      delivery_fee: parsedDeliveryFee,
    };

    submitStep4(payload, {
      onSuccess: async () => {
        setIsDeliveryFeeModalVisible(false);

        try {
          await parcelBidCreate({
            data: {
              send_parcel_id: parcelId,
              bid_amount: parsedAmount,
            },
            token: token!,
          });

          const navigationParams = {
            amount: amount,
            send_parcel_id: parcelId.toString(),
          };

          console.log("🚀 Navigating to SearchRiders with:", navigationParams);

          navigation.navigate("SearchRiders", navigationParams);
        } catch (error) {
          console.error("❌ Parcel bid creation failed:", error);
        }
      },
    });
  };


  // Handle amount change
  const handleAmountChange = (value: string) => {
    setAmount(value)
  }
  const handleDeliveryFee = (value: string) => {
    console.log("Amount Change.. of the Delivery...");
    console.log(deliveryFee);
    setDeliveryFee(value);
    console.log(deliveryFee);

  }
  const SelectionModal = ({
    visible,
    onClose,
    title,
    options,
    selectedValue,
    onSelect,
  }: {
    visible: boolean
    onClose: () => void
    title: string
    options: SelectionOption[]
    selectedValue: string
    onSelect: (value: string) => void
  }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalOptions}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => {
                  onSelect(option.value)
                  onClose()
                }}
              >
                {option.icon && <Icon name={option.icon} size={24} color="#000000" style={styles.optionIcon} />}
                <Text style={styles.optionLabel}>{option.label}</Text>
                <View style={[styles.radioOuter, selectedValue === option.value && styles.radioOuterSelected]}>
                  {selectedValue === option.value && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  )

  const SuccessModal = () => (
    <Modal visible={showSuccessModal} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.successModalContent}>
          <Text style={styles.successModalTitle}>Ride Schedule</Text>
          <View style={styles.successIconContainer}>
            <View style={styles.successIconOuter}>
              <View style={styles.successIconInner}>
                <Icon name="checkmark" size={40} color="white" />
              </View>
            </View>
          </View>
          <Text style={styles.successModalText}>
            Your ride has been scheduled successfully, you will recieve a notification when it is time
          </Text>
          <TouchableOpacity style={styles.viewDetailsButton} onPress={() => navigation.navigate("DeliverySummary")}>
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Parcel</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            {[1, 2, 3, 4].map((step, index) => (
              <React.Fragment key={step}>
                <View style={[styles.stepCircle, step <= 4 ? styles.activeStep : styles.inactiveStep]}>
                  <Text style={[styles.stepText, step > 4 && styles.inactiveStepText]}>{step}</Text>
                </View>
                {index < 3 && <View style={[styles.stepLine, step < 4 ? styles.activeLine : styles.inactiveLine]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Who is paying for the delivery ?</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setIsPayerModalVisible(true)}>
            <Text style={payer ? styles.selectButtonText : styles.selectButtonPlaceholder}>
              {payer ? (payer === "sender" ? "Sender" : "Receiver") : "Select who pays for the delivery"}
            </Text>
            <Icon name="chevron-down" size={24} color="#999999" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Payment method</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setIsPaymentMethodModalVisible(true)}>
            <Text style={paymentMethod ? styles.selectButtonText : styles.selectButtonPlaceholder}>
              {paymentMethod ? (paymentMethod === "wallet" ? "Wallet" : "Bank Transfer") : "Choose payment method"}
            </Text>
            <Icon name="chevron-down" size={24} color="#999999" />
          </TouchableOpacity>

          {paymentMethod === "wallet" && (
            <View style={styles.walletBalance}>
              <Icon name="wallet-outline" size={24} color="white" />
              <Text style={styles.walletBalanceText}>N 200,000</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Is this Pay on delivery ?</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity style={styles.radioOption} onPress={() => setIsPayOnDelivery(true)}>
              <View style={[styles.radioOuter, isPayOnDelivery && styles.radioOuterSelected]}>
                {isPayOnDelivery && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.radioOption} onPress={() => setIsPayOnDelivery(false)}>
              <View style={[styles.radioOuter, !isPayOnDelivery && styles.radioOuterSelected]}>
                {!isPayOnDelivery && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>No</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Type Amount"
            placeholderTextColor="#999999"
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
          />

          {isPayOnDelivery && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                If you choose pay on delivery, the money for the package will be collected at the point of delivery and
                will be credited to your wallet automatically upon delivery
              </Text>
            </View>
          )}
          <View style={styles.summaryContainer}>

            <TouchableOpacity
              style={styles.summaryButton}
              onPress={() => setIsDeliverySummaryExpanded(!isDeliverySummaryExpanded)}
            >
              <Text style={styles.summaryButtonText}>Delivery Summary</Text>
              <Icon name={isDeliverySummaryExpanded ? "chevron-up" : "chevron-down"} size={24} color="#000000" />
            </TouchableOpacity>

            {isDeliverySummaryExpanded && (
              <View style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <View style={styles.summaryAddressItem}>
                    <Icon name="location" size={20} color="#00A651" />
                    <View style={styles.summaryAddressContent}>
                      <Text style={styles.summaryLabel}>Sender Address</Text>
                      <Text style={styles.summaryValue}>
                        {deliveryDetails.senderAddress ||
                          "No 1, alobalowo street, off saki iseyin express way, Iseyin,Oyo"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryAddressItem}>
                    <Icon name="location" size={20} color="#FF0000" />
                    <View style={styles.summaryAddressContent}>
                      <Text style={styles.summaryLabel}>Receiver Address</Text>
                      <Text style={styles.summaryValue}>
                        {deliveryDetails.receiverAddress ||
                          "No 1, alobalowo street, off saki iseyin express way, Iseyin,Oyo"}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.summaryDetails}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Sender Name</Text>
                    <Text style={styles.summaryValue}>{deliveryDetails.senderName || "Qamardeen Malik"}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Sender Phone</Text>
                    <Text style={styles.summaryValue}>{deliveryDetails.senderPhone || "07030123456"}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Receiver Name</Text>
                    <Text style={styles.summaryValue}>{deliveryDetails.receiverName || "Adebisi Lateefat"}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Receiver Phone</Text>
                    <Text style={styles.summaryValue}>{deliveryDetails.receiverPhone || "07031234567"}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Parcel Name</Text>
                    <Text style={styles.summaryValue}>{deliveryDetails.parcelName || "Samsung Phone"}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Parcel Category</Text>
                    <Text style={styles.summaryValue}>{deliveryDetails.parcelCategory || "Electronics"}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Parcel Value</Text>
                    <Text style={styles.summaryValue}>{deliveryDetails.parcelValue || "100,000 - 200,000"}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Description</Text>
                    <Text style={styles.summaryValue}>{deliveryDetails.description || "Nil"}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.proceedButton, (!payer || !paymentMethod) && styles.proceedButtonDisabled]}
          onPress={handleProceed}
          disabled={!payer || !paymentMethod}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>

      <SelectionModal
        visible={isPayerModalVisible}
        onClose={() => setIsPayerModalVisible(false)}
        title="Select Who Pays"
        options={[
          { label: "Sender", value: "sender" },
          { label: "Receiver", value: "receiver" },
        ]}
        selectedValue={payer}
        onSelect={setPayer}
      />

      <SelectionModal
        visible={isPaymentMethodModalVisible}
        onClose={() => setIsPaymentMethodModalVisible(false)}
        title="Select Payment Method"
        options={[
          { label: "Wallet", value: "wallet", icon: "wallet-outline" },
          { label: "Bank Transfer", value: "bank_transfer", icon: "business-outline" },
        ]}
        selectedValue={paymentMethod}
        onSelect={handlePaymentMethodSelect}
      />

      {/* Different modals for different payment flows */}
      <DeliveryFeeModal
        visible={isDeliveryFeeModalVisible}
        onClose={() => setIsDeliveryFeeModalVisible(false)}
        onConfirm={handleDeliveryFeeConfirm}
        amount={deliveryFee}
        onAmountChange={handleDeliveryFee}
      />

      <FeeModal
        visible={isFeeModalVisible}
        onClose={() => setIsFeeModalVisible(false)}
        onConfirm={handleFeeConfirm}
        amount={deliveryFee}
        onAmountChange={handleDeliveryFee}
      />

      <ReceiverModal
        visible={isReceiverModalVisible}
        onClose={() => setIsReceiverModalVisible(false)}
        onConfirm={handleReceiverConfirm}
        amount={amount}
      />

      <SuccessModal />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 25,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  summaryContainer:{
    backgroundColor: "white",
    marginTop: 20,
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
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
    marginTop: 16,
  },
  selectButton: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectButtonText: {
    fontSize: 16,
    color: "#333333",
  },
  selectButtonPlaceholder: {
    fontSize: 16,
    color: "#999999",
  },
  walletBalance: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#800080",
    padding: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  walletBalanceText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  radioGroup: {
    backgroundColor: "white",
    flexDirection: "row",
    padding: 18,
    borderRadius: 8,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: "#800080",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#800080",
  },
  radioLabel: {
    fontSize: 16,
    color: "#333333",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
  },
  infoBox: {
    backgroundColor: "#FFF9E5",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  summaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    // borderWidth: 1,
    // borderColor: "#EEEEEE",
    marginBottom: 10,
  },
  summaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  summaryContent: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    // marginTop: 8,
    marginBottom: 40,
  },
  summaryItem: {
    marginBottom: 16,
  },
  summaryAddressItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  summaryAddressContent: {
    flex: 1,
    marginLeft: 8,
  },
  summaryDivider: {
    // height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },
  summaryDetails: {
    marginTop: 16,
    borderWidth: .5,
    borderStyle: "dashed",
    borderColor: "#C3C3C3",
    padding: 10,
    borderRadius: 10
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#00000080",
  },
  summaryValue: {
    fontSize: 11,
    color: "#333333",
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F5F5F5",
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  modalOptions: {
    padding: 16,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },
  successModalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 24,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 128, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  successIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "green",
    alignItems: "center",
    justifyContent: "center",
  },
  successModalText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  viewDetailsButton: {
    backgroundColor: "#800080",
    width: "100%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  viewDetailsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})

