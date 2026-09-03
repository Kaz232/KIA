import { describe, it, expect } from "vitest";
import { ErrorBoundary } from "../src/components/ErrorBoundary";

describe("ErrorBoundary RESOURCE_EXHAUSTED Detection", () => {
  it("detects RESOURCE_EXHAUSTED error correctly in getDerivedStateFromError", () => {
    const quotaError = new Error("429 RESOURCE_EXHAUSTED: Quota exceeded for model gemini-3.7-flash");
    const state = ErrorBoundary.getDerivedStateFromError(quotaError);

    expect(state.hasError).toBe(true);
    expect(state.isQuotaError).toBe(true);
    expect(state.showOverlay).toBe(true);
    expect(state.error).toBe(quotaError);
  });

  it("detects generic non-quota errors without marking as quota error", () => {
    const genericError = new Error("TypeError: Cannot read properties of undefined");
    const state = ErrorBoundary.getDerivedStateFromError(genericError);

    expect(state.hasError).toBe(true);
    expect(state.isQuotaError).toBe(false);
    expect(state.showOverlay).toBe(true);
  });

  it("detects alternate rate limit and quota patterns", () => {
    const rateLimitError = new Error("Rate_Limit_Exceeded: too many requests to gemini endpoint");
    const state = ErrorBoundary.getDerivedStateFromError(rateLimitError);

    expect(state.hasError).toBe(true);
    expect(state.isQuotaError).toBe(true);
  });
});
