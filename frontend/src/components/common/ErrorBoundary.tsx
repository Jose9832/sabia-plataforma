import React from 'react';

interface Props {
  children: React.ReactNode;
  onReset: () => void;
}

interface State {
  error: Error | null;
}

/**
 * Si una pantalla falla al dibujarse, React desmonta toda la app y la página queda en blanco
 * (se "cierra"). Este límite atrapa el error y muestra una salida clara sin perder la sesión.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error al mostrar la pantalla:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="max-w-xl mx-auto my-16 px-6 py-8 rounded-3xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] shadow-sm text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl text-[#06233B] dark:text-white">Algo no salió bien en esta pantalla</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Tu sesión y tus datos siguen guardados. Vuelve al inicio para continuar; si el problema se repite, recarga la página.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => { this.setState({ error: null }); this.props.onReset(); }}
            className="px-6 py-2.5 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs"
          >
            Volver al inicio
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-full border border-slate-300 dark:border-[#1E3E54] text-[#06233B] dark:text-white font-bold text-xs"
          >
            Recargar la página
          </button>
        </div>
      </div>
    );
  }
}
