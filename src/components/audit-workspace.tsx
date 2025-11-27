/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useMemo, useRef, useState, type DragEvent } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Loader2, UploadCloud, ShieldCheck, FileText, CheckCircle2, AlertCircle, LogOut } from "lucide-react";

import { auth, googleProvider, firebaseReady } from "@/lib/firebase";
import { AuditFinding, AuditResponse, uploadDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Status = "idle" | "uploading" | "processing" | "complete" | "error";

function AuditWorkspaceInner({ activeAuth }: { activeAuth: import("firebase/auth").Auth }) {
  const [user, loadingAuth, authError] = useAuthState(activeAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [docType, setDocType] = useState<string>("");
  const [taxYear, setTaxYear] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const progressValue = useMemo(() => {
    switch (status) {
      case "idle":
        return 5;
      case "uploading":
        return 25;
      case "processing":
        return 60;
      case "complete":
        return 100;
      case "error":
        return 15;
      default:
        return 5;
    }
  }, [status]);

  const handleFileChange = (f: File | null) => {
    setFile(f);
    setResult(null);
    setStatus("idle");
    setMessage(f ? `${f.name} ready to upload.` : "");
  };

  const onDrop = (evt: DragEvent<HTMLLabelElement>) => {
    evt.preventDefault();
    setDragActive(false);
    const f = evt.dataTransfer.files?.[0];
    if (f) {
      handleFileChange(f);
    }
  };

  const onSubmit = useCallback(async () => {
    if (!file || !user) {
      setMessage("Please choose a file and sign in.");
      setStatus("error");
      return;
    }
    try {
      setStatus("uploading");
      setMessage("Uploading file securely...");
      const parsedYear = taxYear ? Number(taxYear) : undefined;
      const response = await uploadDocument(file, user, docType || undefined, parsedYear);
      setStatus("complete");
      setResult(response);
      setMessage("Audit complete.");
    } catch (err: unknown) {
      setStatus("error");
      const message = err instanceof Error ? err.message : "Upload failed.";
      setMessage(message);
    }
  }, [docType, file, user, taxYear]);

  const handleEmailLogin = async (mode: "signin" | "signup") => {
    if (!email || !password) {
      setMessage("Email and password are required.");
      setStatus("error");
      return;
    }
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(activeAuth, email, password);
        setMessage("Signed in.");
      } else {
        await createUserWithEmailAndPassword(activeAuth, email, password);
        setMessage("Account created and signed in.");
      }
      setStatus("idle");
    } catch (err: unknown) {
      setStatus("error");
      const message = err instanceof Error ? err.message : "Auth error";
      setMessage(message);
    }
  };

  const severityTone = (finding: AuditFinding) => {
    const level = (finding.severity || finding.category || "").toLowerCase();
    if (level.includes("high") || level.includes("critical")) return "danger";
    if (level.includes("med") || level.includes("risk")) return "warning";
    if (level.includes("low") || level.includes("info")) return "default";
    return "default";
  };

  const renderFindings = (title: string, findings?: AuditFinding[]) => {
    if (!findings?.length) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{findings.length} findings</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {findings.map((f, idx) => (
            <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">{f.title || f.code || "Finding"}</span>
                  {f.description && <p className="text-sm text-slate-600">{f.description}</p>}
                </div>
                <Badge variant={severityTone(f)}>{(f.severity || f.category || "info").toUpperCase()}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                {f.code && <span className="rounded bg-white px-2 py-1">Code: {f.code}</span>}
                {typeof f.confidence === "number" && <span className="rounded bg-white px-2 py-1">Confidence: {(f.confidence * 100).toFixed(1)}%</span>}
                {f.category && <span className="rounded bg-white px-2 py-1">Category: {f.category}</span>}
                {f.source && <span className="rounded bg-white px-2 py-1">Source: {f.source}</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const SummaryHeader = () => (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Corallo TaxOps</p>
          <h1 className="text-2xl font-semibold text-slate-900">AI Audit Desk for CPAs</h1>
        </div>
      </div>
      <p className="text-sm text-slate-600">
        Securely upload W-2 PDFs, JSON exports, or scanned images. We parse, run deterministic rules, call the Auditor model (remote optional), and return a merged audit report ready for CPA review.
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge>HIPAA-safe prototype</Badge>
        <Badge variant="success">No file retention</Badge>
        <Badge variant="warning">Auth required</Badge>
      </div>
    </div>
  );

  if (loadingAuth) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SummaryHeader />

      {!user ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Sign in with Email</CardTitle>
              <CardDescription>Auth is required before uploading any documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cpa@firm.com" />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={() => handleEmailLogin("signin")}>
                  Sign In
                </Button>
                <Button type="button" variant="outline" onClick={() => handleEmailLogin("signup")}>
                  Create Account
                </Button>
              </div>
              {authError && <p className="text-sm text-rose-600">{authError.message}</p>}
              {message && status !== "error" && <p className="text-sm text-slate-600">{message}</p>}
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Or continue with Google</CardTitle>
              <CardDescription>Use your firm-managed Google Workspace account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                className="w-full justify-center gap-2"
                variant="outline"
                onClick={() => signInWithPopup(activeAuth, googleProvider)}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                Sign in with Google
              </Button>
              {message && status !== "error" && <p className="mt-3 text-sm text-slate-600">{message}</p>}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Upload & Audit</CardTitle>
                <CardDescription>Signed in as {user.email || user.uid}</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setMessage("")} className="hidden md:inline-flex">
                  Reset
                </Button>
                <Button variant="ghost" onClick={() => signOut(activeAuth)} className="gap-2 text-slate-600">
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <Label className="mb-2 block">Document type (optional)</Label>
                <Input value={docType} onChange={(e) => setDocType(e.target.value)} placeholder="e.g., W2, 1099-INT" className="mb-4" />
                <Label className="mb-2 block">Tax year (optional)</Label>
                <Input
                  value={taxYear}
                  onChange={(e) => setTaxYear(e.target.value)}
                  placeholder="e.g., 2024"
                  className="mb-4"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all",
                    dragActive ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-slate-50/80"
                  )}
                >
                  <UploadCloud className="h-8 w-8 text-slate-500" />
                  <p className="mt-3 text-sm font-medium text-slate-800">Drag & drop or click to upload</p>
                  <p className="text-xs text-slate-500">PDF, JSON, PNG, JPG. Files are held in memory only during processing.</p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.json,.png,.jpg,.jpeg,.tiff,.bmp"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  />
                </label>
                {file && (
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-3 text-sm shadow-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <FileText className="h-4 w-4 text-sky-600" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Badge>{file.type || "uploaded"}</Badge>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-3">
                  <Button onClick={onSubmit} disabled={!file || status === "uploading" || status === "processing"}>
                    {status === "uploading" || status === "processing" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      "Run audit"
                    )}
                  </Button>
                  {status === "complete" && <Badge variant="success" className="gap-1"><CheckCircle2 className="h-4 w-4" /> Done</Badge>}
                  {status === "error" && <Badge variant="danger" className="gap-1"><AlertCircle className="h-4 w-4" /> Error</Badge>}
                </div>
                <div className="mt-4 space-y-2">
                  <Progress value={progressValue} />
                  <p className="text-xs text-slate-500">{message || "Ready for upload. Authenticated requests only."}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-50">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      Security snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-200">
                    <p>• Firebase JWT is attached to every request.</p>
                    <p>• Files are processed in memory; no disk persistence.</p>
                    <p>• Backend CORS is limited to your deployed origin.</p>
                    <p>• No logs capture document contents.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Audit timeline</CardTitle>
                    <CardDescription>What happens after you click &ldquo;Run audit&rdquo;.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-600">
                    <p>1. Upload hits Render FastAPI with Firebase JWT validation.</p>
                    <p>2. PDF/image is parsed to JSON using in-memory OCR/extraction.</p>
                    <p>3. Deterministic rules run + optional remote LLM call.</p>
                    <p>4. Findings are merged and returned to your browser.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {result && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Result snapshot</CardTitle>
                  <CardDescription>
                    Doc ID: {result.doc_id || "unknown"} · Duration: {result.processing_time_ms} ms · LLM mode:{" "}
                    {result.audit_trail?.llm_mode || (result.audit_trail?.llm_skipped ? "SKIPPED" : "REMOTE")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm text-slate-600">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Rule findings: {result.rule_findings.length}</Badge>
                    <Badge variant="default">LLM findings: {result.llm_findings.length}</Badge>
                    <Badge variant="success">Merged findings: {result.merged_findings.length}</Badge>
                  </div>
                  {result.audit_trail?.retrieval_sources?.length ? (
                    <div className="text-xs text-slate-500">
                      Retrieval sources:{" "}
                      {result.audit_trail.retrieval_sources
                        .map((s) => {
                          const source = s as { title?: string; id?: string };
                          return source.title || source.id || "source";
                        })
                        .join(", ")}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
              {renderFindings("Merged findings (prioritized)", result.merged_findings)}
              {renderFindings("Rule-based findings", result.rule_findings)}
              {renderFindings("LLM findings", result.llm_findings)}
            </div>
          )}

          {status === "error" && (
            <Card className="border-rose-100 bg-rose-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-rose-700">{message || "Something went wrong."}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export function AuditWorkspace() {
  const activeAuth = auth;
  if (!firebaseReady || !activeAuth) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-sm">
        <p className="text-sm font-semibold">Firebase configuration missing.</p>
        <p className="text-sm">Set NEXT_PUBLIC_FIREBASE_* keys in your environment and redeploy.</p>
      </div>
    );
  }
  return <AuditWorkspaceInner activeAuth={activeAuth} />;
}
