export type ListingStatus = 'active' | 'claimed';

export type FoodCategory =
  | 'Cooked Meals'
  | 'Baked Goods'
  | 'Fresh Produce'
  | 'Packaged/Pantry'
  | 'Dairy & Eggs'
  | 'Beverages'
  | 'Other';

export interface FoodListing {
  id: string;
  food_item: string;
  category: FoodCategory;
  quantity: string;
  location: string;
  available_from: string;
  available_until: string;
  contact_info: string;
  note?: string;
  status: ListingStatus;
  created_at: string;
}

export interface CreateListingInput {
  food_item: string;
  category?: FoodCategory;
  quantity: string;
  location: string;
  available_from: string;
  available_until: string;
  contact_info: string;
  note?: string;
}

export interface FilterOptions {
  search: string;
  category: string;
  status: string; // 'all' | 'active' | 'claimed'
  sortBy: string; // 'newest' | 'expiring'
}

export interface ListingStats {
  totalListings: number;
  activeListings: number;
  claimedListings: number;
  locationsCount: number;
}
