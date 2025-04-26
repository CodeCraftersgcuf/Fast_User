// ChatListScreen.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Chat">;

interface ChatItem {
  id: string;
  name: string;
  orderId: string;
  avatar: any;
  lastMessageTime: string;
  unreadCount: number;
}

export default function ChatScreen() {
  const navigation = useNavigation<ChatScreenNavigationProp>();

  const chats: ChatItem[] = [
    {
      id: "1",
      name: "Afeez Wale",
      orderId: "ORD-12345672D",
      avatar: require("../../assets/images/smiles.png"),
      lastMessageTime: "23/02/25- 11:12AM",
      unreadCount: 2,
    },
    {
      id: "2",
      name: "Adam Wayne",
      orderId: "ORD-12345672D",
      avatar: require("../../assets/images/smiley.png"),
      lastMessageTime: "23/02/25- 11:12AM",
      unreadCount: 2,
    },
    // ...rest
  ];

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate("ChatRoom", { chat: item })}
    >
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatOrderId}>{item.orderId}</Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount} Unread</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // use the same styles as in your original component
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  chatList: {
    paddingHorizontal: 16,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  chatOrderId: {
    fontSize: 14,
    color: "#800080",
  },
  chatMeta: {
    alignItems: "flex-end",
  },
  chatTime: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: "#800080",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
