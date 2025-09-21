import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Image, SafeAreaView,TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
// gradient add kiya
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { analyzeImage, healthCheck, BASE_URL } from '../services/api';

// Pre-loaded mock data
const MOCK_DATA = {
  'cow1': {
    image: require('../assets/cow1.jpg'),
    details: {
      'Breed': 'Sahiwal',
      'Body Length': '142 cm',
      'Chest Width': '55 cm',
      'Rump Angle': '21°',
      'Score': '8.5 / 10'
    }
  },
  'cow2': {
    image: require('../assets/cow2.jpg'),
    details: {
      'Breed': 'Gir',
      'Body Length': '135 cm',
      'Chest Width': '48 cm',
      'Rump Angle': '19°',
      'Score': '7.8 / 10'
    }
  },
  'cow3': {
    image: require('../assets/cow3.jpg'),
    details: {
      'Breed': 'Red Sindhi',
      'Body Length': '138 cm',
      'Chest Width': '51 cm',
      'Rump Angle': '22°',
      'Score': '8.1 / 10'
    }
  }
};

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const pickImage = async (isCamera) => {
    let result;
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    };

    try {
      if (isCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Camera access is needed to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Gallery access is needed to pick photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) {
        Alert.alert('Error', 'No image URI found.');
        return;
      }

      setLoading(true);
      try {
        await healthCheck();
      } catch (hcErr) {
        Alert.alert(
          'Backend unreachable',
          `${hcErr.message}\n\nTips:\n• If using Android emulator, set BASE_URL to http://10.0.2.2:8000\n• For device, use your PC LAN IP (e.g., http://192.168.1.x:8000)\n• Ensure the /analyze server is running and firewall allows access.`
        );
        return;
      }

      const analysis = await analyzeImage(uri);

      navigation.navigate('Result', {
        imageUri: uri,
        isCustom: true,
        resultData: analysis,
      });
    } catch (e) {
      Alert.alert('Upload failed', e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };
  
  const viewSample = (sampleKey) => {
     // For sample images, we pass the key to retrieve mock data
    navigation.navigate('Result', { sampleKey: sampleKey, isCustom: false });
  };

 return (
    // 2. WRAP the entire view in the LinearGradient component
    <LinearGradient
      colors={['#A8CDA8', '#E8DDB5']} // A nice earthy green to a sandy beige
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {/* Optional: You can add a logo/icon here */}
          {/* <Image source={require('../assets/farm-icon.png')} style={styles.icon} /> */}
          <Text style={styles.title}>Cattle Classifier</Text>
          <Text style={styles.description}>
            Use AI to evaluate the body structure of your livestock for productivity and health.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* 3. REPLACE the old <Button> with our new custom <TouchableOpacity> button */}
          <TouchableOpacity style={styles.primaryButton} onPress={() => pickImage(true)} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Uploading...' : '📸 Take Photo'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={() => pickImage(false)} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Uploading...' : '🖼️ Upload from Gallery'}</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator style={{ marginTop: 8 }} color="#2e7d32" />}
        </View>
        
        <View style={styles.sampleContainer}>
          <Text style={styles.sampleTitle}>— or use our samples —</Text>
          <View style={styles.sampleButtons}>
            {/* 4. The sample buttons are also replaced with a different style */}
            <TouchableOpacity style={styles.secondaryButton} onPress={() => viewSample('cow1')}>
               <Text style={styles.secondaryButtonText}>Sample 1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => viewSample('cow2')}>
               <Text style={styles.secondaryButtonText}>Sample 2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => viewSample('cow3')}>
               <Text style={styles.secondaryButtonText}>Sample 3</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// 5. THE STYLESHEET is completely updated for the new look
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', // Center content vertically
    padding: 20,
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 50,
  },
  title: { 
    fontSize: 36, 
    fontWeight: '700', // A bit bolder
    color: '#3A3A3A', // Dark text for contrast
    marginBottom: 15,
  },
  description: { 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#5E5E5E', // A softer dark grey
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonContainer: { 
    width: '90%', 
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#4CAF50', // A strong, earthy green
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30, // Fully rounded corners
    alignItems: 'center',
    marginBottom: 15,
    // Adding a subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sampleContainer: { 
    alignItems: 'center', 
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(58, 58, 58, 0.2)',
  },
  sampleTitle: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: '#5E5E5E', 
    marginBottom: 20,
  },
  sampleButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // A semi-transparent white
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  }
});

// We need to export this so ResultScreen can use it
export { MOCK_DATA };