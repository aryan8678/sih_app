import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import cattleClassificationAPI from '../services/cattleClassificationAPI';

// Pre-loaded mock data
const MOCK_DATA = {
  'cow1': {
    image: require('../assets/cow1.jpg'),
    details: { 'Breed': 'Gir', 'Body Length': '142 cm', 'Chest Width': '55 cm', 'Rump Angle': '21°', 'Score': '8.5 / 10' }
  },
  'cow2': {
    image: require('../assets/cow2.jpg'),
    details: { 'Breed': 'Murrah', 'Body Length': '135 cm', 'Chest Width': '48 cm', 'Rump Angle': '19°', 'Score': '7.8 / 10' }
  },
  'cow3': {
    image: require('../assets/cow3.jpg'),
    details: { 'Breed': 'Sahiwal', 'Body Length': '138 cm', 'Chest Width': '51 cm', 'Rump Angle': '22°', 'Score': '8.1 / 10' }
  }
};

export default function HomeScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testAPIConnection = async () => {
    setIsTestingConnection(true);
    try {
      const results = await cattleClassificationAPI.testConnectivity();
      let message = 'API Connectivity Test Results:\n\n';
      Object.entries(results).forEach(([endpoint, result]) => {
        message += result.status === 'success'
          ? `✅ ${endpoint}\n   Response: ${result.responseTime}ms\n\n`
          : `❌ ${endpoint}\n   Error: ${result.error}\n\n`;
      });
      Alert.alert('Connection Test Results', message, [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('Test Failed', error.message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const classifyImage = async (imageUri) => {
    setIsLoading(true);
    try {
      const result = await cattleClassificationAPI.classifyImage(imageUri);
      if (result.success) {
        navigation.navigate('Result', { imageUri, classificationResult: result.data, isCustom: true });
      } else {
        Alert.alert(
          'Using Mock Data',
          '⚠️ Could not connect to AI server. Showing mock results for demonstration.',
          [{
            text: 'Continue with Mock Data',
            onPress: () => navigation.navigate('Result', { imageUri, classificationResult: result.data, isCustom: true, isMockData: true })
          }, { text: 'Cancel', style: 'cancel' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during classification.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async (isCamera) => {
    const permission = isCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permission.granted === false) {
      alert('Camera/Gallery access is required!');
      return;
    }

    const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    };

    const result = isCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      await classifyImage(result.assets[0].uri);
    }
  };
  
  const viewSample = (sampleKey) => {
    navigation.navigate('Result', { sampleKey, isCustom: false });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.description}>
          Evaluate animal body structure using AI.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="📸 Take Photo for Classification" onPress={() => pickImage(true)} disabled={isLoading} />
        <View style={{ marginVertical: 10 }} />
        <Button title="🖼️ Upload Photo for Classification" onPress={() => pickImage(false)} disabled={isLoading} />
        <View style={{ marginVertical: 10 }} />
        <Button title="🔴 Live Detection (YOLO)" onPress={() => navigation.navigate('LiveDetection')} disabled={isLoading || isTestingConnection} color="#d9534f" />
        <View style={{ marginVertical: 10 }} />
        <Button title="🔧 Test API Connection" onPress={testAPIConnection} disabled={isTestingConnection || isLoading} color="#FF6B35" />
        
        {(isLoading || isTestingConnection) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>{isLoading ? 'Analyzing...' : 'Testing...'}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.sampleContainer}>
        <Text style={styles.sampleTitle}>Or Use Our Samples:</Text>
        <View style={styles.sampleButtons}>
           <Button title="Sample 1" onPress={() => viewSample('cow1')} />
           <Button title="Sample 2" onPress={() => viewSample('cow2')} />
           <Button title="Sample 3" onPress={() => viewSample('cow3')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', color: '#666', paddingHorizontal: 20 },
  buttonContainer: { width: '80%', marginBottom: 40 },
  loadingContainer: { alignItems: 'center', marginTop: 20, padding: 20, backgroundColor: '#f8f8f8', borderRadius: 10 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#0066cc' },
  sampleContainer: { alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 20, width: '100%' },
  sampleTitle: { fontSize: 18, fontWeight: '500', color: '#444', marginBottom: 15 },
  sampleButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%'}
});

export { MOCK_DATA };