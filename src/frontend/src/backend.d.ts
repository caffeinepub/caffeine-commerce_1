import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type OrderId = bigint;
export interface Category {
    id: CategoryId;
    name: string;
}
export type AdminToken = string;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
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
export type UserId = Principal;
export interface SiteSettings {
    logo: string;
    shopName: string;
}
export interface Wishlist {
    productIds: Array<ProductId>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type CouponCode = string;
export type CategoryId = bigint;
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
export type ProductId = bigint;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
}
export interface UserProfile {
    name: string;
    address: string;
}
export interface Product {
    id: ProductId;
    categoryId: CategoryId;
    name: string;
    description: string;
    stock: bigint;
    imageUrl: string;
    price: bigint;
}
export enum Order {
    less = "less",
    equal = "equal",
    greater = "greater"
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / ************
     * /    * Cart & Wishlist Management
     * /    *************
     */
    addToCart(productId: ProductId): Promise<void>;
    /**
     * / ************
     * /    * Admin Authentication
     * /    *************
     */
    adminAuthenticate(username: string, password: string): Promise<AdminToken>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    /**
     * / ************
     * /    * Coupon Management
     * /    *************
     */
    getAllCoupons(): Promise<Array<Coupon>>;
    getAllCustomerOrders(userId: UserId): Promise<Array<Order__1>>;
    /**
     * / ************
     * /    * User Profile Management
     * /    *************
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getCategories(): Promise<Array<Category>>;
    getOrder(orderId: OrderId): Promise<Order__1>;
    getProducts(filters: Array<Filter>): Promise<Array<Product>>;
    /**
     * / ************
     * /    * Site Settings Management
     * /    *************
     */
    getSiteSettings(): Promise<SiteSettings>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    /**
     * / ************
     * /    * Referral & Order Management
     * /    *************
     */
    getUserReferrals(userId: UserId): Promise<Array<UserId>>;
    getWishlist(): Promise<Wishlist>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    /**
     * / ************
     * /    * Migration Sample Products (needed only once)
     * /    *************
     */
    migrateSampleProducts(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateSiteSettings(newSettings: SiteSettings): Promise<void>;
    verifyAdminToken(adminToken: AdminToken): Promise<boolean>;
}
