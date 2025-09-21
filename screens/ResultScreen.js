import React from 'react';
import { StyleSheet, Text, View, Image, Button, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MOCK_DATA } from './HomeScreen'; // Import the mock data

export default function ResultScreen({ route, navigation }) {
  const { imageUri, sampleKey, isCustom, resultData } = route.params || {};

  const sample = !isCustom && sampleKey ? MOCK_DATA[sampleKey] : null;
  const details = resultData?.details ?? sample?.details ?? null;
  const imageSource = imageUri ? { uri: imageUri } : sample ? sample.image : null;

  return (
    <LinearGradient
      colors={['#A8CDA8', '#E8DDB5']} // Earthy green to sandy beige
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} />
        ) : (
          <View style={[styles.image, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#5E5E5E' }}>No image</Text>
          </View>
        )}

        <View style={styles.card}>
          {details ? (
            <>
              <Text style={styles.cardTitle}>Classification Details</Text>
              {Object.entries(details).map(([key, value]) => (
                <View style={styles.row} key={key}>
                  <Text style={styles.label}>{key}:</Text>
                  <Text style={styles.value}>{String(value)}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.defaultText}>
              No analysis available. Try again from Home.
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackButtonText}>Go Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'flex-start',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  defaultText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#5E5E5E',
    lineHeight: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#3A3A3A',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 58, 58, 0.1)',
  },
  label: {
    fontSize: 16,
    color: '#3A3A3A',
    fontWeight: '700',
  },
  value: {
    fontSize: 16,
    color: '#5E5E5E',
  },
  goBackButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});