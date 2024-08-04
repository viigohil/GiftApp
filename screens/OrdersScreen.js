import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { auth, firestore } from '../firebase/firebaseConfig';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

// OrdersScreen Component
const OrdersScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch cart items from Firestore with real-time updates
  const fetchCartItems = () => {
    const user = auth.currentUser;
    if (user) {
      const cartRef = doc(firestore, 'carts', user.uid);

      const unsubscribe = onSnapshot(cartRef, async (snapshot) => {
        try {
          if (snapshot.exists()) {
            const cartData = snapshot.data();
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
        } catch (error) {
          console.error('Error fetching cart items:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } else {
      console.log('No authenticated user');
      setCartItems([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchCartItems();
    return () => unsubscribe && unsubscribe();
  }, []);

  // Function to handle buying a product
  const handleBuy = (productId) => {
    Alert.alert(
      'Confirm Purchase',
      'Do you want to buy this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
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
                  fetchCartItems(); // Refresh the cart items
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
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Function to handle canceling a product
  const handleCancel = async (productId) => {
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

          Alert.alert('Success', 'Product removed from cart.');
          fetchCartItems(); // Refresh the cart items
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

  // Function to render each item in the cart
  const renderItem = ({ item }) => {
    // Ensure `price` is a number before calling `toFixed`
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price);

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemPrice}>${isNaN(price) ? 'N/A' : price.toFixed(2)}</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleBuy(item.id)}>
            <Text style={styles.buttonText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleCancel(item.id)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  listContainer: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginVertical: 8,
    padding: 8,
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    color: '#007BFF',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginVertical: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default OrdersScreen;
