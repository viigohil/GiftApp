import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { firestore, auth } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Define local image sources
const imageSources = {
  default: require('../assets/gifts.jpg'), // Default image for missing local images
};

const ProductDetailScreen = ({ route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(firestore, 'products', productId);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          setProduct(productDoc.data());
        } else {
          setError('Product not found.');
        }
      } catch (error) {
        setError('Error fetching product.');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const cartRef = doc(firestore, 'carts', user.uid);
        const cartDoc = await getDoc(cartRef);

        if (cartDoc.exists()) {
          // Document exists, update it
          const cartData = cartDoc.data();
          const productIds = cartData.items || [];

          await setDoc(cartRef, {
            items: [...productIds, productId]
          }, { merge: true }); // Merge to avoid overwriting other fields

          Alert.alert('Success', 'Product added to cart!');
        } else {
          // Document does not exist, create it
          await setDoc(cartRef, {
            items: [productId]
          });

          Alert.alert('Success', 'Product added to cart!');
        }
      } else {
        Alert.alert('Error', 'You must be logged in to add items to the cart.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error adding product to cart.');
      console.error('Error adding product to cart:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  // Ensure imageUrl exists
  const imageUrl = product?.imageUrl || '';
  const imageSource = imageUrl.startsWith('http')
    ? { uri: imageUrl }
    : imageSources.default;

  return (
    <View style={styles.container}>
      {product && (
        <>
          <Image source={imageSource} style={styles.productImage} />
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <Button title="Add to Cart" onPress={handleAddToCart} color="#007BFF" />
        </>
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
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: '#007BFF',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ProductDetailScreen;
