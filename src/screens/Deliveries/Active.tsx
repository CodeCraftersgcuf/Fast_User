
"use client"

import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/Ionicons"
import { colors } from "../../constants/colors"
import { useState } from "react";

interface DeliveryItem {
  id: string;
  status: "In transit" | "Picked up" | "Order";
  fromAddress: string;
  userId: string;
  toAddress: string;
  orderTime: string;
  deliveryTime: string;
  rider: {
    id: string;
    name: string;
    avatar: any;
    rating: number;
    phone: string
  };
}

interface ActiveDeliveriesProps {
  deliveries: DeliveryItem[];
}

//Code Related to the Integration;
import { useQuery } from "@tanstack/react-query"
import { getParcelList } from "../../utils/queries/accountQueries";
import { getFromStorage } from "../../utils/storage";
import Loader from "../../components/Loader";
import { ContactReceiverPopup } from "../../components/ContactReceiverPopup"



const ActiveDeliveries = ({ deliveries }: ActiveDeliveriesProps) => {
  const navigation = useNavigation();
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);
  const onChatPress = (item: DeliveryItem) => {
    setSelectedDelivery(item);
    console.log("Chat Clicked", item);
    navigation.navigate(
      "ChatRoom",
      { chatId: item?.rider.id },
    );
  };
  // const handleDeliveryPress = (delivery: DeliveryItem) => {
  //   // Navigate to RideDetailsMap screen with the delivery ID
  //   navigation.navigate("RideDetailsMap", { deliveryId: delivery.id })
  // }
  const STATUS_ORDER = ["ordered", "picked_up", "in_transit", "delivered"];
  const STATUS_PICKED_UP = ["picked_up", "in_transit", "delivered"];
  const STATUS_IN_TRANSIT = ["in_transit", "delivered"];
  const STATUS_DELIVERED = ["delivered"];

  // const isDotActive = (current: string, stage: string) => {
  //   console.log("Current:", current, "Stage:", stage);
  //   const stages = {
  //     picked_up: STATUS_PICKED_UP,
  //     in_transit: STATUS_IN_TRANSIT,
  //     delivered: STATUS_DELIVERED,
  //   };
  //   return stages[stage]?.includes(current);
  // };
  const statusStages = ["Order", "picked_up", "in_transit", "Delivered"];

  const getStatusIndex = (status: string) => statusStages.indexOf(status);

  const isDotActive = (currentStatus: string, stage: string) => {
    console.log("Current Status:", currentStatus, "Stage:", stage);
    return getStatusIndex(currentStatus) >= getStatusIndex(stage);
  };

  const isLineActive = (currentStatus: string, nextStage: string) => {
    console.log("Current Status:", currentStatus, "Next Stage:", nextStage,"for line");
    return getStatusIndex(currentStatus) >= getStatusIndex(nextStage);
  };
  const isStepActive = (current: string, stage: string) => {
    return isDotActive(current, stage) ? styles.activeLine : styles.inactiveLine;
  };
  const handleDeliveryPress = (delivery: DeliveryItem) => {
    console.log("Delivery ID:", delivery.id);
    navigation.navigate("DeliveryDetails", { delivery: delivery })
  }
  const handleRidePress = (delivery: DeliveryItem) => {
    const selectedParcel = delivery;
    navigation.navigate("RidesDetails", { rideId: delivery.id, parcel: selectedParcel });
  }
  const renderDeliveryItem = ({ item }: { item: DeliveryItem }) => (
    <TouchableOpacity style={styles.deliveryCard} onPress={() => handleRidePress(item)}>
      <View style={styles.deliveryHeader}>
        <Text style={styles.orderId}>{item.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.addressContainer}>
        <View style={styles.addressColumn}>
          <Text style={styles.addressLabel}>From</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.fromAddress}
          </Text>

          <Text style={styles.timeLabel}>Time of Order</Text>
          <Text style={styles.timeText}>{item.orderTime}</Text>
        </View>

        <View style={styles.addressColumn}>
          <Text style={styles.addressLabel}>To</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.toAddress}
          </Text>

          <Text style={styles.timeLabel}>Estimated Delivery</Text>
          <Text style={styles.timeText}>{item.deliveryTime}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        {/* Step 1: Order */}
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, isDotActive(item.status, "order") ? styles.activeDot : styles.inactiveDot]}>
            {isDotActive(item.status, "order") && <View style={styles.innerDot} />}
          </View>
          <Text style={styles.progressText}>Order</Text>
        </View>

        <View style={[styles.progressLine, isLineActive(item.status, "picked_up") ? styles.activeLine : styles.inactiveLine]} />

        {/* Step 2: Picked up */}
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, isDotActive(item.status, "picked_up") ? styles.activeDot : styles.inactiveDot]}>
            {isDotActive(item.status, "picked_up") && <View style={styles.innerDot} />}
          </View>
          <Text style={styles.progressText}>Picked up</Text>
        </View>

        <View style={[styles.progressLine, isLineActive(item.status, "in_transit") ? styles.activeLine : styles.inactiveLine]} />

        {/* Step 3: In transit */}
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, isDotActive(item.status, "in_transit") ? styles.activeDot : styles.inactiveDot]}>
            {isDotActive(item.status, "in_transit") && <View style={styles.innerDot} />}
          </View>
          <Text style={styles.progressText}>In transit</Text>
        </View>

        <View style={[styles.progressLine, isLineActive(item.status, "Delivered") ? styles.activeLine : styles.inactiveLine]} />

        {/* Step 4: Delivered */}
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, isDotActive(item.status, "Delivered") ? styles.activeDot : styles.inactiveDot]}>
            {isDotActive(item.status, "Delivered") && <View style={styles.innerDot} />}
          </View>
          <Text style={styles.progressText}>Delivered</Text>
        </View>
      </View>



      <View style={styles.riderContainer}>
        <Image source={item.rider.avatar} style={styles.riderAvatar} />
        <View style={styles.riderInfo}>
          <Text style={styles.riderName}>{item.rider.name}</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name={star <= item.rider.rating ? "star" : "star-outline"}
                size={16}
                color={colors.primary}
              />
            ))}
          </View>
        </View>
        <View style={styles.riderActions}>
          <TouchableOpacity style={styles.riderAction}>
            <Icon name="chatbubble-outline" size={20} color={colors.primary} onPress={() => onChatPress(item)} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.riderAction} onPress={() => setSelectedDelivery(item)}>
            <Icon name="phone-portrait-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.trackButton} onPress={() => handleDeliveryPress(item)}>
        <Text style={styles.trackButtonText}>Track Delivery</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <>
      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      <ContactReceiverPopup
        visible={!!selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        name={selectedDelivery?.rider.name ?? ""}
        phone={selectedDelivery?.rider.phone ?? ""}
        email={""} // or from rider if available
        address={selectedDelivery?.toAddress ?? ""}
        onCall={() => {
          console.log(`Calling ${selectedDelivery?.rider.name}...`);
        }}
      />

    </>

  )
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    padding: 0,
    position: "relative",
  },

  progressStep: {
    flex: 1,
    alignItems: "center",
    zIndex: 2,
  },

  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  activeDot: {
    borderColor: colors.primary,
  },

  inactiveDot: {
    borderColor: "#ccc",
  },

  progressLine: {
    position: "absolute",
    top: 7,
    left: "10%",
    width: "80%",
    height: 2,
    backgroundColor: "#E0E0E0",
    zIndex: 1,
  },

  activeLine: {
    backgroundColor: colors.primary,
  },

  inactiveLine: {
    backgroundColor: "#E0E0E0",
  },

  progressText: {
    fontSize: 10,
    color: "#666666",
    marginTop: 6,
  },

  // progressLine: {
  //   position: "absolute",
  //   top: 10, // align with center of 20px dot
  //   left: "10%",
  //   width: "80%",
  //   height: 2,
  //   zIndex: 1,
  // },

  // activeLine: {
  //   backgroundColor: colors.primary,
  // },

  // inactiveLine: {
  //   backgroundColor: "#ccc",
  // },

  // // inactiveLine: {
  // //   backgroundColor: "#E0E0E0",
  // // },

  // progressText: {
  //   fontSize: 11,
  //   color: "#000",
  //   fontWeight: "500",
  //   marginTop: 6,
  //   textAlign: "center",
  // },

  listContainer: {
    padding: 12,
  },
  deliveryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  addressContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  addressColumn: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: "#000000",
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#000000",
  },
  //   progressContainer: {
  //     flexDirection: "row",
  //     alignItems: "center",
  //     justifyContent: "space-between",
  //     marginBottom: 16,
  //   },
  //   progressStep: {
  //     alignItems: "center",
  //   },
  // progressDot: {
  //   width: 16,
  //   height: 16,
  //   borderRadius: 8,
  //   borderWidth: 2,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "#fff",
  // },
  // innerDot: {
  //   width: 8,
  //   height: 8,
  //   borderRadius: 4,
  //   backgroundColor: colors.primary,
  // },

  // activeDot: {
  //   borderColor: colors.primary,
  // },
  // inactiveDot: {
  //   borderColor: "#ccc",
  // },

  //   progressLine: {
  //     flex: 1,
  //     height: 0.3,
  //     marginBottom: 15,
  //   },
  //   activeLine: {
  //     backgroundColor: colors.primary,
  //   },
  //   inactiveLine: {
  //     backgroundColor: "#E0E0E0",
  //   },
  //   progressText: {
  //     fontSize: 10,
  //     color: "#666666",
  //   },
  riderContainer: {
    flexDirection: "row",
    alignItems: "center",
    // borderTopWidth: 1,
    backgroundColor: "#F2F2F2",
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderRadius: 10
  },
  riderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  riderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  riderName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
  },
  riderActions: {
    flexDirection: "row",
  },
  riderAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8E6FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  trackButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
})

export default ActiveDeliveries

