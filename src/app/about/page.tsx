export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-12 text-slate-800">
      <h1 className="text-3xl font-semibold text-slate-900">About TaxOps</h1>
      <p>
        TaxOps assists CPA firms by automating audit testing and surfacing findings for professional review. It does not issue a legal audit opinion; CPAs remain accountable for conclusions.
      </p>
      <p>
        The platform enforces firm/client/engagement isolation, supports versioned rule packs, and links findings to workpapers and immutable data snapshots.
      </p>
    </div>
  );
}
