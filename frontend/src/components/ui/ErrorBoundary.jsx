import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="h-16 w-16 mx-auto bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-white">
                Ocurrió un problema en la interfaz
              </h1>
              <p className="text-sm text-slate-300 mt-2">
                ReservaUPLA encontró un error inesperado al renderizar la vista.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-red-900/50 text-left font-mono text-xs text-red-300 max-h-48 overflow-auto">
                <p className="font-bold text-red-400 mb-1">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[11px] text-slate-400 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer shadow-md transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Recargar Página</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-sm cursor-pointer transition-all"
              >
                <span>Restablecer y Volver al Login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
