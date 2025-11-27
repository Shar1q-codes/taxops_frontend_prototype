import { AuditWorkspace } from "@/components/audit-workspace";

export default function Home() {
  return (
    <div className="bg-slate-50/80">
      <main className="px-4 py-12 sm:px-8">
        <AuditWorkspace />
      </main>
    </div>
  );
}
