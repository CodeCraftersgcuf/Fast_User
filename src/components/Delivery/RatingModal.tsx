import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getFromStorage } from "../../utils/storage";
import { getReview, submitReview } from "../../utils/queries/appQueries";
// import { getFromStorage } from "../../../utils/storage";
// import { getReview } from "../../../utils/queries/accountQueries";
// import { submitReview } from "../../../utils/mutations/accountMutations";

interface RatingModalProps {
  visible: boolean;
  parcelId: string | number;
  riderId: string | number;
  onClose: () => void;
}

export function RatingModal({
  visible,
  parcelId,
  riderId,
  onClose,
}: RatingModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [rating, setRating] = useState(4);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ratingStats, setRatingStats] = useState<Record<number, number>>({});
  const [reviews, setReviews] = useState<any[]>([]);

  // 🔐 Load token on mount
  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getFromStorage("authToken");
      setToken(fetchedToken);
      console.log("🔹 Retrieved Token:", fetchedToken);
    };
    fetchToken();
  }, []);

  // 🔁 Load reviews when modal opens
  useEffect(() => {
    if (visible && token && riderId) {
      fetchReviews();
    }
  }, [visible, token]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getReview(token!, riderId);
      console.log("response", res)
      setRatingStats(res?.data?.rating_distribution || {});
      setReviews(Array.isArray(res) ? res : res?.data?.reviews || []);
    } catch (e) {
      console.log("❌ Failed to fetch reviews", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!token || !parcelId || rating === 0) return;

    setSubmitting(true);
    try {
      await submitReview({
        data: {
          send_parcel_id: parcelId,
          rating,
          review,
        },
        token,
      });
      console.log("🔹 Review submitted");
      Alert.alert("Success", "Review submitted!");
      setRating(4);
      setReview("");
      fetchReviews(); // refresh after submit
    } catch (e) {
      console.log("❌ Submit review failed", e);
      Alert.alert("Error", `Could not submit reveiw because ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rate your delivery experience</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.ratingNumber}>{rating}</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Icon
                  name="star"
                  size={40}
                  color={star <= rating ? "#800080" : "#DDDDDD"}
                  style={{ padding: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.reviewInputContainer}>
            <TextInput
              style={styles.reviewInput}
              placeholder="Leave a review"
              value={review}
              onChangeText={setReview}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size={20} color="#800080" />
              ) : (
                <Icon name="send" size={24} color="#666666" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.ratingStats}>
            {[5, 4, 3, 2, 1].map((num) => (
              <RatingStat
                key={num}
                number={num}
                percentage={ratingStats?.[num] ?? 0}
              />
            ))}
          </View>

          <View style={styles.reviewsList}>
            {loading ? (
              <ActivityIndicator size="large" color="#800080" />
            ) : reviews.length > 0 ? (
              reviews.map((r, i) => (
                <ReviewItem
                  key={i}
                  name={r.from_user?.name || "Anonymous"}
                  image={
                    r.from_user?.profile_picture
                      ? `https://fastlogistic.hmstech.xyz/storage/${r.from_user.profile_picture}`
                      : "https://via.placeholder.com/40"
                  }
                  rating={r.rating}
                  date={new Date(r.created_at).toLocaleDateString()}
                  comment={r.review}
                />
              ))
            ) : (
              <Text style={{ textAlign: "center", color: "#999" }}>
                No reviews yet.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const RatingStat = ({ number, percentage }: { number: number; percentage: number }) => {
  const getBarColor = () => {
    if (number === 5) return "#4CAF50";
    if (number === 4) return "#8BC34A";
    if (number === 3) return "#FFEB3B";
    if (number === 2) return "#FF9800";
    return "#F44336";
  };

  return (
    <View style={styles.ratingStat}>
      <Text style={styles.ratingStatNumber}>{number} ★</Text>
      <View style={styles.ratingStatBar}>
        <View
          style={[
            styles.ratingStatFill,
            { width: `${percentage}%`, backgroundColor: getBarColor() },
          ]}
        />
      </View>
      <Text style={styles.ratingStatPercentage}>
        {percentage.toString().padStart(2, "0")}%
      </Text>
    </View>
  );
};

const ReviewItem = ({
  name,
  rating,
  date,
  comment,
  image,
}: {
  name: string;
  rating: number;
  date: string;
  comment: string;
  image: string;
}) => (
  <View style={styles.reviewItem}>
    <View style={styles.reviewHeader}>
      <Image source={{ uri: image }} style={styles.reviewerImage} />
      <View style={styles.reviewerInfo}>
        <Text style={styles.reviewerName}>{name}</Text>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name="star"
              size={16}
              color={star <= rating ? "#800080" : "#DDDDDD"}
            />
          ))}
          <Text style={styles.reviewDate}>{date}</Text>
        </View>
      </View>
    </View>
    {comment ? <Text style={styles.reviewComment}>{comment}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#000" },
  closeButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, padding: 16 },
  ratingNumber: { fontSize: 48, fontWeight: "700", textAlign: "center", marginVertical: 16 },
  starsContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 8 },
  reviewInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  reviewInput: { flex: 1, fontSize: 16, minHeight: 48 },
  sendButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  ratingStats: { marginBottom: 24 },
  ratingStat: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  ratingStatNumber: { width: 30 },
  ratingStatBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  ratingStatFill: { height: 8, borderRadius: 4 },
  ratingStatPercentage: { width: 40, textAlign: "right" },
  reviewsList: { flex: 1 },
  reviewItem: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  reviewHeader: { flexDirection: "row", marginBottom: 8 },
  reviewerImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  reviewerInfo: { flex: 1 },
  reviewerName: { fontSize: 16, fontWeight: "600" },
  reviewRating: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  reviewDate: { fontSize: 12, color: "#666", marginLeft: 8 },
  reviewComment: { fontSize: 14, color: "#333", lineHeight: 20 },
});
