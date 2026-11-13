"use client";

import { useCallback, useEffect, useState } from "react";
import { billingService } from "./service";
import type { Invoice } from "./types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; invoices: Invoice[] };

export function usePatientInvoices(patientId: string) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    billingService
      .getPatientInvoices(patientId)
      .then((invoices) => !cancelled && setState({ status: "success", invoices }))
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ status: "error", message: err instanceof Error ? err.message : "Failed to load invoices." });
      });
    return () => {
      cancelled = true;
    };
  }, [patientId, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
