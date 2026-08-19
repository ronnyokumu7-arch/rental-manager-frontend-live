// src/components/contracts/public/PublicContractActions.tsx
"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  onSign: (signature: string) => Promise<boolean>;
  isSigning?: boolean;
  signed?: boolean;
}

export default function PublicContractActions({ 
  onSign, 
  isSigning = false, 
  signed = false 
}: Props) {
  return (
    <div className="p-4 sm:px-8 sm:py-6 bg-slate-50 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Simple English confirmation text */}
        <p className="text-xs text-slate-600 text-center sm:text-left max-w-md">
          By clicking sign, you confirm you have read and agree to all terms above.
        </p>
        
        {/* Sign button with loading state */}
        {!signed ? (
          <button
            onClick={() => onSign("")} // Signature handled by parent via signature pad
            disabled={isSigning}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                      bg-blue-600 text-white text-sm font-bold 
                      hover:bg-blue-700 transition-all 
                      shadow-lg shadow-blue-200 
                      disabled:opacity-50 disabled:cursor-not-allowed 
                      shrink-0"
          >
            {isSigning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> 
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> 
                Sign Contract
              </>
            )}
          </button>
        ) : (
          /* Success state - contract already signed */
          <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                        bg-emerald-50 text-emerald-700 text-sm font-bold 
                        border border-emerald-200 shrink-0">
            <CheckCircle2 size={16} className="text-emerald-600" />
            Contract Signed
          </div>
        )}
      </div>
    </div>
  );
}
