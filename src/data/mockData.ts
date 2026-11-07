import type { FoodItem, Option, Restaurant } from '../types';

const photo = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;

export const CATEGORIES = [
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Burgers', emoji: '🍔' },
  { name: 'Biryani', emoji: '🍛' },
  { name: 'Chinese', emoji: '🍜' },
  { name: 'Healthy', emoji: '🥗' },
  { name: 'South Indian', emoji: '🥞' },
  { name: 'Desserts', emoji: '🍰' },
  { name: 'Beverages', emoji: '🥤' },
];

export const LOCATIONS = ['Guntur', 'Vijayawada', 'Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai', 'Delhi'];

const EMOJI: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.name, c.emoji]));

const PHOTOS: Record<string, string[]> = {
  Pizza: ['1513104890138-7c749659a591', '1565299624946-b28f40a0ae38', '1574071318508-1cdbab80d002'],
  Burgers: ['1568901346375-23c9450c58cd', '1550547660-d9450f859349', '1571091718767-18b5b1457add'],
  Biryani: ['1563379091339-03b21ab4a4f8', '1589302168068-964664d93dc0', '1631515243349-e0cb75fb8d3a'],
  Chinese: ['1563245372-f21724e3856d', '1585032226651-759b368d7246', '1512058564366-18510be2db19'],
  Healthy: ['1546069901-ba9599a7e63c', '1512621776951-a57141f2eefd', '1540420773420-3366772f4999'],
  'South Indian': ['1630383249896-424e482df921', '1589301760014-d929f3979dbc', '1606491956689-2ea866880c84'],
  Desserts: ['1551024601-bec78aea704b', '1565958011703-44f9829ba187', '1488477181946-6428a0291777'],
  Beverages: ['1544145945-f90425340c7e', '1497534446932-c925b458314e', '1572490122747-3968b75cc699'],
};

interface Dish { name: string; description: string; price: number; veg: boolean; photo: number; available?: boolean }

const CATALOG: Record<string, Dish[]> = {
  Pizza: [
    { name: 'Margherita Pizza', description: 'Classic tomato sauce, mozzarella and fresh basil on a hand-tossed base.', price: 249, veg: true, photo: 0 },
    { name: 'Pepperoni Pizza', description: 'Loaded with spicy pepperoni and double mozzarella.', price: 349, veg: false, photo: 1 },
    { name: 'Paneer Tikka Pizza', description: 'Tandoori paneer, onions and capsicum with a smoky tikka sauce.', price: 299, veg: true, photo: 2 },
  ],
  Burgers: [
    { name: 'Veg Crunch Burger', description: 'Crispy veggie patty with lettuce, tomato and mayo.', price: 149, veg: true, photo: 0 },
    { name: 'Chicken Zinger Burger', description: 'Spicy fried chicken fillet with creamy sauce and slaw.', price: 199, veg: false, photo: 1 },
    { name: 'Cheese Melt Burger', description: 'Double cheese, caramelised onions and a juicy patty.', price: 179, veg: true, photo: 2 },
  ],
  Biryani: [
    { name: 'Veg Dum Biryani', description: 'Basmati rice slow-cooked with vegetables and whole spices.', price: 219, veg: true, photo: 0 },
    { name: 'Chicken Dum Biryani', description: 'Hyderabadi-style biryani with tender marinated chicken.', price: 279, veg: false, photo: 1 },
    { name: 'Mutton Biryani', description: 'Aromatic rice layered with slow-cooked mutton pieces.', price: 349, veg: false, photo: 2, available: false },
  ],
  Chinese: [
    { name: 'Veg Hakka Noodles', description: 'Wok-tossed noodles with crunchy vegetables and soy.', price: 179, veg: true, photo: 0 },
    { name: 'Chicken Fried Rice', description: 'Egg fried rice with shredded chicken and spring onions.', price: 209, veg: false, photo: 1 },
    { name: 'Veg Manchurian', description: 'Crispy vegetable balls in a tangy Indo-Chinese gravy.', price: 189, veg: true, photo: 2 },
  ],
  Healthy: [
    { name: 'Greek Salad Bowl', description: 'Cucumber, olives, feta, tomato and olive oil dressing.', price: 199, veg: true, photo: 0 },
    { name: 'Quinoa Veg Bowl', description: 'Quinoa with roasted vegetables, chickpeas and tahini.', price: 229, veg: true, photo: 1 },
    { name: 'Grilled Chicken Bowl', description: 'Grilled chicken, brown rice, greens and herb sauce.', price: 259, veg: false, photo: 2 },
  ],
  'South Indian': [
    { name: 'Masala Dosa', description: 'Crispy rice crepe filled with spiced potato, with sambar and chutneys.', price: 99, veg: true, photo: 0 },
    { name: 'Idli Sambar', description: 'Soft steamed idlis served with sambar and coconut chutney.', price: 79, veg: true, photo: 1 },
    { name: 'Chicken Chettinad', description: 'Fiery Chettinad-style chicken curry with pepper and curry leaves.', price: 249, veg: false, photo: 2 },
  ],
  Desserts: [
    { name: 'Chocolate Brownie', description: 'Warm fudgy brownie with a gooey chocolate centre.', price: 129, veg: true, photo: 0 },
    { name: 'Gulab Jamun', description: 'Soft milk dumplings soaked in rose-scented sugar syrup.', price: 99, veg: true, photo: 1 },
    { name: 'Red Velvet Cake', description: 'Moist red velvet slice with cream cheese frosting.', price: 169, veg: true, photo: 2, available: false },
  ],
  Beverages: [
    { name: 'Cold Coffee', description: 'Chilled blended coffee with ice cream.', price: 119, veg: true, photo: 0 },
    { name: 'Fresh Lime Soda', description: 'Refreshing lime soda, sweet or salted.', price: 69, veg: true, photo: 1 },
    { name: 'Mango Shake', description: 'Thick shake made with fresh Alphonso mangoes.', price: 129, veg: true, photo: 2 },
  ],
};

const SIZES: Record<string, Option[]> = {
  Pizza: [{ name: 'Regular', price: 0 }, { name: 'Medium', price: 80 }, { name: 'Large', price: 160 }],
  Biryani: [{ name: 'Half', price: 0 }, { name: 'Full', price: 120 }],
  Beverages: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 40 }],
};

const ADDONS: Record<string, Option[]> = {
  Pizza: [{ name: 'Extra Cheese', price: 40 }, { name: 'Black Olives', price: 30 }, { name: 'Jalapeños', price: 25 }],
  Burgers: [{ name: 'Extra Patty', price: 60 }, { name: 'Cheese Slice', price: 25 }, { name: 'French Fries', price: 49 }],
  Biryani: [{ name: 'Raita', price: 30 }, { name: 'Boiled Egg', price: 20 }, { name: 'Mirchi Ka Salan', price: 35 }],
  Chinese: [{ name: 'Extra Gravy', price: 30 }, { name: 'Chilli Oil', price: 15 }],
  Healthy: [{ name: 'Extra Dressing', price: 15 }, { name: 'Avocado', price: 60 }],
  'South Indian': [{ name: 'Extra Chutney', price: 10 }, { name: 'Ghee', price: 20 }],
  Desserts: [{ name: 'Ice Cream Scoop', price: 40 }],
  Beverages: [{ name: 'Ice Cream Scoop', price: 35 }],
};

interface Seed extends Restaurant { mult: number }

const SEEDS: Seed[] = [
  { id: 'r1', name: 'Pizza Palace', description: 'Wood-fired pizzas, garlic bread and sweet treats made fresh to order.', image: photo('1513104890138-7c749659a591'), emoji: '🍕', rating: 4.5, reviews: 2840, deliveryTime: 30, priceForTwo: 500, cuisines: ['Pizza', 'Italian', 'Desserts'], categories: ['Pizza', 'Desserts', 'Beverages'], offer: '50% off up to ₹100', mult: 1 },
  { id: 'r2', name: 'Burger Barn', description: 'Juicy burgers, crispy fries and thick shakes in a flash.', image: photo('1568901346375-23c9450c58cd'), emoji: '🍔', rating: 4.2, reviews: 1920, deliveryTime: 25, priceForTwo: 350, cuisines: ['Burgers', 'American', 'Fast Food'], categories: ['Burgers', 'Beverages', 'Desserts'], offer: 'Flat ₹20 off', mult: 1 },
  { id: 'r3', name: 'Biryani House', description: 'Authentic dum biryani cooked the traditional way with aged basmati.', image: photo('1563379091339-03b21ab4a4f8'), emoji: '🍛', rating: 4.7, reviews: 4120, deliveryTime: 40, priceForTwo: 600, cuisines: ['Biryani', 'Mughlai', 'North Indian'], categories: ['Biryani', 'Beverages', 'Desserts'], offer: 'Free delivery above ₹300', mult: 1.05 },
  { id: 'r4', name: 'Dragon Wok', description: 'Indo-Chinese favourites tossed on a roaring wok.', image: photo('1563245372-f21724e3856d'), emoji: '🍜', rating: 4.1, reviews: 1310, deliveryTime: 35, priceForTwo: 450, cuisines: ['Chinese', 'Asian', 'Noodles'], categories: ['Chinese', 'Beverages'], offer: '', mult: 1 },
  { id: 'r5', name: 'Green Bowl', description: 'Fresh salads, grain bowls and protein-packed meals for a lighter day.', image: photo('1546069901-ba9599a7e63c'), emoji: '🥗', rating: 4.4, reviews: 860, deliveryTime: 28, priceForTwo: 550, cuisines: ['Healthy', 'Salads', 'Continental'], categories: ['Healthy', 'Beverages', 'Desserts'], offer: 'Flat ₹20 off', mult: 1.1 },
  { id: 'r6', name: 'Dosa Corner', description: 'Crispy dosas, fluffy idlis and spicy Andhra-style curries.', image: photo('1630383249896-424e482df921'), emoji: '🥞', rating: 4.6, reviews: 3560, deliveryTime: 22, priceForTwo: 250, cuisines: ['South Indian', 'Andhra', 'Tiffins'], categories: ['South Indian', 'Beverages'], offer: '50% off up to ₹100', mult: 0.95 },
  { id: 'r7', name: 'Sweet Tooth', description: 'Brownies, cakes, Indian sweets and shakes for every craving.', image: photo('1551024601-bec78aea704b'), emoji: '🍰', rating: 4.3, reviews: 980, deliveryTime: 20, priceForTwo: 300, cuisines: ['Desserts', 'Bakery', 'Beverages'], categories: ['Desserts', 'Beverages'], offer: '', mult: 1 },
  { id: 'r8', name: 'Spice Route', description: 'A tour of India on one menu — biryani, Indo-Chinese and South Indian classics.', image: photo('1589302168068-964664d93dc0'), emoji: '🍽️', rating: 4.8, reviews: 5210, deliveryTime: 38, priceForTwo: 650, cuisines: ['Biryani', 'Chinese', 'South Indian'], categories: ['Biryani', 'Chinese', 'South Indian'], offer: 'Free delivery above ₹300', mult: 1.1 },
];

export const RESTAURANTS: Restaurant[] = SEEDS.map((s) => ({
  id: s.id, name: s.name, description: s.description, image: s.image, emoji: s.emoji,
  rating: s.rating, reviews: s.reviews, deliveryTime: s.deliveryTime, priceForTwo: s.priceForTwo,
  cuisines: s.cuisines, categories: s.categories, offer: s.offer,
}));

const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const FOODS: FoodItem[] = SEEDS.flatMap((r) =>
  r.categories.flatMap((cat) =>
    (CATALOG[cat] ?? []).map((d): FoodItem => ({
      id: `${r.id}-${slug(d.name)}`,
      restaurantId: r.id,
      name: d.name,
      description: d.description,
      price: Math.round((d.price * r.mult) / 5) * 5,
      image: photo(PHOTOS[cat][d.photo % PHOTOS[cat].length]),
      emoji: EMOJI[cat] ?? '🍽️',
      category: cat,
      veg: d.veg,
      available: d.available !== false,
      sizes: SIZES[cat] ?? [],
      addons: ADDONS[cat] ?? [],
    })),
  ),
);
