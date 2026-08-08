import React from 'react';
import { HeartHandshake, Sparkles, Plus, Utensils, ShieldCheck, MapPin } from 'lucide-react';
import { ListingStats } from '../types.js';

interface HeroProps {
  onOpenCreateModal: () => void;
  stats?: ListingStats;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCreateModal, stats }) => {
  return (
    <section className="bg-[#F9F4F0] p-6 sm:p-8 rounded-[2rem] border border-[#F2E8DF] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6 my-4">
      <div className="max-w-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#E98A4A]" />
          <span>Community Food Exchange</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#2D3436] leading-tight">
          Reduce Waste. <span className="text-[#E98A4A]">Help Neighbors.</span>
        </h2>
        <p className="text-stone-600 text-sm sm:text-base mt-2 leading-relaxed">
          Share extra food with people in your neighborhood. Simple, local, and impactful.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-[#E98A4A] hover:bg-[#D3763D] text-white shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Post Food Donation</span>
          </button>
        </div>
      </div>

      {/* Hero Right Metrics (Bento style) */}
      <div className="w-full md:w-auto flex flex-row md:flex-col justify-around md:justify-end items-center md:items-end gap-4 p-4 md:p-0 bg-white/60 md:bg-transparent rounded-2xl md:rounded-none border md:border-none border-[#F2E8DF]">
        <div className="text-left md:text-right">
          <div className="text-3xl sm:text-4xl font-serif font-bold text-[#5A7D55]">
            {stats ? stats.claimedListings + stats.activeListings : '24+'}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#5A7D55]/80">
            Meals Shared & Active
          </div>
        </div>

        {stats && (
          <div className="flex items-center gap-3 text-xs text-stone-600 font-medium">
            <span className="inline-flex items-center gap-1 bg-[#5A7D55]/10 px-2.5 py-1 rounded-full text-[#5A7D55] font-semibold">
              <Utensils className="w-3.5 h-3.5" />
              {stats.activeListings} available
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-100/80 px-2.5 py-1 rounded-full text-amber-900 font-semibold">
              <HeartHandshake className="w-3.5 h-3.5 text-[#E98A4A]" />
              {stats.claimedListings} claimed
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
