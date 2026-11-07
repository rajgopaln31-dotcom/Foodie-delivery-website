# FoodieGo – Food Delivery Website

Eight-screen, fully working food delivery website built with **React 18, TypeScript, Redux Toolkit, React Router and Vite**.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

Requires Node.js 18+.

**Demo login:** `demo@foodiego.com` / `Demo@123` (or create your own account on the Create Account screen).

## Customer journey

Login → Home → Restaurant Listing → Restaurant Details → Food Details / Cart → Delivery Address / Checkout → Payment → Order Confirmation / Tracking

| # | Screen | Route | File |
|---|--------|-------|------|
| 1 | Login / Registration | `/login` | `src/pages/LoginPage.tsx` |
| 2 | Home | `/` | `src/pages/HomePage.tsx` |
| 3 | Restaurant Listing / Search | `/restaurants?q=&cat=` | `src/pages/ListingPage.tsx` |
| 4 | Restaurant Details / Menu | `/restaurants/:id` | `src/pages/RestaurantDetailsPage.tsx` |
| 5 | Food Details / Cart | modal on screen 4 + `/cart` | `src/components/FoodModal.tsx`, `src/pages/CartPage.tsx` |
| 6 | Delivery Address / Checkout | `/checkout` | `src/pages/CheckoutPage.tsx` |
| 7 | Payment | `/payment` | `src/pages/PaymentPage.tsx` |
| 8 | Order Confirmation / Tracking | `/order/:id` (+ `/orders`) | `src/pages/OrderConfirmationPage.tsx`, `MyOrdersPage.tsx` |

All routes except `/login` are protected (redirect to login when signed out).

## Folder structure

```
src/
  components/   reusable UI (Header, Footer, Img, Toast, ConfirmDialog, FoodModal, AddressForm, ...)
  pages/        the eight screens + My Orders
  store/        Redux Toolkit: authSlice, restaurantSlice, cartSlice, addressSlice, orderSlice, favouriteSlice
  services/     api.ts (mock service layer), http.ts (fetch helper for a real backend)
  data/         mockData.ts (restaurants, menu items, categories)
  utils/        pricing, validators, storage, order status
  types/        shared TypeScript interfaces
```

## Redux implementation

| Slice | Holds |
|-------|-------|
| `authSlice` | user, login/register thunks, logout (persisted) |
| `restaurantSlice` | restaurants, menu items, delivery location, `selectMenu` selector |
| `cartSlice` | items, restaurant, coupon; add/replace/quantity/remove/coupon; `selectCartTotals` (persisted) |
| `addressSlice` | saved addresses, selected/default address, CRUD (persisted) |
| `orderSlice` | order history, `placeOrder` and `fetchOrders` thunks |
| `favouriteSlice` | favourite restaurant ids (persisted) |

## API integration / mock data

All data access goes through `src/services/api.ts`; UI components never touch storage or `fetch` directly.
The backend is **mocked**: restaurants come from `src/data/mockData.ts`, and users, orders and addresses are kept in `localStorage`.
To connect a real backend set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=https://your-api` in `.env`, then implement the endpoints in `api.ts`/`http.ts`.
No secrets or API keys are in the frontend code. Mock passwords are stored in plain text in localStorage purely for the demo.

- **Order tracking is simulated:** the status advances every 20 seconds (Order Placed → … → Delivered).
- **Payments are simulated:** no real money moves. Test failure with a card number ending `0000` or a UPI ID starting with `fail`. Cash on Delivery is available up to ₹2000.
- **Coupons:** `WELCOME50`, `SAVE20`, `FREEDEL`. Delivery is ₹40 (free above ₹500); 5% GST.
- **Images:** food and restaurant photos load from Unsplash. If a photo cannot load (offline or blocked), a built-in emoji illustration is shown instead.

## Validation, feedback and quality

- Field-level validation: required fields, email, 10-digit mobile, password rules, confirm password, PIN code, UPI ID, card number, expiry, CVV.
- Loading states, skeleton loaders, empty states, error states with retry, snackbars (no `alert()`), confirmation dialogs.
- Duplicate-submit protection on login/payment, success shown only after the order is confirmed.
- Strict TypeScript, no `any`, functional components and hooks, responsive layouts (desktop, tablet, mobile).

## Testing checklist

| Area | Steps to verify |
|------|-----------------|
| Login / Registration | Submit empty form (errors), bad email/mobile, mismatched passwords; register then log in; show/hide password |
| Home | Categories, banners (copy code), restaurants, recommended food, location select, cart count, mobile menu |
| Search / Filters | Search "biryani", filter category, sort by rating/time, favourites, search "zzz" shows empty state |
| Restaurant / Food | Category tabs, Customise & Add, quantity stepper, sold-out items, add from a second restaurant (confirm dialog) |
| Cart | Quantity, remove, coupons (valid/invalid/min amount), totals, empty-cart state, checkout blocked when empty |
| Address / Checkout | Add / edit / delete, default address, validation of mobile and PIN |
| Payment | UPI / card / net banking / COD validation, failure (card `…0000`), cancel, no double submit |
| Order | Order ID, items, address, timeline progress, My Orders, Continue Shopping |
| Responsive | Resize to 1280 / 768 / 375 px: no horizontal scroll, mobile nav works |

## Completed functionality / pending

Completed: all eight screens, routing with protected routes, six Redux slices, persistence, validation, mock service layer.
Pending / out of scope: real backend and payment gateway, real password reset email, automated unit tests, real-time order tracking.

## Screenshots

Run the app and capture each screen (including mobile view via browser dev tools) for your submission.
