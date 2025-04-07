import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { GradientBackground } from "./../../components/BackgroundGradient";
import { CodeInput } from "./../../components/CodeInput";
import { Button } from "./../../components/Button";
import { colors } from "./../../constants/colors";
import { useAuth } from "../../contexts/AuthContext"; // adjust path

//Code Related to the integration

import { verifyEmailOTP, resendOtp } from "./../../utils/mutations/authMutations";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native"; // 👈 to get params

const Verify = () => {
  const [timeLeft, setTimeLeft] = useState(59);
  const [otpCode, setOtpCode] = useState('');

  const navigation = useNavigation();
  const { login } = useAuth();
  const route = useRoute();

  const { email } = route.params as { email: string }; // 👈 get email from route

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleCodeComplete = (code: string) => {
    console.log("Code entered:", code);
    setOtpCode(code); // store to state
  };

  const { mutate: mutateVerify, isPending: isVerifying } = useMutation({
    mutationFn: (data: { otp: string; email: string }) => verifyEmailOTP(data),

    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Verified",
        text2: "Welcome aboard!",
      });
      login(); // ✅ Triggers MainApp
    },

    onError: () => {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: "Invalid code or server error",
      });
    },
  });
  const { mutate: mutateResend, isPending: isResending } = useMutation({
    mutationFn: () => resendOtp({ data: { email } }),

    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "OTP Resent",
        text2: "Please check your email again",
      });
      setTimeLeft(59);
    },

    onError: () => {
      Toast.show({
        type: "error",
        text1: "Failed to resend",
        text2: "Please try again later",
      });
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify</Text>
          <Text style={styles.subtitle}>
            Verify your phone number by entering the 5 - digit code
          </Text>

          <View style={styles.form}>
            <View style={styles.headerRow}>
              <Text style={styles.enterCodeText}>Enter Code</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.goBackText}>Go back</Text>
              </TouchableOpacity>
            </View>

            <CodeInput
              length={6}
              onCodeComplete={handleCodeComplete}
              allowBackspace={true}
            />

            {/* <Button title="Proceed" onPress={() => {RideDetails}} /> */}
            <Button
              title={isVerifying ? "Verifying..." : "Proceed"}
              onPress={() => mutateVerify({ email, otp: otpCode })}
              disabled={otpCode.length !== 6 || isVerifying}
            />

            {timeLeft === 0 && (
              <TouchableOpacity onPress={() => mutateResend()}>
                <Text style={styles.resendLink}>
                  {isResending ? "Resending..." : "Resend Code"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Toast />
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.lightgrey,
    opacity: 0.8,
    marginBottom: 20,
  },
  form: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 20,
    height: "80%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  enterCodeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },

  goBack: {
    alignSelf: "flex-end",
  },
  goBackText: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  timerText: {
    textAlign: "center",
    color: colors.text.secondary,
  },
  timer: {
    color: colors.primary,
  },
});

export default Verify;
