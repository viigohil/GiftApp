import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { auth, firestore } from '../firebase/firebaseConfig';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

const imageSources = {
  default: require('../assets/gifts.jpg'), 
};

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
          setError('Error fetching cart items.');
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

                  // Remove product from cart
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

          // Remove product from cart
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

    // Determine image source
    const imageSource = item.imageUrl && item.imageUrl.startsWith('http')
      ? { uri: item.imageUrl }
      : imageSources.default;

    return (
      <View style={styles.itemContainer}>
        <Image source={imageSource} style={styles.productImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemPrice}>${isNaN(price) ? 'N/A' : price.toFixed(2)}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => handleBuy(item.id)}>
              <Text style={styles.buttonText}>Buy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => handleCancel(item.id)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#ffb5ad',
  },
  listContainer: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    marginVertical: 8,
    padding: 16,
    alignItems: 'center',
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  itemPrice: {
    fontSize: 18,
    color: '#007BFF',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 4,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF5733',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    color: '#FF5733',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default OrdersScreen;
