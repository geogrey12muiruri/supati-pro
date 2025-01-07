import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Badge } from 'react-native-paper'; // Updated import

import Colors from './Shared/Colors';

const ClientHeader: React.FC<{ title: string }> = ({ title }) => {
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    return () => {
    };
  }, []);

  const handleLogout = () => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.profileImageFallback}>
          <Text style={styles.profileInitial}>A</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.notificationButton}>
          <AntDesign name="bells" size={24} color="black" />
          {notificationCount > 0 && (
            <Badge
              size={24}
              style={styles.badgeContainer}
            >
              {notificationCount}
            </Badge>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <AntDesign name="logout" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.ligh_gray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40, // Increased padding to create space from the status bar
    elevation: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileImageFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    color: 'white',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginLeft: 10,
  },
});

export default ClientHeader;
