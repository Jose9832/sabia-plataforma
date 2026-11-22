import React, { useState } from 'react';
import { useAluna } from '../context/AlunaContext';
import { KnowledgeItem } from '../types';
import { KnowledgeCard } from '../components/common/KnowledgeCard';
import { 
  Search, 
  BookOpen, 
  RotateCcw
} from 'lucide-react';

interface LibraryScreenProps {
  onOpenKnowledge: (k: KnowledgeItem) => void;
  onRequestAccess: (k: KnowledgeItem) => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  onOpenKnowledge,
  onRequestAccess
}) => {
  const { 
    knowledgeItems, 
    communities, 
    currentUser, 
    canUserRead 
  } = useAluna();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [selectedAccessFilter, setSelectedAccessFilter] = useState<string>('all');

  // Filter logic
  const filteredItems = knowledgeItems.filter(item => {
    // Only approved items appear in library, or items authored by current user
    if (item.status !== 'approved' && item.authorUserId !== currentUser.id) {
      return false;
    }

    // Search query
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    // Type filter
    const matchesType = selectedType === 'all' || item.type === selectedType;

    // Community filter
    const matchesComm = selectedCommunity === 'all' || item.communityIds.includes(selectedCommunity);

    // Access Level / Permissions filter
    let matchesAccess = true;
    if (selectedAccessFilter === 'public') {
      matchesAccess = item.permissions.consultation === 'public';
    } else if (selectedAccessFilter === 'community') {
      matchesAccess = item.permissions.consultation === 'community';
    } else if (selectedAccessFilter === 'restricted') {
      matchesAccess = item.permissions.consultation === 'restricted';
    } else if (selectedAccessFilter === 'my_authorized') {
      matchesAccess = canUserRead(item).allowed;
    }

    return matchesSearch && matchesType && matchesComm && matchesAccess;
  });

  const accessibleCount = filteredItems.filter(i => canUserRead(i).allowed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#005A8D] dark:text-aluna-cyan">
              Memoria y Archivo Comunitario
            </span>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#06233B] dark:text-white">
              Biblioteca de Saberes y Prácticas
            </h1>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0D212E] border border-slate-200 dark:border-[#1E3E54] text-xs shadow-sm">
            <span className="text-slate-500 dark:text-slate-400">Consultando como:</span>
            <strong className="text-[#06233B] dark:text-white">{currentUser.name}</strong>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-aluna-cyan/15 text-[#004B87] dark:text-aluna-cyan border border-sky-200 dark:border-aluna-cyan/30">
              {currentUser.roleLabel}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Explora relatos, grabaciones de audio, memorias fluviales y documentos protegidos. El acceso a cada archivo está condicionado por las directrices acordadas por sus custodios territoriales.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#0D212E] p-5 rounded-3xl border border-slate-200/90 dark:border-[#1E3E54] shadow-sm space-y-4">
        
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, temática, autoría o palabras clave (ej. terrazas, pesca, boga, semillas)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-16 py-3 rounded-2xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#004B87] dark:focus:ring-aluna-cyan placeholder:text-slate-400 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#004B87] dark:text-aluna-cyan hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          {/* Filter by Type */}
          <div className="space-y-1">
            <label className="font-bold text-[#06233B] dark:text-slate-200 block text-[11px]">
              Formato o tipo:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#004B87]"
            >
              <option value="all">Todos los formatos</option>
              <option value="relato">Relato</option>
              <option value="audio">Audio y Testimonio</option>
              <option value="practica">Práctica Comunitaria</option>
              <option value="documento">Documento / Bitácora</option>
              <option value="video">Video</option>
              <option value="fotografia">Fotografía</option>
            </select>
          </div>

          {/* Filter by Community */}
          <div className="space-y-1">
            <label className="font-bold text-[#06233B] dark:text-slate-200 block text-[11px]">
              Comunidad de origen:
            </label>
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#004B87]"
            >
              <option value="all">Todas las comunidades</option>
              {communities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Access */}
          <div className="space-y-1">
            <label className="font-bold text-[#06233B] dark:text-slate-200 block text-[11px]">
              Nivel de acceso:
            </label>
            <select
              value={selectedAccessFilter}
              onChange={(e) => setSelectedAccessFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-[#1E3E54] bg-slate-50 dark:bg-[#0A1924] text-[#06233B] dark:text-white font-medium outline-none focus:ring-2 focus:ring-[#004B87]"
            >
              <option value="all">Todos los niveles</option>
              <option value="my_authorized">Solo autorizados para mí ({currentUser.name})</option>
              <option value="public">Público general</option>
              <option value="community">Solo integrantes de comunidad</option>
              <option value="restricted">Custodia restringida</option>
            </select>
          </div>

        </div>

      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
        <span>
          Mostrando <strong className="text-[#06233B] dark:text-white">{filteredItems.length}</strong> saberes (<span className="text-[#004B87] dark:text-aluna-cyan font-bold">{accessibleCount}</span> disponibles para tu rol).
        </span>

        {(searchTerm || selectedType !== 'all' || selectedCommunity !== 'all' || selectedAccessFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
              setSelectedCommunity('all');
              setSelectedAccessFilter('all');
            }}
            className="flex items-center gap-1 font-bold text-[#004B87] dark:text-aluna-cyan hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer filtros</span>
          </button>
        )}
      </div>

      {/* Grid of Knowledge Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-[#0D212E] rounded-3xl p-12 text-center border border-slate-200 dark:border-[#1E3E54] space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#06233B] dark:text-white">
            No se encontraron saberes con estos criterios
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Prueba ajustando los términos de búsqueda o cambiando el selector de usuario en la barra superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <KnowledgeCard
              key={item.id}
              knowledge={item}
              onOpen={onOpenKnowledge}
              onRequestAccess={onRequestAccess}
            />
          ))}
        </div>
      )}

    </div>
  );
};
