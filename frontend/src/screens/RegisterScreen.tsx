import React, { useEffect, useState } from 'react';
import { useAluna } from '../context/AlunaContext';
import { ParticipationIdentity } from '../types';
import { 
  GraduationCap, 
  Eye, 
  Building2, 
  Flower2, 
  Clock
} from 'lucide-react';

/**
 * Brave se cierra por completo al enviar este formulario cuando su gestor de contraseñas
 * intenta ofrecer «guardar contraseña» (fallo del navegador, no de la página). Solo en Brave,
 * el campo se muestra igual (puntos), pero no es de tipo «password», así que Brave no interviene.
 * En los demás navegadores se usa el campo de contraseña normal.
 */
const esBrave = () => typeof navigator !== 'undefined' && 'brave' in navigator;

export const RegisterScreen: React.FC = () => {
  const { communities, registerAccount, setActiveScreen, showToast } = useAluna();
  const ES_BRAVE = esBrave();

  const [selectedIdentity, setSelectedIdentity] = useState<ParticipationIdentity>('community_member');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCommunityId, setSelectedCommunityId] = useState(communities[0].id);
  const [rationale, setRationale] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lento, setLento] = useState(false);

  // El servidor gratuito puede tardar en despertar: se avisa para que nadie cierre la página
  useEffect(() => {
    if (!enviando) { setLento(false); return; }
    const t = setTimeout(() => setLento(true), 4000);
    return () => clearTimeout(t);
  }, [enviando]);

  const roleOptions: {
    identity: ParticipationIdentity;
    title: string;
    description: string;
    icon: React.ReactNode;
    requiresAffiliation: boolean;
  }[] = [
    {
      identity: 'community_member',
      title: 'Integrante Comunitario',
      description: 'Persona perteneciente a un pueblo o territorio que desea registrar memorias y participar en sus espacios.',
      icon: <Flower2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      requiresAffiliation: true
    },
    {
      identity: 'visitor',
      title: 'Visitante General',
      description: 'Persona interesada en consultar relatos, memorias y materiales culturales autorizados para consulta pública.',
      icon: <Eye className="w-5 h-5 text-[#004B87] dark:text-sky-400" />,
      requiresAffiliation: false
    },
    {
      identity: 'researcher',
      title: 'Investigador o Académico',
      description: 'Persona de una institución que investiga con rigor ético y tramita solicitudes formales de acceso.',
      icon: <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      requiresAffiliation: false
    },
    {
      identity: 'org_representative',
      title: 'Representante de Organización',
      description: 'Persona vinculada a entidades públicas, ONGs o proyectos interinstitucionales aliados.',
      icon: <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      requiresAffiliation: false
    }
  ];

  // POST /api/v1/auth/register · la filiación comunitaria nunca se auto-verifica:
  // queda pendiente hasta que la custodia de esa comunidad la valide.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name || !email || !password) {
      showToast('Por favor completa todos los campos requeridos.', 'warning');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    const esIntegrante = selectedIdentity === 'community_member';
    setEnviando(true);
    const res = await registerAccount({
      name,
      email,
      password,
      identity: selectedIdentity,
      organization: organization || undefined,
      communityId: esIntegrante ? selectedCommunityId : undefined,
      rationale: esIntegrante ? rationale || 'Solicitud de vinculación comunitaria.' : undefined
    });
    setEnviando(false);
    if (!res.ok) {
      setErrorMsg(res.error || 'No se pudo crear la cuenta.');
      return;
    }
    if (esIntegrante) {
      setIsSuccess(true);
    } else {
      showToast(`Cuenta creada. Bienvenido(a) a ALUNA, ${name.split(' ')[0]}.`, 'success');
      setActiveScreen('dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-[#005A8D] dark:text-aluna-cyan">
          Registro e Identidad Intercultural
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">
          ¿Cómo deseas participar en ALUNA?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Las identidades describen tu intención de participación, pero <strong className="text-[#06233B] dark:text-white">no otorgan automáticamente permisos reservados</strong>. La pertenencia comunitaria requiere validación del custodio territorial.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-white dark:bg-[#0D212E] rounded-3xl p-8 border border-slate-200 dark:border-[#1E3E54] shadow-sm text-center space-y-5 animate-fade-in max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#06233B] dark:text-white">
            Solicitud de Vinculación Enviada
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Tu petición para vincularte a <strong className="text-[#06233B] dark:text-white">{communities.find(c => c.id === selectedCommunityId)?.name}</strong> quedó registrada y ya tienes tu cuenta activa. La custodia de esa comunidad revisará tu vinculación; mientras tanto puedes consultar los saberes públicos.
          </p>
          <button
            onClick={() => setActiveScreen('dashboard')}
            className="px-6 py-2.5 rounded-full bg-[#004B87] hover:bg-[#003865] text-white font-bold text-xs shadow-sm transition-colors"
          >
            Ir al Panel Principal
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0D212E] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-[#1E3E54] shadow-sm space-y-8">
          
          {/* Identity Selection Cards */}
          <div className="space-y-3">
            <label className="font-bold text-sm text-[#06233B] dark:text-white block">
              Selecciona tu identidad de participación:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roleOptions.map((opt) => (
                <div
                  key={opt.identity}
                  onClick={() => setSelectedIdentity(opt.identity)}
                  className={`p-4 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedIdentity === opt.identity
                      ? 'bg-sky-50 dark:bg-[#132C3E] border-[#004B87] dark:border-aluna-cyan text-[#06233B] dark:text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-[#0A1924] border-slate-200 dark:border-[#1E3E54] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54]">
                      {opt.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#06233B] dark:text-white">{opt.title}</h4>
                      {opt.requiresAffiliation && (
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">Requiere validación comunitaria</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200">Nombre completo:</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ejemplo: Laura Gómez"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200">Correo institucional o de contacto:</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@unimagdalena.edu.co"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200">Contraseña (mínimo 8 caracteres):</label>
              <input
                type={ES_BRAVE ? 'text' : 'password'}
                style={ES_BRAVE ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
                name={ES_BRAVE ? 'clave-registro-aluna' : 'new-password'}
                required
                minLength={8}
                autoComplete={ES_BRAVE ? 'off' : 'new-password'}
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#06233B] dark:text-slate-200">Organización (opcional):</label>
              <input
                type="text"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                placeholder="Ejemplo: UNIMAGDALENA · Semillero"
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Community selection if member */}
          {selectedIdentity === 'community_member' && (
            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0A1924] border border-slate-200 dark:border-[#1E3E54] text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#06233B] dark:text-white">Comunidad territorial con la que te identificas:</label>
                <select
                  value={selectedCommunityId}
                  onChange={e => setSelectedCommunityId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-white dark:bg-[#0D212E] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87]"
                >
                  {communities.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.region})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#06233B] dark:text-white">Fundamento del vínculo:</label>
                <textarea
                  rows={2}
                  value={rationale}
                  onChange={e => setRationale(e.target.value)}
                  placeholder="Describe brevemente tu relación o pertenencia con la comunidad..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-white dark:bg-[#0D212E] text-[#06233B] dark:text-white outline-none focus:ring-2 focus:ring-[#004B87] placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 font-medium text-xs">
              {errorMsg}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={enviando}
              className="px-8 py-3 rounded-full bg-[#004B87] hover:bg-[#003865] disabled:opacity-60 text-white font-bold text-xs shadow-sm transition-colors"
            >
              {enviando ? 'Creando cuenta…' : 'Completar Registro'}
            </button>
          </div>
          {lento && (
            <p role="status" className="text-[11px] text-right text-amber-800 dark:text-amber-300">
              El servidor se está activando (puede tardar hasta un minuto la primera vez). No cierres la página.
            </p>
          )}

        </form>
      )}

    </div>
  );
};
