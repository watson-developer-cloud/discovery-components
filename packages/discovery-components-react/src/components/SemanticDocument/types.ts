export interface Location {
  begin: number;
  end: number;
}

// TODO better name
export interface Item {
  id?: string;
  location: Location;
}
