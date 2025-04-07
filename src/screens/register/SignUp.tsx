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
import { Button } from './../../components/Button';
import { colors } from './../../constants/colors';


//Code realted to the integration
import { signUpUser } from './../../utils/mutations/authMutations';
import { useMutation } from '@tanstack/react-query';
import Toast from "react-native-toast-message";
import { saveToStorage } from "../../utils/storage";

type SignupInput = {
  name: string;
  phone: string;
  email: string;
  password: string;
};


const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const { isPending: isSigningUp, mutate: mutateSignUp } = useMutation<any, Error, SignupInput>({
    mutationFn: (data) => signUpUser(data),

    onSuccess: async (response) => {
      console.log("✅ Sign up successful:", response);

      Toast.show({
        type: "success",
        text1: "Account created",
        text2: "Please verify your email to continue",
      });

      const userEmail = response?.data?.email || email;
      const token = response?.data?.token;

      if (token) {
        try {
          await saveToStorage("authToken", token);
        } catch (err) {
          console.error("❌ Error saving authToken:", err);
        }
      }

      navigation.navigate("Verify" as never, { email: userEmail } as never);
    },

    onError: (error) => {
      console.error("❌ Sign up failed:", error);

      Toast.show({
        type: "error",
        text1: "Sign up failed",
        text2: "Please check your details and try again",
      });
    },
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Create an Account</Text>
          <Text style={styles.subtitle}>Create an account with your details</Text>

          <View style={styles.form}>


            <View style={styles.header}>
              <Text style={styles.headerText}>Got an account ? <Text>Login Here </Text> </Text>

              <TouchableOpacity onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
            <FormInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              autoCapitalize="words"
            />
            <FormInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <FormInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
            />
            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
            />

            <Button
              title={isSigningUp ? "Creating Account..." : "Create an Account"}
              onPress={() => mutateSignUp({
                name: fullName,
                phone,
                email,
                password,
              })}
              disabled={!fullName || !phone || !email || !password || isSigningUp}
            />

            <Text style={styles.termsText}>
              By continuing you agree with Fast Logistics{' '}
              <Text style={styles.link}>terms of agreement</Text> and{' '}
              <Text style={styles.link}>privacy policy</Text>
            </Text>
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
    fontWeight: 'bold',
    color: colors.grey,
    marginBottom: 18,
    textAlign: 'left'
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
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 50
  },
  headerText: {
    color: 'grey',
    marginRight: 4,
  },
  loginButton: {
    backgroundColor: colors.grey,
    padding: 14,
    borderRadius: 50,
    width: 70
  },
  loginLink: {
    color: colors.black,
    fontWeight: '600',
    textDecorationLine: 'none',
    textAlign: 'center',
  },
  termsText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default SignUp;