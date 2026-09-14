import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import Reveal from "../components/Reveal.tsx";
import { Button } from "../components/ui/button.tsx";
import { getPeriods, type Period } from "../lib/api.ts";
import { useLanguage, type Strings } from "../lib/i18n.tsx";

function statusBadge(status: Period["status"], c: Strings["common"]) {
  if (status === "ACTIVE")
    return { cls: "bg-[#EDF3EC] text-[#346538]", label: c.active };
  if (status === "UPCOMING")
    return { cls: "bg-[#FBF3DB] text-[#956400]", label: c.upcoming };
  return { cls: "bg-[#F7F6F3] text-[#787774]", label: c.done };
}

export default function Events() {
  const { t } = useLanguage();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPeriods();
      setPeriods(res.periods);
    } catch (e) {
      setPeriods([]);
      setError(e instanceof Error ? e.message : t.events.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [t.events.loadFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-white text-[#2F3437]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 pt-[92px] sm:pt-[104px]">
        <section aria-label={t.events.title} className="py-14 sm:py-20">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#787774]">
                {t.events.eyebrow}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
                {t.events.title}
              </h1>
              <p className="mt-2 max-w-xl text-base text-[#787774]">
                {t.events.sub}
              </p>
            </div>
            {!loading && !error && periods.length > 0 && (
              <span className="font-mono text-xs tabular-nums text-[#787774]">
                {periods.length} {t.arsip.activitiesUnit}
              </span>
            )}
          </Reveal>

          {loading && (
            <div className="grid gap-3 sm:grid-cols-2" aria-label={t.events.loading}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[76px] rounded-xl border border-[#EAEAEA] bg-white"
                >
                  <div className="skeleton h-full w-full rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-[#EAEAEA] bg-white p-8 text-center">
              <p className="text-sm font-medium text-[#111111]">{t.events.loadFailed}</p>
              <p className="mt-1 font-mono text-xs text-[#787774]">{error}</p>
              <div className="mt-5 flex justify-center gap-2">
                <Button type="button" onClick={() => void load()}>
                  {t.events.retry}
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">{t.events.back}</Link>
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && periods.length === 0 && (
            <div className="rounded-xl border border-[#EAEAEA] bg-white p-8 text-center">
              <p className="text-base font-semibold text-[#111111]">{t.events.emptyTitle}</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-[#787774]">
                {t.events.emptySub}
              </p>
              <div className="mt-5 flex justify-center">
                <Button asChild variant="outline">
                  <Link to="/">{t.events.back}</Link>
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && periods.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {periods.map((ev, i) => {
                const badge = statusBadge(ev.status, t.common);
                return (
                  <Reveal key={ev.id} delay={Math.min(i, 7) * 50}>
                    <Link
                      to={`/p/${ev.slug}`}
                      aria-label={`${t.events.openLabel} ${ev.name}`}
                      className="group flex h-full items-center justify-between gap-3 rounded-xl border border-[#EAEAEA] bg-white p-5 transition duration-200 hover:border-[#cccccc] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-[#111111]">
                          {ev.name}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-xs text-[#787774]">
                          /p/{ev.slug}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                        <span
                          aria-hidden
                          className="text-[#787774] transition-transform duration-200 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
