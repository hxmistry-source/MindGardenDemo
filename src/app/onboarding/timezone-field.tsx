"use client";

import { useEffect, useState } from "react";

export default function TimezoneField() {
  const [timezone, setTimezone] = useState("UTC");

  useEffect(() => {
    try {
      const resolvedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (resolvedTimezone) {
        setTimezone(resolvedTimezone);
      }
    } catch {
      // Keep UTC fallback if the browser does not support timezone detection.
    }
  }, []);

  return (
    <div className="mt-3 text-sm text-ink/60">
      <input type="hidden" name="timezone" value={timezone} />
      We’ll use your local timezone: <span className="font-semibold text-ink">{timezone}</span>
    </div>
  );
}
