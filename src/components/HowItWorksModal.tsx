import React from 'react';
import { X, Utensils, HeartHandshake, ShieldCheck, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreate: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onOpenCreate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-[#EBE9E4] overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="p-6 bg-[#E98A4A] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">How Leftover Share Works</h2>
              <p className="text-xs text-amber-100">
                Simple, open, neighbor-to-neighbor food sharing
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

        {/* Steps */}
        <div className="p-6 space-y-6 text-[#2D3436]">
          
          <div className="flex items-start space-x-4">
            <div className="w-9 h-9 rounded-2xl bg-[#5A7D55]/15 text-[#5A7D55] font-bold flex items-center justify-center shrink-0 border border-[#5A7D55]/20">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D3436]">Post Surplus Extra Food</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Got extra dinner portions, fresh baked loaves, or surplus garden fruit? Fill out a quick 1-minute post with pickup location, timing, and contact info.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-9 h-9 rounded-2xl bg-[#E98A4A]/15 text-[#E98A4A] font-bold flex items-center justify-center shrink-0 border border-[#E98A4A]/20">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D3436]">Neighbors Browse & Contact</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Local neighbors search by area or food category, then call or message the donor to arrange a quick, respectful pickup.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-900 font-bold flex items-center justify-center shrink-0 border border-teal-200">
              3
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D3436]">Pickup & Mark Claimed</h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Once collected, either the donor or recipient clicks "Mark as Picked Up / Claimed". The status updates live for the entire community!
              </p>
            </div>
          </div>

          {/* Safety Guidelines Box */}
          <div className="p-4 rounded-2xl bg-[#F9F9F7] border border-[#EBE9E4] text-xs text-stone-600 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-[#2D3436]">
              <ShieldCheck className="w-4 h-4 text-[#5A7D55]" />
              <span>Community Food Safety Tips</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Only share food you would comfortably eat yourself.</li>
              <li>Keep hot foods warm and perishable foods refrigerated until pickup.</li>
              <li>Clearly note dietary ingredients (allergens, dairy, nuts, meat).</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-[#F9F9F7] border-t border-[#EBE9E4] flex items-center justify-between">
          <span className="text-xs text-stone-500">100% Free & Open Access</span>
          <button
            onClick={() => {
              onClose();
              onOpenCreate();
            }}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#E98A4A] hover:bg-[#D3763D] transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Post Food Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
