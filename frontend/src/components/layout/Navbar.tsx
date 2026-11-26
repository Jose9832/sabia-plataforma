import React, { useState, useRef, useEffect } from 'react';
import { useAluna } from '../../context/AlunaContext';
import { MODULO_BIENESTAR_VISIBLE } from '../../config/funciones';
import { accessService } from '../../services/accessService';
import { 
  Home, 
  Compass, 
  BookOpen, 
  UploadCloud, 
  Bot, 
  ShieldCheck, 
  HeartHandshake, 
  Sun, 
  Moon, 
  Menu, 
  X,
  UserCheck,
  ChevronDown,
  Building,
  KeyRound,
  FileCheck2,
  LogIn,
  RotateCcw,
  Users
} from 'lucide-react';
import { ActiveScreen } from '../../types';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    users,
    switchUser,
    resetDemoData,
    activeScreen, 
    setActiveScreen, 
    themeMode, 
    toggleTheme,
    accessRequests,
    affiliationRequests,
    knowledgeItems,
    aiArtifacts,
    demoModeEnabled,
    isOnline,
    isAuthenticated,
    pendingSyncCount,
    logout
  } = useAluna();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // P0.2: Strictly scoped custodian pending count via centralized accessService
  const isCustodianOfAny = currentUser.affiliations.some(a => a.status === 'verified' && a.role === 'custodian');

  const pendingApprovalsCount = isCustodianOfAny 
    ? accessService.listPendingAccessRequestsForCustodian(currentUser, accessRequests).length +
      accessService.listPendingAffiliationsForCustodian(currentUser, affiliationRequests).length +
      accessService.listPendingKnowledgeForCustodian(currentUser, knowledgeItems).length +
      accessService.listPendingAIDerivativesForCustodian(currentUser, aiArtifacts).length
    : 0;

  // Primary navigation: clean, non-wrapping
  const primaryLinks: { id: ActiveScreen; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Inicio', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'communities', label: 'Comunidades', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'my_community', label: 'Mi Territorio', icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'library', label: 'Biblioteca', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'ai_lab', label: 'Ceiba IA', icon: <Bot className="w-3.5 h-3.5" /> },
  ];

  // Secondary / Governance modules grouped in the user & management dropdown
  const secondaryLinks: { id: ActiveScreen; label: string; desc: string; icon: React.ReactNode; badge?: number }[] = [
    { 
      id: 'custodian', 
      label: 'Panel de Custodia', 
      desc: 'Aprobaciones y gobernanza territorial',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined
    },
    { 
      id: 'permissions', 
      label: 'Matriz de Permisos', 
      desc: 'Control granular de lectura y Ceiba IA',
      icon: <KeyRound className="w-4 h-4 text-[#005A8D] dark:text-aluna-cyan" /> 
    },
    { 
      id: 'requests', 
      label: 'Solicitudes de Acceso', 
      desc: 'Historial y seguimiento de permisos',
      icon: <FileCheck2 className="w-4 h-4 text-amber-600 dark:text-amber-400" /> 
    },
    { 
      id: 'profile', 
      label: 'Mi Perfil e Identidad', 
      desc: `${currentUser.name} · ${currentUser.roleLabel}`,
      icon: <UserCheck className="w-4 h-4 text-slate-600 dark:text-slate-300" /> 
    },
    ...(MODULO_BIENESTAR_VISIBLE ? [{
      id: 'wellness' as const,
      label: 'Bienestar y Orientación',
      desc: 'Salud, derechos y orientación',
      icon: <HeartHandshake className="w-4 h-4 text-rose-600 dark:text-rose-400" />
    }] : []),
    {
      id: 'login',
      label: 'Iniciar Sesión / Cuenta', 
      desc: 'Autenticación formal y cambio de sesión',
      icon: <LogIn className="w-4 h-4 text-[#004B87] dark:text-sky-400" /> 
    },
  ];

  const isSecondaryActive = secondaryLinks.some(l => l.id === activeScreen);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#07131B]/95 text-[#06233B] dark:text-white backdrop-blur-md border-b border-slate-200/90 dark:border-[#1E3E54] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Izquierda: sello UNIMAGDALENA + divisor + logotipo de ceiba y nombre SABIA */}
          <div 
            onClick={() => setActiveScreen('welcome')}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveScreen('welcome'); } }}
            role="link"
            tabIndex={0}
            aria-label="SABIA · Universidad del Magdalena: ir al inicio"
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <img 
              src="/assets/logos/escudo_unimag_oficial.png" 
              alt="Universidad del Magdalena" 
              className="hidden sm:block w-9 h-9 object-contain shrink-0"
            />
            <div className="hidden sm:block h-7 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className="flex items-center gap-2.5">
              {/* Logotipo: árbol de ceiba (frontend/public/logo-ceiba.svg) */}
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 dark:border-slate-700 p-0.5 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src="/logo-ceiba.svg"
                  alt="SABIA"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg leading-none tracking-wide text-[#005A8D] dark:text-white whitespace-nowrap">
                  SABIA
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#06233B]/70 dark:text-slate-400 whitespace-nowrap mt-0.5">
                  UNIMAGDALENA
                </span>
              </div>
            </div>
          </div>

          {/* Center: Clean Horizontal Pill Navigation (No line breaks) */}
          <nav aria-label="Navegación principal" className="hidden xl:flex items-center gap-1">
            {primaryLinks.map((link) => {
              const isActive = activeScreen === link.id || (link.id === 'communities' && activeScreen === 'community_detail');
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveScreen(link.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-sky-50 dark:bg-[#005A8D] text-[#004B87] dark:text-white border border-sky-200/90 dark:border-aluna-cyan/40 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#06233B] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-[#132C3E]'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Action Pill + Governance/User Menu + Theme Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Primary Action Pill */}
            <button
              onClick={() => setActiveScreen('upload')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors shadow-sm ${
                activeScreen === 'upload'
                  ? 'bg-[#004B87] text-white'
                  : 'bg-[#F5B82E] hover:bg-[#E0A61F] text-[#06233B]'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Aportar Saber</span>
            </button>

            {/* Custodia Quick Pill on Desktop */}
            <button
              onClick={() => setActiveScreen('custodian')}
              className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                activeScreen === 'custodian'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold'
                  : 'bg-white dark:bg-[#132C3E] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#1E3E54] hover:border-slate-300'
              }`}
              title="Panel de Custodia Comunitaria"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Custodia</span>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-[#06233B]">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema visual"
              title={themeMode === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro Institucional'}
              className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-slate-200 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#132C3E] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#193A50] transition-colors"
            >
              {themeMode === 'light' ? (
                <Moon className="w-4 h-4 text-[#004B87]" />
              ) : (
                <Sun className="w-4 h-4 text-[#F5B82E]" />
              )}
            </button>

            {/* User & Quick Profile Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-label={`Menú de usuario y perfiles: ${currentUser.name}`}
                className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  userMenuOpen || isSecondaryActive
                    ? 'bg-sky-50 dark:bg-[#163244] border-[#004B87] dark:border-aluna-cyan text-[#06233B] dark:text-white'
                    : 'bg-white dark:bg-[#132C3E] border-slate-200 dark:border-[#1E3E54] hover:border-slate-300 dark:hover:border-slate-600 text-[#06233B] dark:text-white'
                }`}
                title="Menú de usuario, custodia y cambio rápido de perfil"
              >
                <div className="relative">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-aluna-cyan"
                  />
                  {pendingApprovalsCount > 0 && (
                    <span className="-top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white dark:border-[#07131B] absolute" />
                  )}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#06233B] dark:text-white leading-none whitespace-nowrap">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-[#005A8D] dark:text-aluna-cyan-300 font-medium truncate max-w-[105px] mt-0.5">
                    {currentUser.identity === 'visitor' ? 'Visitante' : currentUser.identity === 'researcher' ? 'Investigador' : isCustodianOfAny ? 'Custodia' : 'Comunidad'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] shadow-xl py-2 z-50 max-h-[85vh] overflow-y-auto">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#1E3E54] flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#004B87]/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#06233B] dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-[#005A8D] dark:text-aluna-cyan font-semibold truncate">{currentUser.roleLabel}</p>
                    </div>
                  </div>

                  {/* Conexión con el servidor y sesión (API /api/v1) */}
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-[#1E3E54] flex items-center justify-between gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {isOnline ? 'Conectado al servidor' : 'Sin conexión · modo local'}
                      {pendingSyncCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold" title="Acciones guardadas que se enviarán al volver la señal">
                          {pendingSyncCount} en cola
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (isAuthenticated) logout();
                        else setActiveScreen('login');
                      }}
                      className="font-bold text-[#004B87] dark:text-aluna-cyan hover:underline"
                    >
                      {isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión'}
                    </button>
                  </div>

                  {/* Quick Profile Switcher inside dropdown (Only when demoModeEnabled is true) */}
                  {demoModeEnabled && (
                    <div className="px-3 py-2.5 bg-slate-50 dark:bg-[#0A1924] border-b border-slate-200 dark:border-[#1E3E54] space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase tracking-wider text-amber-800 dark:text-[#F5B82E] flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Cambio rápido de perfil</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            resetDemoData();
                            setUserMenuOpen(false);
                          }}
                          className="text-slate-500 hover:text-[#06233B] dark:hover:text-white inline-flex items-center gap-1 font-semibold"
                          title="Restablecer datos de demostración"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restablecer</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-1">
                        {users.map(u => {
                          const isSelected = u.id === currentUser.id;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                switchUser(u.id);
                                setUserMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left text-[11px] transition-colors ${
                                isSelected
                                  ? 'bg-[#004B87] text-white font-bold'
                                  : 'hover:bg-slate-200/70 dark:hover:bg-[#132C3E] text-[#06233B] dark:text-slate-200'
                              }`}
                            >
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/40"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="truncate leading-tight">{u.name}</div>
                                <div className={`text-[10px] truncate ${isSelected ? 'text-sky-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {u.roleLabel}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/70 dark:border-[#1E3E54]">
                        Entorno de demostración · Datos y perfiles ficticios
                      </div>
                    </div>
                  )}

                  {/* Secondary Navigation Links */}
                  <div className="py-1">
                    {secondaryLinks.map((item) => {
                      const active = activeScreen === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveScreen(item.id);
                            setUserMenuOpen(false);
                          }}
                          className={`w-full flex items-start justify-between gap-3 px-4 py-2.5 text-left transition-colors ${
                            active
                              ? 'bg-sky-50 dark:bg-[#163244] text-[#004B87] dark:text-white font-semibold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#132C3E]'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0">{item.icon}</div>
                            <div>
                              <div className="text-xs font-semibold text-[#06233B] dark:text-white">{item.label}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                            </div>
                          </div>
                          {item.badge !== undefined && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-[#06233B]">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-3 rounded-xl text-[#06233B] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#132C3E]"
              aria-label="Menú principal"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-[#0D212E] border-b border-slate-200 dark:border-[#1E3E54] px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Navegación Principal
          </div>
          {primaryLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveScreen(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeScreen === link.id
                  ? 'bg-[#004B87] text-white'
                  : 'text-[#06233B] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#132C3E]'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}

          <button
            onClick={() => {
              setActiveScreen('upload');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#F5B82E] text-[#06233B]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Aportar Saber</span>
          </button>

          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-[#1E3E54]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Gobernanza y Herramientas
            </div>
            {secondaryLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveScreen(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeScreen === item.id
                    ? 'bg-sky-50 dark:bg-[#163244] text-[#004B87] dark:text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#132C3E]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-[#06233B]">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
