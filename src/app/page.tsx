import dynamic from "next/dynamic";

const AuditWorkspace = dynamic(() => import("@/components/audit-workspace").then((m) => m.AuditWorkspace), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center text-slate-600">Loading dashboard…</div>
  ),
});

export default function Home() {
  return (
    <div className="bg-slate-50/80">
      <main className="px-4 py-12 sm:px-8">
        <AuditWorkspace />
      </main>
    </div>
  );
}
