module {
  type OldActor = { nextId : Nat };
  type NewActor = { nextId : Nat };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
