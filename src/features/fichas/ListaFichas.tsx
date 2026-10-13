import React, { useMemo } from 'react';
import { useGuiaStore } from '../../store/useGuiaStore';
import { FichaCard } from './FichaCard';
import { Ficha, OrdenacaoTipo, TipoVisualizacao } from '../../types';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface Props {
  apenasSeparadas?: boolean;
}

export const ListaFichas: React.FC<Props> = ({ apenasSeparadas = false }) => {
  const {
    fichas,
    filtros,
    setFiltros,
    setModalFiltros,
    setModalImportacao,
  } = useGuiaStore();

  // Filtragem
  const fichasFiltradas = useMemo(() => {
    let resultado = fichas.filter((f) => !f.descartada);

    if (apenasSeparadas) {
      resultado = resultado.filter((f) => f.separada);
    }

    // Busca textual ampla: empresa, nicho, bairro, problemas
    if (filtros.busca && filtros.busca.trim().length > 0) {
      const q = filtros.busca
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      resultado = resultado.filter((f) => {
        const emp = f.empresa.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const nic = f.nicho.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const bai = f.bairro.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const prob = f.problemas
          .join(' ')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();

        return emp.includes(q) || nic.includes(q) || bai.includes(q) || prob.includes(q);
      });
    }

    // Prioridades
    if (filtros.prioridades.length > 0) {
      resultado = resultado.filter((f) => f.prioridade && filtros.prioridades.includes(f.prioridade));
    }

    // Nichos
    if (filtros.nichos.length > 0) {
      resultado = resultado.filter((f) => filtros.nichos.includes(f.nicho));
    }

    // Bairros
    if (filtros.bairros.length > 0) {
      resultado = resultado.filter((f) => filtros.bairros.includes(f.bairro));
    }

    // Anúncios
    if (filtros.apenasSemAnuncios) {
      resultado = resultado.filter((f) => !f.anunciosAtivos && !f.metaAds && !f.googleAds);
    }
    if (filtros.apenasMetaAds) {
      resultado = resultado.filter((f) => f.metaAds === true);
    }
    if (filtros.apenasGoogleAds) {
      resultado = resultado.filter((f) => f.googleAds === true);
    }

    // Site
    if (filtros.apenasSemSite) {
      resultado = resultado.filter((f) => !f.website || f.website.trim().length === 0);
    }

    // Ordenação
    resultado.sort((a, b) => {
      switch (filtros.ordenacao) {
        case 'pontuacao-asc':
          return (a.pontuacao || 0) - (b.pontuacao || 0);
        case 'nota-desc':
          return (b.notaGoogle || 0) - (a.notaGoogle || 0);
        case 'avaliacoes-desc':
          return (b.avaliacoes || 0) - (a.avaliacoes || 0);
        case 'nome-asc':
          return a.empresa.localeCompare(b.empresa);
        case 'pontuacao-desc':
        default:
          return (b.pontuacao || 0) - (a.pontuacao || 0);
      }
    });

    return resultado;
  }, [fichas, filtros, apenasSeparadas]);

  // Agrupamento por bairro para visualização 'bairros'
  const gruposPorBairro = useMemo(() => {
    const mapa = new Map<string, Ficha[]>();
    fichasFiltradas.forEach((f) => {
      const b = f.bairro || 'Sem Bairro';
      if (!mapa.has(b)) mapa.set(b, []);
      mapa.get(b)!.push(f);
    });
    return Array.from(mapa.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [fichasFiltradas]);

  // Chips de filtros ativos
  const chipsAtivos = useMemo(() => {
    const lista: { chave: string; label: string; onRemover: () => void }[] = [];

    filtros.prioridades.forEach((p) => {
      lista.push({
        chave: `prio-${p}`,
        label: `Prioridade: ${p}`,
        onRemover: () =>
          setFiltros({
            prioridades: filtros.prioridades.filter((item) => item !== p),
          }),
      });
    });

    filtros.nichos.forEach((n) => {
      lista.push({
        chave: `nicho-${n}`,
        label: `Nicho: ${n}`,
        onRemover: () =>
          setFiltros({
            nichos: filtros.nichos.filter((item) => item !== n),
          }),
      });
    });

    filtros.bairros.forEach((b) => {
      lista.push({
        chave: `bairro-${b}`,
        label: `Bairro: ${b}`,
        onRemover: () =>
          setFiltros({
            bairros: filtros.bairros.filter((item) => item !== b),
          }),
      });
    });

    if (filtros.apenasSemAnuncios) {
      lista.push({
        chave: 'sem-anuncios',
        label: 'Sem Anúncios',
        onRemover: () => setFiltros({ apenasSemAnuncios: false }),
      });
    }

    if (filtros.apenasMetaAds) {
      lista.push({
        chave: 'meta-ads',
        label: 'Com Meta Ads',
        onRemover: () => setFiltros({ apenasMetaAds: false }),
      });
    }

    if (filtros.apenasGoogleAds) {
      lista.push({
        chave: 'google-ads',
        label: 'Com Google Ads',
        onRemover: () => setFiltros({ apenasGoogleAds: false }),
      });
    }

    if (filtros.apenasSemSite) {
      lista.push({
        chave: 'sem-site',
        label: 'Sem Site',
        onRemover: () => setFiltros({ apenasSemSite: false }),
      });
    }

    return lista;
  }, [filtros, setFiltros]);

  return (
    <div className="space-y-4 font-mono">
      {/* BARRA DE CONTROLE & BUSCA */}
      <section className="bg-[#F8F3ED] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-3 md:p-4 hard-shadow">
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="font-bold text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 uppercase tracking-widest">
            {apenasSeparadas ? '[CADERNO DE SEPARADAS]' : '[EXPEDIENTE INVESTIGATIVO]'}
          </span>
          <span className="font-bold text-[#E8431F]">
            {fichasFiltradas.length} FICHAS {apenasSeparadas ? 'SEPARADAS' : 'ENCONTRADAS'}
          </span>
        </div>

        {/* Input de busca pautado */}
        <div className="relative mb-3">
          <div className="flex items-center border-b-2 border-dashed border-[#1B1A17] pb-1 px-1 bg-[#FDF9F3] dark:bg-[#1E1C19]">
            <Search className="w-4 h-4 text-[#1B1A17]/60 ml-1 mr-2 shrink-0" strokeWidth={2.5} />
            <input
              type="text"
              value={filtros.busca}
              onChange={(e) => setFiltros({ busca: e.target.value })}
              placeholder="Buscar empresa, rua, nicho ou gargalo..."
              className="w-full bg-transparent border-0 p-0 text-xs md:text-sm text-[#1B1A17] dark:text-[#EDE5D6] placeholder:text-[#1B1A17]/40 outline-none"
            />
            {filtros.busca && (
              <button
                onClick={() => setFiltros({ busca: '' })}
                className="text-[#1B1A17]/60 hover:text-[#1B1A17] p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Alternador de visualização & Botão de Filtros */}
        <div className="flex flex-wrap justify-between items-center gap-2 pt-1 border-t border-[#1B1A17]/20">
          {/* Abas datilografadas */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setFiltros({ visualizacao: 'fichas' })}
              className={`px-2.5 py-1.5 border-2 border-[#1B1A17] font-bold uppercase transition-none cursor-pointer flex items-center gap-1 ${
                filtros.visualizacao === 'fichas'
                  ? 'bg-[#E8431F] text-white hard-shadow-sm'
                  : 'bg-[#FDF9F3] text-[#1B1A17] hover:bg-[#E8DFC8]'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Fichas</span>
            </button>

            <button
              onClick={() => setFiltros({ visualizacao: 'compacta' })}
              className={`px-2.5 py-1.5 border-2 border-[#1B1A17] font-bold uppercase transition-none cursor-pointer flex items-center gap-1 ${
                filtros.visualizacao === 'compacta'
                  ? 'bg-[#E8431F] text-white hard-shadow-sm'
                  : 'bg-[#FDF9F3] text-[#1B1A17] hover:bg-[#E8DFC8]'
              }`}
            >
              <List className="w-3 h-3" />
              <span>Compacta</span>
            </button>

            <button
              onClick={() => setFiltros({ visualizacao: 'bairros' })}
              className={`px-2.5 py-1.5 border-2 border-[#1B1A17] font-bold uppercase transition-none cursor-pointer flex items-center gap-1 ${
                filtros.visualizacao === 'bairros'
                  ? 'bg-[#E8431F] text-white hard-shadow-sm'
                  : 'bg-[#FDF9F3] text-[#1B1A17] hover:bg-[#E8DFC8]'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Bairros</span>
            </button>
          </div>

          {/* Ordenação e Filtro Modal */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalFiltros(true)}
              className="px-2.5 py-1.5 bg-[#E8DFC8] dark:bg-[#332F28] border-2 border-[#1B1A17] font-bold uppercase text-[11px] hard-shadow-sm flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#E8431F]" />
              <span>Filtros</span>
              {chipsAtivos.length > 0 && (
                <span className="bg-[#E8431F] text-white px-1 text-[9px]">
                  {chipsAtivos.length}
                </span>
              )}
            </button>

            {/* Ordenação */}
            <div className="relative inline-block">
              <select
                value={filtros.ordenacao}
                onChange={(e) => setFiltros({ ordenacao: e.target.value as OrdenacaoTipo })}
                className="bg-[#FDF9F3] dark:bg-[#1E1C19] border-2 border-[#1B1A17] px-2 py-1 text-[11px] font-bold uppercase text-[#1B1A17] dark:text-[#EDE5D6] outline-none cursor-pointer"
              >
                <option value="pontuacao-desc">Maior Pontuação</option>
                <option value="pontuacao-asc">Menor Pontuação</option>
                <option value="nota-desc">Maior Nota Google</option>
                <option value="avaliacoes-desc">Mais Avaliações</option>
                <option value="nome-asc">Nome (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chips de filtros aplicados */}
        {chipsAtivos.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2.5 mt-2.5 border-t border-[#1B1A17]/20 text-[10px]">
            <span className="text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 font-bold self-center">
              FILTROS ATIVOS:
            </span>
            {chipsAtivos.map((chip) => (
              <span
                key={chip.chave}
                className="bg-[#FDF9F3] dark:bg-[#1E1C19] border border-[#1B1A17] px-2 py-0.5 flex items-center gap-1 font-semibold text-[#1B1A17] dark:text-[#EDE5D6] hard-shadow-sm"
              >
                <span>{chip.label}</span>
                <button
                  onClick={chip.onRemover}
                  className="hover:text-[#E8431F] cursor-pointer ml-0.5"
                  aria-label={`Remover filtro ${chip.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() =>
                setFiltros({
                  prioridades: [],
                  nichos: [],
                  bairros: [],
                  apenasSemAnuncios: false,
                  apenasMetaAds: false,
                  apenasGoogleAds: false,
                  apenasSemSite: false,
                })
              }
              className="text-[#E8431F] underline text-[10px] font-bold self-center ml-1 cursor-pointer"
            >
              Limpar todos
            </button>
          </div>
        )}
      </section>

      {/* ESTADO VAZIO */}
      {fichasFiltradas.length === 0 && (
        <div className="border-2 border-dashed border-[#1B1A17] p-8 text-center space-y-3 bg-[#FDF9F3] dark:bg-[#282520]">
          <div className="w-12 h-12 bg-[#E8DFC8] border-2 border-[#1B1A17] mx-auto flex items-center justify-center hard-shadow-sm">
            <Filter className="w-6 h-6 text-[#E8431F]" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1B1A17] dark:text-[#EDE5D6]">
            Nenhuma ficha encontrada com esses critérios
          </h3>
          <p className="text-xs text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 max-w-sm mx-auto">
            Tente remover alguns filtros ou limpar o termo de busca para visualizar as fichas do caderno.
          </p>

          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() =>
                setFiltros({
                  busca: '',
                  prioridades: [],
                  nichos: [],
                  bairros: [],
                  apenasSemAnuncios: false,
                  apenasMetaAds: false,
                  apenasGoogleAds: false,
                  apenasSemSite: false,
                })
              }
              className="bg-[#1B1A17] text-white border-2 border-[#1B1A17] px-4 py-2 font-mono text-xs font-bold uppercase hard-shadow-sm cursor-pointer"
            >
              Limpar Filtros de Busca
            </button>

            {fichas.length === 0 && (
              <button
                onClick={() => setModalImportacao(true)}
                className="bg-[#D9A21B] text-[#1B1A17] border-2 border-[#1B1A17] px-4 py-2 font-mono text-xs font-bold uppercase hard-shadow-sm cursor-pointer"
              >
                Importar Planilha
              </button>
            )}
          </div>
        </div>
      )}

      {/* VISUALIZAÇÃO 1: FICHAS EM CARTÃO */}
      {fichasFiltradas.length > 0 && filtros.visualizacao === 'fichas' && (
        <div className="space-y-4">
          {fichasFiltradas.map((ficha, index) => (
            <FichaCard
              key={ficha.id}
              ficha={ficha}
              numeroFicha={index + 1}
            />
          ))}
        </div>
      )}

      {/* VISUALIZAÇÃO 2: LISTA COMPACTA */}
      {fichasFiltradas.length > 0 && filtros.visualizacao === 'compacta' && (
        <div className="space-y-2">
          {fichasFiltradas.map((ficha, index) => (
            <FichaCard
              key={ficha.id}
              ficha={ficha}
              numeroFicha={index + 1}
              compacto={true}
            />
          ))}
        </div>
      )}

      {/* VISUALIZAÇÃO 3: MAPA / AGRUPAMENTO POR BAIRROS */}
      {fichasFiltradas.length > 0 && filtros.visualizacao === 'bairros' && (
        <div className="space-y-6">
          {gruposPorBairro.map(([bairro, fichasDoBairro]) => {
            const mediaScore = Math.round(
              fichasDoBairro.reduce((acc, f) => acc + (f.pontuacao || 0), 0) /
                fichasDoBairro.length
            );

            return (
              <section
                key={bairro}
                className="border-2 border-[#1B1A17] dark:border-[#EDE5D6] bg-[#F8F3ED] dark:bg-[#282520] p-3 md:p-4 hard-shadow"
              >
                {/* Cabeçalho de Perímetro do Bairro */}
                <div className="flex justify-between items-center border-b-2 border-[#1B1A17] pb-2 mb-3 bg-[#E8DFC8] dark:bg-[#332F28] -mx-3 -mt-3 md:-mx-4 md:-mt-4 p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E8431F]" />
                    <h3 className="font-serif text-lg font-bold text-[#1B1A17] dark:text-[#EDE5D6] uppercase">
                      {bairro}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="bg-[#1B1A17] text-white px-2 py-0.5">
                      {fichasDoBairro.length} FICHAS
                    </span>
                    <span className="bg-[#D9A21B] text-[#1B1A17] px-2 py-0.5 border border-[#1B1A17]">
                      MÉDIA: {mediaScore} PTS
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {fichasDoBairro.map((ficha, i) => (
                    <FichaCard
                      key={ficha.id}
                      ficha={ficha}
                      numeroFicha={i + 1}
                      compacto={true}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
