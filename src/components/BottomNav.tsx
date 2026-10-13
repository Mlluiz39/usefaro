import React from 'react';
import { useGuiaStore } from '../store/useGuiaStore';
import { Archive, Filter, Bookmark, Upload } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    abaMobile,
    setAbaMobile,
    setModalImportacao,
    setModalFiltros,
    filtros,
    fichas,
    selecionarFicha,
  } = useGuiaStore();

  const totalSeparadas = fichas.filter((f) => f.separada && !f.descartada).length;

  // Contagem de filtros ativos
  let totalFiltrosAtivos = 0;
  if (filtros.prioridades.length > 0) totalFiltrosAtivos += filtros.prioridades.length;
  if (filtros.nichos.length > 0) totalFiltrosAtivos += filtros.nichos.length;
  if (filtros.bairros.length > 0) totalFiltrosAtivos += filtros.bairros.length;
  if (filtros.apenasSemAnuncios) totalFiltrosAtivos += 1;
  if (filtros.apenasMetaAds) totalFiltrosAtivos += 1;
  if (filtros.apenasGoogleAds) totalFiltrosAtivos += 1;
  if (filtros.busca) totalFiltrosAtivos += 1;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-[#F8F3ED] dark:bg-[#1E1C19] border-t-2 border-[#1B1A17] dark:border-[#EDE5D6] shadow-[0px_-3px_0px_#1B1A17] flex justify-around items-center px-2 py-1"
      aria-label="Navegação móvel"
    >
      {/* 1. Fichas */}
      <button
        onClick={() => {
          setAbaMobile('fichas');
          selecionarFicha(null);
        }}
        className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center transition-none ${
          abaMobile === 'fichas'
            ? 'bg-[#E8431F] text-white border border-[#1B1A17] shadow-[2px_2px_0px_#1B1A17]'
            : 'text-[#1B1A17] dark:text-[#EDE5D6] hover:bg-[#E8DFC8]'
        }`}
      >
        <Archive className="w-5 h-5" strokeWidth={2.5} />
        <span className="font-mono text-[10px] uppercase font-bold tracking-wider mt-0.5">
          Fichas
        </span>
      </button>

      {/* 2. Filtros */}
      <button
        onClick={() => {
          setAbaMobile('filtros');
          setModalFiltros(true);
        }}
        className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center relative transition-none ${
          abaMobile === 'filtros'
            ? 'bg-[#E8431F] text-white border border-[#1B1A17] shadow-[2px_2px_0px_#1B1A17]'
            : 'text-[#1B1A17] dark:text-[#EDE5D6] hover:bg-[#E8DFC8]'
        }`}
      >
        <Filter className="w-5 h-5" strokeWidth={2.5} />
        <span className="font-mono text-[10px] uppercase font-bold tracking-wider mt-0.5">
          Filtros
        </span>
        {totalFiltrosAtivos > 0 && (
          <span className="absolute top-1 right-2 bg-[#D9A21B] text-[#1B1A17] font-mono text-[9px] font-bold px-1 rounded-none border border-[#1B1A17]">
            {totalFiltrosAtivos}
          </span>
        )}
      </button>

      {/* 3. Separadas (Caderno) */}
      <button
        onClick={() => {
          setAbaMobile('separadas');
          selecionarFicha(null);
        }}
        className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center relative transition-none ${
          abaMobile === 'separadas'
            ? 'bg-[#E8431F] text-white border border-[#1B1A17] shadow-[2px_2px_0px_#1B1A17]'
            : 'text-[#1B1A17] dark:text-[#EDE5D6] hover:bg-[#E8DFC8]'
        }`}
      >
        <Bookmark className="w-5 h-5" strokeWidth={2.5} />
        <span className="font-mono text-[10px] uppercase font-bold tracking-wider mt-0.5">
          Separadas
        </span>
        {totalSeparadas > 0 && (
          <span className="absolute top-1 right-2 bg-[#2F4A3A] text-white font-mono text-[9px] font-bold px-1 rounded-none border border-[#1B1A17]">
            {totalSeparadas}
          </span>
        )}
      </button>

      {/* 4. Importar */}
      <button
        onClick={() => {
          setAbaMobile('importar');
          setModalImportacao(true);
        }}
        className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center transition-none ${
          abaMobile === 'importar'
            ? 'bg-[#E8431F] text-white border border-[#1B1A17] shadow-[2px_2px_0px_#1B1A17]'
            : 'text-[#1B1A17] dark:text-[#EDE5D6] hover:bg-[#E8DFC8]'
        }`}
      >
        <Upload className="w-5 h-5" strokeWidth={2.5} />
        <span className="font-mono text-[10px] uppercase font-bold tracking-wider mt-0.5">
          Importar
        </span>
      </button>
    </nav>
  );
};
