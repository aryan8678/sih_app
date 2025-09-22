import React from 'react';
import { StyleSheet, Text, View, Image, Button, SafeAreaView, ScrollView } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MOCK_DATA } from './HomeScreen'; // Import the mock data

export default function ResultScreen({ route, navigation }) {
  const { imageUri, sampleKey, isCustom, classificationResult, isMockData } = route.params;
  
  // Determine which data to show
  const dataToShow = isCustom ? null : MOCK_DATA[sampleKey];
  const imageSource = isCustom ? { uri: imageUri } : dataToShow.image;

  // Render confidence scores for AI classification
  const renderConfidenceScores = (confidenceScores) => {
    if (!confidenceScores) return null;

    // Sort confidence scores in descending order
    const sortedScores = Object.entries(confidenceScores)
      .sort(([,a], [,b]) => b - a);

    return (
      <Animatable.View animation="slideInUp" delay={300} style={styles.confidenceContainer}>
        <Text style={styles.sectionTitle}>🎯 Confidence Scores</Text>
        {sortedScores.map(([breed, confidence], index) => {
          const isTopPrediction = index === 0;
          return (
            <Animatable.View 
              key={breed} 
              animation="fadeInRight" 
              delay={400 + (index * 100)}
              style={[styles.confidenceRow, isTopPrediction && styles.topPrediction]}
            >
              <Text style={[styles.breedName, isTopPrediction && styles.topBreedName]}>
                {isTopPrediction ? '🏆 ' : ''}{breed}
              </Text>
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceBarFill, 
                    { width: `${confidence}%` },
                    isTopPrediction && styles.topConfidenceBar
                  ]} 
                />
                <Text style={[styles.confidenceText, isTopPrediction && styles.topConfidenceText]}>
                  {confidence.toFixed(1)}%
                </Text>
              </View>
            </Animatable.View>
          );
        })}
      </Animatable.View>
    );
  };

  // Render additional information
  const renderAdditionalInfo = (additionalInfo) => {
    if (!additionalInfo) return null;

    return (
      <Animatable.View animation="slideInUp" delay={600} style={styles.additionalInfoContainer}>
        <Text style={styles.sectionTitle}>📊 Additional Analysis</Text>
        {Object.entries(additionalInfo).map(([key, value], index) => (
          <Animatable.View 
            key={key} 
            animation="fadeInLeft" 
            delay={700 + (index * 50)}
            style={styles.infoRow}
          >
            <Text style={styles.infoLabel}>{key}:</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </Animatable.View>
        ))}
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="zoomIn" duration={800}>
          <Image source={imageSource} style={styles.image} />
        </Animatable.View>

        {isCustom && classificationResult ? (
          // AI Classification Results
          <>
            <Animatable.View animation="slideInUp" delay={200} style={styles.resultCard}>
              <Text style={styles.resultTitle}>
                {isMockData ? '🎭 Mock AI Classification' : '🤖 AI Classification Result'}
              </Text>
              {isMockData && (
                <Text style={styles.mockWarning}>
                  ⚠️ This is demonstration data. Connect to API for real results.
                </Text>
              )}
              <Text style={styles.predictedBreed}>
                Predicted Breed: {classificationResult.predicted_breed}
              </Text>
              {classificationResult.prediction_time && (
                <Text style={styles.timestamp}>
                  Analyzed at: {new Date(classificationResult.prediction_time).toLocaleString()}
                </Text>
              )}
            </Animatable.View>

            {renderConfidenceScores(classificationResult.confidence_scores)}
            {renderAdditionalInfo(classificationResult.additional_info)}
          </>
        ) : isCustom ? (
          // Fallback for custom images without classification
          <Animatable.View animation="slideInUp" delay={200} style={styles.card}>
            <Text style={styles.defaultText}>
              🔬 AI analysis is being processed. This is where detailed breed classification would appear.
            </Text>
          </Animatable.View>
        ) : (
          // Sample data display
          <Animatable.View animation="slideInUp" delay={200} style={styles.card}>
            <Text style={styles.cardTitle}>📋 Sample Classification Details</Text>
            {Object.entries(dataToShow.details).map(([key, value], index) => (
              <Animatable.View 
                key={key} 
                animation="fadeInRight" 
                delay={300 + (index * 100)}
                style={styles.row}
              >
                <Text style={styles.label}>{key}:</Text>
                <Text style={styles.value}>{value}</Text>
              </Animatable.View>
            ))}
          </Animatable.View>
        )}

        <Animatable.View animation="bounceIn" delay={1000} style={styles.buttonContainer}>
          <Button title="🏠 Analyze Another Image" onPress={() => navigation.goBack()} />
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  mockWarning: {
    fontSize: 14,
    color: '#FF8C00',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 5,
  },
  predictedBreed: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  confidenceContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  confidenceRow: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  topPrediction: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
  },
  breedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  topBreedName: {
    color: '#856404',
    fontSize: 17,
  },
  confidenceBar: {
    height: 25,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  confidenceBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  topConfidenceBar: {
    backgroundColor: '#ffc107',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    zIndex: 1,
  },
  topConfidenceText: {
    color: '#856404',
  },
  additionalInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  defaultText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    lineHeight: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
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
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
});