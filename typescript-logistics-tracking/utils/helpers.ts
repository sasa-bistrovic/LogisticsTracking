import { OrderStatus } from '@/types';
import { colors } from '@/constants/colors';

export const formatDate = (dateString: string, includeTime = false): string => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };
  
  return date.toLocaleDateString('en-US', options);
};

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return colors.warning;
    case 'determine_price':
      return colors.info;
    case 'accepted':
      return colors.info;
    case 'pickup':
      return colors.secondary;
    case 'in_transit':
      return colors.primary;
    case 'delivered':
      return colors.success;
    case 'cancelled':
      return colors.danger;
    default:
      return colors.gray;
  }
};

export const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'PENDING';
    case 'determine_price':
      return 'PRICE PROPOSED';
    case 'accepted':
      return 'ACCEPTED';
    case 'pickup':
      return 'PICKED UP';
    case 'in_transit':
      return 'IN TRANSIT';
    case 'delivered':
      return 'DELIVERED';
    case 'cancelled':
      return 'CANCELLED';
    default:
      // Use type assertion to tell TypeScript that status is a string
      return (status as string).toUpperCase();
  }
};

export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Math.round(distance);
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const getEstimatedDeliveryTime = (
  distance: number,
  averageSpeed = 60 // km/h
): number => {
  // Return hours
  return Math.ceil(distance / averageSpeed);
};