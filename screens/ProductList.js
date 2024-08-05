import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { firestore } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Define local image sources
const imageSources = {
  product2: require('../assets/images/Rose.jpg'),
  default: require('../assets/gifts.jpg'), // Default image for missing local images
};

const ProductList = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState({});
  const route = useRoute();
  const { category } = route.params;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(firestore, 'products');
        const q = query(productsRef, where('category', '==', category));
        const querySnapshot = await getDocs(q);

        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
      } catch (error) {
        setError('Error fetching products.');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const handleImageError = (id) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  const renderProductItem = ({ item }) => {
    // Ensure item.imageUrl exists
    const imageUrl = item.imageUrl || '';
    const imageSource = imageUrl.startsWith('http')
      ? { uri: imageUrl }
      : imageSources[imageUrl] || imageSources.default;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <Image
          source={imageSource}
          style={styles.productImage}
          onError={() => handleImageError(item.id)}
        />
        {imageError[item.id] && <Text style={styles.error}>Failed to load image</Text>}
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </TouchableOpacity>
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
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderProductItem}
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
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginVertical: 8,
    padding: 8,
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    color: '#007BFF',
  },
  listContainer: {
    paddingBottom: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ProductList;
