import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Package, Calendar, Truck, ArrowRight } from 'lucide-react-native';
import { Order } from '@/types';
import { colors } from '@/constants/colors';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '@/utils/helpers';

interface OrderCardProps {
  order: Order;
  showActions?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order,
  showActions = true,
}) => {
  const router = useRouter();
  
  const navigateToOrderDetails = () => {
    router.push(`/orders/${order.id}`);
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={navigateToOrderDetails}
      activeOpacity={0.8}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.orderTitle}>#{order.id.slice(-4)} — {order.cargo.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
        </View>
      </View>

      {/* LOCATIONS */}
      <View style={styles.locations}>
        <View style={styles.locationItem}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {order.pickupLocation.city}, {order.pickupLocation.country}
          </Text>
        </View>
        <View style={styles.locationItem}>
          <MapPin size={16} color={colors.secondary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {order.deliveryLocation.city}, {order.deliveryLocation.country}
          </Text>
        </View>
      </View>

      {/* DETAILS */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Package size={16} color={colors.gray} />
          <Text style={styles.detailText}>{order.cargo.weight * order.cargo.items} kg</Text>
        </View>
        <View style={styles.detailItem}>
          <Calendar size={16} color={colors.gray} />
          <Text style={styles.detailText}>{formatDate(order.scheduledPickup)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Truck size={16} color={colors.gray} />
          <Text style={styles.detailText}>{order.transporterId ? 'Assigned' : 'Unassigned'}</Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        {order.proposedPrice && order.proposedPrice > 0 ? (
          <Text style={styles.priceText}>{formatCurrency(order.proposedPrice, order.currency)}</Text>
        ) : (
          <Text style={styles.awaitingText}>Awaiting price</Text>
        )}

        {showActions && (
          <TouchableOpacity style={styles.detailsButton} onPress={navigateToOrderDetails}>
            <Text style={styles.detailsButtonText}>Details</Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  locations: {
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    flexShrink: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: colors.textLight,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  awaitingText: {
    fontSize: 14,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
