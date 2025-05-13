import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageStyle,
  Platform,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import { icons } from "../../../constants/icons";
import { colors } from "../../../constants/colors";
import { theme } from "../../../constants/theme";
import { useNavigation } from "@react-navigation/native";
import imageSource from '../../../assets/images/pp.png';


import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";


interface TimelineItem {
  date: string;
  time: string;
  text: string;
  location: string;
  isCompleted: boolean;
}
interface DeliveryItem {
  id: string;
  status: "Delivered" | "In transit" | "Picked up" | "Order";
  fromAddress: string;
  toAddress: string;
  orderTime: string;
  deliveryTime: string;
  rider: {
    name: string;
    avatar: any;
    rating: number;
  };
}

type DeliveryDetailsRouteProp = RouteProp<
  {
    DeliveryDetails: {
      delivery: DeliveryItem;
    };
  },
  "DeliveryDetails"
>;
//Code Related to the Integration;
import { useQuery } from "@tanstack/react-query"
import { getParcelDetail, getRiderLocation } from "../../../utils/queries/accountQueries";
import { getFromStorage } from "../../../utils/storage";
import Loader from "../../../components/Loader";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { GOOGLE_MAPS_API_KEY } from "@env";


export default function DeliveryDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const [token, setToken] = useState<string | null>(null);
  const [origin, setOrigin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routePolyline, setRoutePolyline] = useState<{ latitude: number; longitude: number }[]>([]);
  const GOOGLE_KEY = GOOGLE_MAPS_API_KEY;

  console.log("The Google Api hh", GOOGLE_KEY);
  // Get parcelId from route params
  const parcelId = route.params?.delivery?.id;
  // Fetch token
  useEffect(() => {
    const fetchUserData = async () => {
      const fetchedToken = await getFromStorage("authToken");
      setToken(fetchedToken);
      console.log("🔹 Retrieved Token:", fetchedToken);
    };
    fetchUserData();
  }, []);

  // Fetch parcel details
  const { data: parcelData, isLoading: parcelLoading } = useQuery({
    queryKey: ["parcelDetails", token, parcelId],
    queryFn: () => getParcelDetail(parcelId, token),
    enabled: !!token && !!parcelId,
  });
  // Fetch rider location
  const riderId = parcelData?.data?.rider_id;
  const { data: riderLocationData, isLoading: riderLoading } = useQuery({
    queryKey: ["riderLocation", riderId],
    queryFn: () => getRiderLocation(riderId, token!),
    enabled: !!token && !!riderId,
    refetchInterval: 5000,
  });

  // Set origin/destination from API data
  useEffect(() => {
    if (parcelData?.data?.receiver_coordinates) {
      setDestination({
        latitude: parcelData.data.receiver_coordinates.lat,
        longitude: parcelData.data.receiver_coordinates.lng,
      });
    }
    if (riderLocationData?.data?.latitude && riderLocationData?.data?.longitude) {
      setOrigin({
        latitude: parseFloat(riderLocationData.data.latitude),
        longitude: parseFloat(riderLocationData.data.longitude),
      });
    } else if (parcelData?.data?.sender_coordinates) {
      setOrigin({
        latitude: parcelData.data.sender_coordinates.lat,
        longitude: parcelData.data.sender_coordinates.lng,
      });
    }
  }, [parcelData, riderLocationData]);

  // Fetch Google Directions API polyline
  useEffect(() => {
    const fetchRoute = async () => {
      if (origin && destination) {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_KEY}`;
        console.log("Fetching route from Google Directions API:", url);
        try {
          const res = await axios.get(url);
          console.log("Directions API response:", res.data);
          const routes = res.data.routes;
          if (routes && routes.length > 0 && routes[0].overview_polyline?.points) {
            const points = routes[0].overview_polyline.points;
            console.log("overview_polyline.points:", points);
            const decoded = polyline.decode(points);
            console.log("Decoded polyline:", decoded);
            if (decoded.length >= 2) {
              const polylineCoords = decoded.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
              setRoutePolyline(polylineCoords);
              console.log("Set routePolyline:", polylineCoords);
            } else {
              setRoutePolyline([]);
              console.warn("Google Directions API returned a route with less than 2 points.");
            }
          } else {
            setRoutePolyline([]);
            console.warn("No route found from Google Directions API.");
          }
        } catch (e) {
          setRoutePolyline([]);
          console.warn("Failed to fetch route from Google Directions API.", e);
        }
      }
    };
    fetchRoute();
  }, [origin, destination]);

  if (parcelLoading) return <Loader />;
  if (!parcelData?.data) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50, fontSize: 16 }}>
          Delivery data not available.
        </Text>
      </SafeAreaView>
    );
  }

  const parcel = parcelData.data;
  const rider = parcel.accepted_bid?.rider;
  const routeCoordinates = routePolyline.length >= 2 ? routePolyline : (
    origin && destination ? [origin, destination] : []
  );

  // Helper to format date/time
  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : "";
  const formatTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString() : "";

  const timelineData: TimelineItem[] = [
    {
      date: formatDate(parcel.ordered_at),
      time: formatTime(parcel.ordered_at),
      text: "User ordered a delivery",
      location: parcel.sender_address,
      isCompleted: !!parcel.ordered_at,
    },
    {
      date: formatDate(parcel.picked_up_at),
      time: formatTime(parcel.picked_up_at),
      text: "Package picked up",
      location: parcel.sender_address,
      isCompleted: !!parcel.picked_up_at,
    },
    {
      date: formatDate(parcel.in_transit_at),
      time: formatTime(parcel.in_transit_at),
      text: "Package in transit",
      location: parcel.sender_address,
      isCompleted: !!parcel.in_transit_at,
    },
    {
      date: formatDate(parcel.delivered_at),
      time: formatTime(parcel.delivered_at),
      text: "Package delivered",
      location: parcel.receiver_address,
      isCompleted: !!parcel.delivered_at,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name={icons.back} size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: routeCoordinates[0]?.latitude || 31.4146583,
              longitude: routeCoordinates[0]?.longitude || 73.0699726,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {routeCoordinates.length >= 2 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#9C27B0"
                strokeWidth={4}
                lineDashPattern={[1]}
                lineCap="round"
                lineJoin="round"
              />
            )}
            {routeCoordinates[0] && (
              <Marker coordinate={routeCoordinates[0]}>
                <View style={styles.markerContainer}>
                  <View style={[styles.markerOuter, styles.markerOuterStart]}>
                    <View style={[styles.markerInner, styles.markerInnerStart]} />
                  </View>
                </View>
              </Marker>
            )}
            {routeCoordinates[routeCoordinates.length - 1] && (
              <Marker coordinate={routeCoordinates[routeCoordinates.length - 1]}>
                <View style={styles.markerContainer}>
                  <View style={[styles.markerOuter, styles.markerOuterEnd]}>
                    <View style={[styles.markerInner, styles.markerInnerEnd]} />
                  </View>
                </View>
              </Marker>
            )}
          </MapView>
        </View>

        <View style={[{ marginBottom: 130 }]}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Image
                  source={
                    rider?.profile_picture
                      ? { uri: `https://fastlogistic.hmstech.xyz/storage/${rider.profile_picture}` }
                      : imageSource
                  }
                  style={styles.profileImage}
                />

                <View style={styles.nameRating}>
                  <Text style={styles.riderName}>
                    {rider?.name || "Rider Name"}
                  </Text>

                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Image
                        key={star}
                        source={icons.star}
                        style={[
                          styles.iconTiny as ImageStyle,
                          styles.starFilled,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.iconButton}>
                  <Image
                    source={icons.chats}
                    style={styles.iconMedium as ImageStyle}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Image
                    source={icons.phoneb}
                    style={styles.iconMedium as ImageStyle}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>


          <View style={styles.orderDetails}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderLabel}>Order ID</Text>
                <Text style={styles.orderId}>ORD-{parcel.id}</Text>
              </View>
              <Text style={styles.statusText}>{parcel.status}</Text>
            </View>

            <View style={styles.timeline}>
              {timelineData.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <Text style={styles.timelineDate}>{item.date}</Text>
                    <Text style={styles.timelineTime}>{item.time}</Text>
                  </View>

                  {/* FIX: Close dot properly and move content out */}
                  <View style={styles.timelineDot}>
                    <View
                      style={[
                        styles.dot,
                        item.isCompleted ? styles.dotActive : styles.dotInactive,
                      ]}
                    >
                      {item.isCompleted && <View style={styles.innerDot} />}
                    </View>

                    {index < timelineData.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          item.isCompleted ? styles.lineActive : styles.lineInactive,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineText}>{item.text}</Text>
                    <Text style={styles.timelineLocation}>{item.location}</Text>
                  </View>
                </View>
              ))}

            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconMedium:{
    width: 24,
    height: 24,
    tintColor: colors.white
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    height: 80,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerButton: {
    padding: 11,
    borderRadius: theme.borderRadius.round,
    backgroundColor: "#EBEBEB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  markerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  markerOuterStart: {
    borderColor: "#4CAF50",
  },
  markerOuterEnd: {
    borderColor: "#F44336",
  },
  markerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  markerInnerStart: {
    backgroundColor: "#4CAF50",
  },
  markerInnerEnd: {
    backgroundColor: "#F44336",
  },
  lineInactive: {
    backgroundColor: "#ccc",
  },

  profileCard: {
    backgroundColor: "#5B1170", // Deep purple for sleek design
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    marginTop: -40, // Moves it up to merge with order details
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  nameRating: {
    marginLeft: 10,
  },
  riderName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  starFilled: {
    tintColor: "#FFD700", // Gold color for filled stars
  },
  starOutline: {
    tintColor: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
  },
  iconButton: {
    backgroundColor: "'rgba(255,255,255,0.2)'",
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  orderDetails: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    marginTop: -12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderLabel: {
    fontSize: 14,
    color: "#888",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statusText: {
    color: "#FF9800",
    fontSize: 14,
    fontWeight: "bold",
  },
  timeline: {
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
    position: "relative", // Needed for absolute line
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff", // optional: to see better
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
    top: 16, // positions line just below dot
    width: 2,
    height: 40, // make this long enough to reach next dot
    backgroundColor: "#ccc",
    zIndex: 0,
  },

  lineActive: {
    backgroundColor: colors.primary,
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
