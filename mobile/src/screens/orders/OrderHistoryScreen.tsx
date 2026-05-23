import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { orderApi } from '../../api/orderApi';
import { Order } from '../../types/order';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const OrderHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderApi.getOrders();
      setOrders(response.data.data.content);
    } catch {} finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return colors.success;
      case 'PENDING': return colors.warning;
      case 'CANCELLED': return colors.error;
      default: return colors.textSecondary;
    }
  };

  if (!loading && orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No orders yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.orderCard}
          onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.total}>₹{item.total}</Text>
          <Text style={styles.items}>{item.items.length} item(s)</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: colors.textSecondary },
  orderCard: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  orderNumber: { fontSize: 15, fontWeight: '600', color: colors.text },
  status: { fontSize: 13, fontWeight: '600' },
  date: { fontSize: 13, color: colors.textSecondary },
  total: { fontSize: 18, fontWeight: '700', color: colors.accent, marginTop: spacing.sm },
  items: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
