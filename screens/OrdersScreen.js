import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { auth, firestore } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';

const OrdersScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const cartRef = doc(firestore, 'carts', user.uid);
          const cartDoc = await getDoc(cartRef);

          if (cartDoc.exists()) {
            const cartData = cartDoc.data();
            const productIds = cartData.items || [];

            // Fetch product details for all items in the cart
            const productPromises = productIds.map(productId =>
              getDoc(doc(firestore, 'products', productId))
            );
            const productDocs = await Promise.all(productPromises);
            const productsList = productDocs.map(doc => ({ id: doc.id, ...doc.data() }));

            setCartItems(productsList);
          } else {
            setCartItems([]);
          }
        } else {
          console.log('No authenticated user');
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleBuy = async (productId) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const cartRef = doc(firestore, 'carts', user.uid);
        const cartDoc = await getDoc(cartRef);

        if (cartDoc.exists()) {
          const cartData = cartDoc.data();
          const productIds = cartData.items || [];

          await updateDoc(cartRef, {
            items: productIds.filter(id => id !== productId)
          });

          // Update order status in orders collection
          const orderRef = doc(firestore, 'orders', productId);
          await updateDoc(orderRef, {
            status: 'Purchased'
          });

          Alert.alert('Success', 'Product marked as purchased!');
        } else {
          Alert.alert('Error', 'Cart does not exist.');
        }
      } else {
        Alert.alert('Error', 'You must be logged in to modify cart.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error marking product as purchased.');
      console.error('Error marking product as purchased:', error);
    }
  };

  const handleCancel = async (productId) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const cartRef = doc(firestore, 'carts', user.uid);
        const cartDoc = await getDoc(cartRef);

        if (cartDoc.exists()) {
          const cartData = cartDoc.data();
          const productIds = cartData.items || [];

          // Remove item from cart
          await updateDoc(cartRef, {
            items: productIds.filter(id => id !== productId)
          });

          Alert.alert('Success', 'Product removed from cart!');
        } else {
          Alert.alert('Error', 'Cart does not exist.');
        }
      } else {
        Alert.alert('Error', 'You must be logged in to modify cart.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error removing product from cart.');
      console.error('Error removing product from cart:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <Text style={styles.orderName}>{item.name}</Text>
      <Text style={styles.orderCategory}>Category: {item.category}</Text>
      <Text style={styles.orderPrice}>Price: ${item.price}</Text>
      <Text style={styles.orderRatings}>Ratings: {item.ratings}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleBuy(item.id)}>
          <Text style={styles.buttonText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleCancel(item.id)}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cart Items</Text>
      {cartItems.length === 0 ? (
        <Text>No items in cart.</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
    padding: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  orderName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderCategory: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  orderPrice: {
    fontSize: 14,
    color: '#333',
    marginVertical: 4,
  },
  orderRatings: {
    fontSize: 14,
    color: '#333',
    marginVertical: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default OrdersScreen;
