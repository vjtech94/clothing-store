import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useCartStore } from '../../store/cartStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { cart, fetchCart, updateQuantity, removeItem, isLoading } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Start adding items to your cart</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemPrice}>₹{item.unitPrice}</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() =>
                    item.quantity > 1
                      ? updateQuantity(item.id, item.quantity - 1)
                      : removeItem(item.id)
                  }>
                  <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal ({cart.totalItems} items)</Text>
          <Text style={styles.totalValue}>₹{cart.subtotal}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 20, fontWeight: '600', color: colors.text },
  emptySubtext: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm },
  cartItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  itemImage: { width: 80, height: 80, backgroundColor: colors.border, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: spacing.md },
  itemPrice: { fontSize: 16, fontWeight: '600', color: colors.text },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { fontSize: 16, fontWeight: '600' },
  qtyValue: { fontSize: 16, marginHorizontal: spacing.md },
  removeText: { fontSize: 13, color: colors.error },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  totalLabel: { fontSize: 16, color: colors.textSecondary },
  totalValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  checkoutButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
