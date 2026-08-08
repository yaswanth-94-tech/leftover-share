import React, { useState, useEffect } from 'react';
import { X, Utensils, MapPin, Clock, Phone, Tag, Sparkles, AlertCircle, Calendar, UserCheck } from 'lucide-react';
import { CreateListingInput, FoodCategory } from '../types.js';
import { useAuth } from '../AuthContext';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateListingInput) => Promise<void>;
}

const CATEGORIES: { label: string; value: FoodCategory; icon: string }[] = [
  { label: 'Cooked Meals', value: 'Cooked Meals', icon: '🍲' },
  { label: 'Baked Goods', value: 'Baked Goods', icon: '🥖' },
  { label: 'Fresh Produce', value: 'Fresh Produce', icon: '🍎' },
  { label: 'Packaged & Pantry', value: 'Packaged/Pantry', icon: '🥫' },
  { label: 'Dairy & Eggs', value: 'Dairy & Eggs', icon: '🥛' },
  { label: 'Beverages', value: 'Beverages', icon: '🥤' },
  { label: 'Other Food', value: 'Other', icon: '🍱' },
];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth();

  // Helper to format Date for datetime-local input
  const formatForDateTimeInput = (d: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const [foodItem, setFoodItem] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Cooked Meals');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [note, setNote] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize smart date/time & contact defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const inFourHours = new Date(now.getTime() + 4 * 60 * 60 * 1000);

      setAvailableFrom(formatForDateTimeInput(now));
      setAvailableUntil(formatForDateTimeInput(inFourHours));
      setError(null);

      if (user && !contactInfo) {
        const defaultContact = user.displayName
          ? `${user.displayName} (${user.email})`
          : user.email || '';
        setContactInfo(defaultContact);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation checks
    if (!foodItem.trim()) {
      setError('Please describe the food item you want to share.');
      return;
    }
    if (!quantity.trim()) {
      setError('Please specify the quantity (e.g. 3 portions, 1 box).');
      return;
    }
    if (!location.trim()) {
      setError('Please enter the pickup location address or area.');
      return;
    }
    if (!contactInfo.trim()) {
      setError('Please enter contact info (e.g. Name and phone number).');
      return;
    }
    if (!availableFrom || !availableUntil) {
      setError('Please provide valid start and end pickup times.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        food_item: foodItem.trim(),
        category,
        quantity: quantity.trim(),
        location: location.trim(),
        available_from: new Date(availableFrom).toISOString(),
        available_until: new Date(availableUntil).toISOString(),
        contact_info: contactInfo.trim(),
        note: note.trim(),
      });

      // Reset form
      setFoodItem('');
      setQuantity('');
      setLocation('');
      setContactInfo('');
      setNote('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit food listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-[#EBE9E4] overflow-hidden z-10 my-8">
        
        {/* Modal Header */}
        <div className="p-6 bg-[#5A7D55] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Post Food Donation</h2>
              <p className="text-xs text-stone-100">
                Share extra meals or ingredients with neighbors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Food Item Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Food Item / Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="e.g., 5 Loaves of Sourdough Bread, Vegetable Curry with Rice"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/30 focus:bg-white"
            />
          </div>

          {/* Food Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Food Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center space-x-1.5 p-2.5 rounded-2xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    category === cat.value
                      ? 'border-[#5A7D55] bg-[#5A7D55]/10 text-[#5A7D55] font-bold'
                      : 'border-[#EBE9E4] bg-[#F9F9F7] text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Contact Info Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 4 portions, 2 crates, 1 large bowl"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/30 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Contact Name & Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g., Sarah (555-0199) or Porch Box"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/30 focus:bg-white"
              />
            </div>
          </div>

          {/* Location Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Pickup Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., 142 Elm Street, Downtown (or porch / front desk)"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/30 focus:bg-white"
            />
          </div>

          {/* Available Window: From & Until */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Available From <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/30 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Available Until <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/30 focus:bg-white"
              />
            </div>
          </div>

          {/* Note / Special Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Additional Notes <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Vegetarian, contains dairy, kept warm in foil, bring your own bag"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#EBE9E4] bg-[#F9F9F7] text-sm text-[#2D3436] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A7D55]/30 focus:bg-white"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#EBE9E4] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-[#E98A4A] hover:bg-[#D3763D] shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-1"></span>
                  <span>Publishing Post...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Food Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
