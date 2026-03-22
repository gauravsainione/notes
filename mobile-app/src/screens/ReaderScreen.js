import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { useAuth } from '../context/AuthContext';
import { API_HOST } from '../config';

const ReaderScreen = ({ route }) => {
  const { orderId } = route.params;
  const { token } = useAuth();

  const source = {
    uri: `http://${API_HOST}/api/orders/${orderId}/view`,
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: true
  };

  return (
    <View style={styles.container}>
      <Pdf
        source={source}
        trustAllCerts={false}
        style={styles.pdf}
        renderActivityIndicator={() => (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffff'
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  }
});

export default ReaderScreen;
