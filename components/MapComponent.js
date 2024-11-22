import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Linking,
    Platform,
    Alert,
    SafeAreaView
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

const GOOGLE_API_KEY = 'AIzaSyAsc-PWMl_MI5iSNk9Jt61afWlZLFQ5Dmo';

const REGIONS = [
    { latitude: -26.2041, longitude: 28.0473 },
    { latitude: -33.9249, longitude: 18.4241 },
    { latitude: -25.7479, longitude: 28.2293 },
    { latitude: -29.8587, longitude: 31.0218 },
    { latitude: -25.6107, longitude: 27.7895 },
    { latitude: -31.6326, longitude: 28.5306 },
    { latitude: -30.675, longitude: 23.0418 },
    { latitude: -26.874, longitude: 29.2494 },
    { latitude: -24.1944, longitude: 29.0097 },
    { latitude: -29.6663, longitude: 27.2317 },
    { latitude: -30.874, longitude: 27.4708 },
    { latitude: -32.9468, longitude: 27.7013 },
    { latitude: -30.0097, longitude: 29.0097 },
    { latitude: -29.8587, longitude: 31.0218 },
];

const MapComponent = ({ onLocationSelect }) => {
    const [medicalFacilities, setMedicalFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    const initialRegion = {
        latitude: -30.5595,
        longitude: 22.9375,
        latitudeDelta: 10,
        longitudeDelta: 10,
    };

    const openInGoogleMaps = (facility) => {
        if (!userLocation) {
            Alert.alert('Location Required', 'Please enable location services to get directions.');
            return;
        }

        const destination = `${facility.latitude},${facility.longitude}`;
        const label = encodeURIComponent(facility.name || 'Medical Facility');

        const scheme = Platform.select({
            ios: 'comgooglemaps://',
            android: 'geo:'
        });

        const url = Platform.select({
            ios: `${scheme}?q=${label}@${destination}&directionsmode=driving`,
            android: `${scheme}0,0?q=${destination}(${label})`
        });

        const webUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url);
                }
                return Linking.openURL(webUrl);
            })
            .catch(() => {
                Linking.openURL(webUrl);
            });
    };

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const allFacilities = [];
                const processedIds = new Set();

                for (const region of REGIONS) {
                    const hospitalUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${region.latitude},${region.longitude}&radius=50000&type=hospital&key=${GOOGLE_API_KEY}`;
                    const clinicUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${region.latitude},${region.longitude}&radius=50000&keyword=clinic&type=health&key=${GOOGLE_API_KEY}`;

                    const [hospitalResponse, clinicResponse] = await Promise.all([
                        fetch(hospitalUrl),
                        fetch(clinicUrl)
                    ]);

                    const [hospitalData, clinicData] = await Promise.all([
                        hospitalResponse.json(),
                        clinicResponse.json()
                    ]);

                    if (hospitalData.results) {
                        hospitalData.results.forEach((place) => {
                            if (!processedIds.has(place.place_id)) {
                                processedIds.add(place.place_id);
                                allFacilities.push({
                                    id: place.place_id,
                                    name: place.name || 'Unnamed Facility',
                                    latitude: place.geometry.location.lat,
                                    longitude: place.geometry.location.lng,
                                    address: place.vicinity || 'Address not available',
                                    type: 'hospital'
                                });
                            }
                        });
                    }

                    if (clinicData.results) {
                        clinicData.results.forEach((place) => {
                            if (!processedIds.has(place.place_id)) {
                                processedIds.add(place.place_id);
                                allFacilities.push({
                                    id: place.place_id,
                                    name: place.name || 'Unnamed Facility',
                                    latitude: place.geometry.location.lat,
                                    longitude: place.geometry.location.lng,
                                    address: place.vicinity || 'Address not available',
                                    type: 'clinic'
                                });
                            }
                        });
                    }
                }

                setMedicalFacilities(allFacilities);
            } catch (error) {
                console.error('Error fetching facilities:', error);
                setErrorMsg('Error fetching medical facilities');
            } finally {
                setLoading(false);
            }
        };

        const getUserLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation(location.coords);
            } else {
                setErrorMsg('Location permission not granted');
            }
        };

        fetchFacilities();
        getUserLocation();
    }, []);

    const renderFacilityCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => onLocationSelect && onLocationSelect(item)}
        >
            <View style={styles.cardHeader}>
                <MaterialIcons 
                    name={item.type === 'hospital' ? 'local-hospital' : 'medical-services'} 
                    size={24} 
                    color={item.type === 'hospital' ? '#FF4444' : '#4444FF'} 
                />
                <Text style={styles.facilityName}>{item.name}</Text>
            </View>
            <Text style={styles.facilityAddress}>{item.address}</Text>
            <TouchableOpacity
                style={styles.directionButton}
                onPress={() => openInGoogleMaps(item)}
            >
                <MaterialIcons name="directions" size={20} color="#FFFFFF" />
                <Text style={styles.directionButtonText}>Get Directions</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>Medical Facilities</Text>
                    <Text style={styles.subHeaderText}>Hospitals & Clinics Near You</Text>
                </View>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#007BFF" />
                        <Text style={styles.loadingText}>Finding nearby medical facilities...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={medicalFacilities}
                        renderItem={renderFacilityCard}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
                {errorMsg && (
                    <View style={styles.errorContainer}>
                        <MaterialIcons name="error" size={24} color="#FF4444" />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    container: {
        flex: 1,
    },
    headerContainer: {
        backgroundColor: '#007BFF',
        padding: 15,
        alignItems: 'center',
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subHeaderText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 5,
        opacity: 0.9,
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    facilityName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    facilityAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    directionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    directionButtonText: {
        color: '#FFFFFF',
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#FFE5E5',
        padding: 15,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    errorText: {
        marginLeft: 10,
        color: '#FF4444',
        fontSize: 14,
        flex: 1,
    },
});

export default MapComponent;