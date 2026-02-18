import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  public type OldMigratedCategory = {
    id : Nat;
    name : Text;
  };

  public type OldActor = {
    categories : Map.Map<Nat, OldMigratedCategory>;
  };

  public type NewMigratedCategory = {
    id : Nat;
    name : Text;
    image : Text;
  };

  public type NewActor = {
    categories : Map.Map<Nat, NewMigratedCategory>;
  };

  public func run(old : OldActor) : NewActor {
    let newCategories = old.categories.map<Nat, OldMigratedCategory, NewMigratedCategory>(
      func(_id, oldCategory) {
        {
          oldCategory with
          image = "";
        };
      }
    );
    {
      categories = newCategories;
    };
  };
};
