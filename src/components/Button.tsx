import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled: boolean;
}

export const Button: React.FC<ButtonProps> = ({ onPress, title, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton]} // Apply disabled style
      onPress={disabled ? undefined : onPress} // Prevent onPress if disabled
      disabled={disabled} // Ensure TouchableOpacity knows it's disabled
    >
      <Text style={[styles.buttonText, disabled && styles.disabledText]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: colors.grey, // Change to a gray color when disabled
  },
  buttonText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: colors.lightgrey, // Lighten the text color when disabled
  },
});
