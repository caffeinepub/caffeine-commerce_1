import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    address: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export type Filter = {
    __kind__: "sortByCategory";
    sortByCategory: Order;
} | {
    __kind__: "page";
    page: bigint;
} | {
    __kind__: "pageSize";
    pageSize: bigint;
} | {
    __kind__: "sortByName";
    sortByName: Order;
} | {
    __kind__: "maxPrice";
    maxPrice: bigint;
} | {
    __kind__: "searchText";
    searchText: string;
} | {
    __kind__: "sortByPrice";
    sortByPrice: Order;
} | {
    __kind__: "category";
    category: CategoryId;
} | {
    __kind__: "minPrice";
    minPrice: bigint;
};
export interface Wishlist {
    productIds: Array<ProductId>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type CouponCode = string;
export interface Cart {
    items: Array<CartItem>;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface Category {
    id: CategoryId;
    name: string;
    image: string;
}
export interface ProductInput {
    categoryId: CategoryId;
    name: string;
    description: string;
    stock: bigint;
    imageUrl: string;
    price: bigint;
}
export interface ShippingAddress {
    name: string;
    address: string;
    phone: string;
    pincode: string;
}
export interface Coupon {
    code: CouponCode;
    discountPercentage: bigint;
    validUntil: Time;
}
export interface Order__1 {
    id: OrderId;
    status: OrderStatus;
    userId: UserId;
    statusHistory: Array<OrderStatus>;
    totalAmount: bigint;
    timestamp: Time;
    shippingAddress: ShippingAddress;
    items: Array<CartItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type UserId = Principal;
export interface SiteSettings {
    logo: string;
    shopName: string;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export type CategoryId = bigint;
export type ProductId = bigint;
export type ReferralCode = string;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
}
export interface Product {
    id: ProductId;
    categoryId: CategoryId;
    owner: UserId;
    name: string;
    description: string;
    stock: bigint;
    imageUrl: string;
    price: bigint;
}
export type OrderId = bigint;
export enum Order {
    less = "less",
    equal = "equal",
    greater = "greater"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    delivered = "delivered",
    confirmed = "confirmed",
    processing = "processing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(category: Category): Promise<CategoryId>;
    addCoupon(coupon: Coupon): Promise<void>;
    addProduct(input: ProductInput): Promise<ProductId>;
    addToCart(productId: ProductId): Promise<void>;
    addToWishlist(productId: ProductId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createReferral(code: ReferralCode): Promise<void>;
    deleteCategory(categoryId: CategoryId): Promise<void>;
    deleteCoupon(code: CouponCode): Promise<void>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAllCoupons(): Promise<Array<Coupon>>;
    getAllCustomerOrders(userId: UserId): Promise<Array<Order__1>>;
    getAllOrders(): Promise<Array<Order__1>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getCategories(): Promise<Array<Category>>;
    getOrder(orderId: OrderId): Promise<Order__1>;
    getOwnerProducts(): Promise<Array<Product>>;
    getProductOwner(productId: ProductId): Promise<Principal>;
    getProducts(filters: Array<Filter>): Promise<Array<Product>>;
    getSiteSettings(): Promise<SiteSettings>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserReferrals(userId: UserId): Promise<Array<UserId>>;
    getWishlist(): Promise<Wishlist>;
    healthCheck(): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    placeOrder(shippingAddress: ShippingAddress): Promise<OrderId>;
    removeFromCart(productId: ProductId): Promise<void>;
    removeFromWishlist(productId: ProductId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCategory(categoryId: CategoryId, category: Category): Promise<void>;
    updateOrderStatus(orderId: OrderId, newStatus: OrderStatus): Promise<void>;
    updateProduct(productId: ProductId, input: ProductInput): Promise<void>;
    updateSiteSettings(newSettings: SiteSettings): Promise<void>;
}
