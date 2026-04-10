"use client";

import Link from "next/link";
import { useState } from "react";

// ── Icon components (inline SVG, Heroicon-style) ───────

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function CpuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5M4.5 15.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ── Main Landing Page ──────────────────────────────────

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", facility: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ────────────────────── Navigation ────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-blue-600">CareFlow</span>
            <span className="text-xs font-semibold text-slate-400">AI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">
              How It Works
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">
              Pricing
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">
              Contact
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Sign In
            </Link>
            <a
              href="#contact"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Book a Demo
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <XIcon className="h-6 w-6 text-slate-600" /> : <MenuIcon className="h-6 w-6 text-slate-600" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Pricing</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Contact</a>
              <hr className="border-slate-100" />
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Sign In</Link>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">Book a Demo</a>
            </div>
          </div>
        )}
      </nav>

      {/* ────────────────────── Hero ────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28 lg:pb-36 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Trusted by 40+ Senior Living Communities
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Stop Leaving Revenue{" "}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                on the Table
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
              AI-powered financial intelligence for assisted living operators.
              Detect revenue leakage, automate collections, and gain the visibility
              your finance team has been asking for.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#contact"
                className="w-full rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 sm:w-auto"
              >
                Book a Demo
              </a>
              <a
                href="#features"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
              >
                See How It Works
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </a>
            </div>

            {/* Hero stats */}
            <div className="mx-auto mt-16 grid max-w-xl grid-cols-3 gap-8">
              <div>
                <p className="text-3xl font-bold text-slate-900">$2.4M</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Revenue Recovered</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">68%</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Faster Collections</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">12hrs</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Saved per Week</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── Problem Section ────────────────────── */}
      <section className="bg-white py-20 sm:py-28" id="problems">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">The Problem</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Senior living finance teams are stretched thin
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Most assisted living operators lose 3&ndash;5% of revenue to billing
              gaps they can&apos;t even see. These three problems cost the industry
              billions every year.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Pain point 1 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-red-100 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-100">
                <DollarIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Revenue Leakage</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Care plans change but billing doesn&apos;t update. The gap between
                documented care levels and invoiced rates silently drains revenue
                &mdash; often for months before anyone notices.
              </p>
              <p className="mt-4 text-2xl font-bold text-red-600">$8,400<span className="text-sm font-medium text-red-400">/mo avg</span></p>
              <p className="text-xs text-slate-400">lost per community</p>
            </div>

            {/* Pain point 2 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-amber-100 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100">
                <ClockIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">Manual AR Processes</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Chasing overdue payments with spreadsheets and sticky notes.
                Billing managers spend 12+ hours a week on follow-ups that
                could be automated with intelligent reminders.
              </p>
              <p className="mt-4 text-2xl font-bold text-amber-600">12+ hrs<span className="text-sm font-medium text-amber-400">/week</span></p>
              <p className="text-xs text-slate-400">wasted on manual follow-ups</p>
            </div>

            {/* Pain point 3 */}
            <div className="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-blue-100 hover:shadow-md sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                <ChartIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">No Financial Visibility</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                CFOs and operators are flying blind. Without a unified dashboard,
                spotting occupancy trends, payment patterns, and cost drivers
                across facilities is nearly impossible.
              </p>
              <p className="mt-4 text-2xl font-bold text-blue-600">0<span className="text-sm font-medium text-blue-400"> dashboards</span></p>
              <p className="text-xs text-slate-400">in most senior living EHRs</p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── Solution / Features ────────────────────── */}
      <section className="bg-slate-50 py-20 sm:py-28" id="features">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">The Solution</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              One platform. Complete financial clarity.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              CareFlow AI connects care documentation to billing, automates
              collections, and gives your leadership team real-time visibility.
            </p>
          </div>

          <div className="mt-20 space-y-24">
            {/* Feature 1: Revenue Leakage Detection */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  <DollarIcon className="h-3.5 w-3.5" />
                  Revenue Leakage Detection
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-900">
                  Find every dollar you&apos;re missing
                </h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  CareFlow AI automatically compares care plan assessments against
                  billing records. When a resident&apos;s care level increases but
                  the rate doesn&apos;t follow, you&apos;ll know within hours &mdash; not months.
                </p>
                <ul className="mt-6 space-y-3">
                  {["Real-time care-to-billing mismatch alerts", "Per-resident and per-facility gap analysis", "One-click PDF export for board reports"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                <div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                  <p className="text-xs font-medium text-slate-400">Monthly Leakage</p>
                  <p className="mt-1 text-3xl font-bold text-red-400">$8,400</p>
                  <p className="mt-0.5 text-xs text-red-400/70">across 12 mismatches</p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: "Prairie Meadows", amount: "$3,200", pct: "38%" },
                      { label: "Lakeview MC", amount: "$2,800", pct: "33%" },
                      { label: "Oakwood SR", amount: "$2,400", pct: "29%" },
                    ].map((f) => (
                      <div key={f.label} className="rounded-lg bg-slate-700/50 p-3">
                        <p className="text-xs text-slate-400">{f.label}</p>
                        <p className="text-sm font-semibold text-white">{f.amount}</p>
                        <p className="text-xs text-slate-500">{f.pct}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Automated AR */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                  <div className="space-y-3">
                    {[
                      { days: "7 days", channel: "Email", status: "Delivered", color: "emerald" },
                      { days: "14 days", channel: "SMS", status: "Delivered", color: "emerald" },
                      { days: "30 days", channel: "Phone", status: "Escalated", color: "amber" },
                      { days: "60 days", channel: "Letter", status: "Pending", color: "blue" },
                      { days: "90 days", channel: "Collections", status: "Scheduled", color: "red" },
                    ].map((rule) => (
                      <div key={rule.days} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{rule.days.split(" ")[0]}</span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{rule.days} overdue</p>
                            <p className="text-xs text-slate-500">{rule.channel} reminder</p>
                          </div>
                        </div>
                        <span className={`rounded-full bg-${rule.color}-100 px-2.5 py-0.5 text-xs font-medium text-${rule.color}-700`}>
                          {rule.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Smart AR Automation
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-900">
                  Collections on autopilot
                </h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  Set escalation rules once and let CareFlow handle the rest.
                  Automated reminders via email, SMS, phone, and letter &mdash;
                  with smart timing that respects family relationships.
                </p>
                <ul className="mt-6 space-y-3">
                  {["Multi-channel escalation workflows", "Family-friendly payment portal", "Real-time aging reports and DSO tracking"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3: Executive Dashboard */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  <ChartIcon className="h-3.5 w-3.5" />
                  Executive Dashboard
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-900">
                  The CFO view you&apos;ve been waiting for
                </h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  Occupancy, revenue, collections, food costs &mdash; all in one
                  place. Drill down by facility, time period, or care level.
                  Generate board-ready reports in seconds.
                </p>
                <ul className="mt-6 space-y-3">
                  {["Multi-facility financial overview", "Custom report builder with PDF/CSV export", "Food waste and operational cost tracking"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-6">
                  <p className="text-xs font-medium text-blue-200">Financial Overview</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {[
                      { label: "Monthly Revenue", value: "$847,200", trend: "+4.2%" },
                      { label: "Collection Rate", value: "94.3%", trend: "+2.1%" },
                      { label: "Avg Occupancy", value: "89%", trend: "+1.5%" },
                      { label: "Food Cost/Meal", value: "$8.12", trend: "-3.4%" },
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-lg bg-white/10 p-3">
                        <p className="text-xs text-blue-200">{metric.label}</p>
                        <p className="mt-1 text-lg font-bold text-white">{metric.value}</p>
                        <p className="text-xs text-emerald-300">{metric.trend}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── Social Proof ────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Testimonials</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Trusted by senior living operators
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: "CareFlow found $14,000 in monthly leakage we had no idea existed. It paid for itself in the first week.",
                name: "Sarah Lindberg",
                title: "CFO, Prairie Senior Communities",
                initials: "SL",
              },
              {
                quote: "Our billing team went from 15 hours a week chasing payments to 3. The automated reminders are a game-changer.",
                name: "Michael Thornton",
                title: "Director of Operations, Lakeview Group",
                initials: "MT",
              },
              {
                quote: "Finally, a dashboard that speaks finance, not just clinical. Board meetings are actually productive now.",
                name: "Jennifer Olson",
                title: "CEO, Oakwood Senior Living",
                initials: "JO",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
              >
                <div className="mb-4 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-600">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── How It Works ────────────────────── */}
      <section className="bg-slate-50 py-20 sm:py-28" id="how-it-works">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">How It Works</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Three steps to recovered revenue
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Get up and running in under a day. No IT department required.
            </p>
          </div>

          <div className="relative mt-16">
            {/* Connector line (desktop) */}
            <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-blue-200 via-emerald-200 to-blue-200 lg:block" />

            <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
              {/* Step 1 */}
              <div className="relative text-center">
                <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <UploadIcon className="h-12 w-12 text-blue-600" />
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md">
                    1
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">Upload Your Data</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Import care plans and billing records via CSV. Our smart parser
                  handles multiple EHR export formats automatically.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative text-center">
                <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <CpuIcon className="h-12 w-12 text-emerald-600" />
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-md">
                    2
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">AI Detects Issues</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Our engine cross-references every resident&apos;s care level against
                  their billing rate, flagging mismatches and projecting annual impact.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative text-center">
                <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <CurrencyIcon className="h-12 w-12 text-blue-600" />
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md">
                    3
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">Recover Revenue</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Fix billing gaps with one-click corrections, automate AR
                  follow-ups, and watch your collection rate climb.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── Pricing ────────────────────── */}
      <section className="bg-white py-20 sm:py-28" id="pricing">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Pricing</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Plans that grow with your organization
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              No setup fees. No long-term contracts. Cancel anytime.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {/* Starter */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Starter</h3>
                <p className="mt-1 text-sm text-slate-500">For single-community operators</p>
              </div>
              <div className="mt-6">
                <span className="text-4xl font-bold text-slate-900">$800</span>
                <span className="text-sm text-slate-500">/mo per community</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "Revenue leakage detection",
                  "Basic AR automation (email)",
                  "Executive dashboard",
                  "CSV upload & parsing",
                  "Up to 60 residents",
                  "Email support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="mt-8 block rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Get Started
              </a>
            </div>

            {/* Professional (Featured) */}
            <div className="relative flex flex-col rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-lg">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-md">
                  Most Popular
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Professional</h3>
                <p className="mt-1 text-sm text-slate-500">For multi-community operators</p>
              </div>
              <div className="mt-6">
                <span className="text-4xl font-bold text-slate-900">$1,200</span>
                <span className="text-sm text-slate-500">/mo per community</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "Everything in Starter, plus:",
                  "Multi-channel AR (email, SMS, phone)",
                  "Family communication portal",
                  "Custom report builder",
                  "Food waste tracking",
                  "Up to 150 residents",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="mt-8 block rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Get Started
              </a>
            </div>

            {/* Enterprise */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Enterprise</h3>
                <p className="mt-1 text-sm text-slate-500">For large portfolios &amp; REITs</p>
              </div>
              <div className="mt-6">
                <span className="text-4xl font-bold text-slate-900">Custom</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3">
                {[
                  "Everything in Professional, plus:",
                  "Unlimited communities",
                  "Unlimited residents",
                  "EHR/billing system integrations",
                  "Dedicated account manager",
                  "Custom AI model training",
                  "SSO & advanced security",
                  "SLA & uptime guarantee",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="mt-8 block rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────── Footer / Contact ────────────────────── */}
      <footer className="bg-slate-900" id="contact">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Left: Contact form */}
            <div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to recover your revenue?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Fill out the form and our team will reach out within one business
                day to schedule a personalized demo.
              </p>

              {contactSubmitted ? (
                <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckIcon className="h-7 w-7 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Thank you!</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    We&apos;ve received your message. A member of our team will
                    be in touch within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-10 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-300">
                        Full Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Jane Smith"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-300">
                        Work Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="jane@seniorliving.com"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-facility" className="mb-1.5 block text-sm font-medium text-slate-300">
                      Organization / Facility Name
                    </label>
                    <input
                      id="contact-facility"
                      type="text"
                      value={contactForm.facility}
                      onChange={(e) => setContactForm({ ...contactForm, facility: e.target.value })}
                      placeholder="Sunrise Senior Living"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-300">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Tell us about your communities and what challenges you're facing..."
                      className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl sm:w-auto"
                  >
                    Book a Demo
                  </button>
                </form>
              )}
            </div>

            {/* Right: Company info */}
            <div className="flex flex-col justify-between lg:pl-16">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-400">CareFlow</span>
                  <span className="text-xs font-semibold text-slate-500">AI</span>
                </div>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                  Intelligent financial management for senior living operators.
                  We help assisted living, memory care, and nursing home
                  communities protect their revenue and serve their residents better.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Product</h4>
                  <ul className="mt-4 space-y-2.5">
                    {["Revenue Leakage", "AR Automation", "Executive Dashboard", "Family Portal", "Reports"].map((item) => (
                      <li key={item}>
                        <a href="#features" className="text-sm text-slate-500 transition-colors hover:text-white">{item}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Company</h4>
                  <ul className="mt-4 space-y-2.5">
                    {["About", "Careers", "Blog", "Security", "Privacy Policy"].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">{item}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-12 border-t border-slate-800 pt-8">
                <p className="text-xs text-slate-600">
                  &copy; {new Date().getFullYear()} CareFlow AI. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
