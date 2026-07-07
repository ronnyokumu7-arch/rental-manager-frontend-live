"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, User, Shield, CheckCircle, Mail, Phone, Briefcase, CreditCard, Car } from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";
import SectionCard from "@/components/ui/SectionCard";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import DatePicker from "@/components/forms/DatePicker";

// ✅ STRICT SYSTEM-ALIGNED TITLES (No fluff, only operational roles)
const ADMIN_TITLES = ["Director", "Manager", "HR"];

const STAFF_DEPARTMENTS: Record<string, string[]> = {
  "Fleet & Operations": ["Fleet Manager", "Dispatcher", "Driver"],
  "Finance": ["Accountant", "Cashier"],
  "Sales & Contracts": ["Sales Agent", "Contracts Officer"],
};

const steps = [
  { id: 1, label: "Role & Position", icon: Shield },
  { id: 2, label: "Identity", icon: User },
  { id: 3, label: "Compliance", icon: CreditCard },
  { id: 4, label: "Review", icon: CheckCircle },
];

type RoleType = "admin" | "staff" | null;

export default function NewUserPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [roleType, setRoleType] = useState<RoleType>(null);
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
  });

  const updateField = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  // ✅ FIX: Prevent form submission on "Enter" key unless on the final step
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && currentStep < 4) {
      e.preventDefault();
    }
  };

  const validateStep = (): boolean => {
    if (currentStep === 1) {
      if (!roleType) { toast.error("Please select a role type"); return false; }
      if (!jobTitle) { toast.error("Please select a job title"); return false; }
      if (roleType === "staff" && !department) { toast.error("Please select a department"); return false; }
    }
    if (currentStep === 2) {
      if (!formData.full_name || !formData.email || !formData.password) {
        toast.error("Please fill in all required fields"); return false;
      }
    }
    if (currentStep === 3) {
      if (roleType === "staff" && !formData.id_number) { toast.error("ID Number is required for staff"); return false; }
      if (jobTitle === "Driver" && !formData.dl_number) { toast.error("Driver's License is required for Drivers"); return false; }
      if (jobTitle === "Driver" && !formData.dl_expiry) { toast.error("DL Expiry Date is required for Drivers"); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setCurrentStep(s => Math.min(4, s + 1)); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      await usersApi.create({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: roleType === "admin" ? "tenant_admin" : "tenant_staff",
        phone_number: formData.phone_number || null,
        // ✅ Correctly map department based on role
        department: roleType === "admin" ? "Executive" : department, 
        job_title: jobTitle,
        id_number: formData.id_number || null,
        dl_number: formData.dl_number || null,
        dl_expiry: formData.dl_expiry || null,
      });
      toast.success("Team member added successfully!");
      router.push("/dashboard/users");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = () => {
    if (roleType === "admin") return jobTitle || "Admin";
    if (jobTitle) return jobTitle;
    return "Staff";
  };

  const selectClass = "w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      <button onClick={() => router.push("/dashboard/users")} className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
        <ArrowLeft size={14} /> Back to Team
      </button>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Add Team Member</h1>
        <p className="text-sm text-slate-500 mt-1">Create a new account for your staff or admin.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentStep >= step.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                {currentStep > step.id ? <CheckCircle size={18} /> : <step.icon size={18} />}
              </div>
              <span className={`mt-2 text-xs font-medium ${currentStep >= step.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>{step.label}</span>
            </div>
            {index < steps.length - 1 && <div className={`h-0.5 flex-1 mx-4 ${currentStep > step.id ? "bg-blue-300" : "bg-slate-200 dark:bg-slate-700"}`} />}
          </div>
        ))}
      </div>

      {/* ✅ FIX: Added onKeyDown to block accidental Enter key submissions */}
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        
        {/* Step 1: Role & Position */}
        {currentStep === 1 && (
          <SectionCard className="!p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">1. Select Access Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Admin & HR Card */}
              <button type="button" onClick={() => { setRoleType("admin"); setDepartment(""); setJobTitle(""); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${roleType === "admin" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                <Shield className={`mb-2 ${roleType === "admin" ? "text-blue-600" : "text-slate-400"}`} size={20} />
                <p className="font-bold text-slate-900 dark:text-slate-100">Admin</p>
                <p className="text-xs text-slate-500 mt-1">Leadership, HR, and full agency management access.</p>
              </button>
              {/* Staff Card */}
              <button type="button" onClick={() => { setRoleType("staff"); setDepartment(""); setJobTitle(""); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${roleType === "staff" ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
                <Briefcase className={`mb-2 ${roleType === "staff" ? "text-blue-600" : "text-slate-400"}`} size={20} />
                <p className="font-bold text-slate-900 dark:text-slate-100">Operational Staff</p>
                <p className="text-xs text-slate-500 mt-1">Day-to-day operations, drivers, finance, and support.</p>
              </button>
            </div>

            {/* ✅ ADMIN DROPDOWN: Shows only when Admin is selected */}
            {roleType === "admin" && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. Select Admin Title</h3>
                <FormGroup label="Job Title / Position">
                  <select value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={selectClass}>
                    <option value="">Select Title...</option>
                    {ADMIN_TITLES.map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </FormGroup>
              </div>
            )}

            {/* ✅ STAFF DROPDOWNS: Shows only when Staff is selected */}
            {roleType === "staff" && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. Select Department & Position</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="Department">
                    <select 
                      value={department} 
                      onChange={(e) => { setDepartment(e.target.value); setJobTitle(""); }}
                      className={selectClass}
                    >
                      <option value="">Select Department...</option>
                      {Object.keys(STAFF_DEPARTMENTS).map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </FormGroup>
                  <FormGroup label="Job Title / Position">
                    <select 
                      value={jobTitle} 
                      onChange={(e) => setJobTitle(e.target.value)}
                      disabled={!department}
                      className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option value="">Select Position...</option>
                      {department && STAFF_DEPARTMENTS[department]?.map((title) => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
              </div>
            )}
          </SectionCard>
        )}

        {/* Step 2: Identity & Contact */}
        {currentStep === 2 && (
          <SectionCard className="!p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Full Name" required>
                <Input value={formData.full_name} onChange={(e) => updateField("full_name", e.target.value)} placeholder="e.g. Jane Doe" />
              </FormGroup>
              <FormGroup label="Email Address" required>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="jane@agency.com" className="pl-9" />
                </div>
              </FormGroup>
              <FormGroup label="Phone Number">
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input type="tel" value={formData.phone_number} onChange={(e) => updateField("phone_number", e.target.value)} placeholder="+254 7..." className="pl-9" />
                </div>
              </FormGroup>
              <FormGroup label="Temporary Password" required>
                <Input type="password" value={formData.password} onChange={(e) => updateField("password", e.target.value)} placeholder="Min 8 characters" />
              </FormGroup>
            </div>
          </SectionCard>
        )}

        {/* Step 3: Compliance */}
        {currentStep === 3 && (
          <SectionCard className="!p-6">
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Role:</strong> {getRoleDisplay()} | 
                {jobTitle === "Driver" && <span> ID & DL required</span>}
                {roleType === "staff" && jobTitle !== "Driver" && <span> ID required, DL optional</span>}
                {roleType === "admin" && <span> All fields optional</span>}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="National ID Number" required={roleType === "staff"}>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input value={formData.id_number} onChange={(e) => updateField("id_number", e.target.value)} placeholder="e.g. 12345678" className="pl-9" />
                </div>
              </FormGroup>
              {roleType === "staff" && (
                <>
                  <FormGroup label="Driver's License Number" required={jobTitle === "Driver"}>
                    <div className="relative">
                      <Car className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input value={formData.dl_number} onChange={(e) => updateField("dl_number", e.target.value)} placeholder="e.g. DL-01234" className="pl-9" />
                    </div>
                  </FormGroup>
                  <FormGroup label="DL Expiry Date" required={jobTitle === "Driver"}>
                    <DatePicker value={formData.dl_expiry} onChange={(val) => updateField("dl_expiry", val)} placeholder="Select date" />
                  </FormGroup>
                </>
              )}
            </div>
          </SectionCard>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <SectionCard className="!p-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Role & Access</h4>
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-blue-600" />
                  <span className="font-bold text-slate-900 dark:text-slate-100">{getRoleDisplay()}</span>
                  <span className="text-xs text-slate-500">({roleType === "admin" ? "Executive" : department})</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Identity</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-900 dark:text-slate-100">{formData.full_name}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-900 dark:text-slate-100">{formData.email}</span></div>
                  <div><span className="text-slate-500">Phone:</span> <span className="font-medium text-slate-900 dark:text-slate-100">{formData.phone_number || "—"}</span></div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Compliance</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500">ID Number:</span> <span className="font-medium text-slate-900 dark:text-slate-100">{formData.id_number || "—"}</span></div>
                  {roleType === "staff" && (
                    <>
                      <div><span className="text-slate-500">DL Number:</span> <span className="font-medium text-slate-900 dark:text-slate-100">{formData.dl_number || "—"}</span></div>
                      <div><span className="text-slate-500">DL Expiry:</span> <span className="font-medium text-slate-900 dark:text-slate-100">{formData.dl_expiry || "—"}</span></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={prevStep} disabled={currentStep === 1} className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30">
            <ArrowLeft size={14} className="inline mr-1" /> Previous
          </button>
          {currentStep < 4 ? (
            // ✅ Explicitly type="button" to prevent form submission
            <button type="button" onClick={nextStep} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">
              Next Step <ArrowRight size={14} className="inline ml-1" />
            </button>
          ) : (
            // ✅ The ONLY submit button. User MUST click this to create the user.
            <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50">
              <CheckCircle size={14} className="inline mr-1" /> {loading ? "Creating..." : "Create Teammate"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
