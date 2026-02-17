import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  /**************
   * Authorization System
   **************/
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /**************
   * Types
   **************/
  public type UserId = Principal;

  public type UserProfile = {
    name : Text;
    address : Text;
  };

  public type ProductId = Nat;
  public type CategoryId = Nat;
  public type OrderId = Nat;
  public type CouponCode = Text;
  public type ReferralCode = Text;
  public type AdminToken = Text;

  public type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    imageUrl : Text;
    categoryId : CategoryId;
  };

  public type Filter = {
    #category : CategoryId;
    #sortByCategory : Order.Order;
    #minPrice : Nat;
    #maxPrice : Nat;
    #sortByPrice : Order.Order;
    #sortByName : Order.Order;
    #searchText : Text;
    #page : Nat;
    #pageSize : Nat;
  };

  public type Category = {
    id : CategoryId;
    name : Text;
  };

  public type CartItem = {
    productId : ProductId;
    quantity : Nat;
  };

  public type Cart = {
    items : [CartItem];
  };

  public type Wishlist = {
    productIds : [ProductId];
  };

  public type OrderStatus = {
    #pending;
    #completed;
    #cancelled;
  };

  public type Order = {
    id : OrderId;
    userId : UserId;
    items : [CartItem];
    totalAmount : Nat;
    status : OrderStatus;
    statusHistory : [OrderStatus];
    timestamp : Time.Time;
  };

  public type Coupon = {
    code : CouponCode;
    discountPercentage : Nat;
    validUntil : Time.Time;
  };

  public type Referral = {
    code : ReferralCode;
    creator : UserId;
    referrals : [UserId];
  };

  public type SiteSettings = {
    shopName : Text;
    logo : Text;
  };

  /**************
   * State
   **************/
  var nextId : Nat = 0;
  func generateId() : Nat {
    nextId += 1;
    nextId;
  };

  let userProfiles = Map.empty<UserId, UserProfile>();
  let products = Map.empty<ProductId, Product>();
  let categories = Map.empty<CategoryId, Category>();
  let carts = Map.empty<UserId, Cart>();
  let wishlists = Map.empty<UserId, Wishlist>();
  let orders = Map.empty<OrderId, Order>();
  let coupons = Map.empty<CouponCode, Coupon>();
  let referrals = Map.empty<ReferralCode, Referral>();
  let stripeSessions = Map.empty<Text, UserId>(); // sessionId -> userId mapping

  // Track active admin sessions (caller principal -> token)
  let adminSessions = Map.empty<Principal, AdminToken>();

  // Persisted site settings (shop name permanently set to BISAULI)
  var siteSettings : SiteSettings = {
    shopName = "BISAULI";
    logo = "";
  };

  /**************
   * User Profile Management
   **************/
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  /**************
   * Site Settings Management
   **************/
  public query ({ caller }) func getSiteSettings() : async SiteSettings {
    // Enforce BISAULI as permanent shop name
    {
      shopName = "BISAULI";
      logo = siteSettings.logo;
    };
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func updateSiteSettings(newSettings : SiteSettings) : async () {
    // Permanently enforce BISAULI as shop name, only allow logo updates
    siteSettings := {
      shopName = "BISAULI";
      logo = newSettings.logo;
    };
  };

  /**************
   * Product & Category Management
   **************/
  func matchesText(product : Product, searchText : Text) : Bool {
    let lowerSearchText = searchText.toLower();
    product.name.toLower().contains(#text lowerSearchText) or
    product.description.toLower().contains(#text lowerSearchText);
  };

  public query func getProducts(filters : [Filter]) : async [Product] {
    var filteredProducts = products.values().toArray();

    for (filter in filters.values()) {
      switch (filter) {
        case (#category(categoryId)) {
          filteredProducts := filteredProducts.filter(
            func(product) { product.categoryId == categoryId }
          );
        };
        case (#minPrice(minPrice)) {
          filteredProducts := filteredProducts.filter(
            func(product) { product.price >= minPrice }
          );
        };
        case (#maxPrice(maxPrice)) {
          filteredProducts := filteredProducts.filter(
            func(product) { product.price <= maxPrice }
          );
        };
        case (#sortByCategory(order)) {
          filteredProducts := switch (order) {
            case (#less) {
              filteredProducts.sort(
                func(a, b) { Nat.compare(a.categoryId, b.categoryId) }
              );
            };
            case (#greater) {
              filteredProducts.sort(
                func(a, b) { Nat.compare(b.categoryId, a.categoryId) }
              );
            };
            case (_) { filteredProducts };
          };
        };
        case (#sortByPrice(order)) {
          filteredProducts := switch (order) {
            case (#less) {
              filteredProducts.sort(
                func(a, b) { Nat.compare(a.price, b.price) }
              );
            };
            case (#greater) {
              filteredProducts.sort(
                func(a, b) { Nat.compare(b.price, a.price) }
              );
            };
            case (_) { filteredProducts };
          };
        };
        case (#sortByName(order)) {
          filteredProducts := switch (order) {
            case (#less) {
              filteredProducts.sort(
                func(a, b) {
                  Text.compare(a.name.toLower(), b.name.toLower());
                }
              );
            };
            case (#greater) {
              filteredProducts.sort(
                func(a, b) {
                  Text.compare(b.name.toLower(), a.name.toLower());
                }
              );
            };
            case (_) { filteredProducts };
          };
        };
        case (#searchText(searchText)) {
          filteredProducts := filteredProducts.filter(
            func(product) { matchesText(product, searchText) }
          );
        };
        case (_) {};
      };
    };

    filteredProducts;
  };

  public query func getCategories() : async [Category] {
    categories.values().toArray();
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func addProduct(product : Product) : async ProductId {
    let productId = generateId();
    let newProduct = {
      product with id = productId
    };
    products.add(productId, newProduct);
    productId;
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func updateProduct(productId : ProductId, product : Product) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?_) {
        products.add(productId, product);
      };
    };
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    products.remove(productId);
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func addCategory(category : Category) : async CategoryId {
    let categoryId = generateId();
    let newCategory = {
      category with id = categoryId
    };
    categories.add(categoryId, newCategory);
    categoryId;
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func updateCategory(categoryId : CategoryId, category : Category) : async () {
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?_) {
        categories.add(categoryId, category);
      };
    };
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func deleteCategory(categoryId : CategoryId) : async () {
    categories.remove(categoryId);
  };

  /**************
   * Cart & Wishlist Management
   **************/

  public shared ({ caller }) func addToCart(productId : ProductId) : async () {
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?value) { value };
    };

    if (product.stock == 0) {
      Runtime.trap("Product out of stock");
    };

    let existingCart = switch (carts.get(caller)) {
      case (null) { { items = [] } };
      case (?cart) { cart };
    };

    let existingCartItems = List.fromArray<CartItem>(existingCart.items);
    let existingItem = existingCartItems.find(
      func(item) { item.productId == productId }
    );

    let filteredCart = if (existingCartItems.size() == 0) {
      List.empty<CartItem>();
    } else {
      existingCartItems.filter(
        func(item) { item.productId != productId }
      );
    };

    let newQuantity = switch (existingItem) {
      case (null) { 1 };
      case (?item) { item.quantity + 1 };
    };

    let newItem = { productId; quantity = newQuantity };
    filteredCart.add(newItem);

    let newCart = { items = filteredCart.toArray() };
    carts.add(caller, newCart);
  };

  public shared ({ caller }) func removeFromCart(productId : ProductId) : async () {
    let existingCart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    let existingCartItems = List.fromArray<CartItem>(existingCart.items);
    let filteredCart = existingCartItems.filter(
      func(item) { item.productId != productId }
    );

    let newCart = { items = filteredCart.toArray() };
    carts.add(caller, newCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    carts.add(caller, { items = [] });
  };

  public query ({ caller }) func getCart() : async Cart {
    switch (carts.get(caller)) {
      case (null) {
        { items = [] };
      };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func addToWishlist(productId : ProductId) : async () {
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?value) { value };
    };

    let existingWishlist = switch (wishlists.get(caller)) {
      case (null) { { productIds = [] } };
      case (?wishlist) { wishlist };
    };

    let existingIds = List.fromArray<ProductId>(existingWishlist.productIds);
    let alreadyExists = existingIds.find(func(id) { id == productId });

    if (alreadyExists != null) {
      Runtime.trap("Product already in wishlist");
    };

    existingIds.add(productId);
    let newWishlist = { productIds = existingIds.toArray() };
    wishlists.add(caller, newWishlist);
  };

  public shared ({ caller }) func removeFromWishlist(productId : ProductId) : async () {
    let existingWishlist = switch (wishlists.get(caller)) {
      case (null) { Runtime.trap("Wishlist is empty") };
      case (?wishlist) { wishlist };
    };

    let existingIds = List.fromArray<ProductId>(existingWishlist.productIds);
    let filteredIds = existingIds.filter(func(id) { id != productId });

    let newWishlist = { productIds = filteredIds.toArray() };
    wishlists.add(caller, newWishlist);
  };

  public query ({ caller }) func getWishlist() : async Wishlist {
    switch (wishlists.get(caller)) {
      case (null) {
        { productIds = [] };
      };
      case (?wishlist) { wishlist };
    };
  };

  /**************
   * Coupon Management
   **************/
  public query ({ caller }) func getAllCoupons() : async [Coupon] {
    coupons.values().toArray();
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func addCoupon(coupon : Coupon) : async () {
    coupons.add(coupon.code, coupon);
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func deleteCoupon(code : CouponCode) : async () {
    coupons.remove(code);
  };

  /**************
   * Referral & Order Management
   **************/
  public query ({ caller }) func getUserReferrals(userId : UserId) : async [UserId] {
    let code = userId.toText();
    switch (referrals.get(code)) {
      case (null) { [] };
      case (?referral) { referral.referrals };
    };
  };

  public shared ({ caller }) func createReferral(code : ReferralCode) : async () {
    switch (referrals.get(code)) {
      case (?_) { Runtime.trap("Referral code already exists") };
      case (null) {
        let newReferral : Referral = {
          code = code;
          creator = caller;
          referrals = [];
        };
        referrals.add(code, newReferral);
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async Order {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) { order };
    };

    order;
  };

  public query ({ caller }) func getAllCustomerOrders(userId : UserId) : async [Order] {
    orders.values().filter(func(order) { Principal.equal(order.userId, userId) }).toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, newStatus : OrderStatus) : async () {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) { order };
    };

    let updatedHistory = List.fromArray<OrderStatus>(order.statusHistory);
    updatedHistory.add(newStatus);

    let updatedOrder = {
      order with
      status = newStatus;
      statusHistory = updatedHistory.toArray();
    };

    orders.add(orderId, updatedOrder);
  };

  /**************
   * Stripe Integration
   **************/
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  // Admin operation - no authorization check per implementation plan
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
