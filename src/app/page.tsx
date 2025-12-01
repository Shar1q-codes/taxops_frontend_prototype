import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-16 pt-14 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <ShieldCheck className="h-5 w-5 text-slate-800" />
          <span>TaxOps · AI-powered audit automation for CPA firms</span>
        </div>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
          Assist your audit teams with automated testing, findings, and workpapers — never a legal audit opinion.
        </h1>
        <p className="max-w-2xl text-lg text-slate-700">
          TaxOps runs deterministic audit rules and anomaly detection over client uploads, producing findings for CPAs to review, resolve, and sign off.
          Built for multi-tenant firms with firm/client/engagement isolation.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-400"
          >
            Request access
          </Link>
        </div>
      </header>

      <main className="space-y-16 bg-white pb-20">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
            <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Upload", desc: "TB, GL, payroll, bank, and supporting docs via S3 presigned flows." },
                { title: "Normalize", desc: "Parse to canonical accounting model for consistent rule packs." },
                { title: "Run rules", desc: "Deterministic audit packs + ML anomaly layer produce findings." },
                { title: "Review & sign off", desc: "CPAs resolve findings, attach workpapers, and export reports." },
              ].map((step) => (
                <div key={step.title} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {step.title}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase text-slate-500">Audit modules</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Built for CPA workflows</h3>
              <p className="mt-2 text-sm text-slate-700">
                Income, Expenses, Bank & Cash, Assets, Liabilities, Payroll, Inventory, Compliance, Tax Forms. Each module has versioned rule packs
                with evidence links for CPA review.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-800 sm:grid-cols-3">
                {["Income", "Expenses", "Bank & Cash", "Payroll", "Inventory", "Tax Forms"].map((m) => (
                  <span key={m} className="rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-50 shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-300" />
                <div>
                  <p className="text-sm uppercase text-slate-200">Why CPAs use TaxOps</p>
                  <h3 className="text-xl font-semibold text-white">Assistive, not opinionated</h3>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-100">
                <li>Automated tests surface exceptions for CPA review; no audit opinion is issued.</li>
                <li>Multi-tenant isolation: firm_id scoped calls, client/engagement boundaries, least-privilege access.</li>
                <li>Workpapers, findings, and reports stay linked to immutable data snapshots.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
