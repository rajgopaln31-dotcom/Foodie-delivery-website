import type { Order } from '../types';

export const ORDER_STATUSES = [
  'Order Placed',
  'Order Confirmed',
  'Preparing',
  'Ready for Pickup',
  'On the Way',
  'Delivered',
] as const;

/** Demo simulation: the order moves to the next status every STEP_MS milliseconds. */
export const STEP_MS = 20000;

export function statusIndex(order: Order, now: number): number {
  return Math.min(ORDER_STATUSES.length - 1, Math.max(0, Math.floor((now - order.createdAt) / STEP_MS)));
}
