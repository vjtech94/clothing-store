import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import { ProductVariant } from '../../types/product';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const ProductDetailScreen: React.FC<{ route: any }> = ({ route }) => {
  const { productId } = route.params;
  const { currentProduct, fetchProductById, isLoading } = useProductStore();
  const { addItem } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    fetchProductById(productId);
  }, [productId]);

  if (!currentProduct) return null;

  const sizes = [...new Set(currentProduct.variants.map((v) => v.size))];
  const colorsAvailable = [...new Set(currentProduct.variants.map((v) => v.color))];

  const selectedVariant = currentProduct.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor,
  );

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      Alert.alert('Select Options', 'Please select a size and color');
      return;
    }
    if (!selectedVariant || selectedVariant.stockQuantity <= 0) {
      Alert.alert('Out of Stock', 'This variant is currently unavailable');
      return;
    }
    try {
      await addItem({
        productId: currentProduct.id,
        variantId: selectedVariant.id,
        quantity: 1,
        unitPrice: selectedVariant.priceOverride || currentProduct.salePrice || currentProduct.basePrice,
      });
      Alert.alert('Added', 'Item added to cart');
    } catch {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const price = currentProduct.salePrice || currentProduct.basePrice;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer} />

      <View style={styles.details}>
        <Text style={styles.brand}>{currentProduct.brand}</Text>
        <Text style={styles.name}>{currentProduct.name}</Text>
        <Text style={styles.price}>₹{price}</Text>
        {currentProduct.salePrice && (
          <Text style={styles.originalPrice}>₹{currentProduct.basePrice}</Text>
        )}

        <Text style={styles.sectionLabel}>Size</Text>
        <View style={styles.optionsRow}>
          {sizes.map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.option, selectedSize === size && styles.optionSelected]}
              onPress={() => setSelectedSize(size)}>
              <Text style={[styles.optionText, selectedSize === size && styles.optionTextSelected]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Color</Text>
        <View style={styles.optionsRow}>
          {colorsAvailable.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.option, selectedColor === color && styles.optionSelected]}
              onPress={() => setSelectedColor(color)}>
              <Text style={[styles.optionText, selectedColor === color && styles.optionTextSelected]}>
                {color}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedVariant && (
          <Text style={styles.stockText}>
            {selectedVariant.stockQuantity > 0
              ? `${selectedVariant.stockQuantity} in stock`
              : 'Out of stock'}
          </Text>
        )}

        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{currentProduct.description}</Text>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  imageContainer: { width: '100%', height: 350, backgroundColor: colors.border },
  details: { padding: spacing.lg },
  brand: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs },
  name: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  price: { fontSize: 24, fontWeight: '700', color: colors.accent },
  originalPrice: { fontSize: 16, color: colors.textSecondary, textDecorationLine: 'line-through' },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accent },
  optionText: { fontSize: 14, color: colors.text },
  optionTextSelected: { color: colors.white },
  stockText: { fontSize: 13, color: colors.success, marginTop: spacing.sm },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  addButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  addButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
