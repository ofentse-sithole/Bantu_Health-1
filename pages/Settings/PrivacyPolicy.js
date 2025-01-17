// pages/PrivacyPolicy.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { Platform } from 'react-native';

const PrivacyPolicy = () => {
    const navigation = useNavigation(); // Use the hook to get navigation

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar 
            barStyle="dark-content" 
            backgroundColor="#FFFFFF"
            translucent={Platform.OS === 'android'}
            />

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Privacy Policy</Text>
                </View>

                <Text style={styles.date}>Effective Date: 24 October 2024</Text>

                <View style={styles.card}>
                    <Text style={styles.content}>
                        At Bantu Health, we are committed to protecting your privacy. This policy
                        explains how we collect, use, and disclose your information when you use
                        our services.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.subTitle}>1. Information We Collect</Text>
                    <Text style={styles.content}>
                        We collect information to provide better services to all of our users. This
                        includes:
                    </Text>
                    <Text style={styles.bullet}>• Personal Information: Your name, email address, and other information you may choose to provide when setting up an account.</Text>
                    <Text style={styles.bullet}>• Health Information: Symptoms and medical conditions you input to receive AI-powered diagnosis suggestions.</Text>
                    <Text style={styles.bullet}>• Location Data: Your current location to show nearby hospitals and for emergency services.</Text>
                    <Text style={styles.bullet}>• Usage Data: We collect information about how you use the app, including features accessed, time spent, etc.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.subTitle}>2. How We Use Your Information</Text>
                    <Text style={styles.content}>
                        We use the information collected to:
                    </Text>
                    <Text style={styles.bullet}>• Provide AI-based health diagnoses.</Text>
                    <Text style={styles.bullet}>• Enhance user experience and improve app functionality.</Text>
                    <Text style={styles.bullet}>• Display nearby hospitals based on your location.</Text>
                    <Text style={styles.bullet}>• Enable emergency response by providing critical data to healthcare providers.</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.subTitle}>3. Data Security</Text>
                    <Text style={styles.content}>
                        We take reasonable measures to protect your data from unauthorized access. All
                        sensitive information is encrypted and securely stored. However, no security
                        system is 100% foolproof, and we cannot guarantee the absolute security of your
                        data.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.subTitle}>4. Your Rights</Text>
                    <Text style={styles.content}>
                        You have the right to access, update, or delete your personal information at any
                        time. For any requests, please contact us at [Support Email].
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.subTitle}>5. Updates to This Policy</Text>
                    <Text style={styles.content}>
                        We may update this Privacy Policy from time to time. We will notify you of
                        significant changes by posting the new policy on this page.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f4f8',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,

    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
        marginRight: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    subTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        textAlign: 'justify',
    },
    bullet: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginLeft: 10,
        marginBottom: 10,
    },
});

export default PrivacyPolicy;
