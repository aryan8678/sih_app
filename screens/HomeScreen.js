import React from 'react';
import { StyleSheet, Text, View, Button, Image, SafeAreaView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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

  const pickImage = async (isCamera) => {
    let result;
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    };

    if (isCamera) {
      // Ask for camera permissions
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.granted === false) {
        alert('Camera access is required!');
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
       // Ask for gallery permissions
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.granted === false) {
        alert('Gallery access is required!');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      // For any user-uploaded image, we pass its URI and a "custom" flag
      navigation.navigate('Result', { imageUri: result.assets[0].uri, isCustom: true });
    }
  };
  
  const viewSample = (sampleKey) => {
     // For sample images, we pass the key to retrieve mock data
    navigation.navigate('Result', { sampleKey: sampleKey, isCustom: false });
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.description}>
          Evaluate animal body structure to predict longevity, productivity, and reproductive efficiency using AI.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="📸 Take Photo" onPress={() => pickImage(true)} />
        <View style={{ marginVertical: 10 }} />
        <Button title="🖼️ Upload Photo from Gallery" onPress={() => pickImage(false)} />
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
  container: { flex: 1, backgroundColor: '#ffffffff', alignItems: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 16, textAlign: 'center', color: '#666', paddingHorizontal: 20 },
  buttonContainer: { width: '80%', marginBottom: 40 },
  sampleContainer: { alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 20, width: '100%' },
  sampleTitle: { fontSize: 18, fontWeight: '500', color: '#444', marginBottom: 15 },
  sampleButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%'}
});

// We need to export this so ResultScreen can use it
export { MOCK_DATA };