import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native"
import { RouteProp, useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import Icon from "react-native-vector-icons/Ionicons"
import type { SendParcelStackParamList } from "../../types/navigation"

type SearchRidersNavigationProp = NativeStackNavigationProp<SendParcelStackParamList, "SearchRiders">

type RootStackParamList = {
  SearchRiders: {
    amount: string;
    send_parcel_id: string;
  };
  // ... other routes
};


// Integration Related
import { useQuery } from "@tanstack/react-query"
import { getFromStorage } from "../../utils/storage"
import { getParcelBidList } from "../../utils/queries/accountQueries"
import { cancelParcel } from "../../utils/queries/accountQueries"
import { useMutation } from "@tanstack/react-query"
import { useIsFocused } from "@react-navigation/native";

export default function SearchRidersScreen({ route }: { route: RouteProp<RootStackParamList, 'SearchRiders'> }) {
  const navigation = useNavigation<SearchRidersNavigationProp>()
  const [token, setToken] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(true)
  const { amount, send_parcel_id } = route.params
  const isFocused = useIsFocused();

  console.log("🔹 Amount:, Send Parecel Id", amount, send_parcel_id);

  const [hasNavigated, setHasNavigated] = useState(false) // 👈 Prevent multiple navigations

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getFromStorage("authToken")
      setToken(fetchedToken)
      console.log("🔹 Retrieved Token:", fetchedToken)
    }
    fetchToken()
  }, [])

  const { data: parcelBidList, isLoading: parcelBidListLoading } = useQuery({
    queryKey: ["parcelBidList", token, send_parcel_id],
    queryFn: () => getParcelBidList(send_parcel_id, token!),
    enabled: !!token && !!send_parcel_id,
    refetchInterval: isFocused ? 1000 : false, // ✅ Stop polling when not focused
  })
  console.log("🔹 Parcel Bid List Data:", parcelBidList);

  const { mutate: cancelParcelMutation } = useMutation({
    mutationFn: (parcelId: string) => cancelParcel(parcelId, token!),
    onSuccess: () => {
      console.log("✅ Parcel cancelled successfully")
      navigation.goBack()
    },
    onError: (error) => {
      console.error("❌ Error cancelling parcel:", error)
    },
  })

  useEffect(() => {
    if (
      parcelBidList?.data?.bids &&
      parcelBidList.data.bids.length > 0 &&
      !hasNavigated
    ) {
      setIsSearching(false)
      setHasNavigated(true)
      navigation.navigate("RiderBid", {
        amount,
        parcel_id: send_parcel_id, // ✅ Pass this
      })
    }
  }, [parcelBidList, hasNavigated, amount, send_parcel_id, navigation])


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Searching</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchAnimation}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
          <View style={styles.searchIconContainer}>
            <Icon name="search" size={40} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.searchingText}>Searching for available riders...</Text>

        <TouchableOpacity
          onPress={() => cancelParcelMutation(send_parcel_id.toString())}
          style={{
            marginTop: 20,
            backgroundColor: "#FF3B30",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            alignSelf: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>
            Cancel Parcel
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#800080",
    paddingTop: 30
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  searchAnimation: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  circle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  circle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  circle3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  searchIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchingText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
})


