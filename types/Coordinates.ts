export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserLocation extends Coordinates {
  address: string;
}
