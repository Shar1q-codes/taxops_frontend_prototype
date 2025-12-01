export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-12 text-slate-800">
      <h1 className="text-3xl font-semibold text-slate-900">Pricing</h1>
      <p>Pricing is tailored by firm size, number of engagements, and storage. Contact us to request access and a deployment plan.</p>
      <ul className="list-disc space-y-2 pl-5 text-slate-700">
        <li>Firm-level tenancy with secure S3 storage and Postgres.</li>
        <li>Per-engagement pricing with volume discounts.</li>
        <li>Optionally include ML anomaly pack and LLM narratives.</li>
      </ul>
    </div>
  );
}
