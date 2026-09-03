import React from "react";
import { AlertTriangle, ExternalLink, RefreshCw, Sparkles, CreditCard, ShieldAlert } from "lucide-react";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isQuotaError: boolean;
  showOverlay: boolean;
}

export function checkIfQuotaError(error: Error | null): boolean {
  if (!error) return false;
  const errorStr = (
    (error.message || "") +
    " " +
    (error.name || "") +
    " " +
    (error.stack || "")
  ).toLowerCase();

  return (
    errorStr.includes("resource_exhausted") ||
    errorStr.includes("quota exceeded") ||
    errorStr.includes("rate_limit_exceeded") ||
    errorStr.includes("quota_exceeded") ||
    errorStr.includes("too many requests") ||
    (errorStr.includes("429") && errorStr.includes("quota")) ||
    (errorStr.includes("429") && errorStr.includes("gemini"))
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isQuotaError: false,
      showOverlay: true,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const isQuota = checkIfQuotaError(error);
    return {
      hasError: true,
      error,
      isQuotaError: isQuota,
      showOverlay: true,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    if (checkIfQuotaError(error)) {
      // Dispatch custom event to notify listeners (e.g. AppContext toast)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("gemini-quota-exceeded", {
            detail: {
              message: "Limite de cota de IA atingido (RESOURCE_EXHAUSTED)",
              details:
                error.message ||
                "A cota de requisições da API Gemini foi esgotada. Verifique o plano ou estado de faturação.",
            },
          })
        );
      }
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      isQuotaError: false,
      showOverlay: false,
    });
  };

  public override render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // If it's a Gemini RESOURCE_EXHAUSTED / Quota error
      if (this.state.isQuotaError) {
        return (
          <div
            id="gemini-quota-error-boundary-screen"
            className="min-h-screen bg-[#05070c] text-slate-100 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="max-w-xl w-full bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      RESOURCE_EXHAUSTED (429)
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    Limite de Cota da API Gemini Atingido
                  </h2>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                A aplicação atingiu o limite de requisições do plano gratuito (Free Tier) da Google Gemini API. 
                Para restaurar a capacidade total de geração, consulte o estado da sua faturação ou configure o plano Pay-as-you-go no Google AI Studio.
              </p>

              {this.state.error?.message && (
                <div className="mb-6 p-3 bg-black/50 border border-slate-800 rounded-lg text-xs font-mono text-amber-200/90 break-words max-h-28 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="https://ai.google.dev/gemini-api/docs/rate-limits"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="link-error-boundary-billing"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Verificar Estado de Faturação</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <a
                  href="https://aistudio.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="link-error-boundary-aistudio"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl transition-colors border border-slate-700"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Studio</span>
                </a>

                <button
                  onClick={this.handleReset}
                  id="btn-error-boundary-retry"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-xl transition-colors border border-slate-700 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Tentar Novamente</span>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>GAG Visual Core OS • Sistema de Resiliência de IA</span>
                <button
                  onClick={() => window.location.reload()}
                  className="text-amber-400 hover:underline"
                >
                  Recarregar Aplicação
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Generic error fallback
      return (
        <div
          id="generic-error-boundary-screen"
          className="min-h-screen bg-[#05070c] text-slate-100 flex items-center justify-center p-4 sm:p-6"
        >
          <div className="max-w-lg w-full bg-slate-900/90 border border-rose-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <ShieldAlert className="w-7 h-7" />
              <h2 className="text-lg font-bold text-white">Ocorreu um erro na interface</h2>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              {this.state.error?.message || "Ocorreu um comportamento inesperado na aplicação."}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={this.handleReset}
                id="btn-generic-error-retry"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
