import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Un componente simple para atrapar errores y evitar la "pantalla negra de la muerte"
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error crítico en la aplicación:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center text-center">
          <div className="bg-red-900/20 border border-red-500 rounded-xl p-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Algo salió mal 😔</h1>
            <p className="mb-4 text-slate-300">La aplicación ha encontrado un error inesperado.</p>
            <div className="bg-black/50 p-4 rounded text-left font-mono text-sm text-red-300 overflow-auto mb-6 max-h-40">
              {this.state.error?.message || 'Error desconocido'}
            </div>
            <button 
              onClick={() => {
                localStorage.clear(); 
                window.location.reload();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Borrar caché y Reiniciar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);