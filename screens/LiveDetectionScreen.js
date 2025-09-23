import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import cattleClassificationAPI from '../services/cattleClassificationAPI';

export default function LiveDetectionScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const cameraRef = useRef(null);

  const captureAndClassify = async () => {
    if (isProcessing || !cameraRef.current) return;

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        skipProcessing: true,
      });

      const result = await cattleClassificationAPI.classifyImage(photo.base64);
      setLastResult(result);
    } catch (error) {
      console.error('Error taking or processing picture:', error);
      setLastResult({ success: false, error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Camera permission not granted</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"   // ✅ new API expects string, not CameraType
      />

      {/* Result Overlay */}
      {lastResult && (
        <View style={styles.resultOverlay}>
          {lastResult.success ? (
            <View>
              <Text style={styles.resultText}>
                Breed: {lastResult.data.prediction}
              </Text>
              <Text style={styles.confidenceText}>
                Confidence: {(lastResult.data.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          ) : (
            <Text style={styles.errorText}>
              {lastResult.error || 'Classification failed'}
            </Text>
          )}
        </View>
      )}

      {/* Capture Button */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={captureAndClassify}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.captureButtonText}>Classify</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  resultText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  confidenceText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: '#666',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});