interface Place {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  imageUri: string;
  address: string;
  priceLevel: number;
  selected: boolean;
  googlePlaceId?: string;
  location?: {
    lat: number;
    lng: number;
  };
  vicinity?: string;
}

declare global {
  var selectedInterests: string[];
  var routeDestination: string;
  var routeWaypoints: string;
  var selectedPlaces: Place[];
  var shouldResetInputs: boolean;
}

export {};