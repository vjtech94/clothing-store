import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useProductStore } from '../../store/productStore';
import { ProductFilter } from '../../types/product';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const CatalogScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { categoryId, title } = route.params || {};
  const { products, fetchProducts, loadMore, isLoading } = useProductStore();
  const [sort, setSort] = useState<ProductFilter['sort']>('NEWEST');

  useEffect(() => {
    fetchProducts({ categoryId, sort });
  }, [categoryId, sort]);

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {(['NEWEST', 'PRICE_ASC', 'PRICE_DESC', 'POPULAR'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, sort === s && styles.filterChipActive]}
            onPress={() => setSort(s)}>
            <Text style={[styles.filterText, sort === s && styles.filterTextActive]}>
              {s === 'PRICE_ASC' ? 'Low-High' : s === 'PRICE_DESC' ? 'High-Low' : s === 'NEWEST' ? 'New' : 'Popular'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.productRow}
        onEndReached={() => loadMore({ categoryId, sort })}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
            <View style={styles.productImage} />
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productBrand}>{item.brand}</Text>
            <Text style={styles.productPrice}>₹{item.salePrice || item.basePrice}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterBar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { fontSize: 12, color: colors.textSecondary },
  filterTextActive: { color: colors.white },
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
    height: 180,
    backgroundColor: colors.border,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  productName: { fontSize: 14, color: colors.text, marginBottom: 2 },
  productBrand: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
  productPrice: { fontSize: 16, fontWeight: '700', color: colors.accent },
});
