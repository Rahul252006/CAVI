'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CompanySignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    jobTitle: '',
    companyName: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create Company Admin account');
      }

      localStorage.setItem('echosphere_admin_id', data.admin.adminId);
      localStorage.setItem('echosphere_company_id', data.company.id);

      router.push(data.nextStepUrl || `/company/onboard?companyId=${data.company.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="soft-page p-5">
      <div className="soft-shell flex min-h-screen items-center py-10">
        <div className="grid w-full overflow-hidden soft-card animate-soft-rise lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="border-b border-neutral-200 bg-white p-8 lg:border-b-0 lg:border-r">
            <Link href="/admin/login?intent=onboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-blue-600">
              <ArrowLeft className="h-4 w-4" />
              Back to owner sign in
            </Link>

            <div className="mt-14 max-w-sm">
              <p className="soft-kicker">Step 1 of onboarding</p>
              <h1 className="mt-4 font-display text-5xl leading-tight text-neutral-950">
                Create the company owner account first.
              </h1>
              <p className="mt-5 text-base leading-7 text-neutral-500">
                This account becomes the admin owner for your CAVI tenant. After this, you will configure the company profile, support hotline, Company Brain, policies, and team.
              </p>
            </div>

            <div className="mt-10 space-y-3 text-sm text-neutral-500">
              {['Owner verified before setup', 'Company data stays tenant-isolated', 'Support operations stay behind login'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-neutral-950" />
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <main className="bg-[#fbfbfa] p-8 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white">
                  <Building2 className="h-5 w-5 text-neutral-950" />
                </div>
                <h2 className="mt-5 font-display text-3xl leading-tight text-neutral-950">
                  Owner details
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                  Use a real work email. This person controls company settings, officers, billing, and AI action permissions.
                </p>
              </div>
              <Link href="/admin/login" className="hidden text-sm font-semibold text-neutral-950 underline underline-offset-4 sm:block">
                Already have access
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="soft-label">First name</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} placeholder="Vikram" className="soft-field" />
                </div>
                <div>
                  <label className="soft-label">Last name</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} placeholder="Malhotra" className="soft-field" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="soft-label">Company name</label>
                  <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} placeholder="Acme Payments Corp" className="soft-field" />
                </div>
                <div>
                  <label className="soft-label">Role</label>
                  <input type="text" name="jobTitle" required value={formData.jobTitle} onChange={handleChange} placeholder="VP Customer Support" className="soft-field" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="soft-label">Work email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="vikram@company.com" className="soft-field font-mono" />
                </div>
                <div>
                  <label className="soft-label">Mobile number</label>
                  <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} placeholder="+91 98765 43210" className="soft-field font-mono" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="soft-label">Password</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" className="soft-field" />
                </div>
                <div>
                  <label className="soft-label">Confirm password</label>
                  <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="soft-field" />
                </div>
              </div>

              <div className="soft-card flex items-start gap-3 bg-white p-4 text-sm leading-6 text-neutral-500">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neutral-950" />
                <span>
                  You are creating the <span className="font-semibold text-neutral-950">company owner/admin account</span>. The actual company onboarding form appears after this account is verified.
                </span>
              </div>

              <button type="submit" disabled={isLoading} className="soft-action h-12 w-full disabled:opacity-50">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                Create owner account and continue
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
