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

export default function CompanyOnboardingWizardPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyId: '',
    name: '',
    legalName: '',
    industry: '',
    website: '',
    description: '',
    country: '',
    state: '',
    city: '',
    businessAddress: '',
    timezone: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',

    // Support & Telephony
    supportPhone: '',
    phoneType: 'PSTN',
    countryCode: '+91',
    businessHours: '',
    is24x7Support: true,
    supportedLanguages: ['Hindi', 'English'],

    plan: 'Growth',
    tagline: '',

    // Company Brain
    aiAgentName: '',
    welcomeMessage: '',
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
    initialAgentDepartment: 'Payments & Refunds',
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
              industry: company.industry || '',
              website: company.website || '',
              description: company.description || '',
              country: company.country || '',
              state: company.state || '',
              city: company.city || '',
              businessAddress: company.businessAddress || '',
              timezone: company.timezone || '',
              primaryContactName: company.primaryContactName || '',
              primaryContactEmail: company.primaryContactEmail || '',
              primaryContactPhone: company.primaryContactPhone || '',
              supportPhone: company.supportPhone || '',
              phoneType: company.phoneType || 'PSTN',
              countryCode: company.countryCode || '',
              businessHours: company.businessHours || '',
              is24x7Support: company.is24x7Support ?? true,
              supportedLanguages: company.supportedLanguages || ['Hindi', 'English'],
              plan: company.plan || 'Growth',
              tagline: company.tagline || '',
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

  const handleFinishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="soft-page flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-3xl soft-card animate-soft-rise p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white font-extrabold">
              E
            </div>
            <div>
              <h1 className="font-display text-2xl text-neutral-950">Company onboarding</h1>
              <p className="text-xs text-neutral-500">Configure the tenant, customer care number, and Company Brain</p>
            </div>
          </div>

          <span className="rounded-full bg-white border border-neutral-200 px-3 py-1 text-xs font-bold text-neutral-600">
            Step {step} of 5
          </span>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-5 gap-2 border-b border-slate-100 pb-4">
          {stepsList.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`flex flex-col items-center p-2 rounded-full text-center transition-all ${
                  isCurrent
                    ? 'bg-[#2563eb] border border-[#2563eb] text-white font-bold'
                    : isCompleted
                    ? 'text-emerald-700 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-600 font-medium text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleFinishOnboarding} className="space-y-6 text-xs">
          {/* STEP 1: Basic Company Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#2563eb]" /> Basic Company Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Legal / Registered Entity Name *</label>
                  <input
                    type="text"
                    name="legalName"
                    required
                    value={formData.legalName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-semibold"
                  >
                    <option value="Fintech & Digital Payments">Fintech & Digital Payments</option>
                    <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                    <option value="Telecommunications">Telecommunications & ISP</option>
                    <option value="Healthcare & Insurance">Healthcare & Insurance</option>
                    <option value="SaaS & Cloud Services">SaaS & Cloud Services</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Tagline / Value Proposition</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Support & Telephony */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="soft-card bg-neutral-50 p-4 space-y-1">
                <div className="text-xs font-bold text-neutral-950 flex items-center gap-1.5">
                  <PhoneCall className="h-4 w-4 text-neutral-950" />
                  Your Company-Owned Dedicated Support Hotline
                </div>
                <p className="text-[11px] text-slate-600">
                  This is the actual phone number your customers will call from their physical mobile phones. When an inbound call reaches EchoSphere, the destination number automatically maps to this company&apos;s isolated brain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Existing Customer Care Hotline *</label>
                  <input
                    type="text"
                    name="supportPhone"
                    required
                    value={formData.supportPhone}
                    onChange={handleChange}
                    placeholder="e.g. +91 (800) 555-ACME"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telephony Gateway Type</label>
                  <select
                    name="phoneType"
                    value={formData.phoneType}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-semibold"
                  >
                    <option value="PSTN">PSTN Cellular Inbound (Carrier Direct)</option>
                    <option value="SIP">SIP Trunk / PBX Forwarding</option>
                    <option value="Other">Custom Toll-Free Trunk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Support Hours</label>
                  <input
                    type="text"
                    name="businessHours"
                    value={formData.businessHours}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selected Platform Plan</label>
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-semibold"
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
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Brain className="h-4 w-4 text-[#2563eb]" /> Isolated Company Brain Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Voice AI Assistant Name</label>
                  <input
                    type="text"
                    name="aiAgentName"
                    value={formData.aiAgentName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Voice Personality & Tone</label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-semibold"
                  >
                    <option value="Empathetic & Professional">Empathetic & Professional</option>
                    <option value="Authoritative & Calm">Authoritative & Calm</option>
                    <option value="Friendly & Dynamic">Friendly & Dynamic</option>
                    <option value="Concise & Technical">Concise & Technical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Custom Welcome Greeting</label>
                <textarea
                  rows={2}
                  name="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] leading-relaxed"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="font-bold text-slate-900 text-xs">AI Policy Boundary Rules</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="rounded border border-emerald-200 bg-emerald-50/70 p-2.5">
                    <div className="font-bold text-emerald-900">✓ Auto-Allowed</div>
                    <div className="text-slate-600 mt-1">check_transaction, lookup_customer, create_ticket</div>
                  </div>
                  <div className="rounded border border-amber-200 bg-amber-50/70 p-2.5">
                    <div className="font-bold text-amber-900">⚠ Requires Confirmation</div>
                    <div className="text-slate-600 mt-1">update_customer_details, change_address</div>
                  </div>
                  <div className="rounded border border-red-200 bg-red-50/70 p-2.5">
                    <div className="font-bold text-red-900">🛑 Human Approval Required</div>
                    <div className="text-slate-600 mt-1">request_refund, unfreeze_account</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Initial Knowledge & SOPs */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#2563eb]" /> Initial SOPs & Refund Policies
              </h3>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document / Policy Title</label>
                <input
                  type="text"
                  name="initialSopTitle"
                  value={formData.initialSopTitle}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Knowledge & Policy Instructions for Voice AI</label>
                <textarea
                  rows={4}
                  name="initialSopContent"
                  value={formData.initialSopContent}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Invite Initial Support Specialist */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#2563eb]" /> Invite Your First Human Support Specialist
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Officer Name</label>
                  <input
                    type="text"
                    name="initialAgentName"
                    value={formData.initialAgentName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Work Email</label>
                  <input
                    type="email"
                    name="initialAgentEmail"
                    value={formData.initialAgentEmail}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Outbound Calling Phone Number</label>
                  <input
                    type="tel"
                    name="initialAgentPhone"
                    value={formData.initialAgentPhone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Department</label>
                  <select
                    name="initialAgentDepartment"
                    value={formData.initialAgentDepartment}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-semibold"
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

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="soft-action-secondary px-4 py-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous Step
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="soft-action px-6 py-2.5"
              >
                Continue to Step {step + 1} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="soft-action px-7 py-3 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Complete Onboarding & Launch Admin Console →
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
