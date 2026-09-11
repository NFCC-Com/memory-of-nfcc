import { useEffect, useState } from "react";
import { getPeriods, type Period } from "./api.ts";

let eventsCache: Period[] | null = null;
let eventsPromise: Promise<Period[]> | null = null;

function fetchEventsShared(): Promise<Period[]> {
  if (eventsCache) return Promise.resolve(eventsCache);
  if (!eventsPromise) {
    eventsPromise = getPeriods()
      .then((res) => {
        eventsCache = res.periods;
        return eventsCache;
      })
      .catch(() => {
        eventsPromise = null;
        return [];
      });
  }
  return eventsPromise;
}

export function useEvents(): Period[] {
  const [events, setEvents] = useState<Period[]>(eventsCache ?? []);
  useEffect(() => {
    let alive = true;
    fetchEventsShared().then((list) => {
      if (alive) setEvents(list);
    });
    return () => {
      alive = false;
    };
  }, []);
  return events;
}
