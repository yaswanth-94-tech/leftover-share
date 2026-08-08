import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Trash2,
  Tag,
  Info,
  Calendar,
  Sparkles,
  Share2,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { FoodListing } from '../types.js';
import { getRelativeTimeString, formatTimeWindow, isExpired } from '../utils/time.js';

interface ListingCardProps {
  listing: FoodListing;
  onClaimToggle: (id: string, currentStatus: 'active' | 'claimed') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  'Cooked Meals': { bg: 'bg-amber-100/80 border-amber-200/80', text: 'text-amber-900', icon: '🍲' },
  'Baked Goods': { bg: 'bg-orange-100/80 border-orange-200/80', text: 'text-orange-900', icon: '🥖' },
  'Fresh Produce': { bg: 'bg-emerald-100/80 border-emerald-200/80', text: 'text-emerald-900', icon: '🍎' },
  'Packaged/Pantry': { bg: 'bg-blue-100/80 border-blue-200/80', text: 'text-blue-900', icon: '🥫' },
  'Dairy & Eggs': { bg: 'bg-indigo-100/80 border-indigo-200/80', text: 'text-indigo-900', icon: '🥛' },
  'Beverages': { bg: 'bg-teal-100/80 border-teal-200/80', text: 'text-teal-900', icon: '🥤' },
  'Other': { bg: 'bg-stone-100 border-stone-200', text: 'text-stone-800', icon: '🍱' },
};

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onClaimToggle,
  onDelete,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isClaimed = listing.status === 'claimed';
  const expired = isExpired(listing.available_until);
  const relativeTime = getRelativeTimeString(listing.created_at);
  const timeWindowText = formatTimeWindow(listing.available_from, listing.available_until);

  const catStyle = CATEGORY_COLORS[listing.category] || CATEGORY_COLORS['Other'];

  const handleClaim = async () => {
    setIsUpdating(true);
    try {
      await onClaimToggle(listing.id, listing.status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove "${listing.food_item}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(listing.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleCopyContact = () => {
    navigator.clipboard.writeText(`${listing.contact_info} (Pickup at ${listing.location})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-[2rem] border transition-all duration-200 p-5 shadow-xs ${
        isClaimed
          ? 'bg-[#F9F9F7] border-[#EBE9E4] opacity-75'
          : 'bg-white border-[#EBE9E4] hover:border-[#5A7D55]/50 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex justify-between items-start mb-3">
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-2xl shadow-2xs">
            {catStyle.icon}
          </div>

          <div className="flex items-center space-x-2">
            {isClaimed ? (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                CLAIMED
              </span>
            ) : expired ? (
              <span className="text-[10px] bg-stone-200 text-stone-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                EXPIRED
              </span>
            ) : (
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Title & Quantity */}
        <h4
          className={`font-bold text-lg text-[#2D3436] leading-tight mb-1 ${
            isClaimed ? 'line-through text-stone-400' : ''
          }`}
        >
          {listing.food_item}
        </h4>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 border border-[#EBE9E4] text-stone-600">
            {listing.quantity}
          </span>
          <span className="text-xs text-stone-400 font-medium">Posted {relativeTime}</span>
        </div>

        {/* Details List */}
        <div className="mt-4 space-y-2 text-xs text-stone-600 border-t border-[#EBE9E4] pt-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#5A7D55] shrink-0" />
            <span className="truncate font-medium text-stone-800">{listing.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E98A4A] shrink-0" />
            <span className="text-stone-700">{timeWindowText}</span>
          </div>

          <div className="flex items-center justify-between gap-1 pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <Phone className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="font-semibold text-stone-800 truncate">{listing.contact_info}</span>
            </div>
            <button
              onClick={handleCopyContact}
              className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              title="Copy contact"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {listing.note && listing.note.trim() !== '' && (
            <p className="text-stone-500 italic mt-2 text-[11px] bg-[#F9F9F7] p-2 rounded-xl border border-[#EBE9E4]">
              "{listing.note}"
            </p>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-3 border-t border-[#EBE9E4] flex items-center gap-2">
        <button
          onClick={handleClaim}
          disabled={isUpdating}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            isClaimed
              ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              : 'bg-[#5A7D55] text-white hover:bg-opacity-90 shadow-2xs'
          }`}
        >
          {isClaimed ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Available Again</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Claimed</span>
            </>
          )}
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2.5 rounded-xl border border-[#EBE9E4] text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Delete listing"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
