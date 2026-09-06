'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  PhoneCall,
  Brain,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function CompanyOnboardingWizardPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyId: '',
    name: '',
    legalName: '',
    industry: 'Fintech & Digital Payments',
    website: '',
    description: '',
    country: 'India',
    state: '',
    city: 'Bengaluru',
    businessAddress: '',
    timezone: 'Asia/Kolkata (GMT+5:30)',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',

    // Support & Telephony
    supportPhone: '',
    phoneType: 'PSTN',
    countryCode: '+91',
    businessHours: '24/7 Live Voice AI Operations',
    is24x7Support: true,
    supportedLanguages: ['Hindi', 'English', 'Tamil'],

    plan: 'Growth',
    tagline: 'Autonomous Multilingual Customer Voice Resolution Engine',

    // Company Brain
    aiAgentName: 'CAVI Voice Specialist',
    welcomeMessage: 'Welcome to customer support. How can I assist with your account or order today?',
    tone: 'Empathetic & Professional',
    allowedActions: ['check_status', 'lookup_customer', 'create_ticket'],
    confirmationActions: ['update_customer_details'],
    humanApprovalActions: ['request_refund', 'cancel_subscription'],

    // Initial Knowledge
    initialSopTitle: '',
    initialSopContent: '',

    // Initial Agent
    initialAgentName: '',
    initialAgentEmail: '',
    initialAgentPhone: '',
    initialAgentDepartment: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cid = params.get('companyId');
      if (cid) {
        setFormData((prev) => ({ ...prev, companyId: cid }));
        fetch(`/api/admin/overview?companyId=${cid}`)
          .then((res) => res.json())
          .then((data) => {
            const company = data.selectedCompany;
            if (!company) return;

            setFormData((prev) => ({
              ...prev,
              companyId: company.id,
              name: company.name || '',
              legalName: company.legalName || '',
              industry: company.industry || 'Fintech & Digital Payments',
              website: company.website || '',
              description: company.description || '',
              country: company.country || 'India',
              state: company.state || '',
              city: company.city || 'Bengaluru',
              businessAddress: company.businessAddress || '',
              timezone: company.timezone || 'Asia/Kolkata (GMT+5:30)',
              primaryContactName: company.primaryContactName || '',
              primaryContactEmail: company.primaryContactEmail || '',
              primaryContactPhone: company.primaryContactPhone || '',
              supportPhone: company.supportPhone || '',
              phoneType: company.phoneType || 'PSTN',
              countryCode: company.countryCode || '',
              businessHours: company.businessHours || '24/7 Live Voice AI Operations',
              is24x7Support: company.is24x7Support ?? true,
              supportedLanguages: company.supportedLanguages || ['Hindi', 'English', 'Tamil'],
              plan: company.plan || 'Growth',
              tagline: company.tagline || 'Autonomous Multilingual Customer Voice Resolution Engine',
            }));
          })
          .catch(console.error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Please enter your Brand Name before proceeding to the next step.');
        return false;
      }
      if (!formData.legalName.trim()) {
        setError('Please enter your Legal / Registered Entity Name before proceeding to the next step.');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.supportPhone.trim()) {
        setError('Please enter your Customer Care Phone Number before proceeding to the next step.');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.aiAgentName.trim()) {
        setError('Please enter a Voice AI Assistant Name before proceeding to the next step.');
        return false;
      }
    }

    if (currentStep === 4) {
      if (!formData.initialSopTitle.trim() || !formData.initialSopContent.trim()) {
        setError('Please fill in the Document Title and Knowledge Instructions before proceeding.');
        return false;
      }
    }

    return true;
  };

  const handleGoToStep = (targetStep: number) => {
    if (targetStep > step) {
      for (let s = step; s < targetStep; s++) {
        if (!validateStep(s)) return;
      }
    }
    setError(null);
    setStep(targetStep);
  };

  const handleFinishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/company/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete company onboarding');
      }

      router.push(data.dashboardUrl || `/admin?companyId=${data.company.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onboarding failed');
    } finally {
      setIsLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Company Profile', icon: Building2 },
    { num: 2, label: 'Support & Hotline', icon: PhoneCall },
    { num: 3, label: 'Company Brain & AI', icon: Brain },
    { num: 4, label: 'Policies & Knowledge', icon: ShieldCheck },
    { num: 5, label: 'Invite Support Team', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-100/90 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-blue-600 selection:text-white animate-in fade-in duration-500">
      
      {/* FLOATING CONTAINER CARD WITH THICK BRIGHT WHITE BORDER */}
      <div className="max-w-4xl w-full rounded-[2.5rem] border-[5px] border-white bg-white shadow-2xl overflow-hidden flex flex-col p-6 sm:p-10 my-auto relative">
        
        {/* Subtle Light Blue Shade Gradient Overlay Flowing From Top */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-blue-50/90 via-blue-50/30 to-transparent pointer-events-none" />

        {/* Top Navigation & Title Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Company Onboarding
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              Configure the tenant, customer care number, and Company Brain
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-xs">
              Step {step} of 5
            </span>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
              <span>Exit</span>
            </Link>
          </div>
        </div>

        {/* STEP TABS ON TOP — HIDDEN SCROLLBAR & STEP VALIDATION */}
        <div className="relative z-10 my-6">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full">
            {stepsList.map((s) => {
              const Icon = s.icon;
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => handleGoToStep(s.num)}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-xs font-bold whitespace-nowrap shrink-0 overflow-hidden transition-all duration-300 shadow-xs ${
                    isCurrent
                      ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border border-blue-600/40 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/80'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/80 hover:bg-slate-200/70'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                  )}
                  <span className="whitespace-nowrap leading-none">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="relative z-10 mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 font-medium text-xs shadow-xs animate-in fade-in">
            {error}
          </div>
        )}

        {/* FORM CONTAINER — Auto-submit disabled; submits only via explicit final button click */}
        <form onSubmit={(e) => e.preventDefault()} className="relative z-10 space-y-6 text-xs sm:text-sm">
          
          {/* STEP 1: Basic Company Profile */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900">Basic Company Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">
                    Brand Name <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">
                    Legal / Registered Entity Name <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="legalName"
                    required
                    value={formData.legalName}
                    onChange={handleChange}
                    placeholder="e.g. Acme Payments Private Limited"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-bold text-xs sm:text-sm shadow-xs transition-colors"
                  >
                    <option value="Fintech & Digital Payments">Fintech & Digital Payments</option>
                    <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                    <option value="Telecommunications">Telecommunications & ISP</option>
                    <option value="Healthcare & Insurance">Healthcare & Insurance</option>
                    <option value="SaaS & Cloud Services">SaaS & Cloud Services</option>
                    <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Company Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://company.com"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-mono text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-xs">Company Tagline / Value Proposition</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="e.g. Autonomous Multilingual Customer Support Resolution"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium text-xs sm:text-sm shadow-xs transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="India"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Bengaluru"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Timezone</label>
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    placeholder="Asia/Kolkata (GMT+5:30)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-mono text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Support & Telephony */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <PhoneCall className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900">Support & Telephony Hotline</h2>
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-blue-950 space-y-1">
                <div className="text-xs font-bold flex items-center gap-1.5 text-blue-900">
                  <PhoneCall className="h-4 w-4 text-blue-600" />
                  Dedicated Customer Care Phone Number
                </div>
                <p className="text-xs text-blue-800/90 leading-relaxed">
                  Inbound calls to this number map directly to your isolated Company Brain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">
                    Customer Care Phone Number <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="supportPhone"
                    required
                    value={formData.supportPhone}
                    onChange={handleChange}
                    placeholder="e.g. +91 (800) 555-ACME"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 font-bold font-mono focus:outline-none focus:border-blue-600 text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Telephony Gateway</label>
                  <select
                    name="phoneType"
                    value={formData.phoneType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-bold text-xs sm:text-sm shadow-xs transition-colors"
                  >
                    <option value="PSTN">PSTN Cellular Inbound (Carrier Direct)</option>
                    <option value="SIP">SIP Trunk / PBX Forwarding</option>
                    <option value="Other">Custom Toll-Free Trunk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Business Support Hours</label>
                  <input
                    type="text"
                    name="businessHours"
                    value={formData.businessHours}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Selected Platform Plan</label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-bold text-xs sm:text-sm shadow-xs transition-colors"
                  >
                    <option value="Starter">Starter ($0.20 / min)</option>
                    <option value="Growth">Growth ($0.15 / min)</option>
                    <option value="Enterprise">Enterprise ($0.12 / min)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Company Brain & AI Persona */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Brain className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900">Company Brain & AI Settings</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Voice AI Assistant Name</label>
                  <input
                    type="text"
                    name="aiAgentName"
                    value={formData.aiAgentName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Voice Personality & Tone</label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-bold text-xs sm:text-sm shadow-xs transition-colors"
                  >
                    <option value="Empathetic & Professional">Empathetic & Professional</option>
                    <option value="Authoritative & Calm">Authoritative & Calm</option>
                    <option value="Friendly & Dynamic">Friendly & Dynamic</option>
                    <option value="Concise & Technical">Concise & Technical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-xs">Custom Welcome Greeting</label>
                <textarea
                  rows={2}
                  name="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 focus:outline-none focus:border-blue-600 leading-relaxed font-medium text-xs sm:text-sm shadow-xs transition-colors"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="font-bold text-slate-900 text-xs">AI Action Permission Matrix</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3">
                    <div className="font-bold text-emerald-900">✓ Auto-Allowed</div>
                    <div className="text-slate-600 mt-1">check_status, lookup_customer, create_ticket</div>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3">
                    <div className="font-bold text-amber-900">⚠ Requires Confirmation</div>
                    <div className="text-slate-600 mt-1">update_customer_details</div>
                  </div>
                  <div className="rounded-lg border border-red-200 bg-red-50/80 p-3">
                    <div className="font-bold text-red-900">🛑 Human Approval Required</div>
                    <div className="text-slate-600 mt-1">request_refund, cancel_subscription</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Initial Knowledge & SOPs */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900">Policies & Knowledge Guidelines</h2>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-xs">Policy Document Title</label>
                <input
                  type="text"
                  name="initialSopTitle"
                  value={formData.initialSopTitle}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium text-xs sm:text-sm shadow-xs transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-xs">SOP & Operational Knowledge Instructions</label>
                <textarea
                  rows={4}
                  name="initialSopContent"
                  value={formData.initialSopContent}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-slate-900 focus:outline-none focus:border-blue-600 leading-relaxed font-medium text-xs sm:text-sm shadow-xs transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Invite Initial Support Specialist */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900">Invite First Human Support Specialist</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Officer Name</label>
                  <input
                    type="text"
                    name="initialAgentName"
                    value={formData.initialAgentName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-medium text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Official Work Email</label>
                  <input
                    type="email"
                    name="initialAgentEmail"
                    value={formData.initialAgentEmail}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-mono text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Callback Phone Number</label>
                  <input
                    type="tel"
                    name="initialAgentPhone"
                    value={formData.initialAgentPhone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-mono text-xs sm:text-sm shadow-xs transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">Assigned Department</label>
                  <select
                    name="initialAgentDepartment"
                    value={formData.initialAgentDepartment}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-600 font-bold text-xs sm:text-sm shadow-xs transition-colors"
                  >
                    <option value="Payments & Refunds">Payments & Refunds Specialist</option>
                    <option value="Technical Support">Technical Support Specialist</option>
                    <option value="Account Security">Account Security & KYC Specialist</option>
                    <option value="General Customer Care">General Customer Care</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM STEP NAVIGATION BUTTONS */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-2 rounded-full bg-white text-neutral-950 border border-slate-300 hover:bg-slate-50 font-bold text-xs sm:text-sm px-5 py-2.5 transition-colors shadow-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => handleGoToStep(step + 1)}
                className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md border border-blue-600/40 transition-colors"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={handleFinishOnboarding}
                className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-xs sm:text-sm px-7 py-3 shadow-md border border-blue-600/40 transition-colors disabled:opacity-80"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="h-4 w-4 text-white" />
                )}
                <span>Complete Onboarding & Launch Admin Console →</span>
              </button>
            )}
          </div>

        </form>

      </div>

    </div>
  );
}
