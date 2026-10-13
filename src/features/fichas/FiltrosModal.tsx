import React from 'react';
import { useGuiaStore } from '../../store/useGuiaStore';
import { Filter, X, Check, RotateCcw } from 'lucide-react';
import { Prioridade } from '../../types';

export const FiltrosModal: React.FC = () => {
  const {
    fichas,
    filtros,
    setFiltros,
    limparFiltros,
    modalFiltrosAberto,
    setModalFiltros,
  } = useGuiaStore();

  if (!modalFiltrosAberto) return null;

  const fichasAtivas = fichas.filter((f) => !f.descartada);

  // Contagens
  const countAlta = fichasAtivas.filter((f) => f.prioridade === 'Alta').length;
  const countMedia = fichasAtivas.filter((f) => f.prioridade === 'Média').length;
  const countBaixa = fichasAtivas.filter((f) => f.prioridade === 'Baixa').length;

  const nichosDisponiveis = Array.from(new Set(fichasAtivas.map((f) => f.nicho).filter(Boolean)));
  const bairrosDisponiveis = Array.from(new Set(fichasAtivas.map((f) => f.bairro).filter(Boolean)));

  const togglePrioridade = (p: Prioridade) => {
    const atual = filtros.prioridades;
    const nova = atual.includes(p) ? atual.filter((item) => item !== p) : [...atual, p];
    setFiltros({ prioridades: nova });
  };

  const toggleNicho = (n: string) => {
    const atual = filtros.nichos;
    const nova = atual.includes(n) ? atual.filter((item) => item !== n) : [...atual, n];
    setFiltros({ nichos: nova });
  };

  const toggleBairro = (b: string) => {
    const atual = filtros.bairros;
    const nova = atual.includes(b) ? atual.filter((item) => item !== b) : [...atual, b];
    setFiltros({ bairros: nova });
  };

  // Contagem de filtros ativos
  let totalAtivos = 0;
  if (filtros.prioridades.length > 0) totalAtivos += filtros.prioridades.length;
  if (filtros.nichos.length > 0) totalAtivos += filtros.nichos.length;
  if (filtros.bairros.length > 0) totalAtivos += filtros.bairros.length;
  if (filtros.apenasSemAnuncios) totalAtivos += 1;
  if (filtros.apenasMetaAds) totalAtivos += 1;
  if (filtros.apenasGoogleAds) totalAtivos += 1;
  if (filtros.apenasSemSite) totalAtivos += 1;
  if (filtros.apenasComWhats) totalAtivos += 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Filtros Investigativos"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
    >
      <div className="w-full max-w-lg bg-[#EBDCC6] dark:bg-[#282520] border-t-2 sm:border-2 border-[#1B1A17] dark:border-[#EDE5D6] shadow-[0px_-6px_0px_#1B1A17] sm:hard-shadow-lg max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
        {/* Aba da pasta com Picote e Indicador */}
        <div className="bg-[#DFCCB2] dark:bg-[#332F28] px-4 py-2.5 border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#1B1A17] dark:text-[#EDE5D6]" strokeWidth={2.5} />
            <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-wider text-[#1B1A17] dark:text-[#EDE5D6]">
              FILTROS INVESTIGATIVOS
            </span>
            {totalAtivos > 0 && (
              <span className="bg-[#E8431F] text-white font-mono text-[9px] px-1.5 py-0.2 font-bold border border-[#1B1A17]">
                {totalAtivos} ATIVOS
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {totalAtivos > 0 && (
              <button
                onClick={limparFiltros}
                className="font-mono text-[10px] uppercase font-bold text-[#1B1A17] dark:text-[#EDE5D6] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            )}
            <button
              onClick={() => setModalFiltros(false)}
              className="font-mono text-xs font-bold text-[#1B1A17] dark:text-[#EDE5D6] uppercase border border-[#1B1A17] px-2 py-0.5 bg-[#FDF9F3] dark:bg-[#1E1C19] hard-shadow-sm flex items-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5 mr-0.5" />
              <span>FECHAR</span>
            </button>
          </div>
        </div>

        {/* Conteúdo da Gaveta com Rolagem */}
        <div className="p-4 space-y-4 overflow-y-auto bg-[#EFE3D0] dark:bg-[#201D1A]">
          {/* 01. CLASSIFICAÇÃO DE PRIORIDADE */}
          <div>
            <label className="font-mono text-[10px] text-[#1B1A17] dark:text-[#EDE5D6] font-bold uppercase tracking-wider block mb-1.5">
              [01 // CLASSIFICAÇÃO DE PRIORIDADE]
            </label>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setFiltros({ prioridades: [] })}
                className={`px-2.5 py-1 border border-[#1B1A17] cursor-pointer ${
                  filtros.prioridades.length === 0
                    ? 'bg-[#1B1A17] text-[#FDF9F3] font-bold'
                    : 'bg-[#FDF9F3] text-[#1B1A17] hover:bg-[#E8DFC8]'
                }`}
              >
                ■ Todos
              </button>

              <button
                type="button"
                onClick={() => togglePrioridade('Alta')}
                className={`px-2.5 py-1 border-2 border-[#1B1A17] font-bold cursor-pointer flex items-center gap-1 ${
                  filtros.prioridades.includes('Alta')
                    ? 'bg-[#E8431F] text-white hard-shadow-sm'
                    : 'bg-[#FDF9F3] text-[#E8431F]'
                }`}
              >
                ALTA ({countAlta}) {filtros.prioridades.includes('Alta') && '✓'}
              </button>

              <button
                type="button"
                onClick={() => togglePrioridade('Média')}
                className={`px-2.5 py-1 border border-[#1B1A17] font-bold cursor-pointer flex items-center gap-1 ${
                  filtros.prioridades.includes('Média')
                    ? 'bg-[#D9A21B] text-[#1B1A17] hard-shadow-sm'
                    : 'bg-[#FDF9F3] text-[#1B1A17]'
                }`}
              >
                MÉDIA ({countMedia}) {filtros.prioridades.includes('Média') && '✓'}
              </button>

              <button
                type="button"
                onClick={() => togglePrioridade('Baixa')}
                className={`px-2.5 py-1 border border-[#1B1A17] font-medium cursor-pointer flex items-center gap-1 ${
                  filtros.prioridades.includes('Baixa')
                    ? 'bg-[#1B1A17] text-white hard-shadow-sm'
                    : 'bg-[#FDF9F3] text-[#1B1A17]'
                }`}
              >
                BAIXA ({countBaixa}) {filtros.prioridades.includes('Baixa') && '✓'}
              </button>
            </div>
          </div>

          {/* 02. ATIVIDADE PUBLICITÁRIA */}
          <div>
            <label className="font-mono text-[10px] text-[#1B1A17] dark:text-[#EDE5D6] font-bold uppercase tracking-wider block mb-1.5">
              [02 // ATIVIDADE PUBLICITÁRIA]
            </label>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setFiltros({ apenasSemAnuncios: !filtros.apenasSemAnuncios })}
                className={`px-2.5 py-1 border-2 border-[#1B1A17] font-bold cursor-pointer ${
                  filtros.apenasSemAnuncios
                    ? 'bg-[#1B1A17] text-[#FDF9F3] hard-shadow-sm'
                    : 'bg-[#FDF9F3] text-[#1B1A17]'
                }`}
              >
                Sem Anúncios Ativos {filtros.apenasSemAnuncios && '✓'}
              </button>

              <button
                type="button"
                onClick={() => setFiltros({ apenasMetaAds: !filtros.apenasMetaAds })}
                className={`px-2.5 py-1 border border-[#1B1A17] cursor-pointer ${
                  filtros.apenasMetaAds
                    ? 'bg-[#2F4A3A] text-white font-bold hard-shadow-sm'
                    : 'bg-[#FDF9F3] text-[#1B1A17]'
                }`}
              >
                Apenas Meta Ads {filtros.apenasMetaAds && '✓'}
              </button>

              <button
                type="button"
                onClick={() => setFiltros({ apenasGoogleAds: !filtros.apenasGoogleAds })}
                className={`px-2.5 py-1 border border-[#1B1A17] cursor-pointer ${
                  filtros.apenasGoogleAds
                    ? 'bg-[#2F4A3A] text-white font-bold hard-shadow-sm'
                    : 'bg-[#FDF9F3] text-[#1B1A17]'
                }`}
              >
                Apenas Google Ads {filtros.apenasGoogleAds && '✓'}
              </button>

              <button
                type="button"
                onClick={() => setFiltros({ apenasSemSite: !filtros.apenasSemSite })}
                className={`px-2.5 py-1 border border-[#1B1A17] cursor-pointer ${
                  filtros.apenasSemSite
                    ? 'bg-[#E8431F] text-white font-bold hard-shadow-sm'
                    : 'bg-[#FDF9F3] text-[#1B1A17]'
                }`}
              >
                Sem Site Oficial {filtros.apenasSemSite && '✓'}
              </button>
            </div>
          </div>

          {/* 03. SEGMENTO ECONÔMICO (NICHO) */}
          <div>
            <label className="font-mono text-[10px] text-[#1B1A17] dark:text-[#EDE5D6] font-bold uppercase tracking-wider block mb-1.5">
              [03 // SEGMENTO ECONÔMICO]
            </label>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {nichosDisponiveis.map((nicho) => {
                const ativo = filtros.nichos.includes(nicho);
                const qtd = fichasAtivas.filter((f) => f.nicho === nicho).length;
                return (
                  <button
                    key={nicho}
                    type="button"
                    onClick={() => toggleNicho(nicho)}
                    className={`px-2 py-1 border border-[#1B1A17] cursor-pointer ${
                      ativo
                        ? 'bg-[#D9A21B] text-[#1B1A17] font-bold hard-shadow-sm'
                        : 'bg-[#FDF9F3] text-[#1B1A17] hover:bg-[#E8DFC8]'
                    }`}
                  >
                    {nicho} ({qtd}) {ativo && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 04. PERÍMETRO / BAIRRO */}
          <div>
            <label className="font-mono text-[10px] text-[#1B1A17] dark:text-[#EDE5D6] font-bold uppercase tracking-wider block mb-1.5">
              [04 // PERÍMETRO / BAIRRO]
            </label>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {bairrosDisponiveis.map((bairro) => {
                const ativo = filtros.bairros.includes(bairro);
                const qtd = fichasAtivas.filter((f) => f.bairro === bairro).length;
                return (
                  <button
                    key={bairro}
                    type="button"
                    onClick={() => toggleBairro(bairro)}
                    className={`px-2 py-1 border border-[#1B1A17] cursor-pointer ${
                      ativo
                        ? 'bg-[#1B1A17] text-white font-bold hard-shadow-sm'
                        : 'bg-[#FDF9F3] text-[#1B1A17] hover:bg-[#E8DFC8]'
                    }`}
                  >
                    {bairro} ({qtd}) {ativo && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rodapé com botão principal */}
        <div className="p-3 bg-[#DFCCB2] dark:bg-[#332F28] border-t-2 border-[#1B1A17] dark:border-[#EDE5D6] shrink-0">
          <button
            onClick={() => setModalFiltros(false)}
            className="w-full bg-[#E8431F] text-white py-2.5 px-3 border-2 border-[#1B1A17] font-mono text-xs font-bold uppercase tracking-wider hard-shadow active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>
              {totalAtivos > 0
                ? `APLICAR ${totalAtivos} FILTROS SELECIONADOS`
                : 'FECHAR E VER RESULTADOS'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
