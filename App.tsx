import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { AuthState } from './types';
import { Ranking } from './pages/Ranking';
import { AdminPanel } from './pages/Admin';
import { JudgePanel } from './pages/Judge';
import { PrintView } from './pages/PrintView';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Lock, User, LayoutDashboard, FileText, LogOut, AlertTriangle, Settings, CheckCircle2 } from 'lucide-react';

const Router = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
};

// Componente para configuración manual si fallan las env vars
const ConfigScreen = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  const handleSave = () => {
    if (url && key) {
      StorageService.saveCredentials(url, key);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Conexión Pendiente</h1>
            <p className="text-slate-400">
              No se detectaron las variables de entorno de Supabase. Puedes configurarlas manualmente aquí.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded border border-slate-700 text-sm mb-6">
                <p className="text-slate-300 font-semibold mb-2">Instrucciones:</p>
                <ol className="list-decimal list-inside text-slate-400 space-y-1">
                    <li>Ve a tu proyecto en Supabase → Settings → API</li>
                    <li>Copia "Project URL" y pégalo abajo.</li>
                    <li>Copia "anon public key" y pégalo abajo.</li>
                </ol>
            </div>

            <Input 
                label="Supabase Project URL" 
                placeholder="https://xyz.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            <Input 
                label="Supabase Anon Key" 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
            />
            
            <Button onClick={handleSave} fullWidth className="mt-4 gap-2">
                <CheckCircle2 size={20} /> Guardar y Conectar
            </Button>
          </div>
        </div>
      </div>
  );
};

export default function App() {
  const route = Router();
  const [auth, setAuth] = useState<AuthState>({ user: null, isAdmin: false });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('sfe_auth');
    if (storedAuth) {
        setAuth(JSON.parse(storedAuth));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      // Admin Check (Hardcoded for simplicity in this version)
      if (password === 'admin2025') {
          const authData = { user: { name: 'Admin', id: 'admin', password_hash: '' }, isAdmin: true };
          setAuth(authData);
          localStorage.setItem('sfe_auth', JSON.stringify(authData));
          window.location.hash = '#/admin';
          return;
      }

      // Judge Check via Supabase
      const judges = await StorageService.getJudges();
      const judge = judges.find(j => j.name.toLowerCase() === username.toLowerCase() && j.password_hash === password);
      
      if (judge) {
          const authData = { user: judge, isAdmin: false };
          setAuth(authData);
          localStorage.setItem('sfe_auth', JSON.stringify(authData));
          window.location.hash = '#/judge';
      } else {
          setLoginError('Credenciales inválidas');
      }
    } catch (err) {
      setLoginError('Error de conexión con la base de datos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isAdmin: false });
    localStorage.removeItem('sfe_auth');
    setUsername('');
    setPassword('');
    window.location.hash = '#/';
  };

  const handleResetConfig = () => {
      if(confirm('¿Desvincular base de datos?')) {
          StorageService.clearCredentials();
      }
  };

  if (route === '#/print') {
      return <PrintView />;
  }

  // Warning if Supabase is not configured
  if (!StorageService.isConnected()) {
    return <ConfigScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center md:justify-between">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.location.hash='#/'}>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">E</span>
                </div>
                <span className="hidden md:inline">Evaluador <span className="text-blue-400">Feria Ciencias</span></span>
            </div>
            
            <div className="flex items-center gap-4">
                {auth.user ? (
                    <>
                         <span className="text-sm text-slate-400 hidden lg:inline">
                            Conectado como <span className="text-white font-medium">{auth.user.name}</span>
                         </span>
                         {auth.isAdmin && (
                             <Button variant="ghost" onClick={() => window.location.hash = '#/admin'} title="Admin">
                                <LayoutDashboard size={18} />
                             </Button>
                         )}
                         {!auth.isAdmin && (
                            <Button variant="ghost" onClick={() => window.location.hash = '#/judge'} title="Panel Juez">
                                <User size={18} />
                            </Button>
                         )}
                         <Button variant="secondary" onClick={() => window.location.hash = '#/print'} title="Imprimir Reportes">
                             <FileText size={18} className="sm:mr-2" />
                             <span className="hidden sm:inline">Reportes</span>
                         </Button>
                         <Button variant="danger" onClick={handleLogout} className="px-3">
                             <LogOut size={18} />
                         </Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" onClick={() => window.location.hash = '#/ranking'}>
                            Ver Ranking
                        </Button>
                        <button onClick={handleResetConfig} className="text-slate-600 hover:text-red-400 p-2" title="Configurar DB">
                            <Settings size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
      </nav>

      <main className="min-h-[calc(100vh-4rem)]">
        {route === '#/' && !auth.user && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-700">
                <div className="text-center max-w-2xl mb-12">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                        Evalúa. Clasifica. Descubre.
                    </h1>
                    <p className="text-lg text-slate-400">
                        Sistema de evaluación en tiempo real conectado a la nube.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button variant="secondary" onClick={() => window.location.hash='#/ranking'} className="text-lg px-8 py-3">
                            Ver Ranking en Vivo
                        </Button>
                    </div>
                </div>

                <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6 text-center">Ingreso al Sistema</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input 
                            label="Usuario / Nombre Juez" 
                            placeholder="Ingrese su nombre" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            disabled={isLoading}
                        />
                        <Input 
                            label="Contraseña" 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                        <Button type="submit" fullWidth className="mt-2 text-lg py-3" disabled={isLoading}>
                            {isLoading ? 'Conectando...' : 'Ingresar'}
                        </Button>
                    </form>
                    <p className="text-center text-xs text-slate-600 mt-4">
                        Admin: contraseña 'admin2025'
                    </p>
                </div>
            </div>
        )}

        {route === '#/' && auth.user && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-3xl font-bold mb-8">Bienvenido de nuevo, {auth.user.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {auth.isAdmin ? (
                        <Button onClick={() => window.location.hash='#/admin'} className="h-32 text-xl w-64">
                            Panel Admin
                        </Button>
                    ) : (
                        <Button onClick={() => window.location.hash='#/judge'} className="h-32 text-xl w-64">
                            Panel Juez
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => window.location.hash='#/print'} className="h-32 text-xl w-64">
                        Generar PDFs
                    </Button>
                </div>
            </div>
        )}

        {route === '#/admin' && auth.isAdmin && <AdminPanel />}
        {route === '#/judge' && !auth.isAdmin && auth.user && <JudgePanel judge={auth.user as any} />}
        {route === '#/ranking' && <Ranking />}
      </main>
    </div>
  );
}