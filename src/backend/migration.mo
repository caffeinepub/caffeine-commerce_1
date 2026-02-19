import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    imageUrl : Text;
    categoryId : Nat;
    owner : Principal;
  };

  type Category = {
    id : Nat;
    name : Text;
    image : Text;
  };

  type OldActor = {
    products : Map.Map<Nat, Product>;
    categories : Map.Map<Nat, Category>;
    // Add other fields here as necessary
  };

  type NewActor = {
    products : Map.Map<Nat, Product>;
    categories : Map.Map<Nat, Category>;
    // Add other fields here as necessary
  };

  public func run(old : OldActor) : NewActor {
    // Initialize with old data by default
    var newProducts = old.products;
    var newCategories = old.categories;

    // Check and populate products if empty
    if (old.products.isEmpty()) {
      let sampleProduct : Product = {
        id = 1;
        name = "iPhone 13";
        description = "Latest Apple smartphone with A15 Bionic chip";
        price = 99900;
        stock = 50;
        imageUrl = "https://example.com/iphone13.jpg";
        categoryId = 1;
        owner = Principal.anonymous();
      };
      newProducts := Map.singleton(1, sampleProduct);
    };

    // Check and populate categories if empty
    if (old.categories.isEmpty()) {
      let sampleCategories = Map.empty<Nat, Category>();
      sampleCategories.add(1, { id = 1; name = "Mobiles"; image = "mobiles.png" });
      sampleCategories.add(2, { id = 2; name = "Electronics"; image = "electronics.png" });
      sampleCategories.add(3, { id = 3; name = "Fashion"; image = "fashion.png" });
      sampleCategories.add(4, { id = 4; name = "Home & Kitchen"; image = "home_kitchen.png" });
      newCategories := sampleCategories;
    };

    {
      products = newProducts;
      categories = newCategories;
      // Add other fields here as necessary
    };
  };
};
