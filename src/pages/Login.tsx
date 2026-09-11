import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminLogin, adminMe, ApiUnreachableError } from "../lib/api.ts";
import Reveal from "../components/Reveal.tsx";
import { Button } from "../components/ui/button.tsx";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    adminMe()
      .then(() => alive && nav("/admin", { replace: true }))
      .catch(() => alive && setChecking(false));
    return () => {
      alive = false;
    };
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await adminLogin(email.trim(), password);
      nav("/admin");
    } catch (err) {
      if (err instanceof ApiUnreachableError) {
        toast.error(err.message);
      } else if (err instanceof Error) {
        toast.error(
          err.message === "email atau kata sandi salah"
            ? "Email atau kata sandi salah."
            : err.message,
        );
      } else {
        toast.error("Login gagal, periksa koneksi dan coba lagi.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (checking)
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="size-6 animate-spin text-[#787774]" aria-hidden />
      </div>
    );

  return (
    <div className="bg-white text-[#2F3437]">
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-5 py-16">
        <Reveal>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#787774] transition hover:text-[#111111]"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            Beranda
          </Link>
          <p className="mt-10 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#787774]">
            Administrasi
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#111111]">
            Masuk pengelola.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#787774]">
            Kurasi foto dan kelola acara dari satu tempat.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <form onSubmit={onSubmit} className="mt-10 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block font-mono text-xs text-[#787774]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                placeholder="admin@event.id"
                className="w-full rounded-lg border border-[#EAEAEA] bg-white px-3.5 py-2.5 text-sm text-[#2F3437] outline-none transition placeholder:text-[#787774]/70 focus:border-[#111111]"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block font-mono text-xs text-[#787774]"
              >
                Kata sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#EAEAEA] bg-white px-3.5 py-2.5 pr-11 text-sm text-[#2F3437] outline-none transition placeholder:text-[#787774]/70 focus:border-[#111111]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-[#787774] transition hover:bg-[#F7F6F3] hover:text-[#111111]"
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden />
                  ) : (
                    <Eye className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={busy} size="lg" className="w-full">
              {busy ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Masuk…
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </Reveal>
      </main>
    </div>
  );
}
