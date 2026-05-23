import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useProductStore } from '../../store/productStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const { products, searchProducts, isLoading } = useProductStore();

  const handleSearch = () => {
    if (query.trim()) {
      searchProducts(query.trim());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search for clothes..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
            <View style={styles.resultImage} />
            <View style={styles.resultInfo}>
              <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.resultBrand}>{item.brand}</Text>
              <Text style={styles.resultPrice}>₹{item.salePrice || item.basePrice}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {query ? 'No results found' : 'Start typing to search'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: { padding: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultImage: {
    width: 60,
    height: 60,
    backgroundColor: colors.border,
    borderRadius: 8,
  },
  resultInfo: { marginLeft: spacing.md, flex: 1, justifyContent: 'center' },
  resultName: { fontSize: 15, color: colors.text, fontWeight: '500' },
  resultBrand: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  resultPrice: { fontSize: 15, fontWeight: '700', color: colors.accent, marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: spacing.xl, color: colors.textSecondary },
});
