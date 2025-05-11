
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/Ionicons"
import { colors } from "../../constants/colors"

// Import the tab screens
import ScheduledDeliveries from "./Scheduled"
import ActiveDeliveries from "./Active"
import DeliveredDeliveries from "./Delivered"

import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { DeliveriesStackParamList } from "../../types/navigation"


//Code Related to the Integration
import { useQuery } from "@tanstack/react-query"
import { getFromStorage } from "../../utils/storage"
import { getUserDeiliveryHistory } from "../../utils/queries/accountQueries"
import Loader from "../../components/Loader"

type DeliveryHistoryNavigationProp = NativeStackNavigationProp<DeliveriesStackParamList, "DeliveryMain">


// Define the delivery item type
interface DeliveryItem {
  id: string;
  status: "Scheduled" | "In transit" | "Picked up" | "Delivered";
  fromAddress: string;
  toAddress: string;
  orderTime: string;
  deliveryTime: string;

  // Optional fields for scheduled deliveries
  scheduledDate?: string;
  scheduledTime?: string;

  // Optional fields for active deliveries
  rider?: {
    name: string;
    avatar: any;
    rating: number;
  };
}


const DeliveryHistory = () => {
  const navigation = useNavigation<DeliveryHistoryNavigationProp>()
  const [token, setToken] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"Scheduled" | "Active" | "Delivered">("Active")

  const handleBack = () => {
    navigation.goBack()
  }
  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getFromStorage("authToken");
      setToken(fetchedToken);
      console.log("🔹 Retrieved Token:", fetchedToken);
    };
    fetchToken();
  }, []);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["userDeliveryHistory", token],
    queryFn: () => getUserDeiliveryHistory(token!),
    enabled: !!token,
  });
  const dummyRider = {
    name: "Qamardeen Malik",
    avatar: require("../../assets/images/pp.png"),
    rating: 5,
  };
  const scheduledData: DeliveryItem[] = historyData?.data?.scheduled?.map((item: any) => ({
    id: item.id.toString(),
    status: "Scheduled",
    fromAddress: item.sender_address,
    toAddress: item.receiver_address,
    orderTime: new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    deliveryTime: "Scheduled",
    scheduledDate: item.scheduled_date,
    scheduledTime: item.scheduled_time,
  })) || [];

  const activeData: DeliveryItem[] = historyData?.data?.active?.map((item: any) => ({
    id: item.id.toString(),
    status: item.status === "ordered" ? "Order" : item.status,
    fromAddress: item.sender_address,
    toAddress: item.receiver_address,
    orderTime: new Date(item.ordered_at || item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    deliveryTime: item.delivery_fee + " fee", // or customize
    rider: {
      name: item.accepted_bid?.rider?.name || "Unknown",
      avatar: { uri: `https://fastlogistic.hmstech.xyz/storage/${item.accepted_bid?.rider?.profile_picture}` },
      rating: 5, // replace with actual rating if available
    },
  })) || [];

  const deliveredData: DeliveryItem[] = historyData?.data?.delivered?.map((item: any) => ({
    id: item.id.toString(),
    status: "Delivered",
    fromAddress: item.sender_address,
    toAddress: item.receiver_address,
    orderTime: new Date(item.ordered_at || item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    deliveryTime: new Date(item.delivered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    rider: {
      name: item.accepted_bid?.rider?.name || "Unknown",
      avatar: { uri: `https://fastlogistic.hmstech.xyz/storage/${item.accepted_bid?.rider?.profile_picture}` },
      rating: 5, // or item.accepted_bid?.rider?.rating if available
    },
  })) || [];

  const renderTabContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    const renderEmpty = (message: string) => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );

    switch (activeTab) {
      case "Scheduled":
        return scheduledData.length > 0
          ? <ScheduledDeliveries deliveries={scheduledData} />
          : renderEmpty("No scheduled deliveries found.");

      case "Active":
        return activeData.length > 0
          ? <ActiveDeliveries deliveries={activeData} />
          : renderEmpty("No active deliveries found.");

      case "Delivered":
        return deliveredData.length > 0
          ? <DeliveredDeliveries deliveries={deliveredData} />
          : renderEmpty("No delivered orders found.");

      default:
        return renderEmpty("No deliveries found.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride History</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Scheduled" && styles.activeTab]}
          onPress={() => setActiveTab("Scheduled")}
        >
          <Text style={[styles.tabText, activeTab === "Scheduled" && styles.activeTabText]}>Scheduled</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Active" && styles.activeTab]}
          onPress={() => setActiveTab("Active")}
        >
          <Text style={[styles.tabText, activeTab === "Active" && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Delivered" && styles.activeTab]}
          onPress={() => setActiveTab("Delivered")}
        >
          <Text style={[styles.tabText, activeTab === "Delivered" && styles.activeTabText]}>Delivered</Text>
        </TouchableOpacity>
      </View>

      {renderTabContent()}
    
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    marginBottom: 90,
    zIndex: 999
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
})

export default DeliveryHistory

