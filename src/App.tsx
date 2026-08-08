import React, { useState, useEffect, useCallback } from 'react';
import {
  Utensils,
  Plus,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Heart,
  HelpCircle,
  Share2,
} from 'lucide-react';
import {
  FoodListing,
  CreateListingInput,
  FilterOptions,
  ListingStats,
} from './types.js';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { ListingCard } from './components/ListingCard.tsx';
import { CreateListingModal } from './components/CreateListingModal.tsx';
import { HowItWorksModal } from './components/HowItWorksModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { AuthProvider } from './AuthContext.tsx';

function MainAppContent() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [stats, setStats] = useState<ListingStats | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'all',
    status: 'active',
    sortBy: 'newest',
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleOpenAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // Fetch listings from API
  const loadListings = useCallback(
    async (isBackgroundRefresh = false) => {
      if (isBackgroundRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.category) queryParams.append('category', filters.category);

        const res = await fetch(`/api/listings?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data: FoodListing[] = await res.json();
        setListings(data);

        // Also refresh stats
        fetchStats();
      } catch (err: any) {
        console.error('Failed to load listings:', err);
        setErrorMessage('Couldn\'t load listings from server. Please check your network and try again.');
        addToast('error', 'Connection Error', 'Could not load listings from server.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters.search, filters.status, filters.category]
  );

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Ignore background stats fetch errors
    }
  };

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // Handle Filter Update
  const handleFilterChange = (updated: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      status: 'active',
      sortBy: 'newest',
    });
  };

  // Handle Create Listing
  const handleCreateListing = async (input: CreateListingInput) => {
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to publish post');
    }

    const newListing: FoodListing = await res.json();

    // Prepend new listing directly to state for instant feedback
    setListings((prev) => [newListing, ...prev]);
    fetchStats();

    addToast(
      'success',
      'Food Post Published!',
      `"${newListing.food_item}" is now visible to nearby neighbors.`
    );
  };

  // Handle Claim Toggle
  const handleClaimToggle = async (id: string, currentStatus: 'active' | 'claimed') => {
    const nextStatus = currentStatus === 'active' ? 'claimed' : 'active';

    try {
      const res = await fetch(`/api/listings/${id}/claim`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status on server');
      }

      const updatedListing: FoodListing = await res.json();

      setListings((prev) =>
        prev.map((item) => (item.id === id ? updatedListing : item))
      );
      fetchStats();

      if (nextStatus === 'claimed') {
        addToast('success', 'Food Claimed!', 'Status updated in database to Picked Up.');
      } else {
        addToast('info', 'Status Updated', 'Listing marked as Available again.');
      }
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message || 'Could not update status.');
    }
  };

  // Handle Delete Listing
  const handleDeleteListing = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete listing on server');
      }

      setListings((prev) => prev.filter((item) => item.id !== id));
      fetchStats();

      addToast('info', 'Post Removed', 'The food listing was deleted.');
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message || 'Could not delete listing.');
    }
  };

  const activeCount = stats?.activeListings || listings.filter((l) => l.status === 'active').length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 antialiased selection:bg-amber-200 selection:text-amber-900">
      
      {/* Top Sticky Header */}
      <Header
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
        activeCount={activeCount}
      />

      {/* Hero Banner Section */}
      <Hero
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        stats={stats}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResults={listings.length}
        onRefresh={() => loadListings(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area in Bento Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error State Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
            <button
              onClick={() => loadListings()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Load</span>
            </button>
          </div>
        )}

        {/* Bento Grid Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar Bento Cards (lg:col-span-4) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Bento Card: Quick Categories */}
            <div className="bg-white p-6 rounded-[2rem] border border-[#EBE9E4] shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5A7D55] mb-3">
                Food Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'All', value: 'all', emoji: '🌟' },
                  { label: 'Cooked Meals', value: 'Cooked Meals', emoji: '🍲' },
                  { label: 'Baked Goods', value: 'Baked Goods', emoji: '🥖' },
                  { label: 'Fresh Produce', value: 'Fresh Produce', emoji: '🍎' },
                  { label: 'Packaged', value: 'Packaged/Pantry', emoji: '🥫' },
                  { label: 'Dairy & Eggs', value: 'Dairy & Eggs', emoji: '🥛' },
                  { label: 'Beverages', value: 'Beverages', emoji: '🥤' },
                  { label: 'Other', value: 'Other', emoji: '🍱' },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleFilterChange({ category: cat.value })}
                    className={`p-2.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer border ${
                      filters.category === cat.value
                        ? 'bg-[#5A7D55] text-white border-[#5A7D55] shadow-xs'
                        : 'bg-[#F9F9F7] text-stone-700 border-[#EBE9E4] hover:bg-stone-100'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bento Card: Post Quick CTA */}
            <div className="bg-[#5A7D55] text-white p-6 rounded-[2rem] shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200">
                  Got Extra Food?
                </span>
                <h3 className="text-xl font-bold font-serif mt-1">Don't throw it away!</h3>
                <p className="text-xs text-stone-100 mt-2 leading-relaxed">
                  Post surplus meals, baked items, or produce in under a minute to share with neighbors nearby.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-5 w-full py-3 rounded-full bg-[#E98A4A] hover:bg-[#D3763D] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Post Food Donation</span>
              </button>
            </div>

            {/* Bento Card: Community Guidelines */}
            <div className="bg-[#F9F4F0] p-6 rounded-[2rem] border border-[#F2E8DF] shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E98A4A] mb-2">
                Sharing Guidelines
              </h3>
              <ul className="text-xs text-stone-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#5A7D55] font-bold">✓</span>
                  <span>Keep perishable foods refrigerated until pickup.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5A7D55] font-bold">✓</span>
                  <span>List dietary details and potential allergens clearly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#5A7D55] font-bold">✓</span>
                  <span>Mark items as claimed promptly once collected.</span>
                </li>
              </ul>
            </div>

          </aside>

          {/* Right Listings Grid Area (lg:col-span-8) */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Loading Skeleton Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-[2rem] p-5 border border-[#EBE9E4] animate-pulse space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-10 w-10 bg-stone-200 rounded-2xl"></div>
                      <div className="h-4 w-16 bg-stone-200 rounded-full"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-stone-200 rounded-md"></div>
                    <div className="h-4 w-1/2 bg-stone-200 rounded-md"></div>
                    <div className="space-y-2 pt-2">
                      <div className="h-4 w-full bg-stone-100 rounded"></div>
                      <div className="h-4 w-5/6 bg-stone-100 rounded"></div>
                    </div>
                    <div className="h-10 w-full bg-stone-200 rounded-xl pt-4"></div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              /* Empty State Design */
              <div className="p-8 sm:p-12 text-center bg-white rounded-[2rem] border border-dashed border-[#EBE9E4] shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#E98A4A] mx-auto flex items-center justify-center mb-4">
                  <Utensils className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#2D3436]">
                  No Food Listings Found
                </h2>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
                  {filters.search || filters.category !== 'all' || filters.status !== 'active'
                    ? 'No food items match your selected filters. Try broadening your search or resetting filters.'
                    : 'No active food posts in the neighborhood yet. Be the first to share extra food with your community!'}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {(filters.search || filters.category !== 'all' || filters.status !== 'active') && (
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2.5 rounded-full border border-[#EBE9E4] text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#E98A4A] text-white text-sm font-semibold hover:bg-[#D3763D] shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Food Now</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Bento Listings Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClaimToggle={handleClaimToggle}
                    onDelete={handleDeleteListing}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Modals & Toasts */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateListing}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onOpenCreate={() => setIsCreateModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          addToast('success', 'Signed In', 'Welcome to Leftover Share!');
        }}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-400 py-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-2 text-stone-300">
            <Utensils className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-stone-100 font-serif">Leftover Share</span>
            <span>— Building Zero-Waste Food Communities</span>
          </div>
          <div className="flex items-center space-x-1 text-stone-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>for neighbors everywhere</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

