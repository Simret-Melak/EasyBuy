import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './FirebaseConfig';
import { useNavigation } from '@react-navigation/native';  
import Icon from 'react-native-vector-icons/Ionicons';  

const OrderHistoryPage = () => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getAuth().currentUser;
  const navigation = useNavigation(); 

  const fetchOrderHistory = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const orders = userDocSnap.data()?.OrderHistory || [];
          setOrderHistory(orders);
        } else {
          console.log("No user document found.");
          setOrderHistory([]);
        }
      } catch (error) {
        console.error("Error fetching order history: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const renderOrderItem = ({ item }) => {
    const orderId = item.id || 'N/A'; 
    const timestamp = item.timestamp;
  
    let formattedDate = 'Invalid Date';
    let formattedTime = '';
    if (timestamp) {
      const date = new Date(timestamp); 
      formattedDate = date.toLocaleDateString();
      formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  
    return (
      <View style={styles.orderContainer}>
        <Text style={styles.orderTitle}>Order ID: {orderId}</Text>
        <Text style={styles.orderDetails}>Total: ${item.total.toFixed(2)}</Text>
        <Text style={styles.orderDetails}>Date: {formattedDate} at {formattedTime}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScroll}>
          {item.items.map((i, index) => (
            <View key={index} style={styles.itemCard}>
              <Image source={{ uri: i.imageURL }} style={styles.itemImage} />
              <Text style={styles.itemName}>{i.name}</Text>
              <Text style={styles.itemQuantity}>Qty: {i.quantity}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={30} color="#333" />  
        </TouchableOpacity>
        <Text style={styles.header}>Order History</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading order history...</Text>
        ) : orderHistory.length === 0 ? (
          <Text style={styles.emptyText}>No orders found.</Text>
        ) : (
          <FlatList
            data={orderHistory}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.orderId}
            contentContainerStyle={styles.orderList}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fceade',
  },
  header: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
    marginTop: 20,
  },
  orderList: {
    paddingVertical: 10,
  },
  orderContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#25ced1',
  },
  orderDetails: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  itemsScroll: {
    flexDirection: 'row',
    marginTop: 10,
  },
  itemCard: {
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
});

export default OrderHistoryPage;