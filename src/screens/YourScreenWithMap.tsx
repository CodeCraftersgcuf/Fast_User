import React, { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Alert } from "react-native"
import MapView, { Marker } from "react-native-maps"
import * as Location from "expo-location"
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete"
import { useNavigation } from "@react-navigation/native"

const INITIAL_REGION = {
  latitude: 40.7128, // fallback: New York
  longitude: -74.0060,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

const YourScreenWithMap = () => {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [hasNoResults, setHasNoResults] = useState(false)
  const [region, setRegion] = useState(INITIAL_REGION)
  const mapRef = useRef(null)
  const navigation = useNavigation()

  // Request location on mount and when screen is focused
  useEffect(() => {
    let isMounted = true
    const getLocation = async () => {
      setIsSearching(true)
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Location permission is required to use this feature.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        )
        setIsSearching(false)
        return
      }
      let location = await Location.getCurrentPositionAsync({})
      if (isMounted && location) {
        const { latitude, longitude } = location.coords
        const userRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }
        setRegion(userRegion)
        setSelectedLocation({
          latitude,
          longitude,
          addressText: "Current Location",
        })
        if (mapRef.current) {
          mapRef.current.animateToRegion(userRegion, 1000)
        }
      }
      setIsSearching(false)
    }
    getLocation()
    return () => {
      isMounted = false
    }
  }, [navigation])

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        region={region}
        showsUserLocation={true}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title={selectedLocation.addressText}
          />
        )}
      </MapView>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          fetchDetails={true}
          onPress={(data, details = null) => {
            setIsSearching(false)
            setHasNoResults(false)
            if (details) {
              const {
                geometry: {
                  location: { lat, lng },
                },
              } = details
              const newLocation = {
                latitude: lat,
                longitude: lng,
                addressText: details?.formatted_address || data.description,
              }
              setSelectedLocation(newLocation)
              setRegion({
                ...newLocation,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              })
              if (mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    ...newLocation,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  },
                  1000
                )
              }
            }
          }}
          query={{
            key: "AIzaSyBqgIQFEH1phOSeeH9cgJk_DxC-cixb87I",
            language: "en",
          }}
          onFail={(error) => {
            console.warn("Search error:", error)
            setIsSearching(false)
            setHasNoResults(true)
          }}
          onNotFound={() => {
            setIsSearching(false)
            setHasNoResults(true)
          }}
          onLoad={() => {
            setIsSearching(true)
            setHasNoResults(false)
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
    </View>
  )
}

const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    elevation: 3,
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    overflow: "hidden",
  },
  textInput: {
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  listView: {
    maxHeight: 200,
  },
  loadingBox: {
    padding: 10,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  noResultBox: {
    padding: 10,
    alignItems: "center",
  },
  noResultText: {
    fontSize: 16,
    color: "red",
  },
})

export default YourScreenWithMap