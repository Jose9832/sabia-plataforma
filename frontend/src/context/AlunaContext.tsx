/**
 * Motor de estado de ALUNA conectado a la API real (FastAPI · /api/v1).
 *
 * Mantiene la misma interfaz que usaban las pantallas del prototipo, pero ahora:
 * 1. Carga el estado desde `GET /api/v1/bootstrap`, ya filtrado por permisos en el servidor.
 * 2. Cada acción se refleja al instante en pantalla (actualización optimista) y luego se
 *    confirma con el servidor, que vuelve a validar la autoridad y los permisos.
 * 3. Sin conexión, las acciones quedan en una cola local y se envían al volver la señal;
 *    la app sigue funcionando con la última copia guardada (o con los datos demo base).
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  User,
  Community,
  KnowledgeItem,
  AccessRequest,
  AffiliationRequest,
  AILabArtifact,
  ActiveScreen,
  KnowledgeType,
  GranularPermissions,
  CeibaQueryResponse,
  TransformRequest,
  WellnessItem
} from '../types';
import {
  DEMO_USERS,
  DEMO_COMMUNITIES,
  INITIAL_KNOWLEDGE_ITEMS,
  INITIAL_ACCESS_REQUESTS,
  INITIAL_AFFILIATION_REQUESTS,
  INITIAL_AI_ARTIFACTS,
  WELLNESS_ITEMS
} from '../data/mockData';
import {
  canReadKnowledge,
  canQueryKnowledgeWithAI,
  canTransformKnowledgeWithAI,
  canCustodianReviewResource,
  canReviewAIDerivative,
  hasUnanimousOwnerApproval,
  isUserCustodianOfCommunity as checkCustodianOfComm,
  isUserVerifiedMemberOfCommunity as checkVerifiedMemberOfComm
} from '../domain/authorization';
import { isDemoProfilesEnabled } from '../services/authService';
import { ceibaService } from '../services/aiService';
import { api, ApiError, cola, nuevoId, SinConexionError, token, usuarioDelToken } from '../services/apiClient';

interface ToastInfo {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface RegistroDatos {
  name: string;
  email: string;
  password: string;
  identity: User['identity'];
  organization?: string;
  communityId?: string;
  rationale?: string;
  /** Autorización de tratamiento de datos personales (el servidor no crea la cuenta sin ella) */
  acceptDataPolicy: boolean;
}

interface Bootstrap {
  me: User | null;
  users: User[];
  communities: Community[];
  knowledgeItems: KnowledgeItem[];
  accessRequests: AccessRequest[];
  affiliationRequests: AffiliationRequest[];
  aiArtifacts: AILabArtifact[];
  wellnessItems: WellnessItem[];
}

interface SesionApi { access_token: string; user: User }

interface AlunaContextType {
  currentUser: User;
  users: User[];
  communities: Community[];
  knowledgeItems: KnowledgeItem[];
  accessRequests: AccessRequest[];
  affiliationRequests: AffiliationRequest[];
  aiArtifacts: AILabArtifact[];
  wellnessItems: WellnessItem[];
  activeScreen: ActiveScreen;
  selectedCommunityId: string | null;
  selectedKnowledgeIdForLab: string | null;
  selectedKnowledgeForDetail: KnowledgeItem | null;
  themeMode: 'light' | 'dark';
  toast: ToastInfo | null;
  activeScenarioNumber: number | null;
  demoModeEnabled: boolean;

  // Conexión con el servidor
  isOnline: boolean;
  isAuthenticated: boolean;
  pendingSyncCount: number;
  authToken: string | null;
  refreshFromServer: () => Promise<void>;

  // Actions
  switchUser: (userId: string) => void;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  registerAccount: (data: RegistroDatos) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  /** Entrar sin cuenta: solo lo público, sin solicitudes ni aportes. */
  enterAsVisitor: () => void;
  resetDemoData: () => void;
  setActiveScreen: (screen: ActiveScreen) => void;
  setSelectedCommunityId: (id: string | null) => void;
  setSelectedKnowledgeIdForLab: (id: string | null) => void;
  setSelectedKnowledgeForDetail: (item: KnowledgeItem | null) => void;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

  // Access & Evaluation (Delegated to centralized domain authorization)
  canUserRead: (knowledge: KnowledgeItem) => { allowed: boolean; reason: string; canRequest: boolean };
  canUserAccess: (knowledge: KnowledgeItem) => { allowed: boolean; reason: string; canRequest: boolean };
  canUserProcessWithAI: (knowledge: KnowledgeItem) => { allowed: boolean; reason: string };
  canUserGenerateDerivatives: (knowledge: KnowledgeItem) => { allowed: boolean; reason: string };
  isUserCustodianOfCommunity: (userId: string, communityId: string) => boolean;
  isUserVerifiedMemberOfCommunity: (userId: string, communityId: string) => boolean;
  canUserReviewResource: (resource: { communityIds?: string[]; communityId?: string }) => boolean;

  // Workflows
  requestAccess: (knowledgeId: string, purpose: string, perms?: { consultation: boolean; aiProcessing: boolean; derivatives: boolean }) => boolean;
  approveAccessRequest: (requestId: string, note?: string) => void;
  rejectAccessRequest: (requestId: string, note?: string) => void;

  requestAffiliation: (communityId: string, rationale: string) => boolean;
  approveAffiliation: (requestId: string) => void;
  rejectAffiliation: (requestId: string) => void;

  proposeKnowledgeItem: (data: {
    title: string;
    type: KnowledgeType;
    communityIds: string[];
    isCollective: boolean;
    provenance: string;
    description: string;
    fullContent: string;
    permissions: GranularPermissions;
    tags: string[];
    mediaUrl?: string;
  }) => KnowledgeItem;

  approveKnowledgeItem: (itemId: string, communityId: string, note?: string) => void;
  rejectKnowledgeItem: (itemId: string, communityId: string, note?: string) => void;
  grantAIPermissionToKnowledge: (itemId: string) => void;
  revokeAIPermissionFromKnowledge: (itemId: string) => void;

  createAIArtifact: (artifact: Omit<AILabArtifact, 'id' | 'generatedAt' | 'status' | 'authorUserId' | 'authorName'>) => AILabArtifact;
  approveAIArtifact: (artifactId: string, feedback?: string) => void;
  rejectAIArtifact: (artifactId: string, feedback?: string) => void;

  // CEIBA (servidor, con respaldo local sin conexión)
  askCeiba: (knowledgeIds: string[], question: string) => Promise<CeibaQueryResponse>;
  transformWithCeiba: (knowledge: KnowledgeItem, request: TransformRequest) => Promise<{ allowed: boolean; artifact?: AILabArtifact; errorReason?: string }>;

  // Bienestar
  sendWellnessOrientation: (description: string, channelId?: string) => Promise<boolean>;

  runScenario: (scenarioNum: number) => void;
}

const STORAGE_KEY = 'aluna_sabia_ceiba_v4';
const PERFIL_INICIAL = 'user_member_sierra'; // Aura Villafaña: flujo de presentación recomendado

/** Persona sin sesión (cuando los perfiles demo están apagados). Solo ve lo público. */
const VISITANTE_ANONIMO: User = {
  id: 'anon',
  name: 'Visitante',
  identity: 'visitor',
  roleLabel: 'Visitante sin sesión',
  avatar: '/assets/logos/aluna_isotipo.png',
  email: '',
  affiliations: [],
  bio: 'Inicia sesión para participar, solicitar accesos o aportar saberes.'
};

/* ---------- Rutas en la barra de direcciones (History API) ---------- */
const RUTAS: Record<ActiveScreen, string> = {
  welcome: '/',
  login: '/ingresar',
  register: '/registro',
  dashboard: '/panel',
  communities: '/comunidades',
  community_detail: '/comunidades',
  my_community: '/mi-comunidad',
  library: '/biblioteca',
  upload: '/aportar',
  permissions: '/permisos',
  requests: '/solicitudes',
  ai_lab: '/ceiba',
  custodian: '/custodia',
  profile: '/perfil',
  wellness: '/bienestar',
  espacio_indigena: '/comunidad-indigena',
  espacio_afro: '/comunidad-afro',
  espacio_campesina: '/comunidad-campesina'
};

/** Pantalla (y comunidad abierta) que corresponde a una dirección. Direcciones desconocidas → inicio. */
function pantallaDesdeRuta(ruta: string): { pantalla: ActiveScreen; comunidad: string | null } {
  const limpia = ruta.replace(/\/+$/, '') || '/';
  const detalle = limpia.match(/^\/comunidades\/([^/]+)$/);
  if (detalle) return { pantalla: 'communities', comunidad: decodeURIComponent(detalle[1]) };
  const encontrada = (Object.keys(RUTAS) as ActiveScreen[]).find(k => RUTAS[k] === limpia && k !== 'community_detail');
  return { pantalla: encontrada || 'welcome', comunidad: null };
}

function rutaDePantalla(pantalla: ActiveScreen, comunidad: string | null): string {
  if ((pantalla === 'communities' || pantalla === 'community_detail') && comunidad) {
    return `/comunidades/${encodeURIComponent(comunidad)}`;
  }
  return RUTAS[pantalla] || '/';
}

const rutaInicial = typeof window === 'undefined' ? { pantalla: 'welcome' as ActiveScreen, comunidad: null } : pantallaDesdeRuta(window.location.pathname);

/**
 * Envía la cola sin conexión del módulo de Salud SABIA aunque la persona no abra Bienestar.
 * Se importa bajo demanda para no cargar el módulo completo al abrir la app.
 */
async function enviarColaSalud(authToken: string | null, usuarioId: string): Promise<number> {
  if (!authToken || usuarioId === 'anon') return 0;
  try {
    const { enviarCola } = await import('../modules/salud/lib/cola');
    return (await enviarCola(authToken, usuarioId)).enviadas;
  } catch {
    return 0; // sin señal o sesión vencida: todo sigue guardado en IndexedDB
  }
}

const fechaCorta = () => new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

function leerCache(): Bootstrap | null {
  try {
    const guardado = localStorage.getItem(`${STORAGE_KEY}_bootstrap`);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

/** Datos base del prototipo: respaldo cuando la app abre sin conexión por primera vez. */
const RESPALDO: Bootstrap = {
  me: DEMO_USERS.find(u => u.id === PERFIL_INICIAL) || DEMO_USERS[0],
  users: DEMO_USERS,
  communities: DEMO_COMMUNITIES,
  knowledgeItems: INITIAL_KNOWLEDGE_ITEMS,
  accessRequests: INITIAL_ACCESS_REQUESTS,
  affiliationRequests: INITIAL_AFFILIATION_REQUESTS,
  aiArtifacts: INITIAL_AI_ARTIFACTS,
  wellnessItems: WELLNESS_ITEMS
};

export const AlunaContext = createContext<AlunaContextType | undefined>(undefined);

export const AlunaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const inicial = leerCache() || RESPALDO;

  const [users, setUsers] = useState<User[]>(inicial.users);
  const [currentUserId, setCurrentUserId] = useState<string>(inicial.me?.id || 'anon');
  const [communities, setCommunities] = useState<Community[]>(inicial.communities);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(inicial.knowledgeItems);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(inicial.accessRequests);
  const [affiliationRequests, setAffiliationRequests] = useState<AffiliationRequest[]>(inicial.affiliationRequests);
  const [aiArtifacts, setAiArtifacts] = useState<AILabArtifact[]>(inicial.aiArtifacts);
  const [wellnessItems, setWellnessItems] = useState<WellnessItem[]>(inicial.wellnessItems);

  const [activeScreen, setActiveScreenState] = useState<ActiveScreen>(rutaInicial.pantalla);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(rutaInicial.comunidad);
  const [selectedKnowledgeIdForLab, setSelectedKnowledgeIdForLab] = useState<string | null>(null);
  const [selectedKnowledgeForDetail, setSelectedKnowledgeForDetail] = useState<KnowledgeItem | null>(null);
  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>('light');
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [activeScenarioNumber, setActiveScenarioNumber] = useState<number | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [authToken, setAuthToken] = useState<string | null>(token.leer());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(cola.de().length);

  const demoModeEnabled = isDemoProfilesEnabled();

  // La pantalla activa se refleja en la dirección: se puede compartir un enlace, recargar
  // sin volver al inicio y usar los botones Atrás/Adelante del navegador.
  const primeraRuta = useRef(true);
  useEffect(() => {
    const ruta = rutaDePantalla(activeScreen, selectedCommunityId);
    if (window.location.pathname !== ruta) {
      if (primeraRuta.current) window.history.replaceState(null, '', ruta);
      else window.history.pushState(null, '', ruta);
    }
    primeraRuta.current = false;
  }, [activeScreen, selectedCommunityId]);
  useEffect(() => {
    const alNavegar = () => {
      const { pantalla, comunidad } = pantallaDesdeRuta(window.location.pathname);
      setActiveScreenState(pantalla);
      setSelectedCommunityId(comunidad);
    };
    window.addEventListener('popstate', alNavegar);
    return () => window.removeEventListener('popstate', alNavegar);
  }, []);

  useEffect(() => {
    if (themeMode === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [themeMode]);

  const currentUser = users.find(u => u.id === currentUserId) || (currentUserId === 'anon' ? VISITANTE_ANONIMO : users[0] || VISITANTE_ANONIMO);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // ------------------------------------------------------------------
  // Sincronización con el servidor
  // ------------------------------------------------------------------
  const aplicar = useCallback((b: Bootstrap) => {
    const lista = b.me && !b.users.some(u => u.id === b.me!.id) ? [b.me, ...b.users] : b.users;
    setUsers(lista);
    setCurrentUserId(b.me?.id || 'anon');
    setCommunities(b.communities);
    setKnowledgeItems(b.knowledgeItems);
    setAccessRequests(b.accessRequests);
    setAffiliationRequests(b.affiliationRequests);
    setAiArtifacts(b.aiArtifacts);
    setWellnessItems(b.wellnessItems);
    try { localStorage.setItem(`${STORAGE_KEY}_bootstrap`, JSON.stringify(b)); } catch { /* lleno */ }
  }, []);

  const refreshFromServer = useCallback(async () => {
    try {
      const b = await api<Bootstrap>('GET', '/bootstrap');
      aplicar(b);
      setIsOnline(true);
    } catch (e) {
      if (e instanceof SinConexionError) setIsOnline(false);
      else if (e instanceof ApiError && e.status === 401) {
        // La sesión venció: las acciones guardadas siguen a nombre de la persona y se
        // enviarán cuando vuelva a entrar con su cuenta.
        const guardadas = cola.de().length;
        token.guardar(null);
        setAuthToken(null);
        setPendingSyncCount(0);
        if (guardadas) {
          setToast({ message: `Tu sesión venció. Inicia sesión de nuevo para enviar ${guardadas} acción(es) guardada(s).`, type: 'warning' });
        }
      }
    }
  }, [aplicar]);

  const enviandoCola = useRef(false);
  const enviarCola = useCallback(async () => {
    if (enviandoCola.current || !cola.de().length) return;
    enviandoCola.current = true;
    try {
      const { enviadas, rechazadas, sesionVencida } = await cola.enviar();
      setPendingSyncCount(cola.de().length);
      if (enviadas) showToast(`Conexión recuperada: se enviaron ${enviadas} acción(es) guardada(s) sin señal.`, 'success');
      if (rechazadas.length) showToast(`El servidor no aceptó: ${rechazadas[0]}`, 'warning');
      if (enviadas || rechazadas.length || sesionVencida) await refreshFromServer();
    } finally {
      enviandoCola.current = false;
    }
  }, [refreshFromServer, showToast]);

  // Mientras haya acciones sin enviar, la copia local guarda también los cambios hechos sin señal:
  // si la persona recarga la página sin conexión, los sigue viendo hasta que se sincronicen.
  useEffect(() => {
    if (!pendingSyncCount || currentUserId === 'anon') return;
    const me = users.find(u => u.id === currentUserId) || null;
    const copia: Bootstrap = { me, users, communities, knowledgeItems, accessRequests, affiliationRequests, aiArtifacts, wellnessItems };
    try { localStorage.setItem(`${STORAGE_KEY}_bootstrap`, JSON.stringify(copia)); } catch { /* lleno */ }
  }, [pendingSyncCount, currentUserId, users, communities, knowledgeItems, accessRequests, affiliationRequests, aiArtifacts, wellnessItems]);

  // Cola del módulo de salud: se envía al abrir, al volver la señal y cada 30 s.
  const sesionSalud = useRef<{ t: string | null; id: string }>({ t: null, id: 'anon' });
  const enviarSalud = useCallback(async () => {
    const { t, id } = sesionSalud.current;
    const n = await enviarColaSalud(t, id);
    if (n) showToast(`Salud SABIA: se enviaron ${n} registro(s) guardado(s) sin señal.`, 'success');
  }, [showToast]);
  useEffect(() => {
    sesionSalud.current = { t: authToken, id: currentUserId };
    void enviarSalud();
  }, [authToken, currentUserId, enviarSalud]);

  const guardarSesion = useCallback((s: SesionApi) => {
    token.guardar(s.access_token);
    setAuthToken(s.access_token);
    // El contador muestra solo las acciones de quien tiene la sesión abierta.
    setPendingSyncCount(cola.de(usuarioDelToken(s.access_token)).length);
  }, []);

  /**
   * Confirma una acción con el servidor. Si no hay señal la deja en cola; si el servidor
   * la rechaza (p. ej. por falta de autoridad), avisa y vuelve al estado real del servidor.
   */
  const confirmar = useCallback(async (method: 'POST' | 'PATCH' | 'DELETE', path: string, body: unknown, descripcion: string) => {
    try {
      await api(method, path, body);
      setIsOnline(true);
      await refreshFromServer();
    } catch (e) {
      if (e instanceof SinConexionError) {
        setIsOnline(false);
        if (cola.agregar({ method, path, body, descripcion })) {
          setPendingSyncCount(cola.de().length);
          showToast(`Sin conexión: "${descripcion}" quedó guardado y se enviará al volver la señal.`, 'warning');
        } else {
          showToast('Sin conexión: inicia sesión para guardar tus acciones y enviarlas después.', 'warning');
        }
      } else {
        showToast((e as Error).message, 'error');
        await refreshFromServer();
      }
    }
  }, [refreshFromServer, showToast]);

  // Arranque: sesión demo por defecto (como el prototipo), datos del servidor y cola pendiente
  const iniciado = useRef(false);
  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    (async () => {
      if (!token.leer() && demoModeEnabled) {
        try { guardarSesion(await api<SesionApi>('POST', `/auth/demo/${PERFIL_INICIAL}`)); } catch { /* sin servidor: respaldo local */ }
      }
      await refreshFromServer();
      await enviarCola();
    })();
    const alVolver = () => {
      setIsOnline(true);
      void enviarCola().then(refreshFromServer);
      void enviarSalud();
    };
    const alIrse = () => setIsOnline(false);
    window.addEventListener('online', alVolver);
    window.addEventListener('offline', alIrse);
    const reintento = setInterval(() => {
      if (cola.de().length) void enviarCola();
      void enviarSalud();
    }, 30000);
    return () => {
      window.removeEventListener('online', alVolver);
      window.removeEventListener('offline', alIrse);
      clearInterval(reintento);
    };
  }, [demoModeEnabled, enviarCola, enviarSalud, guardarSesion, refreshFromServer]);

  // ------------------------------------------------------------------
  // Sesión
  // ------------------------------------------------------------------
  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    setCurrentUserId(userId); // cambio inmediato en pantalla
    showToast(`Perfil activo: ${target.name} (${target.roleLabel})`, 'info');
    void (async () => {
      try {
        guardarSesion(await api<SesionApi>('POST', `/auth/demo/${userId}`));
        await refreshFromServer();
      } catch (e) {
        if (e instanceof SinConexionError) {
          showToast('Sin conexión: se muestra la última copia guardada para este perfil.', 'warning');
        } else {
          showToast((e as Error).message, 'error');
        }
      }
    })();
  };

  const loginWithEmail = async (email: string, password = ''): Promise<boolean> => {
    try {
      const s = await api<SesionApi>('POST', '/auth/login', { email, password });
      guardarSesion(s);
      await refreshFromServer();
      void enviarCola();
      showToast(`Sesión iniciada como ${s.user.name} (${s.user.roleLabel}).`, 'success');
      return true;
    } catch (e) {
      showToast(e instanceof SinConexionError ? 'Sin conexión: para iniciar sesión necesitas internet.' : (e as Error).message, 'error');
      return false;
    }
  };

  const registerAccount = async (data: RegistroDatos): Promise<{ ok: boolean; error?: string }> => {
    try {
      const s = await api<SesionApi>('POST', '/auth/register', data);
      guardarSesion(s);
      await refreshFromServer();
      return { ok: true };
    } catch (e) {
      // Si un intento anterior sí creó la cuenta (p. ej. el servidor tardó en responder),
      // se entra con esas mismas credenciales en lugar de mostrar «ya existe».
      if (e instanceof ApiError && e.status === 409) {
        try {
          const s = await api<SesionApi>('POST', '/auth/login', { email: data.email, password: data.password });
          guardarSesion(s);
          await refreshFromServer();
          return { ok: true };
        } catch { /* la cuenta es de otra persona o la contraseña no coincide */ }
      }
      return {
        ok: false,
        error: e instanceof SinConexionError
          ? 'No pudimos comunicarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.'
          : (e as Error).message
      };
    }
  };

  const logout = () => {
    token.guardar(null);
    setAuthToken(null);
    setPendingSyncCount(0);
    try { localStorage.removeItem(`${STORAGE_KEY}_bootstrap`); } catch { /* bloqueado */ }
    setCurrentUserId('anon');
    setActiveScreenState('welcome');
    void refreshFromServer();
    showToast('Sesión cerrada.', 'info');
  };

  const enterAsVisitor = () => {
    token.guardar(null);
    setAuthToken(null);
    setPendingSyncCount(0);
    setCurrentUserId('anon');
    setActiveScreen('library');
    void refreshFromServer();
    showToast('Entraste como visitante: verás los saberes que las comunidades compartieron en público.', 'info');
  };

  const resetDemoData = () => {
    setSelectedKnowledgeIdForLab(null);
    setSelectedCommunityId(null);
    setSelectedKnowledgeForDetail(null);
    setActiveScreenState('welcome');
    setActiveScenarioNumber(null);
    setThemeModeState('light');
    void (async () => {
      try {
        await api('POST', '/demo/reset');
        await refreshFromServer();
        showToast('Estado del sistema restablecido a los datos base.', 'success');
      } catch (e) {
        showToast(e instanceof SinConexionError ? 'Sin conexión: no se pudo restablecer la demostración.' : (e as Error).message, 'error');
      }
    })();
  };

  const setActiveScreen = (screen: ActiveScreen) => {
    setActiveScreenState(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => setThemeModeState(prev => (prev === 'light' ? 'dark' : 'light'));
  const setThemeMode = (mode: 'light' | 'dark') => setThemeModeState(mode);

  // ------------------------------------------------------------------
  // Autorización (misma lógica que valida el servidor)
  // ------------------------------------------------------------------
  const isUserCustodianOfCommunity = (userId: string, communityId: string): boolean => {
    const u = users.find(x => x.id === userId) || (userId === currentUser.id ? currentUser : undefined);
    return u ? checkCustodianOfComm(u, communityId) : false;
  };

  const isUserVerifiedMemberOfCommunity = (userId: string, communityId: string): boolean => {
    const u = users.find(x => x.id === userId) || (userId === currentUser.id ? currentUser : undefined);
    return u ? checkVerifiedMemberOfComm(u, communityId) : false;
  };

  const canUserRead = (knowledge: KnowledgeItem) => canReadKnowledge(currentUser, knowledge);
  const canUserProcessWithAI = (knowledge: KnowledgeItem) => canQueryKnowledgeWithAI(currentUser, knowledge);
  const canUserGenerateDerivatives = (knowledge: KnowledgeItem) => canTransformKnowledgeWithAI(currentUser, knowledge);
  const canUserReviewResource = (resource: { communityIds?: string[]; communityId?: string }) =>
    canCustodianReviewResource(currentUser, resource);

  const exigirSesion = (): boolean => {
    if (currentUser.id === 'anon') {
      showToast('Inicia sesión para realizar esta acción.', 'warning');
      setActiveScreen('login');
      return false;
    }
    return true;
  };

  // ------------------------------------------------------------------
  // Solicitudes de acceso
  // ------------------------------------------------------------------
  const requestAccess = (
    knowledgeId: string,
    purpose: string,
    perms: { consultation: boolean; aiProcessing: boolean; derivatives: boolean } = { consultation: true, aiProcessing: true, derivatives: true }
  ): boolean => {
    if (!exigirSesion()) return false;
    const target = knowledgeItems.find(k => k.id === knowledgeId);
    if (!target) return false;

    const existing = accessRequests.find(r => r.knowledgeId === knowledgeId && r.userId === currentUser.id && r.status === 'pending');
    if (existing) {
      showToast('Ya tienes una solicitud en trámite para este material.', 'warning');
      return false;
    }

    const newReq: AccessRequest = {
      id: nuevoId('req'),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.roleLabel,
      userEmail: currentUser.email,
      userOrganization: currentUser.organization || 'Investigación Académica',
      knowledgeId: target.id,
      knowledgeTitle: target.title,
      communityId: target.communityIds[0],
      communityName: target.communityNames[0],
      requestDate: fechaCorta(),
      purpose: purpose.trim() || 'Consulta académica para diálogo intercultural de saberes.',
      requestedPermissions: perms,
      status: 'pending'
    };

    setAccessRequests(prev => [newReq, ...prev]);
    showToast(`Solicitud enviada al custodio de ${target.communityNames[0]}.`, 'success');
    void confirmar('POST', `/knowledges/${encodeURIComponent(knowledgeId)}/access-requests`,
      { id: newReq.id, purpose: newReq.purpose, requestedPermissions: perms }, `Solicitud de acceso a «${target.title}»`);
    return true;
  };

  const decidirSolicitud = (requestId: string, aprobar: boolean, note?: string) => {
    const req = accessRequests.find(r => r.id === requestId);
    if (!req) return;

    if (!isUserCustodianOfCommunity(currentUser.id, req.communityId)) {
      showToast(aprobar
        ? `No tienes autoridad de custodio sobre ${req.communityName}. Cada comunidad tiene su propia custodia.`
        : 'No tienes autoridad para resolver solicitudes de esta comunidad.', 'error');
      return;
    }

    setAccessRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: aprobar ? 'approved' : 'rejected',
      responseDate: fechaCorta(),
      responseNote: note || (aprobar ? 'Autorizado con fines académicos respetuosos.' : 'En este momento la comunidad no considera oportuna la apertura de este saber.'),
      custodianId: currentUser.id,
      custodianName: currentUser.name
    } : r));

    if (aprobar) {
      setKnowledgeItems(prev => prev.map(k => {
        if (k.id !== req.knowledgeId) return k;
        const grants = (k.accessGrants || []).filter(g => g.userId !== req.userId);
        return {
          ...k,
          authorizedUserIds: k.authorizedUserIds.includes(req.userId) ? k.authorizedUserIds : [...k.authorizedUserIds, req.userId],
          accessGrants: [...grants, { id: nuevoId('grant'), knowledgeId: k.id, userId: req.userId, requestId: req.id, grantedByCustodianId: currentUser.id, grantedAt: new Date().toISOString() }]
        };
      }));
      showToast(`Solicitud de ${req.userName} aprobada con éxito por ${currentUser.name}.`, 'success');
    } else {
      showToast('Solicitud declinada con justificación comunitaria.', 'info');
    }
    void confirmar('POST', `/access-requests/${encodeURIComponent(requestId)}/decisions`,
      { decision: aprobar ? 'approve' : 'reject', note }, `Decisión sobre la solicitud de ${req.userName}`);
  };

  const approveAccessRequest = (requestId: string, note?: string) => decidirSolicitud(requestId, true, note);
  const rejectAccessRequest = (requestId: string, note?: string) => decidirSolicitud(requestId, false, note);

  // ------------------------------------------------------------------
  // Vinculación comunitaria
  // ------------------------------------------------------------------
  const requestAffiliation = (communityId: string, rationale: string): boolean => {
    if (!exigirSesion()) return false;
    const comm = communities.find(c => c.id === communityId);
    if (!comm) return false;

    const newReq: AffiliationRequest = {
      id: nuevoId('aff'),
      userId: currentUser.id,
      userName: currentUser.name,
      communityId,
      communityName: comm.name,
      requestDate: fechaCorta(),
      rationale: rationale.trim() || 'Deseo participar en los espacios de diálogo y preservación.',
      status: 'pending'
    };

    setAffiliationRequests(prev => [newReq, ...prev]);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? {
      ...u,
      affiliations: [...u.affiliations.filter(a => a.communityId !== communityId), { communityId, communityName: comm.name, status: 'pending', role: 'member' }]
    } : u));

    showToast(`Solicitud enviada al custodio de ${comm.name}. Queda en estado pendiente.`, 'info');
    void confirmar('POST', '/affiliations', { id: newReq.id, communityId, rationale: newReq.rationale }, `Vinculación a ${comm.name}`);
    return true;
  };

  const decidirVinculacion = (requestId: string, aprobar: boolean) => {
    const req = affiliationRequests.find(r => r.id === requestId);
    if (!req) return;

    if (!isUserCustodianOfCommunity(currentUser.id, req.communityId)) {
      showToast(aprobar
        ? `No eres custodio de ${req.communityName}. Solo sus autoridades pueden validar integrantes.`
        : 'No tienes autoridad para resolver esta vinculación.', 'error');
      return;
    }

    setAffiliationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: aprobar ? 'approved' : 'rejected' } : r));
    setUsers(prev => prev.map(u => {
      if (u.id !== req.userId) return u;
      return aprobar
        ? { ...u, affiliations: u.affiliations.map(a => a.communityId === req.communityId ? { ...a, status: 'verified', joinedDate: new Date().toLocaleDateString('es-CO') } : a) }
        : { ...u, affiliations: u.affiliations.filter(a => a.communityId !== req.communityId) };
    }));
    showToast(aprobar ? `Vinculación de ${req.userName} aprobada como integrante verificado.` : 'Solicitud de vinculación denegada.', aprobar ? 'success' : 'info');
    void confirmar('POST', `/affiliations/${encodeURIComponent(requestId)}/decisions`,
      { decision: aprobar ? 'approve' : 'reject' }, `Vinculación de ${req.userName}`);
  };

  const approveAffiliation = (requestId: string) => decidirVinculacion(requestId, true);
  const rejectAffiliation = (requestId: string) => decidirVinculacion(requestId, false);

  // ------------------------------------------------------------------
  // Aportes de saberes (aprobación unánime por cada comunidad titular)
  // ------------------------------------------------------------------
  const proposeKnowledgeItem = (data: {
    title: string;
    type: KnowledgeType;
    communityIds: string[];
    isCollective: boolean;
    provenance: string;
    description: string;
    fullContent: string;
    permissions: GranularPermissions;
    tags: string[];
    mediaUrl?: string;
  }): KnowledgeItem => {
    const commNames = data.communityIds.map(cId => communities.find(c => c.id === cId)?.name || 'Comunidad Territorial');

    const initialApprovals = data.communityIds.map(cId => {
      const comm = communities.find(c => c.id === cId);
      const propio = isUserCustodianOfCommunity(currentUser.id, cId);
      return {
        communityId: cId,
        communityName: comm?.name || 'Comunidad',
        custodianId: propio ? currentUser.id : comm?.custodians[0]?.id,
        custodianName: propio ? currentUser.name : comm?.custodians[0]?.name,
        status: propio ? ('approved' as const) : ('pending' as const),
        decisionDate: propio ? new Date().toLocaleDateString('es-CO') : undefined,
        note: propio ? 'Aprobado directamente por autor con facultades de custodia.' : 'Pendiente de revisión.'
      };
    });

    const unanimouslyApproved = hasUnanimousOwnerApproval({ communityIds: data.communityIds, approvals: initialApprovals });

    const newItem: KnowledgeItem = {
      id: nuevoId('know'),
      title: data.title,
      type: data.type,
      communityIds: data.communityIds,
      communityNames: commNames,
      author: currentUser.name,
      authorRole: currentUser.roleLabel,
      authorUserId: currentUser.id,
      isCommunityCollectiveKnowledge: data.isCollective,
      date: fechaCorta(),
      permissions: data.permissions,
      description: data.description,
      fullContent: data.fullContent,
      excerptForPublic: data.description.slice(0, 150) + '...',
      tags: data.tags.length > 0 ? data.tags : ['Saber Territorial', 'Diálogo ALUNA'],
      status: unanimouslyApproved ? 'approved' : 'pending_review',
      approvals: initialApprovals,
      authorizedUserIds: [currentUser.id],
      mediaUrl: data.mediaUrl || '/assets/photos/campus_lago_aerea_limpia.jpg',
      educationalData: {
        summary: data.description,
        simpleExplanation: data.description,
        sampleQuestions: [{ q: `¿Cuál es el valor principal de ${data.title}?`, ans: `Según el aporte registrado por ${currentUser.name}: ${data.description}`, quote: data.description, anchor: 'Descripción del saber' }],
        outOfDomainQuestion: { q: '¿Qué información externa existe sobre este saber?', ans: 'Información no disponible en la fuente: Ceiba ancla sus respuestas exclusivamente en el testimonio aportado.', explanation: 'Principio de no invención algorítmica.' },
        slides: [{ number: 1, title: data.title, content: data.description, teachingNote: 'Analizar el origen y pertinencia comunitaria del material.', sourceAnchor: `Aporte de ${currentUser.name}` }],
        learningGuide: { keyConcepts: [{ term: 'Saber Territorial', definition: 'Conocimiento situado aportado al archivo de ALUNA.' }], reflectionQuestions: ['¿Cómo dialoga este saber con la sostenibilidad del territorio?'], classroomActivity: 'Debate en aula sobre la protección de saberes comunitarios.' },
        podcastTranscript: [{ speaker: currentUser.name, role: 'Aportante', time: '00:00 - 00:30', text: data.description }],
        conceptNodes: [{ id: 'aporte', label: data.title, category: 'practica', description: data.description, connections: [] }],
        videoStoryboard: [{ scene: 1, visual: 'Registro fotográfico del territorio.', narration: data.description, note: 'Borrador preliminar.' }]
      }
    };

    if (!exigirSesion()) return newItem;
    setKnowledgeItems(prev => [newItem, ...prev]);

    if (unanimouslyApproved) {
      showToast('Saber registrado y publicado con éxito bajo tu autoridad comunitaria.', 'success');
    } else {
      showToast(
        data.communityIds.length > 1
          ? 'Saber propuesto para múltiples comunidades. Requiere aprobación unánime de cada custodio antes de publicarse.'
          : 'Aporte propuesto con éxito. Ha quedado en estado "Pendiente de revisión" por el custodio comunitario.',
        'info'
      );
    }
    void confirmar('POST', '/knowledges', { id: newItem.id, ...data }, `Aporte «${data.title}»`);
    return newItem;
  };

  const decidirSaber = (itemId: string, communityId: string, aprobar: boolean, note?: string) => {
    const item = knowledgeItems.find(k => k.id === itemId);
    if (!item) return;

    if (!isUserCustodianOfCommunity(currentUser.id, communityId)) {
      showToast(aprobar ? 'No tienes autoridad de custodio para aprobar contenidos en esta comunidad.' : 'No tienes autoridad para declinar aportes en esta comunidad.', 'error');
      return;
    }

    setKnowledgeItems(prev => prev.map(k => {
      if (k.id !== itemId) return k;
      const approvals = k.approvals.map(a => a.communityId === communityId ? {
        ...a,
        status: aprobar ? ('approved' as const) : ('rejected' as const),
        custodianId: currentUser.id,
        custodianName: currentUser.name,
        decisionDate: new Date().toLocaleDateString('es-CO'),
        note: note || (aprobar ? 'Aprobado según las normas de gobernanza comunitaria.' : 'Aporte no admitido para salvaguarda comunitaria.')
      } : a);
      const status: KnowledgeItem['status'] = !aprobar ? 'rejected' : hasUnanimousOwnerApproval({ communityIds: k.communityIds, approvals }) ? 'approved' : 'pending_review';
      return { ...k, approvals, status };
    }));

    if (!aprobar) {
      showToast('Aporte de saber no admitido.', 'info');
    } else if (item.communityIds.length > 1) {
      const commName = currentUser.affiliations.find(a => a.communityId === communityId)?.communityName || 'tu comunidad';
      showToast(`Aprobación registrada por ${commName}. El saber se publica cuando todas las comunidades titulares aprueban.`, 'info');
    } else {
      showToast('Saber aprobado y publicado en la biblioteca.', 'success');
    }
    void confirmar('POST', `/knowledges/${encodeURIComponent(itemId)}/decisions`,
      { decision: aprobar ? 'approve' : 'reject', communityId, note }, `Decisión sobre «${item.title}»`);
  };

  const approveKnowledgeItem = (itemId: string, communityId: string, note?: string) => decidirSaber(itemId, communityId, true, note);
  const rejectKnowledgeItem = (itemId: string, communityId: string, note?: string) => decidirSaber(itemId, communityId, false, note);

  const cambiarPermisoIA = (itemId: string, habilitar: boolean) => {
    const target = knowledgeItems.find(k => k.id === itemId);
    if (!target || !canCustodianReviewResource(currentUser, target)) {
      showToast(`Solo el custodio de la comunidad titular puede ${habilitar ? 'habilitar' : 'revocar'} permisos de IA.`, 'error');
      return;
    }
    setKnowledgeItems(prev => prev.map(k => k.id !== itemId ? k : {
      ...k,
      permissions: habilitar
        ? { ...k.permissions, aiQueryAllowed: 'derived_approval_required', derivativeGenerationAllowed: true, revokedAt: undefined }
        : { ...k.permissions, revokedAt: new Date().toISOString() }
    }));
    showToast(habilitar
      ? 'Permiso de IA habilitado por la custodia: ahora Ceiba puede consultar este saber.'
      : 'Permiso de IA revocado: Ceiba bloqueará nuevas consultas y transformaciones sobre este saber.', habilitar ? 'success' : 'warning');
    void confirmar('POST', `/permissions/${encodeURIComponent(itemId)}/${habilitar ? 'grant-ai' : 'revoke'}`, {},
      `${habilitar ? 'Habilitar' : 'Revocar'} IA en «${target.title}»`);
  };

  const grantAIPermissionToKnowledge = (itemId: string) => cambiarPermisoIA(itemId, true);
  const revokeAIPermissionFromKnowledge = (itemId: string) => cambiarPermisoIA(itemId, false);

  // ------------------------------------------------------------------
  // Derivados de IA (siempre nacen como borrador de las comunidades titulares)
  // ------------------------------------------------------------------
  const nuevoDerivado = (artifactData: Omit<AILabArtifact, 'id' | 'generatedAt' | 'status' | 'authorUserId' | 'authorName'>): AILabArtifact => ({
    ...artifactData,
    id: nuevoId('art'),
    generatedAt: fechaCorta() + ' ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    authorUserId: currentUser.id,
    authorName: currentUser.name,
    status: 'draft_pending_review',
    public: false
  });

  const createAIArtifact = (artifactData: Omit<AILabArtifact, 'id' | 'generatedAt' | 'status' | 'authorUserId' | 'authorName'>): AILabArtifact => {
    const newArt = nuevoDerivado(artifactData);
    if (!exigirSesion()) return newArt;
    setAiArtifacts(prev => [newArt, ...prev]);
    showToast('Material generado con apoyo de IA y guardado como borrador pendiente de revisión por la custodia.', 'info');
    const { generatedAt: _g, status: _s, authorUserId: _a, authorName: _n, public: _p, ...cuerpo } = newArt;
    void confirmar('POST', '/ai/outputs', cuerpo, `Borrador IA «${newArt.title}»`);
    return newArt;
  };

  const decidirDerivado = (artifactId: string, aprobar: boolean, feedback?: string) => {
    const target = aiArtifacts.find(a => a.id === artifactId);
    if (!target) return;
    if (!canReviewAIDerivative(currentUser, target)) {
      showToast('Acceso denegado: no tienes autoridad de custodia sobre la comunidad titular de este borrador.', 'error');
      return;
    }
    setAiArtifacts(prev => prev.map(a => a.id === artifactId ? {
      ...a,
      status: aprobar ? 'approved_by_custodian' : 'rejected',
      public: aprobar,
      custodianFeedback: feedback || (aprobar ? `Aprobado por ${currentUser.name} conforme a las directrices comunitarias.` : 'Rechazado por la custodia para proteger la fidelidad a la fuente comunitaria.')
    } : a));
    showToast(aprobar ? 'Borrador derivado de IA aprobado por la custodia territorial.' : 'Borrador derivado de IA rechazado por la custodia.', aprobar ? 'success' : 'info');
    void confirmar('POST', `/ai/outputs/${encodeURIComponent(artifactId)}/decisions`,
      { decision: aprobar ? 'approve' : 'reject', note: feedback }, `Decisión sobre «${target.title}»`);
  };

  const approveAIArtifact = (artifactId: string, feedback?: string) => decidirDerivado(artifactId, true, feedback);
  const rejectAIArtifact = (artifactId: string, feedback?: string) => decidirDerivado(artifactId, false, feedback);

  // ------------------------------------------------------------------
  // CEIBA: el servidor autoriza y responde; sin señal responde el motor local de respaldo
  // ------------------------------------------------------------------
  const askCeiba = async (knowledgeIds: string[], question: string): Promise<CeibaQueryResponse> => {
    try {
      const r = await api<CeibaQueryResponse>('POST', '/ai/query', { knowledgeIds, question });
      setIsOnline(true);
      return r;
    } catch (e) {
      if (e instanceof SinConexionError) {
        setIsOnline(false);
        return { ...ceibaService.query(currentUser, knowledgeItems, { knowledgeIds, question }), isBackupDemoResponse: true };
      }
      return { answer: (e as Error).message, supported: false, citations: [], refusalReason: 'NO_READ_PERMISSION' };
    }
  };

  const transformWithCeiba = async (knowledge: KnowledgeItem, request: TransformRequest) => {
    try {
      const art = await api<AILabArtifact>('POST', '/ai/transform', { ...request, knowledgeIds: [knowledge.id], id: nuevoId('art') });
      setAiArtifacts(prev => [art, ...prev.filter(a => a.id !== art.id)]);
      showToast('Material generado con apoyo de IA y guardado como borrador pendiente de revisión por la custodia.', 'info');
      setIsOnline(true);
      return { allowed: true, artifact: art };
    } catch (e) {
      if (e instanceof SinConexionError) {
        const local = ceibaService.transform(currentUser, knowledge, request);
        if (!local.allowed || !local.artifact) return { allowed: false, errorReason: local.errorReason };
        return { allowed: true, artifact: createAIArtifact(local.artifact) };
      }
      showToast((e as Error).message, 'error');
      return { allowed: false, errorReason: (e as Error).message };
    }
  };

  // ------------------------------------------------------------------
  // Bienestar (servicio aislado: nunca pasa por Ceiba)
  // ------------------------------------------------------------------
  const sendWellnessOrientation = async (description: string, channelId?: string): Promise<boolean> => {
    if (!exigirSesion()) return false;
    await confirmar('POST', '/wellness/orientations', { id: nuevoId('orient'), description, channelId }, 'Solicitud orientativa de bienestar');
    return true;
  };

  const runScenario = (scenarioNum: number) => {
    setActiveScenarioNumber(scenarioNum);
    switch (scenarioNum) {
      case 1: switchUser('user_member_sierra'); setSelectedKnowledgeIdForLab('know_01_terrazas'); setActiveScreen('ai_lab'); break;
      case 2: switchUser('user_visitor'); setActiveScreen('library'); break;
      case 3: switchUser('user_researcher'); setActiveScreen('upload'); break;
      case 4: switchUser('user_custodian_sierra'); setActiveScreen('custodian'); break;
      case 5: switchUser('user_custodian_sierra'); setSelectedKnowledgeIdForLab('know_07_acuerdos_internos'); setActiveScreen('ai_lab'); break;
      case 6: switchUser('user_member_pesca'); setActiveScreen('custodian'); break;
      case 7: setActiveScreen('dashboard'); break;
      default: break;
    }
  };

  return (
    <AlunaContext.Provider
      value={{
        currentUser,
        users,
        communities,
        knowledgeItems,
        accessRequests,
        affiliationRequests,
        aiArtifacts,
        wellnessItems,
        activeScreen,
        selectedCommunityId,
        selectedKnowledgeIdForLab,
        selectedKnowledgeForDetail,
        themeMode,
        toast,
        activeScenarioNumber,
        demoModeEnabled,
        isOnline,
        isAuthenticated: currentUser.id !== 'anon' && !!authToken,
        pendingSyncCount,
        authToken,
        refreshFromServer,
        switchUser,
        loginWithEmail,
        registerAccount,
        logout,
        enterAsVisitor,
        resetDemoData,
        setActiveScreen,
        setSelectedCommunityId,
        setSelectedKnowledgeIdForLab,
        setSelectedKnowledgeForDetail,
        toggleTheme,
        setThemeMode,
        showToast,
        canUserRead,
        canUserAccess: canUserRead,
        canUserProcessWithAI,
        canUserGenerateDerivatives,
        isUserCustodianOfCommunity,
        isUserVerifiedMemberOfCommunity,
        canUserReviewResource,
        requestAccess,
        approveAccessRequest,
        rejectAccessRequest,
        requestAffiliation,
        approveAffiliation,
        rejectAffiliation,
        proposeKnowledgeItem,
        approveKnowledgeItem,
        rejectKnowledgeItem,
        grantAIPermissionToKnowledge,
        revokeAIPermissionFromKnowledge,
        createAIArtifact,
        approveAIArtifact,
        rejectAIArtifact,
        askCeiba,
        transformWithCeiba,
        sendWellnessOrientation,
        runScenario
      }}
    >
      {children}
    </AlunaContext.Provider>
  );
};

export const useAluna = () => {
  const context = useContext(AlunaContext);
  if (!context) {
    throw new Error('useAluna debe usarse dentro de un AlunaProvider');
  }
  return context;
};
