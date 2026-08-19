// src/components/contracts/public/PublicContractTermsSection.tsx
"use client";

import { useState } from "react";
import { Shield, Scale, AlertCircle, FileText, CheckCircle2, Fuel, MapPin, Clock } from "lucide-react";

interface Props {
  tenantName: string;
}

const TABS = [
  { id: "summary", label: "Summary", icon: Shield },
  { id: "terms", label: "Terms & Rules", icon: Scale },
  { id: "policies", label: "Agency Policies", icon: AlertCircle },
];

export default function PublicContractTermsSection({ tenantName }: Props) {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="p-4 sm:p-8">
      
      {/* Section Header */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText size={18} className="text-blue-600" />
          Terms & Conditions
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Review the contract terms before signing.
        </p>
      </div>

      {/* Clean Tab Navigation */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold 
                  whitespace-nowrap transition-colors border-b-2 focus:outline-none
                  ${isActive 
                    ? "border-blue-600 text-blue-700 bg-blue-50/50" 
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "summary" && <SummaryTab tenantName={tenantName} />}
        {activeTab === "terms" && <TermsTab />}
        {activeTab === "policies" && <PoliciesTab tenantName={tenantName} />}
      </div>
    </div>
  );
}

// Tab 1: Summary (Simple English declaration)
function SummaryTab({ tenantName }: { tenantName: string }) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="text-sm font-bold text-blue-900 mb-3">Your Declaration</h4>
        <p className="text-xs text-blue-800 mb-3">
          By signing, you confirm:
        </p>
        <ul className="space-y-2">
          {[
            "I will use this car for legal purposes only",
            "I am between 23 and 70 years old",
            "I am physically fit to drive safely",
            "My driver's license is valid and held for 2+ years",
            "I have no serious driving offenses in the last 5 years"
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-blue-800">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-600 leading-relaxed">
          By signing this document, you agree to all rental terms and conditions provided by {tenantName}. 
          The full legal agreement is available in the PDF download.
        </p>
      </div>
    </div>
  );
}

// Tab 2: General Terms (12 Articles simplified)
function TermsTab() {
  return (
    <div className="space-y-4">
      <ArticleItem 
        number={1}
        title="Who Can Drive"
        content="Only you or drivers we approve can drive this car. You cannot: use it for paid passenger transport, tow other vehicles, drive under the influence, carry illegal goods, or overload the car."
      />
      <ArticleItem 
        number={2}
        title="Car Condition"
        content="You received the car in good condition. If tires are damaged (not normal wear), you replace them. Do not tamper with the trip recorder. If it fails, you pay for 500 KM per day."
      />
      <ArticleItem 
        number={3}
        title="Extending Your Rental"
        content="Want to keep the car longer? Ask us first and pay the extra cost before the original return time. Late returns without approval may be treated as unauthorized use."
      />
      <ArticleItem 
        number={4}
        title="Payments & Fines"
        content="Pay on time. Late payments get 2% monthly interest. You're responsible for traffic fines, parking tickets, and tolls during your rental."
      />
      <ArticleItem 
        number={5}
        title="Insurance & Accidents"
        content="Report any accident, theft, or damage to us within 24 hours AND to police if there's injury or theft. Get a police report. Do not admit fault or settle with others without us."
      />
    </div>
  );
}

// Tab 3: Agency Policies
function PoliciesTab({ tenantName }: { tenantName: string }) {
  return (
    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-4">
      <PolicyItem 
        icon={<Fuel size={14} className="text-amber-600" />}
        title="Fuel Policy"
        content="Return the car with the same fuel level as pickup. If below, a refueling fee applies."
      />
      <PolicyItem 
        icon={<MapPin size={14} className="text-amber-600" />}
        title="Mileage Limit"
        content="Daily limit: 550 KM. Excess mileage: KES 50 per KM."
      />
      <PolicyItem 
        icon={<Clock size={14} className="text-amber-600" />}
        title="Late Returns"
        content="Returns over 2 hours late are charged as a new rental day."
      />
      
      <div className="pt-3 border-t border-amber-200">
        <p className="text-xs text-amber-800 font-semibold mb-2">
          {tenantName} Specific Policies
        </p>
        <p className="text-xs text-amber-700">
          Additional agency-specific policies are detailed in the full PDF contract document.
        </p>
      </div>
    </div>
  );
}

// Reusable components
function ArticleItem({ number, title, content }: { number: number; title: string; content: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
        {number}
      </div>
      <div>
        <h5 className="text-xs font-bold text-slate-900 mb-1">{title}</h5>
        <p className="text-xs text-slate-600 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function PolicyItem({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-amber-100 rounded-lg shrink-0">{icon}</div>
      <div>
        <h5 className="text-xs font-bold text-amber-900 mb-1">{title}</h5>
        <p className="text-xs text-amber-800 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
