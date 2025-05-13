import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { GradientBackground } from "../../components/BackgroundGradient";
import { ActionButton } from "../../components/ActionButton";
import { PromotionCard } from "../../components/PromotionCard";
import { LocationCard } from "../../components/LocationCard";
import { DeliveryCard } from "../../components/DeliveryCard";
import { colors } from "../../constants/colors";
import { theme } from "../../constants/theme";
import { formatCurrency } from "../../utils/Fomatters";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../types";
import { RefreshControl } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

type UserScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "User"
>;

//Code Related to the Integration
import { useQuery } from "@tanstack/react-query";
import { getFromStorage } from "../../utils/storage";
import { getActiveParcel, getBalance } from "../../utils/queries/accountQueries";
import { ContactReceiverPopup } from "../../components/ContactReceiverPopup";



export default function User() {
  const navigation = useNavigation<UserScreenNavigationProp>();
  const [balance, setBalance] = useState(200000);
  const [location, setLocation] = useState("Lagos, Ng");
  const [activeSlide, setActiveSlide] = useState(0);
  const [userData, setUserData] = useState<any>(null); // You can type this more strictly later
  const [token, setToken] = useState<string | null>(null);
const [refreshing, setRefreshing] = useState(false);
const [showContactModal, setShowContactModal] = useState(false);
const queryClient = useQueryClient();
const onRefresh = async () => {
  try {
    setRefreshing(true);
    await queryClient.invalidateQueries(); // Invalidate all queries
  } catch (error) {
    console.error("Error refreshing data:", error);
  } finally {
    setRefreshing(false);
  }
};



  useEffect(() => {
    const fetchUserData = async () => {
      const fetchedToken = await getFromStorage("authToken");
      const fetchedUser = await getFromStorage("user");

      setUserData(fetchedUser);
      setToken(fetchedToken);

      console.log("🔹 Retrieved Token:", fetchedToken);
      console.log("👤 Retrieved User:", fetchedUser);
    };

    fetchUserData();
  }, []);

  const {
    data: balanceData,
    isLoading: isBalanceLoading
  } = useQuery({
    queryKey: ['walletBalance', token],
    queryFn: () => getBalance(token!),
    enabled: !!token, // Only run the query if token is available
  });

  const {
    data: parceldata,
    isLoading: isParcelLoading
  } = useQuery({
    queryKey: ['activeParcel', token],
    queryFn: () => getActiveParcel(token!),
    enabled: !!token, // Only run the query if token is available
  });
  console.log(parceldata?.data, " active parcel");
  const promotions = [
    {
      id: "1",
      title: "Your Number 1 trusted delivery service",
      description:
        "With Fast you get the best delivery service across the country",
      tag: "Fast Logistics",
      imageUrl: "",
    },
    {
      id: "2",
      title: "Same day delivery guaranteed",
      description:
        "Get your packages delivered on the same day within city limits",
      tag: "Express Delivery",
      imageUrl: "",
    },
    {
      id: "3",
      title: "Affordable rates for all packages",
      description: "Enjoy competitive pricing for all your delivery needs",
      tag: "Best Rates",
      imageUrl: "",
    },
  ];

  const handleActionPress = (action: string) => {
    if (action === "Send Parcel") {
      navigation.navigate("Add" as never);
    } else {
      console.log(`${action} pressed`);
      navigation.navigate("Add", { screen: "DeliveredHistory" })
    }
  };

  const handleNotificationsPress = () => {
    navigation.navigate("Notification")
  }


  const handleParcelPress = (action: string) => {
    if (action === "Schedule") {
      navigation.navigate("Add", { screen: "ScheduleParcel" })
    } else {
      console.log(`${action} pressed`)
    }
  }

  const handleLocationPress = (type: "Home" | "Work") => {
    console.log(`${type} location pressed`);

    navigation.navigate("Add", {
      screen: "AddressScreen",
      params: { section: type },
    });
  };


  const handleDeliveryPress = (parcel: any) => {
    navigation.navigate("UserDetails", { parcel }); // 👈 pass the full parcel object
  };


  const handleTopUp = () => {
    console.log("Top up pressed");
    // Navigate to top up screen
    navigation.navigate("Wallet", { modalType: "topup" })

  };

  const handleWithdraw = () => {
    console.log("Withdraw pressed");
    navigation.navigate("Wallet", { modalType: "withdraw" });

    // Navigate to withdraw screen
  };
  const formatStatus = (status: string): "Ordered" | "Picked up" | "In Transit" | "Delivered" => {
    switch (status) {
      case "ordered":
        return "Ordered"; // or "Ordered" based on your UX
      case "picked_up":
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
    console.log("Chat Clicked");
    navigation.navigate(
      "ChatRoom",
      { chatId: parceldata?.data?.rider?.id },
    );
  };
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
            refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Image
                source={
                  userData?.profile_picture
                    ? { uri: `https://fastlogistic.hmstech.xyz/storage/${userData.profile_picture}` }
                    : require("../../assets/images/pp.png")
                }
                style={styles.avatar}
              />
              <View style={styles.userDetails}>
                <Text style={styles.greeting}>Hi, {userData?.name}</Text>
                <TouchableOpacity style={styles.locationContainer}>
                  <Text style={styles.location}>{location}</Text>
                  <Icon name="chevron-down" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Icon
                name="notifications-outline"
                size={24}
                color={colors.white}

                onPress={handleNotificationsPress}
              />
            </TouchableOpacity>
          </View>

          {/* Balance */}
          <View style={styles.balanceContainer}>
            <View>
              <Text style={styles.balanceAmount}>₦ {Number(balanceData?.balance || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.balanceActions}>
              <TouchableOpacity
                style={styles.balanceButton}
                onPress={handleTopUp}
              >
                <Icon name="arrow-up" size={16} color={colors.text.primary} style={{ transform: [{ rotate: '-315deg' }] }} />
                <Text style={styles.balanceButtonText}>Top Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.balanceButton}
                onPress={handleWithdraw}
              >
                <Icon name="arrow-down" size={16} color={colors.text.primary} style={{ transform: [{ rotate: '-315deg' }] }} />
                <Text style={styles.balanceButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <ActionButton
              icon="bicycle"
              label="Send Parcel"
              onPress={() => handleActionPress("Send Parcel")}
            />
            <ActionButton
              icon="locate"
              label="Track Parcel"
              onPress={() => handleActionPress("Track Parcel")}
            />
            <ActionButton
              icon="time"
              label="Schedule"
              onPress={() => handleParcelPress("Schedule")}
            />
          </View>

          {/* Promotions */}
          <View style={styles.promotionContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const slideIndex = Math.floor(
                  event.nativeEvent.contentOffset.x /
                  event.nativeEvent.layoutMeasurement.width
                );
                setActiveSlide(slideIndex);
              }}
            >
              {promotions.map((promo) => (
                <View key={promo.id} style={styles.promotionSlide}>
                  <PromotionCard
                    title={promo.title}
                    description={promo.description}
                    tag={promo.tag}
                    imageUrl={promo.imageUrl}
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.paginationContainer}>
              {promotions.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === activeSlide && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Pickup Locations */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Pickup Locations</Text>

            <View style={styles.locationsContainer}>
              <View style={styles.locationsButton}>
                <LocationCard
                  type="Home"
                  address="Set home address"
                  onPress={() => handleLocationPress("Home")}
                />
              </View>

              <View style={styles.locationsButton}>
                <LocationCard
                  type="Work"
                  address="Set work address"
                  onPress={() => handleLocationPress("Work")}
                />
              </View>
            </View>

          </View>
          {/* {new Date(parceldata.data.ordered_at)} */}
          {/* Active Deliveries */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Active Deliveries</Text>
            {parceldata?.data && (
              <DeliveryCard
                orderId={`ORD-${parceldata.data.id}`}
                status={formatStatus(parceldata.data.status)} // function explained below
                fromAddress={parceldata.data.sender_address}
                toAddress={parceldata.data.receiver_address}
                orderTime={new Date(`${parceldata.data.scheduled_date}T${parceldata.data.scheduled_time}`)}
                estimatedDelivery={new Date(parceldata.data.ordered_at)}
                riderName={parceldata.data.rider?.name ?? "Not Assigned"}
                riderRating={parceldata.data.rider?.rating ?? 5}
                onPress={() => handleDeliveryPress(parceldata.data)} 
                onChatPress={ onChatPress}
                onCallPress={()=> setShowContactModal(true)}
                paymentMethod={parceldata.data.payment_method}
                total={(parseFloat(parceldata.data.amount) + parseFloat(parceldata.data.delivery_fee)).toLocaleString()}
              />
            )}
          </View>
        </ScrollView>
         <ContactReceiverPopup
                visible={showContactModal}
                onClose={() => setShowContactModal(false)}
                name={parceldata?.data?.rider.name ?? ""}
                phone={parceldata?.data?.rider.phone ?? ""}
                email={""} // or from rider if available
                address={parceldata?.data?.receiver_address ?? ""}
                onCall={() => {
                  console.log(`Calling ${parceldata?.data?.rider.name}...`);
                }}
              />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginBottom: 110,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: theme.spacing.md,
  },
  userDetails: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: theme.fontSizes.sm,
    color: colors.white,
    marginRight: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceContainer: {
    marginBottom: theme.spacing.xl,
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing.lg,
    alignItems: 'center',

    justifyContent: 'space-between',
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: "900",
    color: '#FFFFFFE5',
    marginBottom: theme.spacing.md,
  },
  balanceActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "flex-end",
    marginTop: -10
  },
  balanceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: 50,
    paddingVertical: -1,
    paddingHorizontal: 6,
    gap: 1,
    width: 75,
    height: 30,
  },
  balanceButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.primary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xl,
  },
  promotionContainer: {
    marginBottom: theme.spacing.xl,
  },
  promotionSlide: {
    width: 320,
    paddingRight: theme.spacing.md,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightgrey,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
  },
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  locationsContainer: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    gap: 6,
    padding: theme.spacing.sm,
    justifyContent: "space-between",
    width: "100%",
    height: 90,
  },
  locationsButton: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    boxShadow: "none",
    // justifyContent: "space-between",
    alignItems: "center",
    width: "50%",
    height: "auto",
  },
});

