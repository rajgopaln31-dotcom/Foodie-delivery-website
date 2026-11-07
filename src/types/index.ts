export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface User { id: string; name: string; email: string; mobile: string }
export interface Option { name: string; price: number }

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  emoji: string;
  rating: number;
  reviews: number;
  deliveryTime: number;
  priceForTwo: number;
  cuisines: string[];
  categories: string[];
  offer: string;
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  emoji: string;
  category: string;
  veg: boolean;
  available: boolean;
  sizes: Option[];
  addons: Option[];
}

export interface CartItem {
  key: string;
  foodId: string;
  restaurantId: string;
  name: string;
  image: string;
  emoji: string;
  veg: boolean;
  size: Option | null;
  addons: Option[];
  unitPrice: number;
  quantity: number;
}

export interface Address {
  id: string;
  fullName: string;
  mobile: string;
  house: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pin: string;
  instructions: string;
  isDefault: boolean;
}
export type AddressInput = Omit<Address, 'id'>;

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';
export interface PaymentDetails {
  method: PaymentMethod;
  upiId?: string;
  cardNumber?: string;
  cardName?: string;
  expiry?: string;
  cvv?: string;
  bank?: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  items: CartItem[];
  address: Address;
  subtotal: number;
  discount: number;
  delivery: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: number;
  etaMinutes: number;
}
export type NewOrder = Omit<Order, 'id' | 'createdAt'>;

export interface Catalog { restaurants: Restaurant[]; foods: FoodItem[] }
