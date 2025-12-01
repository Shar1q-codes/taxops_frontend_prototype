"use client";

import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-1/3 flex-col justify-center bg-slate-900 px-10 text-slate-50 lg:flex">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-slate-300">TaxOps</p>
          <h1 className="text-3xl font-semibold">Assistive audit automation for CPA firms</h1>
          <p className="text-sm text-slate-200">Automated tests and findings for CPA review. No legal audit opinion is issued by the platform.</p>
          <div className="text-xs text-slate-200/80">
            <p>Multi-tenant isolation by firm_id</p>
            <p>Rule packs per module, versioned</p>
            <p>Workpapers and findings linked to data snapshots</p>
          </div>
        </div>
      </aside>
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
            <Link href="/" className="font-semibold text-slate-900 hover:underline">
              TaxOps
            </Link>
            <span>CPA assist · Not an audit opinion</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
