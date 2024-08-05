import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ActivityIndicator, Alert, StyleSheet, FlatList } from 'react-native';
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
        <View style={styles.content}>
          <Image source={imageSource} style={styles.productImage} />
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <Button title="Add to Cart" onPress={handleAddToCart} color="#007BFF" />
          
          {/* Render Reviews */}
          {product.reviews && product.reviews.length > 0 ? (
            <View style={styles.reviewsContainer}>
              <Text style={styles.reviewsTitle}>Reviews:</Text>
              <FlatList
                data={product.reviews}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.reviewItem}>
                    <Text style={styles.reviewAuthor}>{item.author}</Text>
                    <Text style={styles.reviewRating}>Rating: {item.rating}</Text>
                    <Text style={styles.reviewComment}>{item.comment}</Text>
                  </View>
                )}
              />
            </View>
          ) : (
            <Text style={styles.noReviews}>No reviews yet.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffb5ad',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400, 
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
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 20,
    color: '#007BFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  productDescription: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewsContainer: {
    marginTop: 16,
    width: '100%',
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  reviewItem: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewRating: {
    fontSize: 14,
    color: '#007BFF',
  },
  reviewComment: {
    fontSize: 14,
    marginTop: 4,
  },
  noReviews: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ProductDetailScreen;
