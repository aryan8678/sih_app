import React from 'react';
import { StyleSheet, Text, View, Image, Button, SafeAreaView } from 'react-native';
import { MOCK_DATA } from './HomeScreen'; // Import the mock data

export default function ResultScreen({ route, navigation }) {
  const { imageUri, sampleKey, isCustom } = route.params;
  
  // Determine which data to show
  const dataToShow = isCustom ? null : MOCK_DATA[sampleKey];
  const imageSource = isCustom ? { uri: imageUri } : dataToShow.image;

  return (
    <SafeAreaView style={styles.container}>
      <Image source={imageSource} style={styles.image} />

      <View style={styles.card}>
        {isCustom ? (
          <Text style={styles.defaultText}>
            Demo data is not available for custom images. This is where AI analysis would appear.
          </Text>
        ) : (
          <>
            <Text style={styles.cardTitle}>Classification Details</Text>
            {Object.entries(dataToShow.details).map(([key, value]) => (
              <View style={styles.row} key={key}>
                <Text style={styles.label}>{key}:</Text>
                <Text style={styles.value}>{value}</Text>
              </View>
            ))}
          </>
        )}
      </View>

      <Button title="Go Back to Home" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#ddd'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
});