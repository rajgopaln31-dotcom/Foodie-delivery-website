/**
 * Mock authentication service.
 * Accounts are stored in browser localStorage.
 */

import { USE_MOCK } from '../config';
import { FOODS, RESTAURANTS } from '../data/mockData';
import type {
  Catalog,
  NewOrder,
  Order,
  PaymentDetails,
  User,
} from '../types';
import { load, save } from '../utils/storage';
import { request } from './http';

const delay = (ms = 700): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface StoredUser extends User {
  password: string;
}

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

const publicUser = (user: StoredUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
});

export const authApi = {
  // LOGIN
  async login(identifier: string, password: string): Promise<User> {
    await delay();

    const id = identifier.trim().toLowerCase();
    const users = getUsers();

    const user = users.find(
      (u) =>
        u.email.trim().toLowerCase() === id ||
        u.mobile.trim() === id
    );

    if (!user || user.password !== password) {
      throw new Error('Invalid email/mobile or password');
    }

    return publicUser(user);
  },

  // REGISTER
  async register(input: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }): Promise<User> {
    await delay();

    const users = getUsers();

    const email = input.email.trim().toLowerCase();
    const mobile = input.mobile.trim();

    // Find existing account using email
    const existingIndex = users.findIndex(
      (u) => u.email.trim().toLowerCase() === email
    );

    // If email already exists, update that account
    if (existingIndex !== -1) {
      const updatedUsers = [...users];

      const existingUser = updatedUsers[existingIndex];

      const mobileUsedByAnotherUser = users.some(
        (u, index) =>
          index !== existingIndex && u.mobile.trim() === mobile
      );

      if (mobileUsedByAnotherUser) {
        throw new Error('Mobile number already registered.');
      }

      const updatedUser: StoredUser = {
        ...existingUser,
        name: input.name.trim(),
        email,
        mobile,
        password: input.password,
      };

      updatedUsers[existingIndex] = updatedUser;

      save('fd_users', updatedUsers);

      return publicUser(updatedUser);
    }

    // Check existing mobile number
    const existingMobile = users.find(
      (u) => u.mobile.trim() === mobile
    );

    if (existingMobile) {
      throw new Error('Mobile number already registered.');
    }

    // Create a new account
    const newUser: StoredUser = {
      id: `u-${Date.now()}`,
      name: input.name.trim(),
      email,
      mobile,
      password: input.password,
    };

    save('fd_users', [...users, newUser]);

    return publicUser(newUser);
  },

  // FORGOT PASSWORD
  async requestPasswordReset(email: string): Promise<void> {
    await delay(500);
    void email;
  },
};

export const catalogApi = {
  async fetchCatalog(): Promise<Catalog> {
    if (!USE_MOCK) {
      return request<Catalog>('/catalog');
    }

    await delay(800);

    return {
      restaurants: RESTAURANTS,
      foods: FOODS,
    };
  },
};

const newOrderId = (): string =>
  `FD${Date.now().toString().slice(-7)}${Math.floor(
    Math.random() * 90 + 10
  )}`;

export const orderApi = {
  async placeOrder(
    order: NewOrder,
    payment: PaymentDetails
  ): Promise<Order> {
    await delay(1800);

    if (
      payment.method === 'card' &&
      payment.cardNumber?.replace(/\s/g, '').endsWith('0000')
    ) {
      throw new Error(
        'Payment declined by your bank. Please try another card.'
      );
    }

    if (
      payment.method === 'upi' &&
      payment.upiId?.toLowerCase().startsWith('fail')
    ) {
      throw new Error(
        'UPI payment failed. Please try again.'
      );
    }

    const created: Order = {
      ...order,
      id: newOrderId(),
      createdAt: Date.now(),
    };

    save('fd_orders', [
      created,
      ...load<Order[]>('fd_orders', []),
    ]);

    return created;
  },

  async list(userId: string): Promise<Order[]> {
    await delay(400);

    return load<Order[]>('fd_orders', []).filter(
      (order) => order.userId === userId
    );
  },
};