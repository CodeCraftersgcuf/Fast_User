import * as SecureStore from "expo-secure-store";

// Function to save data securely
export async function saveToStorage(key: string, value: any) {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (error) {
    console.error(`❌ Error saving ${key}:`, error);
  }
}

// Function to retrieve data securely
export async function getFromStorage(key: string) {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`❌ Error retrieving ${key}:`, error);
    return null;
  }
}

// Function to remove data from storage
export async function removeFromStorage(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`❌ Error removing ${key}:`, error);
  }
}
