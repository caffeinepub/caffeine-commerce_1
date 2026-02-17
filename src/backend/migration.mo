import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Old actor type without site settings.
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; address : Text }>;
    products : Map.Map<Nat, { id : Nat; name : Text; description : Text; price : Nat; stock : Nat; imageUrl : Text; categoryId : Nat }>;
    categories : Map.Map<Nat, { id : Nat; name : Text }>;
    carts : Map.Map<Principal, { items : [{ productId : Nat; quantity : Nat }] }>;
    wishlists : Map.Map<Principal, { productIds : [Nat] }>;
    orders : Map.Map<Nat, { id : Nat; userId : Principal; items : [{ productId : Nat; quantity : Nat }]; totalAmount : Nat; status : { #pending; #completed; #cancelled }; statusHistory : [{ #pending; #completed; #cancelled }]; timestamp : Int }>;
    coupons : Map.Map<Text, { code : Text; discountPercentage : Nat; validUntil : Int }>;
    referrals : Map.Map<Text, { code : Text; creator : Principal; referrals : [Principal] }>;
    stripeSessions : Map.Map<Text, Principal>;
    adminSessions : Map.Map<Principal, Text>;
  };

  // New actor type with site settings.
  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; address : Text }>;
    products : Map.Map<Nat, { id : Nat; name : Text; description : Text; price : Nat; stock : Nat; imageUrl : Text; categoryId : Nat }>;
    categories : Map.Map<Nat, { id : Nat; name : Text }>;
    carts : Map.Map<Principal, { items : [{ productId : Nat; quantity : Nat }] }>;
    wishlists : Map.Map<Principal, { productIds : [Nat] }>;
    orders : Map.Map<Nat, { id : Nat; userId : Principal; items : [{ productId : Nat; quantity : Nat }]; totalAmount : Nat; status : { #pending; #completed; #cancelled }; statusHistory : [{ #pending; #completed; #cancelled }]; timestamp : Int }>;
    coupons : Map.Map<Text, { code : Text; discountPercentage : Nat; validUntil : Int }>;
    referrals : Map.Map<Text, { code : Text; creator : Principal; referrals : [Principal] }>;
    stripeSessions : Map.Map<Text, Principal>;
    adminSessions : Map.Map<Principal, Text>;
    siteSettings : { shopName : Text; logo : Text };
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      siteSettings = {
        shopName = "Canfinity Store";
        logo = "";
      };
    };
  };
};
