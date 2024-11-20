import React, { useState, useRef, useEffect } from 'react';
import { 
  StatusBar,
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  SafeAreaView, 
  ActivityIndicator, 
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Navbar from '../components/Navbar/Navbar';
import { Platform } from 'react-native';
import { VULAVULA_TOKEN } from '@env';

const SymptomsAnalysis = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [result, setResult] = useState(null);
  const [emptyInputMessage, setEmptyInputMessage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('eng_Latn');
  const [translatedText, setTranslatedText] = useState('');
  const [keyboardHeight] = useState(new Animated.Value(0));
  const scrollViewRef = useRef(null);
  const resultRef = useRef(null);

  const symptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea',
    'Sore Throat', 'Body Aches', 'Shortness of Breath',
    'Dizziness', 'Chest Pain'
  ];

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      },
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }

    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const toggleSymptom = (symptom) => {
    Keyboard.dismiss();
    setSelectedSymptoms((prevSymptoms) =>
      prevSymptoms.includes(symptom)
        ? prevSymptoms.filter((s) => s !== symptom)
        : [...prevSymptoms, symptom]
    );
  };

  const analyzeSymptoms = async () => {
    Keyboard.dismiss();
    if (!additionalInfo.trim()) {
      setEmptyInputMessage(true);
      return;
    }
    setEmptyInputMessage(false);
    setLoading(true);
    try {
      const analysisResult = await analyzeSymptomsWithAPI(selectedSymptoms, additionalInfo);
      setResult(analysisResult);
      scrollViewRef.current?.scrollTo({
        y: resultRef.current?.offsetTop,
        animated: true,
      });
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSymptomsWithAPI = async (symptoms, additionalInfo) => {
    try {
      const response = await fetch('https://vitality-health-api.vercel.app/api/analyze-symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms,
          additionalInfo: additionalInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const cleanedAnalysis = data.analysis.replace(/[*#]/g, '');
      return cleanedAnalysis;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw error;
    }
  };

  const translateText = async (text, targetLanguage) => {
    const TRANSLATION_URL = "https://vulavula-services.lelapa.ai/api/v1/translate/process";

    const payload = {
      input_text: text,
      source_lang: 'eng_Latn',
      target_lang: targetLanguage,
    };

    try {
      const response = await fetch(TRANSLATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CLIENT-TOKEN': VULAVULA_TOKEN,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      return data.translation[0].translation_text;
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  };

  const handleTranslate = async () => {
    Keyboard.dismiss();
    if (!result || !selectedLanguage) return;
    
    setLoading(true);
    try {
      const translated = await translateText(result, selectedLanguage);
      if (translated) {
        setTranslatedText(translated);
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    } catch (error) {
      console.error('Error translating result:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#FFFFFF"
        translucent={Platform.OS === 'android'}
      />

      <View style={styles.header}>
        <MaterialCommunityIcons name="medical-bag" size={32} color="#007AFF" />
        <Text style={styles.title}>BantuHealthAI</Text>
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Select Your Symptoms</Text>
          <View style={styles.symptomsContainer}>
            {symptoms.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.symptomButton,
                  selectedSymptoms.includes(symptom) && styles.selectedSymptom,
                  styles.elevation
                ]}
                onPress={() => toggleSymptom(symptom)}
              >
                <Text style={[
                  styles.symptomText,
                  selectedSymptoms.includes(symptom) && styles.selectedSymptomText,
                ]}>
                  {symptom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Additional Information</Text>
          <TextInput
            style={[styles.input, styles.elevation]}
            multiline
            numberOfLines={4}
            placeholder="Describe your symptoms in detail..."
            placeholderTextColor="#666"
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => {
              setIsInputFocused(false);
              Keyboard.dismiss();
            }}
          />

          {emptyInputMessage && (
            <Text style={styles.errorMessage}>Please provide additional information about your symptoms.</Text>
          )}

          <TouchableOpacity
            style={[styles.analyzeButton, styles.elevation]}
            onPress={analyzeSymptoms}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="brain" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.analyzeButtonText}>Analyze Symptoms</Text>
              </>
            )}
          </TouchableOpacity>

          {result && (
            <View 
              ref={resultRef}
              style={[styles.resultContainer, styles.elevation]}
            >
              <Text style={styles.resultTitle}>Analysis Results</Text>
              <Text style={styles.resultText}>{result}</Text>
              <Picker
                selectedValue={selectedLanguage}
                onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Language" value="" />
                <Picker.Item label="Northern Sotho" value="nso_Latn" />
                <Picker.Item label="Afrikaans" value="afr_Latn" />
                <Picker.Item label="Southern Sotho" value="sot_Latn" />
                <Picker.Item label="Swati" value="ssw_Latn" />
                <Picker.Item label="Tsonga" value="tso_Latn" />
                <Picker.Item label="Tswana" value="tsn_Latn" />
                <Picker.Item label="Xhosa" value="xho_Latn" />
                <Picker.Item label="Zulu" value="zul_Latn" />
                <Picker.Item label="English" value="eng_Latn" />
                <Picker.Item label="Swahili" value="swh_Latn" />
              </Picker>
              <TouchableOpacity
                style={[styles.translateButton, styles.elevation]}
                onPress={handleTranslate}
                disabled={loading || !selectedLanguage}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.translateButtonText}>Translate</Text>
                )}
              </TouchableOpacity>
              {translatedText && (
                <View style={styles.translationContainer}>
                  <Text style={styles.translationTitle}>Translated Results:</Text>
                  <Text style={styles.translatedText}>{translatedText}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
      <Animated.View style={{
        transform: [{
          translateY: keyboardHeight.interpolate({
            inputRange: [0, 1000],
            outputRange: [0, 1000],
          })
        }]
      }}>
        <Navbar />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingBottom: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    paddingHorizontal: 20,
    marginBottom: 60
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginLeft: 12,
    color: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  symptomButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginVertical: 6,
    width: '48%',
  },
  selectedSymptom: {
    backgroundColor: '#007AFF',
  },
  symptomText: {
    textAlign: 'center',
    color: '#1A1A1A',
    fontWeight: '500',
  },
  selectedSymptomText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    minHeight: 120,
    fontSize: 16,
    color: '#1A1A1A',
  },
  errorMessage: {
    color: '#DC3545',
    marginBottom: 16,
    fontSize: 14,
  },
  analyzeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1A1A1A',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  elevation: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  picker: {
    height: 50,
    width: '100%',
    marginVertical: 10,
  },
  translateButton: {
    backgroundColor: '#28A745',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  translateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  translationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  translationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  translatedText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  }
});

export default SymptomsAnalysis;

