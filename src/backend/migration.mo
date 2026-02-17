import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Stripe "stripe/stripe";

module {
  public type OldActor = {
    nextId : Nat;
    userProfiles : Map.Map<Principal, { userId : Principal; name : Text; address : Text }>;
    products : Map.Map<Nat, { id : Nat; name : Text; description : Text; price : Nat; stock : Nat; imageUrl : Text; categoryId : Nat }>;
    categories : Map.Map<Nat, { id : Nat; name : Text }>;
    carts : Map.Map<Principal, { items : [{ productId : Nat; quantity : Nat }] }>;
    wishlists : Map.Map<Principal, { productIds : [Nat] }>;
    orders : Map.Map<
      Nat,
      {
        id : Nat;
        userId : Principal;
        items : [{ productId : Nat; quantity : Nat }];
        totalAmount : Nat;
        status : { #pending; #completed; #cancelled };
        statusHistory : [{ #pending; #completed; #cancelled }];
        timestamp : Time.Time;
      }
    >;
    coupons : Map.Map<Text, { code : Text; discountPercentage : Nat; validUntil : Time.Time }>;
    referrals : Map.Map<Text, { code : Text; creator : Principal; referrals : [Principal] }>;
    stripeSessions : Map.Map<Text, Principal>;
    stripeConfiguration : ?Stripe.StripeConfiguration;
  };

  public type NewActor = {
    nextId : Nat;
    userProfiles : Map.Map<Principal, { name : Text; address : Text }>;
    products : Map.Map<Nat, { id : Nat; name : Text; description : Text; price : Nat; stock : Nat; imageUrl : Text; categoryId : Nat }>;
    categories : Map.Map<Nat, { id : Nat; name : Text }>;
    carts : Map.Map<Principal, { items : [{ productId : Nat; quantity : Nat }] }>;
    wishlists : Map.Map<Principal, { productIds : [Nat] }>;
    orders : Map.Map<
      Nat,
      {
        id : Nat;
        userId : Principal;
        items : [{ productId : Nat; quantity : Nat }];
        totalAmount : Nat;
        status : { #pending; #completed; #cancelled };
        statusHistory : [{ #pending; #completed; #cancelled }];
        timestamp : Time.Time;
      }
    >;
    coupons : Map.Map<Text, { code : Text; discountPercentage : Nat; validUntil : Time.Time }>;
    referrals : Map.Map<Text, { code : Text; creator : Principal; referrals : [Principal] }>;
    stripeSessions : Map.Map<Text, Principal>;
    stripeConfiguration : ?Stripe.StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    let updatedUserProfiles = old.userProfiles.map<Principal, { userId : Principal; name : Text; address : Text }, { name : Text; address : Text }>(
      func(_userId, oldProfile) {
        { name = oldProfile.name; address = oldProfile.address };
      }
    );

    { old with userProfiles = updatedUserProfiles };
  };
};
