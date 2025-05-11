import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { colors } from "../../constants/colors";
import { theme } from "../../constants/theme";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useOrder } from "../../contexts/OrderContext";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

export default function MapSelect() {
  const navigation = useNavigation();
  const route = useRoute();
  const { updateDeliveryDetails } = useOrder();

  const mapRef = useRef<MapView>(null);
  const googlePlacesRef = useRef<any>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [hasNoResults, setHasNoResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    addressText: string;
  } | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location Denied", "Location access is required.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const addressText = `${place.name || ""}, ${place.street || ""}, ${place.city || ""}, ${place.region || ""}, ${place.country || ""}`.trim();

        const finalLocation = { latitude, longitude, addressText };
        setSelectedLocation(finalLocation);

        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              ...finalLocation,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            1000
          );
        }

        if (googlePlacesRef.current) {
          googlePlacesRef.current.setAddressText(addressText);
        }
      } catch (err) {
        console.warn("Error fetching current location", err);
      }
    };

    fetchLocation();
  }, []);

  const handleSelect = () => {
    if (!selectedLocation) return;
    const address = selectedLocation.addressText || `${selectedLocation.latitude}, ${selectedLocation.longitude}`;

       const type = route.params?.type || "sender"; // could be sender / receiver / address
    const from = route.params?.from || "LocationSelect"; // default fallback
  
    updateDeliveryDetails({
      [type === "sender" ? "senderAddress" : "receiverAddress"]: address,
    });
  
    // New Correct Condition using replace
    if (from === "Address") {
      navigation.replace("Address", { // ✅ REPLACE, not navigate
        selectedAddress: address,
        type,
        fromMap: true,
      });
    } else {
      navigation.replace("LocationSelect", { // ✅ REPLACE, not navigate
        selectedAddress: address,
        type,
        fromMap: true,
      });
    }
  };

  const handleClose = () => navigation.goBack();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          ref={googlePlacesRef}
          placeholder="Search"
          fetchDetails={true}
          onPress={(data, details = null) => {
            setIsSearching(false);
            setHasNoResults(false);

            if (details) {
              const {
                geometry: {
                  location: { lat, lng },
                },
              } = details;

              const newLocation = {
                latitude: lat,
                longitude: lng,
                addressText: details?.formatted_address || data.description,
              };
              setSelectedLocation(newLocation);

              if (mapRef.current) {
                mapRef.current.animateToRegion(
                  { ...newLocation, latitudeDelta: 0.005, longitudeDelta: 0.005 },
                  1000
                );
              }
            }
          }}
          query={{
            key: "AIzaSyBqgIQFEH1phOSeeH9cgJk_DxC-cixb87I",
            language: "en",
          }}
          onFail={() => {
            setIsSearching(false);
            setHasNoResults(true);
          }}
          onNotFound={() => {
            setIsSearching(false);
            setHasNoResults(true);
          }}
          onLoad={() => {
            setIsSearching(true);
            setHasNoResults(false);
          }}
          styles={{
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            listView: styles.listView,
          }}
          enablePoweredByContainer={false}
        />
        {isSearching && (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}
        {hasNoResults && (
          <View style={styles.noResultBox}>
            <Text style={styles.noResultText}>No results found.</Text>
          </View>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: selectedLocation?.latitude || 0,
            longitude: selectedLocation?.longitude || 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={async (e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;

            let { status } = await Location.getForegroundPermissionsAsync();
            if (status !== "granted") {
              const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
              if (newStatus !== "granted") {
                Alert.alert("Permission Denied", "Location access is required.");
                return;
              }
            }

            // Update marker immediately
            const fallback = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            const instantLocation = { latitude, longitude, addressText: fallback };
            setSelectedLocation(instantLocation);

            try {
              const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
              const addressText = `${place.name || ""}, ${place.street || ""}, ${place.city || ""}, ${place.region || ""}, ${place.country || ""}`.trim();
              const finalLocation = { latitude, longitude, addressText };

              setSelectedLocation(finalLocation); // Update with real address
              googlePlacesRef.current?.setAddressText(addressText);
            } catch (error) {
              googlePlacesRef.current?.setAddressText(fallback);
            }

            // Ensure map re-focuses
            setTimeout(() => {
              mapRef.current?.animateToRegion(
                {
                  latitude,
                  longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                },
                500
              );
            }, 100);
          }}

        >
          {selectedLocation && (
            <Marker coordinate={selectedLocation} pinColor={colors.primary} />
          )}
        </MapView>
      </View>

      <TouchableOpacity style={styles.selectButton} onPress={handleSelect}>
        <Text style={styles.selectButtonText}>Select Location</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "600",
    color: colors.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 115 : 95,
    width: "90%",
    alignSelf: "center",
    zIndex: 2,
  },
  textInputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRadius: 5,
    elevation: 3,
  },
  textInput: {
    height: 44,
    color: "#5d5d5d",
    fontSize: 16,
  },
  listView: {
    backgroundColor: colors.white,
    borderRadius: 5,
    elevation: 3,
  },
  mapContainer: {
    flex: 1,
    marginTop: 60,
  },
  map: {
    width,
    height: height - 150,
  },
  selectButton: {
    backgroundColor: colors.primary,
    margin: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  selectButtonText: {
    color: colors.white,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.lightgrey,
    borderRadius: 5,
    alignItems: "center",
  },
  loadingText: {
    color: colors.text.primary,
    fontSize: 14,
    fontStyle: "italic",
  },

  noResultBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#ffe6e6",
    borderRadius: 5,
    alignItems: "center",
  },
  noResultText: {
    color: "#cc0000",
    fontSize: 14,
    fontStyle: "italic",
  },

});
