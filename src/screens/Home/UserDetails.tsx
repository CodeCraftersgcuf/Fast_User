import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native"
import { GradientBackground } from "../../components/BackgroundGradient"
import { DeliveryCard } from "../../components/DeliveryCard"
import { Header } from "../../components/Headers"
import { colors } from "../../constants/colors"
import { theme } from "../../constants/theme"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { RootStackParamList } from "../../types"
import { useState } from "react"
import { ContactReceiverPopup } from "../../components/ContactReceiverPopup"

type UserDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "UserDetails">

export default function UserDetails({ route }: { route: any }) {
  const navigation = useNavigation<UserDetailsScreenNavigationProp>()
  const { parcel } = route.params;
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);

  const handleBackPress = () => {
    navigation.goBack()
  }

  const handleDeliveryPress = (orderId: string) => {
    console.log(`Delivery ${orderId} details pressed`)
  }

  const formatStatus = (status: string): "Ordered" | "Picked up" | "In Transit" | "Delivered" => {
    switch (status) {
      case "ordered":
        return "Picked up";
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      default:
        return "Ordered";
    }
  };
 const onChatPress = () => {
    // setSelectedDelivery(item);
    console.log("Chat Clicked", parcel);
    navigation.navigate(
      "ChatRoom",
      { chatId: parcel?.rider.id }
    );
  };
  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : "";
  const formatTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  const timelineData = [
    {
      key: 'ordered_at',
      label: 'Order Received',
      location: parcel.sender_address,
    },
    {
      key: 'picked_up_at',
      label: 'Picked up',
      location: parcel.sender_address,
    },
    {
      key: 'in_transit_at',
      label: 'In transit',
      location: "On the way to destination",
    },
    {
      key: 'delivered_at',
      label: 'Delivered',
      location: parcel.receiver_address,
    },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Delivery Details" showBackButton={true} onBackPress={handleBackPress} light={true} />

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <DeliveryCard
            orderId={`ORD-${parcel.id}`}
            status={formatStatus(parcel.status)}
            fromAddress={parcel.sender_address}
            toAddress={parcel.receiver_address}
            orderTime={new Date(`${parcel.scheduled_date}T${parcel.scheduled_time}`)}
            estimatedDelivery={new Date(parcel.ordered_at)}
            riderName={parcel.rider?.name ?? "Not Assigned"}
            riderRating={parcel.rider?.rating ?? 5}
            onPress={() => handleDeliveryPress(`ORD-${parcel.id}`)}
            onChatPress={ onChatPress} // 👈 trigger modal
            onCallPress={() => setSelectedDelivery(parcel)} // 👈 trigger modal
          />

          <View style={styles.timelineContainer}>
            <Text style={styles.timelineTitle}>Delivery Timeline</Text>

            {timelineData.map((item, index) => {
              const timeValue = parcel[item.key];
              const isLast = index === timelineData.length - 1;
              const isCompleted = !!timeValue;
              const date = formatDate(timeValue);
              const time = formatTime(timeValue);

              return (
                <View key={item.key} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <Text style={styles.timelineDate}>{date}</Text>
                    <Text style={styles.timelineTime}>{time}</Text>
                  </View>
                  <View style={styles.timelineDot}>
                    <View style={[styles.dot, isCompleted ? styles.dotActive : styles.dotInactive]}>
                      {isCompleted && <View style={styles.innerDot} />}
                    </View>
                    {!isLast && <View style={[styles.timelineLine, isCompleted ? styles.lineActive : styles.lineInactive]} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineText}>{item.label}</Text>
                    <Text style={styles.timelineLocation}>{item.location}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <ContactReceiverPopup
    visible={!!selectedDelivery}            
    onClose={() => setSelectedDelivery(null)} // or a dedicated modal toggle if you want to keep this optional
            name={parcel.receiver_name}
            phone={parcel.receiver_phone}
            email={parcel.rider?.email ?? ""}
            address={parcel.receiver_address}
            onCall={() => {
              console.log(`Calling ${parcel.receiver_phone}`);
              // You can also use:
              // Linking.openURL(`tel:${parcel.receiver_phone}`);
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: theme.spacing.xl,
    marginBottom: 110,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  timelineContainer: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: 40,
  },
  timelineTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: colors.black,
    marginBottom: theme.spacing.lg,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  timelineLeft: {
    width: 70,
  },
  timelineDate: {
    fontSize: 12,
    color: "#888",
  },
  timelineTime: {
    fontSize: 12,
    color: "#555",
  },
  timelineDot: {
    width: 30,
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    zIndex: 1,
  },
  dotActive: {
    borderColor: colors.primary,
  },
  dotInactive: {
    borderColor: "#ccc",
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  timelineLine: {
    position: "absolute",
    top: 16,
    width: 2,
    height: 40,
    backgroundColor: "#ccc",
    zIndex: 0,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  lineInactive: {
    backgroundColor: "#ccc",
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
  },
  timelineText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  timelineLocation: {
    fontSize: 10,
    color: "#888",
  },
});
