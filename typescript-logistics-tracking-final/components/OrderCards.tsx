import React from 'react';
import { FlatList, RefreshControl, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Order } from '@/types';
import { OrderCard } from './OrderCard';
import { colors } from '@/constants/colors';

interface OrderCardsProps {
  orders: Order[];
  refreshing: boolean;
  onRefresh: () => void;
  onEndReached?: () => void;
  showDistance?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  onCreateOrderPress?: () => void;
}

export const OrderCards: React.FC<OrderCardsProps> = ({
  orders,
  refreshing,
  onRefresh,
  onEndReached,
  showDistance = false,
  emptyTitle,
  emptySubtitle,
  onCreateOrderPress,
}) => {
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{emptyTitle || 'No orders'}</Text>
      {emptySubtitle && <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>}

      {onCreateOrderPress && (
        <TouchableOpacity style={styles.createButton} onPress={onCreateOrderPress}>
          <Text style={styles.createButtonText}>Create Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <OrderCard order={item} showActions showDistance={showDistance} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={{ flexGrow: 1, padding: 16 }}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
