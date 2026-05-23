import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useProductStore } from '../../store/productStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { products, categories, fetchProducts, fetchCategories, isLoading } =
    useProductStore();

  useEffect(() => {
    fetchCategories();
    fetchProducts({ sort: 'POPULAR' });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Text style={styles.searchIcon}>Search</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() =>
              navigation.navigate('Catalog', { categoryId: item.id, title: item.name })
            }>
            <Text style={styles.categoryName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>Popular</Text>
      <FlatList
        data={products}
        numColumns={2}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.productRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
            <View style={styles.productImage} />
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.productPrice}>
              {item.salePrice
                ? `₹${item.salePrice}`
                : `₹${item.basePrice}`}
            </Text>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  searchIcon: { fontSize: 16, color: colors.accent },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryList: { paddingHorizontal: spacing.md },
  categoryCard: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  categoryName: { fontSize: 14, fontWeight: '500', color: colors.text },
  productRow: { justifyContent: 'space-between', paddingHorizontal: spacing.md },
  productCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: colors.border,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  productName: { fontSize: 14, color: colors.text, marginBottom: spacing.xs },
  productPrice: { fontSize: 16, fontWeight: '700', color: colors.accent },
});
