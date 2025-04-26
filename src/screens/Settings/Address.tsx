"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Modal, ScrollView, Alert } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import Icon from "react-native-vector-icons/Ionicons"
import type { RootStackParamList } from "../../types/navigation"

type AddressScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Address">

type AddressType = "Home" | "Work"
type TabType = "Home" | "Work"


//Code Related to the integration;
import { useMutation } from "@tanstack/react-query"
import { useQuery } from "@tanstack/react-query"
import { createAddress, deleteAddress, updateAddress } from "../../utils/mutations/accountMutations"
import { getAddressList } from "../../utils/queries/accountQueries"
import Toast from "react-native-toast-message";
import Loader from "../../components/Loader"
import { getFromStorage } from "../../utils/storage";
import { useQueryClient } from "@tanstack/react-query";

interface SavedAddress {
  id: string
  type: AddressType
  title: string
  state: string
  city: string
  address: string
}

export default function AddressScreen() {
  const navigation = useNavigation<AddressScreenNavigationProp>()
  const [token, setToken] = useState<string | null>(null); // State to hold the token

  const [addressType, setAddressType] = useState<AddressType>("Home")
  const [searchText, setSearchText] = useState("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSavedAddresses, setShowSavedAddresses] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("Home")

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null)
  const [city, setCity] = useState("")
  const [state, setState] = useState("")


  const queryClient = useQueryClient();

  const route = useRoute();



  const { data: addressList, isLoading: addressListLoading } = useQuery({
    queryKey: ["addressList", token],
    queryFn: () => getAddressList(token),
    enabled: !!token, // Only run the query if token is available
  })
  const { mutate: createAddressMutation } = useMutation({
    mutationFn: createAddress,
    onSuccess: (data) => {
      console.log("Address created successfully:", data)
      Toast.show({
        type: "success",
        text1: "Address created successfully",
      })
    },
    onError: (error) => {
      console.error("Error creating address:", error)
      Toast.show({
        type: "error",
        text1: "Error creating address",
      })
    },
  })
  console.log("Address List:", addressList);
  const { mutate: updateAddressMutation } = useMutation({
    mutationFn: updateAddress,
    onSuccess: (data) => {
      console.log("Address updated successfully:", data)
      Toast.show({
        type: "success",
        text1: "Address updated successfully",
      })
    },
    onError: (error) => {
      console.error("Error updating address:", error)
      Toast.show({
        type: "error",
        text1: "Error updating address",
      })
    },
  })
  const { mutate: deleteAddressMutation } = useMutation({
    mutationFn: deleteAddress,
    onSuccess: (data) => {
      console.log("Address deleted successfully:", data);
      Toast.show({
        type: "success",
        text1: "Address deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["addressList", token] }); // 🔄 Refetch
    },
    onError: (error) => {
      console.error("Error deleting address:", error);
      Toast.show({
        type: "error",
        text1: "Error deleting address",
      });
    },
  });

  const handleSave = () => {
    if (!token) return;

    const payload = {
      address: searchText,
      city: city || "Ikeja",
      state: state || "Lagos",
      type: addressType,
    };

    if (editingAddress) {
      updateAddressMutation({
        data: payload,
        id: editingAddress.id, // 🔥 ensure ID is passed
        token,
      });
    } else {
      createAddressMutation({
        data: payload,
        token,
      });
    }

    // Reset form and state
    setEditingAddress(null);
    setSearchText("");
    setCity("");
    setState("");
    setAddressType("Home");
    setShowSavedAddresses(false);
  };



  const handleViewSavedAddresses = () => {
    setShowSavedAddresses(true)
  }

  const handleEditAddress = (address: SavedAddress) => {
    setSearchText(address.address);
    setAddressType(address.type.charAt(0).toUpperCase() + address.type.slice(1).toLowerCase() as AddressType);
    setCity(address.city);
    setState(address.state);
    setEditingAddress(address); // 💡 store the whole object for ID access
    setShowSavedAddresses(false); // go back to form screen
  };

  const handleDeleteAddress = (address: SavedAddress) => {
    if (!token) return;

    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            deleteAddressMutation({
              data: { id: address.id },
              token,
            });
          },
          style: "destructive",
        },
      ]
    );
  };

  // First: fetch and set token
  useEffect(() => {
    const fetchUserData = async () => {
      const fetchedToken = await getFromStorage("authToken");
      setToken(fetchedToken);
      console.log("🔹 Retrieved Token:", fetchedToken);
    };

    fetchUserData();
  }, []);

  // Second: Normalize address list into savedAddresses (after any mutation)
  useEffect(() => {
    if (addressList?.data) {
      const normalized = addressList.data.map((item) => ({
        ...item,
        type: item.type.toLowerCase(), // normalize to "home" or "work"
      }));
      setSavedAddresses(normalized);
    }
  }, [addressList]);

  const filteredAddresses = savedAddresses.filter(
    (address) => address.type.toLowerCase() === activeTab.toLowerCase()
  );

// 📍 When coming from Address screen
const handleMapPress = (type: "address" | "address") => {
  navigation.replace("MapSelect", {
    type,
    from: "Address", // still passing correctly
  });
};

  useEffect(() => {
    if (route.params?.fromMap && route.params?.selectedAddress) {
      setSearchText(route.params.selectedAddress);
    }
  }, [route.params]);
  
  const renderAddressScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Address</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Address Type</Text>

        <TouchableOpacity
          style={styles.selectField}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.selectFieldText}>{addressType}</Text>
          <Icon name="chevron-down" size={24} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleMapPress("sender")}>
          <Text style={styles.sectionTitle}>Search</Text>

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#999999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Location"
              placeholderTextColor="#999999"
              value={searchText}
              editable={false} // Prevent typing since it's just for display
              pointerEvents="none" // Disable tap on input
            />
            <View style={styles.locationButton}>
              <Icon name="location" size={20} color="#000000" />
            </View>
          </View>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.viewSavedButton}
          onPress={handleViewSavedAddresses}
        >
          <Text style={styles.viewSavedButtonText}>View Saved Addresses</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
      <Toast />

    </SafeAreaView>
  )

  const renderSavedAddressesScreen = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSavedAddresses(false)} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Address</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Home" && styles.activeTab]}
            onPress={() => setActiveTab("Home")}
          >
            <Text style={[styles.tabText, activeTab === "Home" && styles.activeTabText]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Work" && styles.activeTab]}
            onPress={() => setActiveTab("Work")}
          >
            <Text style={[styles.tabText, activeTab === "Work" && styles.activeTabText]}>Work</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.addressList}>
          {filteredAddresses.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 24, color: "#999", fontSize: 14 }}>
              No saved addresses found for {activeTab}.
            </Text>
          ) : (
            filteredAddresses.map((address) => (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressTitleContainer}>
                    <Icon name="location" size={16} color="#800080" />
                    <Text style={styles.addressTitle}>
                      {address.city}, {address.state}
                    </Text>
                  </View>
                  <View style={styles.addressActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditAddress(address)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAddress(address)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.addressDetails}>
                  <View style={styles.addressDetailColumn}>
                    <Text style={styles.addressDetailLabel}>State</Text>
                    <Text style={styles.addressDetailValue}>{address.state}</Text>
                  </View>
                  <View style={styles.addressDetailColumn}>
                    <Text style={styles.addressDetailLabel}>City</Text>
                    <Text style={styles.addressDetailValue}>{address.city}</Text>
                  </View>
                </View>

                <View style={styles.addressFullDetail}>
                  <Text style={styles.addressDetailLabel}>Address</Text>
                  <Text style={styles.addressDetailValue}>{address.address}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );


  return (
    <>
      {addressListLoading ? (
        <Loader />
      ) : showSavedAddresses ? (
        renderSavedAddressesScreen()
      ) : (
        renderAddressScreen()
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Icon name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.categoryOption}
              onPress={() => {
                setAddressType("Home")
                setShowCategoryModal(false)
              }}
            >
              <Text style={styles.categoryOptionText}>Home</Text>
              <View style={styles.radioButton}>
                {addressType === "Home" && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.categoryOption}
              onPress={() => {
                setAddressType("Work")
                setShowCategoryModal(false)
              }}
            >
              <Text style={styles.categoryOptionText}>Work</Text>
              <View style={styles.radioButton}>
                {addressType === "Work" && <View style={styles.radioButtonSelected} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Toast />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
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
  selectField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  selectFieldText: {
    fontSize: 16,
    color: "#000000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    padding: 12,
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  viewSavedButton: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  viewSavedButtonText: {
    fontSize: 16,
    color: "#000000",
  },
  saveButton: {
    backgroundColor: "#800080",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  navText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  activeNavText: {
    color: "#800080",
    fontWeight: "500",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#800080",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -25,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryOptionText: {
    fontSize: 16,
    color: "#000000",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#800080",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#800080",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#800080",
  },
  tabText: {
    fontSize: 16,
    color: "#000000",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  addressList: {
    flex: 1,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addressTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#800080",
    marginLeft: 8,
  },
  addressActions: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#E6F7E9",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: "#00A651",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    color: "#FF0000",
  },
  addressDetails: {
    flexDirection: "row",
    marginBottom: 16,
  },
  addressDetailColumn: {
    flex: 1,
  },
  addressDetailLabel: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 4,
  },
  addressDetailValue: {
    fontSize: 14,
    color: "#000000",
  },
  addressFullDetail: {
    marginBottom: 8,
  },
})