// /screens/CategoryScreen.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Local images for categories
const localImages = {
  flowers: require('../assets/flowers.jpg'),
  photoFrames: require('../assets/photoframe.jpg'),
  toys: require('../assets/toys.jpg'),
  candles: require('../assets/candels.jpg'),
  jewelry: require('../assets/jewelry.jpg'),
  books: require('../assets/books.jpg'),
};

const { width } = Dimensions.get('window'); // Get the width of the screen

const CategoryScreen = () => {
  const navigation = useNavigation();

  // Categories with local images
  const categories = [
    { id: '1', name: 'Flowers', image: localImages.flowers },
    { id: '2', name: 'Photo Frames', image: localImages.photoFrames },
    { id: '3', name: 'Toys', image: localImages.toys },
    { id: '4', name: 'Candles', image: localImages.candles },
    { id: '5', name: 'Jewelry', image: localImages.jewelry },
    { id: '6', name: 'Books', image: localImages.books },
  ];

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('ProductList', { category: item.name })}
    >
      <Image source={item.image} style={styles.categoryImage} />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.listContainer}
      />
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
  listContainer: {
    paddingBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginVertical: 8,
    padding: 8,
    alignItems: 'center',
    width: width - 32, // Fit to screen width minus padding
    alignSelf: 'center', // Center the card horizontally
  },
  categoryImage: {
    width: '100%',
    height: 200, // Increased height to fit screen better
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CategoryScreen;
