import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GradientBackground } from './../../components/BackgroundGradient';
import { FormInput } from './../../components/FormInput';
import { PasswordInput } from './../../components/PasswordInput';
import { CodeInput } from './../../components/CodeInput';
import { Button } from './../../components/Button';
import { colors } from './../../constants/colors';


//Code Related to the integration:
import { forgotPassword, verifyPasswordOTP, resetPassword } from './../../utils/mutations/authMutations';
import { useMutation } from '@tanstack/react-query';
import Toast from "react-native-toast-message";

type Step = 'email' | 'code' | 'password';

const ChangePassword = () => {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(59);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const navigation = useNavigation();

  React.useEffect(() => {
    if (timeLeft > 0 && currentStep === 'code') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, currentStep]);

  const handleCodeComplete = (code: string) => {
    console.log('Code entered:', code);
    setOtpCode(code); // Save to state
  };

  const { mutate: mutateForgot, isPending: isSendingEmail } = useMutation({
    mutationFn: (data: { email: string }) => forgotPassword(data),
    onSuccess: (response) => {
      console.log("✅ Email Sent:", response);
      Toast.show({
        type: "success",
        text1: "Email Sent",
        text2: "OTP sent to your email",
      });
      setTimeLeft(59);
      setCurrentStep("code");
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Failed",
        text2: "Email not found or server error",
      });
    },
  });

  const { mutate: mutateVerify, isPending: isVerifyingCode } = useMutation({
    mutationFn: (data: { email: string; otp: string }) => verifyPasswordOTP(data),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "OTP Verified",
        text2: "You can now reset your password",
      });
      setCurrentStep("password");
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please try again",
      });
    },
  });
  const { mutate: mutateReset, isPending: isResetting } = useMutation({
    mutationFn: (data: { email: string; password: string, password_confirmation: string }) => resetPassword(data),
    onSuccess: (response) => {
      console.log("");
      Toast.show({
        type: "success",
        text1: "Password Updated",
        text2: "You can now log in",
      });
      navigation.navigate("Login" as never);
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: "Something went wrong",
      });
    },
  });
  const renderStep = () => {
    switch (currentStep) {
      case 'email':
        return (
          <>
            <Text style={styles.subtitle}>Input email address</Text>
            <View style={styles.form}>
              <TouchableOpacity
                style={styles.goBack}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.goBackText}>Go back</Text>
              </TouchableOpacity>

              <FormInput
                label="Enter Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                keyboardType="email-address"
              />

              <Button
                title="Proceed"
                onPress={() => mutateForgot({ email })}
                disabled={!email || isSendingEmail}
              />
            </View>
          </>
        );

      case 'code':
        return (
          <>
            <Text style={styles.subtitle}>
              Input the code sent to your registered email
            </Text>
            <View style={styles.form}>
              <TouchableOpacity
                style={styles.goBack}
                onPress={() => setCurrentStep('email')}
              >
                <Text style={styles.goBackText}>Go back</Text>
              </TouchableOpacity>

              <CodeInput length={6} onCodeComplete={handleCodeComplete} />

              <Button
                title="Proceed"
                onPress={() => mutateVerify({ email, otp: otpCode })}
                disabled={otpCode.length !== 6 || isVerifyingCode}
              />

              <Text style={styles.timerText}>
                Code will be resent in{' '}
                <Text style={styles.timer}>
                  {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                  {String(timeLeft % 60).padStart(2, '0')}
                </Text>{' '}
                sec
              </Text>
            </View>
          </>
        );

      case 'password':
        return (
          <>
            <Text style={styles.subtitle}>Reset your password</Text>
            <View style={styles.form}>
              <TouchableOpacity
                style={styles.goBack}
                onPress={() => setCurrentStep('code')}
              >
                <Text style={styles.goBackText}>Go back</Text>
              </TouchableOpacity>

              <PasswordInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
              />

              <PasswordInput
                label="Re-enter Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
              />

              <Button
                title="Proceed"
                onPress={() => {
                  if (newPassword !== confirmPassword) {
                    Toast.show({
                      type: "error",
                      text1: "Passwords do not match",
                    });
                    return;
                  }
                  mutateReset({ email, password: newPassword, password_confirmation: newPassword });
                }}
                disabled={!newPassword || !confirmPassword || isResetting}
              />

            </View>
          </>
        );
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Change Password</Text>
          {renderStep()}
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
    marginTop: 60
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.secondary,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.lightgrey,
    opacity: 0.8,
    marginBottom: 20,
  },
  form: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    padding: 20,
    height: '80%'
  },
  goBack: {
    alignSelf: 'flex-end',
  },
  goBackText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  timerText: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
  timer: {
    color: colors.primary,
  },
});

export default ChangePassword;