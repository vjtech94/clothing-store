import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { orderApi } from '../../api/orderApi';
import { Order } from '../../types/order';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const OrderDetailScreen: React.FC<{ route: any }> = ({ route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await orderApi.getOrderById(orderId);
      setOrder(response.data.data);
    } catch {}
  };

  if (!order) return null;

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.status}>{order.status}</Text>
            <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>
          </View>

          <Text style={styles.sectionTitle}>Items</Text>
        </View>
      }
      data={order.items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.itemCard}>
          <View style={styles.itemImage} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.productName}</Text>
            <Text style={styles.itemVariant}>{item.size} / {item.color}</Text>
            <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            <Text style={styles.itemPrice}>₹{item.unitPrice * item.quantity}</Text>
          </View>
        </View>
      )}
      ListFooterComponent={
        <View style={styles.summary}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>₹{order.subtotal}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Shipping</Text>
            <Text style={styles.value}>₹{order.shippingFee}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax</Text>
            <Text style={styles.value}>₹{order.tax}</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.total}</Text>
          </View>

          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.address}>
            {order.shippingAddress.street}{'\n'}
            {order.shippingAddress.city}, {order.shippingAddress.state}{'\n'}
            {order.shippingAddress.zipCode}, {order.shippingAddress.country}
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  orderNumber: { fontSize: 18, fontWeight: '700', color: colors.text },
  status: { fontSize: 14, fontWeight: '600', color: colors.success, marginTop: spacing.xs },
  date: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, padding: spacing.md, paddingBottom: spacing.sm },
  itemCard: { flexDirection: 'row', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemImage: { width: 60, height: 60, backgroundColor: colors.border, borderRadius: 8 },
  itemInfo: { marginLeft: spacing.md, flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500', color: colors.text },
  itemVariant: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  itemQty: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '600', color: colors.accent, marginTop: 4 },
  summary: { paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  label: { fontSize: 14, color: colors.textSecondary },
  value: { fontSize: 14, color: colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.sm },
  totalLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '700', color: colors.accent },
  address: { fontSize: 14, color: colors.textSecondary, paddingHorizontal: spacing.md, lineHeight: 22 },
});
