/**
 * Mock service layer. All UI code talks to these functions only, so a real backend
 * can replace them later (set VITE_USE_MOCK=false and VITE_API_BASE_URL).
 * Data is kept in localStorage. Passwords are stored in plain text ONLY because this is a demo.
 */
import { USE_MOCK } from '../config';
import { FOODS, RESTAURANTS } from '../data/mockData';
import type { Catalog, NewOrder, Order, PaymentDetails, User } from '../types';
import { load, save } from '../utils/storage';
import { request } from './http';

const delay = (ms = 700): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

interface StoredUser extends User { password: string }

const DEMO_USER: StoredUser = {
  id: 'u-demo',
  name: 'Demo User',
  email: 'demo@foodiego.com',
  mobile: '9876543210',
  password: 'Demo@123',
};

function getUsers(): StoredUser[] {
  const users = load<StoredUser[]>('fd_users', []);
  if (users.length === 0) {
    save('fd_users', [DEMO_USER]);
    return [DEMO_USER];
  }
  return users;
}

const publicUser = (u: StoredUser): User => ({ id: u.id, name: u.name, email: u.email, mobile: u.mobile });

export const authApi = {
  async login(identifier: string, password: string): Promise<User> {
    await delay();
    const id = identifier.trim().toLowerCase();
    const user = getUsers().find((u) => u.email.toLowerCase() === id || u.mobile === id);
    if (!user || user.password !== password) throw new Error('Invalid email/mobile or password');
    return publicUser(user);
  },

  async register(input: { name: string; email: string; mobile: string; password: string }): Promise<User> {
    await delay();
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    if (users.some((u) => u.mobile === input.mobile.trim())) {
      throw new Error('An account with this mobile number already exists');
    }
    const user: StoredUser = {
      id: `u-${Date.now()}`,
      name: input.name.trim(),
      email: input.email.trim(),
      mobile: input.mobile.trim(),
      password: input.password,
    };
    save('fd_users', [...users, user]);
    return publicUser(user);
  },

  async requestPasswordReset(email: string): Promise<void> {
    await delay(500);
    void email; // Simulated: a real backend would send an email here.
  },
};

export const catalogApi = {
  async fetchCatalog(): Promise<Catalog> {
    if (!USE_MOCK) return request<Catalog>('/catalog');
    await delay(800);
    return { restaurants: RESTAURANTS, foods: FOODS };
  },
};

const newOrderId = (): string => `FD${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 90 + 10)}`;

export const orderApi = {
  /** Processes the (simulated) payment, then creates the order. Card numbers ending 0000 are declined for testing. */
  async placeOrder(order: NewOrder, payment: PaymentDetails): Promise<Order> {
    await delay(1800);
    if (payment.method === 'card' && payment.cardNumber?.replace(/\s/g, '').endsWith('0000')) {
      throw new Error('Payment declined by your bank. Please try another card or payment method.');
    }
    if (payment.method === 'upi' && payment.upiId?.toLowerCase().startsWith('fail')) {
      throw new Error('UPI payment failed or was rejected. Please try again.');
    }
    const created: Order = { ...order, id: newOrderId(), createdAt: Date.now() };
    save('fd_orders', [created, ...load<Order[]>('fd_orders', [])]);
    return created;
  },

  async list(userId: string): Promise<Order[]> {
    await delay(400);
    return load<Order[]>('fd_orders', []).filter((o) => o.userId === userId);
  },
};
