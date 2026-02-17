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
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  /**************
   * Types
   **************/
  public type UserId = Principal;

  public type UserProfile = {
    userId : UserId;
    name : Text;
    address : Text;
  };

  public type ProductId = Nat;
  public type CategoryId = Nat;
  public type OrderId = Nat;
  public type CouponCode = Text;
  public type ReferralCode = Text;

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

  /**************
   * State
   **************/
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  /**************
   * Migration 3 Sample Products (needed only once)
   **************/
  public shared ({ caller }) func migrateSampleProducts() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can migrate sample products");
    };

    let productsToCreate : [Product] = [
      {
        id = 1;
        name = "Sample Product 1";
        description = "This is a sample product 1 description with a price of 299";
        price = 299;
        stock = 10;
        imageUrl = "product1_image.png";
        categoryId = 1;
      },
      {
        id = 2;
        name = "Sample Product 2";
        description = "This is a sample product 2 description with a price of 199";
        price = 199;
        stock = 12;
        imageUrl = "product2_image.png";
        categoryId = 1;
      },
      {
        id = 3;
        name = "Sample Product 3";
        description = "This is a sample product 3 description with a price of 499";
        price = 499;
        stock = 10;
        imageUrl = "product3_image.png";
        categoryId = 1;
      },
    ];

    for (product in productsToCreate.values()) {
      products.add(product.id, product);
    };
  };

  /**************
   * Product & Category Management (public functions required by frontend)
   **************/
  func matchesText(product : Product, searchText : Text) : Bool {
    let lowerSearchText = searchText.toLower();
    product.name.toLower().contains(#text lowerSearchText) or product.description.toLower().contains(#text lowerSearchText);
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

  /**************
   * Cart & Wishlist Management (public functions required by frontend)
   **************/

  public shared ({ caller }) func addToCart(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };

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

  public query ({ caller }) func getCart() : async Cart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (carts.get(caller)) {
      case (null) {
        { items = [] };
      };
      case (?cart) { cart };
    };
  };

  public query ({ caller }) func getWishlist() : async Wishlist {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view wishlist");
    };

    switch (wishlists.get(caller)) {
      case (null) {
        { productIds = [] };
      };
      case (?wishlist) { wishlist };
    };
  };

  /**************
   * Coupon Management (public functions required by frontend)
   **************/
  public query ({ caller }) func getAllCoupons() : async [Coupon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view coupons");
    };
    coupons.values().toArray();
  };

  /**************
   * Referral & Order Management (public functions required by frontend)
   **************/
  public query ({ caller }) func getUserReferrals(userId : UserId) : async [UserId] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own referrals");
    };

    let code = (userId.toText());
    switch (referrals.get(code)) {
      case (null) { [] };
      case (?referral) { referral.referrals };
    };
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async Order {
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) { order };
    };

    if (caller != order.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    order;
  };

  public query ({ caller }) func getAllCustomerOrders(userId : UserId) : async [Order] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    orders.values().filter(func(order) { order.userId == userId }).toArray();
  };

  /**************
   * Stripe Integration (functions required by frontend)
   **************/
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set Stripe configuration");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };

    // Verify the caller owns this session
    let sessionOwner = switch (stripeSessions.get(sessionId)) {
      case (null) { Runtime.trap("Session not found or unauthorized") };
      case (?owner) { owner };
    };

    if (caller != sessionOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own session status");
    };

    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);

    // Store the session ownership for later verification
    stripeSessions.add(sessionId, caller);

    sessionId;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
