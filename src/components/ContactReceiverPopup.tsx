import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ContactReceiverPopupProps {
    visible: boolean;
    onClose: () => void;
    name: string;
    phone: string;
    address: string;
    onCall: () => void;
}

export const ContactReceiverPopup: React.FC<ContactReceiverPopupProps> = ({
    visible,
    onClose,
    name,
    phone,
    address,
    onCall
}) => {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.popupContainer}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="gray" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Contact Receiver</Text>

                    {/* Customer Details */}
                    <View style={styles.infoContainer}>
                        <View style={{ flexDirection: 'column', gap: 4, }}>
                            <Text style={styles.label}>Customer Name</Text>
                            <Text style={styles.value}>{name}</Text>
                        </View>

                        <View style={{ flexDirection: 'column', gap: 4, }}>

                            <Text style={styles.label}>Customer Phone Number</Text>
                            <Text style={styles.value}>{phone}</Text>
                        </View>
                        <View style={{ flexDirection: 'column', gap: 4, }}>

                            <Text style={styles.label}>Customer Address</Text>
                            <Text style={styles.value}>{address}</Text>
                        </View>
                    </View>

                    {/* Call Button */}
                    <TouchableOpacity style={styles.callButton} onPress={onCall}>
                        <Ionicons name="call" size={20} color="white" />
                        <Text style={styles.callText}>Call Customer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoContainer: {
        alignSelf: 'stretch',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 13,
        color: 'gray',
        marginTop: 10,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: 'black',
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#72007E',
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        justifyContent: 'center',
        elevation: 3,
    },
    callText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 8,
    },
});

