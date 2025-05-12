import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import { theme } from "../constants/theme";

type TimelineItem = {
  key: string;
  label: string;
  location: string;
};

interface DeliveryTimelineProps {
  timelineData: TimelineItem[];
  parcel: any;
}

export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({ timelineData, parcel }) => {
  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString() : "";
  const formatTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTitle}>Delivery Timeline</Text>

      {timelineData.map((item, index) => {
        const timeValue = parcel[item.key];
        const isLast = index === timelineData.length - 1;
        const isCompleted = !!timeValue;
        const date = formatDate(timeValue);
        const time = formatTime(timeValue);

        return (
          <View key={item.key} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <Text style={styles.timelineDate}>{date}</Text>
              <Text style={styles.timelineTime}>{time}</Text>
            </View>
            <View style={styles.timelineDot}>
              <View
                style={[
                  styles.dot,
                  isCompleted ? styles.dotActive : styles.dotInactive,
                ]}
              >
                {isCompleted && <View style={styles.innerDot} />}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.timelineLine,
                    isCompleted ? styles.lineActive : styles.lineInactive,
                  ]}
                />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineText}>{item.label}</Text>
              <Text style={styles.timelineLocation}>{item.location}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  timelineContainer: {
    backgroundColor: colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: 0,
  },
  timelineTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: colors.black,
    marginBottom: theme.spacing.lg,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
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
    position: "relative",
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
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
    top: 16,
    width: 2,
    height: 40,
    backgroundColor: "#ccc",
    zIndex: 0,
  },
  lineActive: {
    backgroundColor: colors.primary,
  },
  lineInactive: {
    backgroundColor: "#ccc",
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
