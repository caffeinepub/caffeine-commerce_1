import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.catalog': 'Catalog',
    'nav.cart': 'Cart',
    'nav.wishlist': 'Wishlist',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Home
    'home.featured': 'Featured Products',
    'home.categories': 'Shop by Category',
    'home.viewAll': 'View All',
    
    // Product
    'product.addToCart': 'Add to Cart',
    'product.addToWishlist': 'Add to Wishlist',
    'product.removeFromWishlist': 'Remove from Wishlist',
    'product.inStock': 'In Stock',
    'product.outOfStock': 'Out of Stock',
    'product.description': 'Description',
    'product.reviews': 'Reviews',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.subtotal': 'Subtotal',
    'cart.checkout': 'Proceed to Checkout',
    'cart.remove': 'Remove',
    'cart.quantity': 'Quantity',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shippingAddress': 'Shipping Address',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.orderSummary': 'Order Summary',
    'checkout.placeOrder': 'Place Order',
    'checkout.cod': 'Cash on Delivery',
    'checkout.stripe': 'Credit/Debit Card',
    
    // Orders
    'orders.title': 'My Orders',
    'orders.empty': 'No orders yet',
    'orders.orderNumber': 'Order',
    'orders.date': 'Date',
    'orders.total': 'Total',
    'orders.status': 'Status',
    'orders.viewDetails': 'View Details',
    
    // Profile
    'profile.myOrders': 'My Orders',
    'profile.addresses': 'Addresses',
    'profile.settings': 'Settings',
    'profile.referralCode': 'Referral Code',
    'profile.referrals': 'Referrals',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.products': 'Products',
    'admin.categories': 'Categories',
    'admin.orders': 'Orders',
    'admin.users': 'Users',
    'admin.coupons': 'Coupons',
    'admin.siteSettings': 'Site Settings',
    'admin.stripe': 'Stripe Setup',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.price': 'Price',
    'common.name': 'Name',
    'common.category': 'Category',
    'common.rating': 'Rating',
  },
  hi: {
    // Header
    'nav.home': 'होम',
    'nav.catalog': 'कैटलॉग',
    'nav.cart': 'कार्ट',
    'nav.wishlist': 'विशलिस्ट',
    'nav.profile': 'प्रोफाइल',
    'nav.admin': 'एडमिन',
    'nav.login': 'लॉगिन',
    'nav.logout': 'लॉगआउट',
    
    // Home
    'home.featured': 'फीचर्ड प्रोडक्ट्स',
    'home.categories': 'कैटेगरी से खरीदें',
    'home.viewAll': 'सभी देखें',
    
    // Product
    'product.addToCart': 'कार्ट में जोड़ें',
    'product.addToWishlist': 'विशलिस्ट में जोड़ें',
    'product.removeFromWishlist': 'विशलिस्ट से हटाएं',
    'product.inStock': 'स्टॉक में',
    'product.outOfStock': 'स्टॉक में नहीं',
    'product.description': 'विवरण',
    'product.reviews': 'समीक्षाएं',
    
    // Cart
    'cart.title': 'शॉपिंग कार्ट',
    'cart.empty': 'आपका कार्ट खाली है',
    'cart.subtotal': 'उपयोग',
    'cart.checkout': 'चेकआउट करें',
    'cart.remove': 'हटाएं',
    'cart.quantity': 'मात्रा',
    
    // Checkout
    'checkout.title': 'चेकआउट',
    'checkout.shippingAddress': 'शिपिंग पता',
    'checkout.paymentMethod': 'भुगतान विधि',
    'checkout.orderSummary': 'ऑर्डर सारांश',
    'checkout.placeOrder': 'ऑर्डर करें',
    'checkout.cod': 'कैश ऑन डिलीवरी',
    'checkout.stripe': 'क्रेडिट/डेबिट कार्ड',
    
    // Orders
    'orders.title': 'मेरे ऑर्डर',
    'orders.empty': 'अभी तक कोई ऑर्डर नहीं',
    'orders.orderNumber': 'ऑर्डर',
    'orders.date': 'तारीख',
    'orders.total': 'कुल',
    'orders.status': 'स्थिति',
    'orders.viewDetails': 'विवरण देखें',
    
    // Profile
    'profile.myOrders': 'मेरे ऑर्डर',
    'profile.addresses': 'पते',
    'profile.settings': 'सेटिंग्स',
    'profile.referralCode': 'रेफरल कोड',
    'profile.referrals': 'रेफरल',
    
    // Admin
    'admin.dashboard': 'डैशबोर्ड',
    'admin.products': 'प्रोडक्ट्स',
    'admin.categories': 'कैटेगरी',
    'admin.orders': 'ऑर्डर',
    'admin.users': 'यूजर्स',
    'admin.coupons': 'कूपन',
    'admin.siteSettings': 'साइट सेटिंग्स',
    'admin.stripe': 'स्ट्राइप सेटअप',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.add': 'जोड़ें',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
    'common.sort': 'क्रमबद्ध करें',
    'common.price': 'कीमत',
    'common.name': 'नाम',
    'common.category': 'कैटेगरी',
    'common.rating': 'रेटिंग',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored === 'hi' ? 'hi' : 'en') as Language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}
