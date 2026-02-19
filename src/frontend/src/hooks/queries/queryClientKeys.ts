export const queryKeys = {
  // Separate keys for public/shopper vs admin catalog queries
  publicProducts: ['publicProducts'] as const,
  publicCategories: ['publicCategories'] as const,
  
  // Admin-scoped keys
  products: ['products'] as const,
  product: (id: string) => ['product', id] as const,
  categories: ['categories'] as const,
  
  // User-specific keys
  cart: ['cart'] as const,
  wishlist: ['wishlist'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
  
  // Admin keys
  adminOrders: ['adminOrders'] as const,
  dashboardStats: ['dashboardStats'] as const,
  coupons: ['coupons'] as const,
  userProfile: ['userProfile'] as const,
  userRole: ['userRole'] as const,
  referrals: (userId: string) => ['referrals', userId] as const,
  stripeConfigured: ['stripeConfigured'] as const,
  siteSettings: ['siteSettings'] as const,
  vendorProducts: ['vendorProducts'] as const,
};
