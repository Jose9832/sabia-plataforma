import React, { useEffect, useState } from 'react';
import { useAluna } from '../context/AlunaContext';
import { DEMO_USERS } from '../data/mockData';
import { 
  LogIn, 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Lock, 
  Mail, 
  ArrowRight,
  Info
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { 
    users, 
    currentUser, 
    switchUser, 
    loginWithEmail, 
    setActiveScreen, 
    demoModeEnabled,
    enterAsVisitor
  } = useAluna();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [enviando, setEnviando] = useState(false);
  const [lento, setLento] = useState(false);

  // El servidor gratuito puede tardar en despertar: se avisa en vez de dejar la pantalla quieta
  useEffect(() => {
    if (!enviando) { setLento(false); return; }
    const t = setTimeout(() => setLento(true), 4000);
    return () => clearTimeout(t);
  }, [enviando]);

  // POST /api/v1/auth/login · la contraseña se verifica con bcrypt en el servidor
  const handleFormalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg('Ingresa tu correo electrónico y tu contraseña.');
      return;
    }
    setEnviando(true);
    const ok = await loginWithEmail(email, password);
    setEnviando(false);
    if (!ok) {
      setErrorMsg('No pudimos iniciar sesión. Verifica tu correo y contraseña, o crea una cuenta nueva.');
      return;
    }
    setActiveScreen('dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-[#005A8D] dark:text-aluna-cyan">
          Autenticación y Control de Acceso · ALUNA IA (SABIA)
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">
          Iniciar Sesión en la Plataforma
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          El acceso a los saberes, al asistente <strong>Ceiba</strong> y a las bandejas de custodia depende estrictamente de tu identidad autenticada y de tus membresías territoriales verificadas.
        </p>
      </div>

      <div className={`grid grid-cols-1 ${demoModeEnabled ? 'lg:grid-cols-12' : 'max-w-md mx-auto'} gap-8 items-start`}>
        
        {/* Left Column (5 cols): Formal Production Login Form */}
        <div className={`${demoModeEnabled ? 'lg:col-span-5' : ''} bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-6`}>
          <div className="space-y-1 border-b border-slate-200 dark:border-[#1E3E54] pb-4">
            <div className="flex items-center gap-2 text-[#004B87] dark:text-aluna-cyan font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Acceso Formal con Credenciales</span>
            </div>
            <h2 className="font-serif font-bold text-xl text-[#06233B] dark:text-white">
              Cuenta Institucional o Comunitaria
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conectado a <code className="font-mono">POST /api/v1/auth/login</code>.
            </p>
          </div>

          <form onSubmit={handleFormalLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="font-bold text-[#06233B] dark:text-slate-200 block">
                Correo electrónico:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="font-bold text-[#06233B] dark:text-slate-200 block">
                Contraseña:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
                />
              </div>
            </div>

            {errorMsg && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 font-medium text-xs">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3 px-5 rounded-full bg-[#004B87] hover:bg-[#003865] disabled:opacity-60 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{enviando ? 'Verificando credenciales…' : 'Ingresar con correo'}</span>
            </button>
            {lento && (
              <p role="status" className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                El servidor se está activando (puede tardar hasta un minuto la primera vez). No cierres la página.
              </p>
            )}
            {demoModeEnabled && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Cuentas demo: usa el correo de cualquier perfil de la derecha con la contraseña <code className="font-mono font-bold text-[#004B87] dark:text-aluna-cyan">aluna2026</code>.
              </p>
            )}
          </form>

          {/* ¿Primera vez? Crear cuenta o entrar como visitante (sin perfil) */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#1E3E54] space-y-3 text-xs">
            <p className="font-bold text-[#06233B] dark:text-white">¿Es tu primera vez en ALUNA?</p>
            <button
              type="button"
              onClick={() => setActiveScreen('register')}
              className="w-full py-3 px-5 rounded-full border-2 border-[#004B87] dark:border-aluna-cyan text-[#004B87] dark:text-aluna-cyan font-bold hover:bg-sky-50 dark:hover:bg-[#132C3E] transition-colors inline-flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear una cuenta</span>
            </button>
            <button
              type="button"
              onClick={enterAsVisitor}
              className="w-full py-3 px-5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#132C3E] dark:hover:bg-[#193A50] text-[#06233B] dark:text-white font-bold transition-colors inline-flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Continuar como visitante (sin cuenta)</span>
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Como visitante puedes consultar los saberes que las comunidades compartieron en público. Para solicitar accesos, aportar o usar Ceiba necesitas una cuenta.
            </p>
          </div>

          {/* Cuentas de prueba del equipo evaluador: plegadas, no se muestran todos los perfiles de una vez */}
          {!demoModeEnabled && (
            <details className="pt-3 border-t border-slate-200 dark:border-[#1E3E54] text-[11px] text-slate-600 dark:text-slate-300">
              <summary className="cursor-pointer font-bold text-[#004B87] dark:text-aluna-cyan">¿Eres del equipo evaluador? Ver cuentas de prueba</summary>
              <p className="mt-2 leading-relaxed">Toca un correo para usarlo. Contraseña de todas: <code className="font-mono font-bold">aluna2026</code></p>
              <ul className="mt-2 space-y-1">
                {DEMO_USERS.map(u => (
                  <li key={u.id}>
                    <button type="button" onClick={() => setEmail(u.email)} className="text-left hover:underline">
                      <strong className="text-[#06233B] dark:text-white">{u.roleLabel}</strong> · {u.email}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        {/* Right Column (7 cols): Demo Mode Quick Profile Selector (Separado de producción) */}
        {demoModeEnabled && (
          <div className="lg:col-span-7 bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1E3E54] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-bold uppercase tracking-wider">
                  <Info className="w-3 h-3" />
                  <span>Entorno de demostración · Datos y perfiles ficticios</span>
                </div>
                <h2 className="font-serif font-bold text-xl text-[#06233B] dark:text-white pt-1">
                  Cambio Rápido de Perfil para Sustentación
                </h2>
              </div>
              <Users className="w-5 h-5 text-[#004B87] dark:text-aluna-cyan" />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Selecciona cualquiera de los <strong>6 perfiles preconfigurados</strong> para ingresar inmediatamente y comprobar el aislamiento de permisos entre comunidades, la consulta en <strong>Ceiba</strong> y la revisión de custodia. *(También puedes cambiar de perfil en cualquier momento desde el menú de usuario en la esquina superior derecha).*
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                const isCustodian = u.affiliations.some(a => a.role === 'custodian' && a.status === 'verified');
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      switchUser(u.id);
                      setActiveScreen('dashboard');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-colors flex items-start gap-3.5 ${
                      isCurrent
                        ? 'bg-sky-50 dark:bg-[#132C3E] border-[#004B87] dark:border-aluna-cyan shadow-sm'
                        : 'bg-slate-50 dark:bg-[#0A1924] border-slate-200 dark:border-[#1E3E54] hover:border-[#004B87]/60'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#004B87]/40 dark:border-aluna-cyan/50 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-sm text-[#06233B] dark:text-white">
                          {u.name}
                        </h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#004B87] text-white">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-[#005A8D] dark:text-aluna-cyan">
                        {u.roleLabel}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {u.bio}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-mono truncate">{u.email}</span>
                        <span className="font-bold text-[#004B87] dark:text-[#F5B82E] inline-flex items-center gap-0.5 shrink-0">
                          {isCustodian && <ShieldCheck className="w-3 h-3" />}
                          <span>Entrar</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
