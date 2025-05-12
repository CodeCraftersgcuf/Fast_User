
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageStyle,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { DeliveryTimeline } from "../../../components/DeliveryTimeline";
import { RiderProfile } from "../../../components/RiderProfile";
import { colors } from "../../../constants/colors";
import { theme } from "../../../constants/theme";
import { icons } from "../../../constants/icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Parcel } from "../../../types/parcel";
import { ContactReceiverPopup } from "../../../components/ContactReceiverPopup";
import { RatingModal } from "../../../components/Delivery/RatingModal";

const deliveryDetails = {
  senderInfo: [
    { label: "Sender Name", value: "Qamardeen Malik" },
    { label: "Sender Phone", value: "07030123458" },
    { label: "Receiver Name", value: "Adebisi Lateefat" },
    { label: "Receiver Phone", value: "07031234567" },
    { label: "Parcel Name", value: "Samsung Phone" },
    { label: "Parcel Category", value: "Electronics" },
    { label: "Parcel Value", value: "100,000 - 200,000" },
    { label: "Description", value: "Nil" },
  ],
  paymentInfo: [
    { label: "Payer", value: "Sender - Qamardeen Malik" },
    { label: "Payment method", value: "Bank Transfer" },
  ],
  deliveryInfo: [
    { label: "Pay on delivery", value: "Yes" },
    { label: "Amount", value: "N20,000" },
    { label: "Delivery", value: "N2,000" },
  ],
};
type RouteParams = {
  RideSummary: {
    parcel: Parcel;
  };
}
export default function RideSummary() {
  const [isDeliverySummaryExpanded, setIsDeliverySummaryExpanded] =
    useState(true);
  // const [selectedDelivery, setSelectedDelivery] = useState<Parcel | null>(null);
  const [showContactModel, setShowContactModel] = useState(false)
  const route = useRoute<RouteProp<RouteParams, "RideSummary">>();
  const { parcel } = route.params;
  const navigation = useNavigation();
  console.log("Parcel:", parcel);
  const senderAddress =
    "No 1, alobalowo street, off saki iseyin express way, Iseyin,Oyo";
  const receiverAddress =
    "No 1, alobalowo street, off saki iseyin express way, Iseyin,Oyo";
  const senderInfo = [
    { label: "Sender Name", value: parcel.sender_name },
    { label: "Sender Phone", value: parcel.sender_phone },
    { label: "Receiver Name", value: parcel.receiver_name },
    { label: "Receiver Phone", value: parcel.receiver_phone },
    { label: "Parcel Name", value: parcel.parcel_name },
    { label: "Parcel Category", value: parcel.parcel_category },
    { label: "Parcel Value", value: `₦${Number(parcel.parcel_value).toLocaleString()}` },
    { label: "Description", value: parcel.description || "N/A" },
  ]
  const paymentInfo = [
    {
      label: "Payer",
      value:
        parcel.payer === "sender"
          ? `Sender - ${parcel.sender_name}`
          : `Receiver - ${parcel.receiver_name}`,
    },
    {
      label: "Payment method",
      value: parcel.payment_method === "bank_transfer" ? "Bank Transfer" : "Wallet",
    },
  ]
  const deliveryInfo = [
    {
      label: "Pay on delivery",
      value: parcel.pay_on_delivery === "yes" ? "Yes" : "No",
    },
    {
      label: "Amount",
      value:
        parcel.amount && parseFloat(parcel.amount) > 0
          ? `₦${Number(parcel.amount).toLocaleString()}`
          : "₦0",
    },
    {
      label: "Delivery",
      value: `₦${Number(parcel.delivery_fee).toLocaleString()}`,
    },
  ];
  const timelineData = [
    {
      key: "ordered_at",
      label: "Order Received",
      location: parcel.sender_address,
    },
    {
      key: "picked_up_at",
      label: "Picked Up",
      location: parcel.sender_address,
    },
    {
      key: "in_transit_at",
      label: "In Transit",
      location: "Rider is on the way",
    },
    {
      key: "delivered_at",
      label: "Delivered",
      location: parcel.receiver_address,
    },
  ];
const [showRatingModal, setShowRatingModal] = useState(false)
  const handleChatPress = () => {
    console.log("going to chat room with", parcel?.accepted_bid?.rider?.id)
    navigation.navigate("ChatRoom", {
      chatId: parcel?.accepted_bid?.rider?.id,
      rider: parcel?.accepted_bid?.rider,
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>


        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate("RideDetails")}
        >
          <Icon name={icons.back} size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ride Summary</Text>
        <TouchableOpacity style={styles.headerButtons}>
          <Icon
            name="ellipsis-vertical"
            size={26}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.totalSection}>
          <View>
            <Text style={styles.totalAmount}>{(parseFloat(parcel?.amount) + parseFloat(parcel?.delivery_fee)).toLocaleString()}</Text>
          </View>

          <View>
            <Text style={styles.totalLabel}>Total</Text>

            <View style={styles.deliveryFeeNote}>
              <View style={styles.greenDot} />
              <Text style={styles.deliveryFeeText}>
                Delivery fee paid by sender
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.summaryHeader}
            onPress={() =>
              setIsDeliverySummaryExpanded(!isDeliverySummaryExpanded)
            }
          >
            <Text style={styles.summaryTitle}>Delivery Summary</Text>
            <Icon
              name={isDeliverySummaryExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>

          {isDeliverySummaryExpanded && (
            <View style={styles.summaryContent}>
              <View style={styles.addall}>
                {/* Sender Address */}
                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Sender Address</Text>
                  <View style={styles.addressRow}>
                    <Image
                      source={icons.senderLocation}
                      style={styles.icon as ImageStyle}
                    />
                    <View style={styles.dotLine} />
                    <Text style={styles.addressText}>{parcel.sender_address}</Text>
                  </View>
                </View>

                {/* Receiver Address */}
                <View
                  style={[styles.addressContainer, styles.receiverContainer]}
                >
                  <Text style={styles.addressLabel}>Receiver Address</Text>
                  <View style={styles.addressRow}>
                    <Image
                      source={icons.receiverLocation}
                      style={styles.icon as ImageStyle}
                    />
                    <Text style={styles.addressText}>{parcel.receiver_address}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                {/* Sender Information Section */}
                <View style={[styles.detailRow, styles.section]}>
                  {senderInfo.map((item, index) => (
                    <View key={index} style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{item.label}</Text>
                      <Text style={styles.detailValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Payment Information Section */}
                <View style={[styles.detailRow, styles.section]}>
                  {paymentInfo.map((item, index) => (
                    <View key={index} style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{item.label}</Text>
                      <Text style={styles.detailValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Delivery Information Section */}
                <View style={[styles.detailRow, styles.section]}>
                  {deliveryInfo.map((item, index) => (
                    <View key={index} style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{item.label}</Text>
                      <Text style={styles.detailValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
        <View style={styles.bottomContainer}>

          <View style={styles.riderSection}>
            <RiderProfile
              name={parcel.accepted_bid.rider.name}
              rating={5}
              image="/placeholder.svg"
              onChat={() => { handleChatPress() }}
              onCall={() => { setShowContactModel(true) }}
            />

            <View style={styles.rideInfo}>
              <View style={styles.rideDetail}>
                <Icon name={icons.bike} size={20} color={colors.text.primary} />
                <Text style={styles.rideDetailText}>Bike</Text>
              </View>
              <View style={styles.rideDetail}>
                <Image source={icons.color} style={styles.icon as ImageStyle} />
                <Text style={styles.rideDetailText}>Black</Text>
              </View>
              <View style={styles.rideDetail}>
                <Image source={icons.time} style={styles.icon as ImageStyle} />
                <Text style={styles.rideDetailText}>30 min</Text>
              </View>
            </View>
          </View>

          <DeliveryTimeline parcel={parcel} timelineData={timelineData} />
          <TouchableOpacity style={styles.reviewButton} onPress={() => setShowRatingModal(true)}>
          <Text style={styles.reviewButtonText}>Write a review</Text>
        </TouchableOpacity>
      </View>
      <ContactReceiverPopup
        visible={showContactModel}
        onClose={() => setShowContactModel(false)}
        name={parcel?.accepted_bid?.rider.name ?? ""}
        phone={parcel?.accepted_bid?.rider.phone ?? ""}
        email={""} // or from rider if available
        address={parcel?.receiver_address ?? ""}
        onCall={() => {
          console.log(`Calling ${parcel?.accepted_bid?.rider.name}...`);
        }}
      />

<RatingModal
parcelId={parcel.id}
riderId={parcel.accepted_bid.rider.id}
onClose={() => setShowRatingModal(false)}
visible={showRatingModal}
/>
    </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    padding: 16,
    height: 80,
    borderColor: "none",
    backgroundColor: "white",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.white,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerButton: {
    padding: 11,
    borderRadius: theme.borderRadius.round,
    backgroundColor: "#EBEBEB",
  },
  headerButtons: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },

  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "600",
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  totalSection: {
    backgroundColor: colors.white,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    display: "flex",
    flexDirection: "row-reverse",
    borderRadius: 20,
    width: "95%",
    gap: 27,
    justifyContent: 'space-around',
    // margin: "auto",
    marginHorizontal: theme.spacing.sm
  },
  totalLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: theme.spacing.xs,
    fontWeight: "800",
  },
  totalAmount: {
    fontSize: 30,
    fontWeight: "900",
    color: "#800080",
    marginBottom: theme.spacing.sm,
    textAlign: "right",
  },
  deliveryFeeNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'flex-start'
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#008000",
    marginRight: theme.spacing.sm,
  },
  deliveryFeeText: {
    color: "#008000",
    fontSize: 12
  },

  card: {
    backgroundColor: colors.white,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    shadowColor: "#535353",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    width: "94%",
    margin: "auto",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: colors.text.primary,
  },
  summaryContent: {
    padding: theme.spacing.md,
    width: "100%",
  },

  detailsGrid: {
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    width: "100%",
  },
  detailRow: {
    flexDirection: "column",
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  section: {
    borderWidth: 1,
    borderColor: "#C3C3C3",
    borderStyle: "dashed",
    width: "100%",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.xl,
  },
  detailLabel: {
    color: '#00000080',
    fontSize: 11
  },
  detailValue: {
    color: theme.colors.black,
    fontWeight: "bold",
    maxWidth: "80%",
    textAlign: "right",
    fontSize: 11
  },

  riderSection: {
    // backgroundColor: colors.white,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    // elevation: 2,
    width: "94%",
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "center",
  },
  bottomContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 12,
    shadowColor: "#535353",
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 10, // For Android
    borderRadius: 20,
    marginBottom: 140,
    paddingBottom: 20
  },
  rideInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    borderTopWidth: 0,
    borderTopColor: colors.white,
  },
  rideDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  rideDetailText: {
    color: colors.text.primary,
    fontSize: theme.fontSizes.sm,
  },
  reviewButton: {
    backgroundColor: "#800080",
    padding: theme.spacing.md,
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
    // marginVertical: theme.spacing.xl,
    // marginBottom:150

  },
  reviewButtonText: {
    color: colors.white,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
  },

  addressall: {
    backgroundColor: colors.white,
  },
  addressSection: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: colors.white,
  },
  addressContainer: {
    marginBottom: theme.spacing.md,
    backgroundColor: colors.white,
  },
  addressLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    marginLeft: 28,
    fontFamily: Platform.select({ ios: "System", android: "Roboto-Regular" }),
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    marginTop: 2,
    padding: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 22,
    marginLeft: 14,
    fontWeight: "800",
    fontFamily: Platform.select({ ios: "System", android: "Roboto-Regular" }),
  },
  dotLine: {
    position: "absolute",
    left: 5,
    top: 15,
    width: 1,
    height: 80,
    borderStyle: "dotted",
    borderLeftWidth: 2,
    borderColor: "black",
    zIndex: 1
  },
  receiverContainer: {
    marginTop: theme.spacing.sm,
  },
});
