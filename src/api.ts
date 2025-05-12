import axios from 'axios'
import { getFromStorage } from './utils/storage'

const API_BASE = "https://fastlogistic.hmstech.xyz/api"

export const fetchNotifications = async () => {
  try {
    const token = await getFromStorage("authToken")

    const response = await axios.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    return {
      success: true,
      data: response.data.notifications,
    }
  } catch (error: any) {
    console.error("❌ fetchNotifications error:", error?.response?.data || error.message)

    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch notifications",
    }
  }
}

export const markNotificationAsRead = async (id: number) => {
  try {
    const token = await getFromStorage("authToken")

    await axios.put(`${API_BASE}/notifications/mark-as-read/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })

    return {
      success: true,
      message: "Notification marked as read",
    }
  } catch (error: any) {
    console.error("❌ markNotificationAsRead error:", error?.response?.data || error.message)

    return {
      success: false,
      message: error?.response?.data?.message || "Failed to mark as read",
    }
  }
}
