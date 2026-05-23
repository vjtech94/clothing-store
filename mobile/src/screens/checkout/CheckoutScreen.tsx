import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useCartStore } from '../../store/cartStore';
import { orderApi } from '../../api/orderApi';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const CheckoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { cart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const handleCheckout = async () => {
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      Alert.alert('Error', 'Please fill in all address fields');
      return;
    }
    if (!cart || cart.items.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const checkoutData = {
        shippingAddress: address,
        items: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: '',
          size: '',
          color: '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          imageUrl: '',
        })),
      };

      const response = await orderApi.checkout(checkoutData);
      const { clientSecret } = response.data.data;

      // In production: use Stripe PaymentSheet with clientSecret
      // For MVP demo, simulate payment success
      Alert.alert('Order Placed', 'Your order has been placed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Checkout Failed', error?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Shipping Address</Text>

      <TextInput
        style={styles.input}
        placeholder="Street Address"
        value={address.street}
        onChangeText={(v) => setAddress({ ...address, street: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={address.city}
        onChangeText={(v) => setAddress({ ...address, city: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="State"
        value={address.state}
        onChangeText={(v) => setAddress({ ...address, state: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="ZIP Code"
        value={address.zipCode}
        onChangeText={(v) => setAddress({ ...address, zipCode: v })}
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Order Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Items ({cart?.totalItems || 0})</Text>
        <Text style={styles.summaryValue}>₹{cart?.subtotal || 0}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Shipping</Text>
        <Text style={styles.summaryValue}>Free</Text>
      </View>
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{cart?.subtotal || 0}</Text>
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handleCheckout}
        disabled={loading}>
        <Text style={styles.payButtonText}>
          {loading ? 'Processing...' : 'Pay Now'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { fontSize: 15, color: colors.textSecondary },
  summaryValue: { fontSize: 15, color: colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.sm },
  totalLabel: { fontSize: 18, fontWeight: '600', color: colors.text },
  totalValue: { fontSize: 20, fontWeight: '700', color: colors.accent },
  payButton: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
