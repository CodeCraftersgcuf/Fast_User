import { useEffect, useState } from "react"
import { Platform } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"

interface DateTimePickerProps {
  isVisible: boolean
  onClose: () => void
  onSelect: (dateTime: string) => void
}

export function DateTimePicker({ isVisible, onClose, onSelect }: DateTimePickerProps) {
  const [mode, setMode] = useState<"date" | "time">("date")
  const [tempDate, setTempDate] = useState<Date>(new Date())
  const [internalVisible, setInternalVisible] = useState(false)

  // ✅ FIX: useEffect to sync with external isVisible
  useEffect(() => {
    if (isVisible) {
      setMode("date")
      setInternalVisible(true)
    }
  }, [isVisible])

  const handleConfirm = (date: Date) => {
    if (mode === "date") {
      setTempDate(date)
      setInternalVisible(false) // close to switch mode
      setTimeout(() => {
        setMode("time")
        setInternalVisible(true) // reopen in time mode
      }, 250) // short delay for animation
    } else {
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const day = weekdays[tempDate.getDay()]
      const month = months[tempDate.getMonth()]
      const dateNum = tempDate.getDate()

      const hour = date.getHours() % 12 || 12
      const minute = date.getMinutes().toString().padStart(2, "0")
      const period = date.getHours() >= 12 ? "PM" : "AM"

      const formatted = `${day}, ${month} ${dateNum} - ${hour}:${minute} ${period}`
      onSelect(formatted)
      setInternalVisible(false)
      onClose()
      setMode("date")
    }
  }

  const handleCancel = () => {
    setInternalVisible(false)
    setMode("date")
    onClose()
  }

  return (
    <DateTimePickerModal
      isVisible={internalVisible}
      mode={mode}
      date={new Date()}
      minimumDate={new Date()}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      display={Platform.OS === "ios" ? "spinner" : "default"}
    />
  )
}
