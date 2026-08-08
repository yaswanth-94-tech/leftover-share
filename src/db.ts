import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { FoodListing, CreateListingInput, ListingStats } from './types.js';

const LISTINGS_COLLECTION = 'listings';

export async function fetchAllListings(
  search?: string,
  status?: string,
  category?: string
): Promise<FoodListing[]> {
  try {
    const colRef = collection(db, LISTINGS_COLLECTION);
    const q = query(colRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);

    let listings: FoodListing[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FoodListing, 'id'>),
    }));

    // If Firestore collection is empty, seed initial sample listings into Firestore
    if (listings.length === 0) {
      await seedInitialData();
      const newSnapshot = await getDocs(q);
      listings = newSnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FoodListing, 'id'>),
      }));
    }

    // Filter status
    if (status && status !== 'all') {
      listings = listings.filter((item) => item.status === status);
    }

    // Filter category
    if (category && category !== 'all') {
      listings = listings.filter((item) => item.category === category);
    }

    // Filter search
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      listings = listings.filter(
        (item) =>
          item.food_item.toLowerCase().includes(term) ||
          item.location.toLowerCase().includes(term) ||
          (item.note && item.note.toLowerCase().includes(term))
      );
    }

    return listings;
  } catch (err) {
    console.error('Error fetching listings from Firestore:', err);
    return [];
  }
}

async function seedInitialData() {
  const now = new Date();
  const sampleListings: Omit<FoodListing, 'id'>[] = [
    {
      food_item: 'Fresh Baked Sourdough Loaves & Croissants',
      category: 'Baked Goods',
      quantity: '4 sourdough loaves & 6 croissants',
      location: 'Artisan Bakery - 142 Elm Street, Downtown',
      available_from: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      available_until: new Date(now.getTime() + 1000 * 60 * 60 * 6).toISOString(),
      contact_info: 'Maria (555-0142) - Ask at back door',
      note: 'Baked fresh this morning! All vegetarian.',
      status: 'active',
      created_at: new Date(now.getTime() - 1000 * 60 * 25).toISOString(),
    },
    {
      food_item: 'Vegetable Lasagna & Garlic Bread',
      category: 'Cooked Meals',
      quantity: '1 large tray (approx. 6 portions)',
      location: 'Community Center Kitchen - 500 Oak Avenue',
      available_from: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      available_until: new Date(now.getTime() + 1000 * 60 * 60 * 3).toISOString(),
      contact_info: 'Chef Carlos (555-0199)',
      note: 'Vegetarian, kept warm in insulated foil container. High demand!',
      status: 'active',
      created_at: new Date(now.getTime() - 1000 * 60 * 110).toISOString(),
    },
    {
      food_item: 'Organic Apples, Oranges & Bananas',
      category: 'Fresh Produce',
      quantity: '2 crates (approx. 15 lbs)',
      location: 'Westside Farmers Market - St. Jude Plaza',
      available_from: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
      available_until: new Date(now.getTime() + 1000 * 60 * 60 * 12).toISOString(),
      contact_info: 'Green Grocers Stall #4 (555-0832)',
      note: 'Slightly ripe fruit, perfect for smoothies or baking!',
      status: 'active',
      created_at: new Date(now.getTime() - 1000 * 60 * 150).toISOString(),
    },
    {
      food_item: 'Canned Soups & Pasta Boxes',
      category: 'Packaged/Pantry',
      quantity: '12 cans tomato soup & 8 pasta boxes',
      location: 'Pantry Share Spot - 88 River Road',
      available_from: new Date(now.getTime() - 1000 * 60 * 300).toISOString(),
      available_until: new Date(now.getTime() + 1000 * 60 * 60 * 48).toISOString(),
      contact_info: 'David (555-0411)',
      note: 'Unopened, non-perishable. Sealed in box on porch.',
      status: 'claimed',
      created_at: new Date(now.getTime() - 1000 * 60 * 280).toISOString(),
    },
  ];

  const colRef = collection(db, LISTINGS_COLLECTION);
  for (const item of sampleListings) {
    await addDoc(colRef, item);
  }
}

export async function insertListing(input: CreateListingInput): Promise<FoodListing> {
  const colRef = collection(db, LISTINGS_COLLECTION);
  const nowISO = new Date().toISOString();

  const newListingData: Omit<FoodListing, 'id'> = {
    food_item: input.food_item.trim(),
    category: input.category || 'Other',
    quantity: input.quantity.trim(),
    location: input.location.trim(),
    available_from: input.available_from,
    available_until: input.available_until,
    contact_info: input.contact_info.trim(),
    note: input.note ? input.note.trim() : '',
    status: 'active',
    created_at: nowISO,
  };

  const docRef = await addDoc(colRef, newListingData);

  return {
    id: docRef.id,
    ...newListingData,
  };
}

export async function updateListingStatus(
  id: string,
  status: 'active' | 'claimed'
): Promise<FoodListing | null> {
  const docRef = doc(db, LISTINGS_COLLECTION, id);
  await updateDoc(docRef, { status });

  const updatedSnap = await getDoc(docRef);
  if (!updatedSnap.exists()) {
    return null;
  }

  return {
    id: updatedSnap.id,
    ...(updatedSnap.data() as Omit<FoodListing, 'id'>),
  };
}

export async function deleteListingById(id: string): Promise<boolean> {
  const docRef = doc(db, LISTINGS_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    return false;
  }
  await deleteDoc(docRef);
  return true;
}

export async function getStats(): Promise<ListingStats> {
  const listings = await fetchAllListings();

  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === 'active').length;
  const claimedListings = listings.filter((l) => l.status === 'claimed').length;
  const locationsCount = new Set(listings.map((l) => l.location.toLowerCase().trim())).size;

  return {
    totalListings,
    activeListings,
    claimedListings,
    locationsCount,
  };
}
