import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

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
    owner : UserId;
  };

  public type ProductInput = {
    name : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    imageUrl : Text;
    categoryId : CategoryId;
  };

  public type Filter = {
    #category : CategoryId;
    #minPrice : Nat;
    #maxPrice : Nat;
    #sortByCategory : Order.Order;
    #sortByPrice : Order.Order;
    #sortByName : Order.Order;
    #searchText : Text;
    #page : Nat;
    #pageSize : Nat;
  };

  public type Category = {
    id : CategoryId;
    name : Text;
    image : Text;
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
    #processing;
    #confirmed;
    #shipped;
    #delivered;
  };

  public type Order = {
    id : OrderId;
    userId : UserId;
    items : [CartItem];
    totalAmount : Nat;
    status : OrderStatus;
    statusHistory : [OrderStatus];
    timestamp : Time.Time;
    shippingAddress : ShippingAddress;
  };

  public type ShippingAddress = {
    name : Text;
    phone : Text;
    address : Text;
    pincode : Text;
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
  let stripeSessions = Map.empty<Text, UserId>();
  let adminSessions = Map.empty<UserId, AdminToken>();

  var siteSettings : SiteSettings = {
    shopName = "BISAULI";
    logo = "";
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query func healthCheck() : async Text {
    "Running";
  };

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

  // Public read access - no authorization needed for guests/shoppers
  public query func getSiteSettings() : async SiteSettings {
    siteSettings := {
      shopName = "BISAULI";
      logo = siteSettings.logo;
    };
    siteSettings;
  };

  // Admin-only function
  public shared ({ caller }) func updateSiteSettings(newSettings : SiteSettings) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update site settings");
    };
    siteSettings := {
      shopName = "BISAULI";
      logo = newSettings.logo;
    };
  };

  // Admin-only function
  public shared ({ caller }) func addProduct(input : ProductInput) : async ProductId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let productId = generateId();
    let product : Product = {
      id = productId;
      name = input.name;
      description = input.description;
      price = input.price;
      stock = input.stock;
      imageUrl = input.imageUrl;
      categoryId = input.categoryId;
      owner = caller;
    };
    products.add(productId, product);
    productId;
  };

  // Admin-only function
  public shared ({ caller }) func updateProduct(productId : ProductId, input : ProductInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?existingProduct) {
        let updatedProduct : Product = {
          id = productId;
          name = input.name;
          description = input.description;
          price = input.price;
          stock = input.stock;
          imageUrl = input.imageUrl;
          categoryId = input.categoryId;
          owner = existingProduct.owner;
        };
        products.add(productId, updatedProduct);
      };
    };
  };

  // Admin-only function
  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) {
        products.remove(productId);
      };
    };
  };

  // Public read access - no authorization needed for guests/shoppers
  public query func getProducts(filters : [Filter]) : async [Product] {
    var filteredProducts = products.values().toArray();

    if (filters.size() > 0) {
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
              func(product) {
                let lowerSearchText = searchText.toLower();
                let productMatches = product.name.toLower().contains(#text lowerSearchText);
                let descMatches = product.description.toLower().contains(#text lowerSearchText);
                productMatches or descMatches;
              }
            );
          };
          case (_) {};
        };
      };
    };
    filteredProducts;
  };

  // Public read access - no authorization needed for vendor routing
  public query func getOwnerProducts(owner : Principal) : async [Product] {
    products.values().filter(func(product) { Principal.equal(product.owner, owner) }).toArray();
  };

  // Public read access - no authorization needed
  public query func getProductOwner(productId : ProductId) : async Principal {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) {
        product.owner;
      };
    };
  };

  // Public read access - no authorization needed for guests/shoppers
  public query func getCategories() : async [Category] {
    categories.values().toArray();
  };

  // Admin-only function
  public shared ({ caller }) func addCategory(category : Category) : async CategoryId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add categories");
    };
    let categoryId = generateId();
    let newCategory = {
      category with id = categoryId
    };
    categories.add(categoryId, newCategory);
    categoryId;
  };

  // Admin-only function
  public shared ({ caller }) func updateCategory(categoryId : CategoryId, category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    switch (categories.get(categoryId)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?_) {
        categories.add(categoryId, category);
      };
    };
  };

  // Admin-only function
  public shared ({ caller }) func deleteCategory(categoryId : CategoryId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    categories.remove(categoryId);
  };

  public shared ({ caller }) func addToCart(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
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

  public shared ({ caller }) func removeFromCart(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };
    carts.add(caller, { items = [] });
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

  public shared ({ caller }) func addToWishlist(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage wishlist");
    };

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage wishlist");
    };

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

  // Admin-only function
  public query ({ caller }) func getAllCoupons() : async [Coupon] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all coupons");
    };
    coupons.values().toArray();
  };

  // Admin-only function
  public shared ({ caller }) func addCoupon(coupon : Coupon) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add coupons");
    };
    coupons.add(coupon.code, coupon);
  };

  // Admin-only function
  public shared ({ caller }) func deleteCoupon(code : CouponCode) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete coupons");
    };
    coupons.remove(code);
  };

  public query ({ caller }) func getUserReferrals(userId : UserId) : async [UserId] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own referrals");
    };
    let code = userId.toText();
    switch (referrals.get(code)) {
      case (null) { [] };
      case (?referral) { referral.referrals };
    };
  };

  public shared ({ caller }) func createReferral(code : ReferralCode) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create referrals");
    };
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

    if (not Principal.equal(order.userId, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    order;
  };

  public query ({ caller }) func getAllCustomerOrders(userId : UserId) : async [Order] {
    if (not Principal.equal(userId, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    orders.values().filter(func(order) { Principal.equal(order.userId, userId) }).toArray();
  };

  // Admin-only function
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Admin-only function
  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, newStatus : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

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

  public shared ({ caller }) func placeOrder(shippingAddress : ShippingAddress) : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart is empty") };
      case (?cart) { cart };
    };

    if (cart.items.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    let totalAmount = cart.items.foldLeft(
      0,
      func(acc, item) {
        let product = switch (products.get(item.productId)) {
          case (null) { Runtime.trap("Product does not exist") };
          case (?p) { p };
        };
        acc + (product.price * item.quantity);
      },
    );

    let orderId = generateId();
    let newOrder : Order = {
      id = orderId;
      userId = caller;
      items = cart.items;
      totalAmount;
      status = #pending;
      statusHistory = [#pending];
      timestamp = Time.now();
      shippingAddress;
    };

    orders.add(orderId, newOrder);

    let cartProducts = Map.empty<ProductId, Product>();
    for (item in cart.items.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product does not exist") };
        case (?p) { p };
      };

      if (product.stock < item.quantity) {
        Runtime.trap("Not enough stock for " # product.name # ". Only " # product.stock.toText() # " left in stock.");
      };

      cartProducts.add(item.productId, product);
    };

    for (item in cart.items.values()) {
      let product = switch (cartProducts.get(item.productId)) {
        case (null) { Runtime.trap("Product does not exist anymore") };
        case (?p) { p };
      };
      let updatedProduct = {
        product with
        stock = product.stock - item.quantity;
      };
      products.add(item.productId, updatedProduct);
    };

    carts.add(caller, { items = [] });

    orderId;
  };

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  // Admin-only function
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
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
    switch (stripeSessions.get(sessionId)) {
      case (?owner) {
        if (not Principal.equal(owner, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only check your own sessions");
        };
      };
      case (null) {};
    };

    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);

    stripeSessions.add(sessionId, caller);

    sessionId;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
