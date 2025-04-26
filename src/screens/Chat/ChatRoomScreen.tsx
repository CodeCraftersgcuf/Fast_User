// ChatRoomScreen.tsx
import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { RootStackParamList } from "../../types/navigation"

type ChatItem = RootStackParamList["ChatRoom"]["chat"]

interface Message {
  id: string
  text: string
  sender: "user" | "rider"
  timestamp: string
}

export default function ChatRoomScreen() {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<RootStackParamList, "ChatRoom">>()
  const activeChat = route.params.chat

  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hello! I'm on my way.", sender: "rider", timestamp: "10:30 AM" },
    { id: "2", text: "Great, thanks!", sender: "user", timestamp: "10:32 AM" },
  ])

  const handleSendMessage = () => {
    if (!messageText.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMessage])
    setMessageText("")
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.sender === "user" ? styles.userMessage : styles.riderMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Image source={activeChat.avatar} style={styles.messageAvatar} />
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Image source={activeChat.avatar} style={styles.avatar} />
          <View>
            <Text style={styles.chatName}>{activeChat.name}</Text>
            <Text style={styles.chatOrder}>{activeChat.orderId}</Text>
          </View>
        </View>

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={messageText}
            onChangeText={setMessageText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Icon name="send" size={20} color="#800080" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  chatOrder: {
    fontSize: 14,
    color: "#800080",
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userMessage: {
    backgroundColor: "#800080",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  riderMessage: {
    backgroundColor: "#E5E5E5",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  messageAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
})
