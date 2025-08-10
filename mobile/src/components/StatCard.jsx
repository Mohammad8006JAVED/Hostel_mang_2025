import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';

export default function StatCard({ icon: Icon, number, label, color, theme }) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const styles = createStyles(theme, color);

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const createStyles = (theme, color) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  number: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: theme.textSecondary,
    textAlign: 'center',
  },
});