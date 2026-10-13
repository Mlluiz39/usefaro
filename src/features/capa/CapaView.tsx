import React from 'react';
import { useGuiaStore } from '../../store/useGuiaStore';
import { Target, Search, ArrowRight, Upload, BookOpen } from 'lucide-react';
import { FitaAdesiva } from '../../components/FitaAdesiva';
import { CarimboPrioridade } from '../../components/CarimboPrioridade';

interface Props {
  onVerTodasFichas: () => void;
}

export const CapaView: React.FC<Props> = ({ onVerTodasFichas }) => {
  const {
    fichas,
    filtros,
    setFiltros,
    selecionarFicha,
    setModalImportacao,
  } = useGuiaStore();

  const fichasAtivas = fichas.filter((f) => !f.descartada);
  const total = fichasAtivas.length;

  const totalAlta = fichasAtivas.filter((f) => f.prioridade === 'Alta').length;
  const totalMedia = fichasAtivas.filter((f) => f.prioridade === 'Média').length;
  const totalBaixa = fichasAtivas.filter((f) => f.prioridade === 'Baixa').length;

  const nichosUnicos = Array.from(new Set(fichasAtivas.map((f) => f.nicho).filter(Boolean)));
  const bairrosUnicos = Array.from(new Set(fichasAtivas.map((f) => f.bairro).filter(Boolean)));

  // Top 3 alvos de maior pontuação
  const top3 = [...fichasAtivas]
    .sort((a, b) => (b.pontuacao || 0) - (a.pontuacao || 0))
    .slice(0, 3);

  const dataAtual = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="w-full max-w-[440px] md:max-w-3xl mx-auto px-4 py-4 space-y-6">
      {/* 1. CABEÇALHO DE JORNAL / DOSSIÊ INVESTIGATIVO */}
      <section className="border-2 border-[#1B1A17] bg-[#FDF9F3] p-4 md:p-6 hard-shadow relative">
        <FitaAdesiva posicao="top-right" />

        <div className="flex justify-between items-center pb-2 border-b border-[#1B1A17]">
          <span className="font-mono text-[10px] md:text-xs text-[#1B1A17] tracking-widest uppercase font-semibold">
            GUIA DE CAMPO // EDIÇÃO REGIONAL SÃO PAULO
          </span>
          <span className="font-mono text-[10px] md:text-xs px-1.5 py-0.5 bg-[#E8DFC8] border border-[#1B1A17] text-[#1B1A17] font-bold">
            VOL. IV
          </span>
        </div>

        <div className="py-3">
          <h1 className="font-serif text-3xl md:text-5xl font-semibold tracking-tight text-[#1B1A17] leading-none">
            Guia de Campo
          </h1>
          <div className="mt-2.5 inline-block px-1 highlighter-wash">
            <p className="font-mono text-xs md:text-sm text-[#1B1A17] font-medium">
              {total} fichas analisadas · atualizado em {dataAtual} · Caderno confidencial de prospecção local
            </p>
          </div>
        </div>

        <div className="pt-2 border-t-2 border-dashed border-[#1B1A17] flex justify-between items-center">
          <div className="flex items-center space-x-1.5 font-mono text-[10px]">
            <span className="w-2.5 h-2.5 bg-[#E8431F] border border-[#1B1A17]" />
            <span className="font-bold text-[#1B1A17] tracking-wider">EXPEDIENTE Nº 084/SP</span>
          </div>
          <div className="border border-[#E8431F] text-[#E8431F] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest bg-[#E8431F]/10">
            DOCUMENTO CLASSIFICADO
          </div>
        </div>
      </section>

      {/* 2. BUSCA RÁPIDA ESTILO LINHA PAUTADA */}
      <section>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onVerTodasFichas();
          }}
          className="relative bg-[#F8F3ED] border-2 border-[#1B1A17] hard-shadow-sm p-1 flex items-center"
        >
          <Search className="w-4 h-4 text-[#1B1A17]/60 ml-2 shrink-0" strokeWidth={2.5} />
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => setFiltros({ busca: e.target.value })}
            placeholder="Buscar por empresa, bairro ou nicho..."
            className="w-full bg-transparent border-0 focus:ring-0 text-[#1B1A17] font-mono text-xs md:text-sm placeholder:text-[#1B1A17]/50 placeholder:italic py-1.5 px-2 outline-none"
          />
          <div className="border-l border-[#1B1A17] pl-2 pr-1">
            <button
              type="submit"
              className="font-mono text-[10px] bg-[#E8DFC8] px-2 py-1 border border-[#1B1A17] text-[#1B1A17] font-bold uppercase hover:bg-[#D9A21B] active:translate-y-0.5 cursor-pointer"
            >
              PAUTA
            </button>
          </div>
        </form>
      </section>

      {/* 3. ÍNDICE GERAL DE FICHAS COM LINHA PONTILHADA */}
      <section className="border-2 border-[#1B1A17] bg-[#F8F3ED] p-4 md:p-5 hard-shadow">
        <div className="flex items-center justify-between pb-2 border-b-2 border-[#1B1A17] mb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#1B1A17]" strokeWidth={2.5} />
            <h2 className="font-mono text-xs md:text-sm font-bold uppercase tracking-wider text-[#1B1A17]">
              ÍNDICE GERAL DE FICHAS
            </h2>
          </div>
          <span className="font-mono text-[10px] text-[#1B1A17]/70 font-medium">[TABELA 01]</span>
        </div>

        <div className="space-y-2.5 font-mono text-xs md:text-sm">
          {/* Prioridade Alta */}
          <button
            onClick={() => {
              setFiltros({ prioridades: ['Alta'] });
              onVerTodasFichas();
            }}
            className="w-full text-left group flex items-baseline justify-between hover:bg-[#E8DFC8] p-1 -mx-1 border-b border-[#1B1A17]/20 transition-none cursor-pointer"
          >
            <span className="font-medium text-[#1B1A17] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#E8431F]" />
              Prioridade Alta <span className="text-[#1B1A17]/60 text-[10px] font-normal">(Pts 75-100)</span>
            </span>
            <span className="flex-grow mx-2 border-b-2 border-dotted border-[#1B1A17]/40" />
            <span className="font-bold text-[#E8431F] text-xs bg-[#E8431F]/15 px-1.5 py-0.5 border border-[#E8431F]/40">
              {totalAlta} fichas
            </span>
          </button>

          {/* Prioridade Média */}
          <button
            onClick={() => {
              setFiltros({ prioridades: ['Média'] });
              onVerTodasFichas();
            }}
            className="w-full text-left group flex items-baseline justify-between hover:bg-[#E8DFC8] p-1 -mx-1 border-b border-[#1B1A17]/20 transition-none cursor-pointer"
          >
            <span className="font-medium text-[#1B1A17] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#D9A21B] border border-[#1B1A17]" />
              Prioridade Média <span className="text-[#1B1A17]/60 text-[10px] font-normal">(Pts 50-74)</span>
            </span>
            <span className="flex-grow mx-2 border-b-2 border-dotted border-[#1B1A17]/40" />
            <span className="font-bold text-[#D9A21B] text-xs bg-[#D9A21B]/20 px-1.5 py-0.5 border border-[#D9A21B]/40">
              {totalMedia} fichas
            </span>
          </button>

          {/* Prioridade Baixa */}
          <button
            onClick={() => {
              setFiltros({ prioridades: ['Baixa'] });
              onVerTodasFichas();
            }}
            className="w-full text-left group flex items-baseline justify-between hover:bg-[#E8DFC8] p-1 -mx-1 border-b border-[#1B1A17]/20 transition-none cursor-pointer"
          >
            <span className="font-medium text-[#1B1A17] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#E8DFC8] border border-[#1B1A17]" />
              Prioridade Baixa <span className="text-[#1B1A17]/60 text-[10px] font-normal">(Pts 0-49)</span>
            </span>
            <span className="flex-grow mx-2 border-b-2 border-dotted border-[#1B1A17]/40" />
            <span className="font-medium text-[#1B1A17]/80 text-xs px-1.5 py-0.5 border border-[#1B1A17]/30">
              {totalBaixa} fichas
            </span>
          </button>

          {/* Nichos mapeados */}
          <div className="group flex items-baseline justify-between p-1 -mx-1 border-b border-[#1B1A17]/20">
            <span className="font-medium text-[#1B1A17]">
              Nichos mapeados{' '}
              <span className="text-[#1B1A17]/60 text-[10px] italic">
                ({nichosUnicos.slice(0, 3).join(', ')}...)
              </span>
            </span>
            <span className="flex-grow mx-2 border-b-2 border-dotted border-[#1B1A17]/40" />
            <span className="font-bold text-[#1B1A17] text-xs bg-[#E8DFC8] px-1.5 py-0.5 border border-[#1B1A17]">
              {nichosUnicos.length} nichos
            </span>
          </div>

          {/* Bairros em campo */}
          <div className="group flex items-baseline justify-between p-1 -mx-1">
            <span className="font-medium text-[#1B1A17]">
              Bairros em campo{' '}
              <span className="text-[#1B1A17]/60 text-[10px] italic">
                ({bairrosUnicos.slice(0, 3).join(', ')}...)
              </span>
            </span>
            <span className="flex-grow mx-2 border-b-2 border-dotted border-[#1B1A17]/40" />
            <span className="font-bold text-[#1B1A17] text-xs bg-[#E8DFC8] px-1.5 py-0.5 border border-[#1B1A17]">
              {bairrosUnicos.length} bairros
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-dashed border-[#1B1A17] text-center">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#1B1A17]/70">
            --- FIM DO ÍNDICE DE ABERTURA ---
          </span>
        </div>
      </section>

      {/* 4. SEÇÃO "COMECE POR AQUI" (TOP 3 ALVOS) */}
      <section className="space-y-3 pt-2">
        <div className="flex justify-between items-baseline px-1">
          <div className="flex items-center gap-1.5">
            <Target className="w-5 h-5 text-[#E8431F]" strokeWidth={2.5} />
            <h2 className="font-serif text-2xl font-semibold text-[#1B1A17]">Comece por aqui</h2>
          </div>
          <span className="font-mono text-[10px] text-[#E8431F] font-bold uppercase tracking-wider">
            Top 3 Alvos
          </span>
        </div>
        <p className="text-xs text-[#1B1A17]/70 italic px-1 -mt-2">
          Evidências prioritárias selecionadas para contato imediato no território paulistano:
        </p>

        {top3.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-[#1B1A17] bg-[#F8F3ED] text-center space-y-3">
            <p className="font-serif text-lg text-[#1B1A17]">Nenhuma ficha cadastrada ainda.</p>
            <p className="text-xs text-[#1B1A17]/70">
              Importe sua planilha para começar.
            </p>
            <button
              onClick={() => setModalImportacao(true)}
              className="bg-[#1B1A17] text-white border-2 border-[#1B1A17] px-4 py-2 font-mono text-xs font-bold uppercase hard-shadow-sm flex items-center gap-2 mx-auto"
            >
              <Upload className="w-4 h-4" />
              Importar Planilha
            </button>
          </div>
        ) : (
          <div className="relative pt-2 pb-4 space-y-4">
            {top3.map((ficha, index) => {
              const isPrincipal = index === 0;
              const rot = index === 1 ? '-rotate-1' : index === 2 ? 'rotate-1' : 'rotate-0';

              return (
                <div
                  key={ficha.id}
                  className={`border-2 border-[#1B1A17] bg-[#FDF9F3] p-4 hard-shadow relative ${rot} ${
                    isPrincipal ? 'border-l-8 border-l-[#E8431F] z-20' : 'z-10'
                  }`}
                >
                  {isPrincipal && <FitaAdesiva posicao="top-right" />}

                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] text-[#E8431F] font-bold uppercase tracking-wider">
                          [FICHA {String(index + 1).padStart(2, '0')} // {ficha.bairro.toUpperCase()}]
                        </span>
                        {isPrincipal && (
                          <span className="highlighter-wash px-1 font-mono text-[9px] font-bold text-[#1B1A17]">
                            ALVO IMEDIATO
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#1B1A17]">{ficha.empresa}</h3>
                      <p className="text-xs text-[#1B1A17]/80 font-medium">
                        {ficha.nicho} · {ficha.bairro}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <CarimboPrioridade prioridade={ficha.prioridade} tamanho="sm" />
                      <div className="font-serif text-2xl font-bold text-[#E8431F] mt-1">
                        {ficha.pontuacao}{' '}
                        <span className="font-mono text-[10px] text-[#1B1A17]/60">PTS</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro-detalhes */}
                  <div className="mt-3 bg-[#F8F3ED] border border-[#1B1A17] p-2 space-y-1 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-[#1B1A17]/60">DIAGNOSE:</span>
                      <span className="font-semibold text-[#E8431F] truncate ml-2">
                        {ficha.problemas[0] || 'Oportunidade de presença digital'}
                      </span>
                    </div>
                    {ficha.servicoRecomendado && (
                      <div className="flex justify-between border-t border-[#1B1A17]/20 pt-1">
                        <span className="text-[#1B1A17]/60">RECOMENDAÇÃO:</span>
                        <span className="font-semibold text-[#1B1A17] truncate ml-2">
                          {ficha.servicoRecomendado}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botão de ação */}
                  <div className="mt-3 pt-2.5 border-t-2 border-dashed border-[#1B1A17] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#1B1A17]/70">
                      ★ {ficha.notaGoogle || 4.7} ({ficha.avaliacoes || 100} avaliações)
                    </span>
                    <button
                      onClick={() => selecionarFicha(ficha.id)}
                      className="bg-[#E8431F] text-white border-2 border-[#1B1A17] px-3 py-1.5 font-mono text-xs uppercase font-bold tracking-wider hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Abrir Ficha Investigada</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. PROTOCOLO DE ENTRADA: CARREGAR ARQUIVOS EM LOTE (PASTA KRAFT) */}
      <section className="pt-1 pb-4">
        <div className="relative bg-[#D8C5A5] border-2 border-[#1B1A17] p-4 hard-shadow">
          {/* Ilhós decorativo */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8F7E63] border-2 border-[#1B1A17] flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FDF9F3]" />
          </div>

          <div className="pl-5 flex flex-col justify-between items-start gap-3">
            <div className="w-full flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#1B1A17] font-bold bg-[#BFAB88] px-1 border border-[#1B1A17]">
                    PROTOCOLO DE ENTRADA
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#1B1A17] mt-1">
                  Carregar Arquivos em Lote
                </h4>
                <p className="text-xs text-[#1B1A17]/80 leading-tight">
                  Adicione novas frentes de prospecção territorial ao caderno.
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setModalImportacao(true)}
                className="flex-1 bg-[#1B1A17] text-[#F4EFEA] border-2 border-[#1B1A17] py-2.5 px-3 font-mono text-xs uppercase font-bold tracking-wider shadow-[3px_3px_0px_#D9A21B] active:translate-x-[1px] active:translate-y-[1px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Importar Planilha (CSV/XLSX/JSON)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTÃO DE ACESSO DIRETO AO MURAL COMPLETO */}
      <div className="text-center pt-2">
        <button
          onClick={onVerTodasFichas}
          className="w-full bg-[#FDF9F3] text-[#1B1A17] border-2 border-[#1B1A17] py-3 px-4 font-mono text-xs font-bold uppercase tracking-wider hard-shadow hover:bg-[#E8DFC8] active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-[#E8431F]" />
          <span>Explorar Todas as {total} Fichas do Caderno</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Micro-rodapé de autenticação cartorial */}
      <footer className="pt-2 pb-6 text-center border-t border-[#1B1A17]/30">
        <p className="font-mono text-[9px] text-[#1B1A17]/70 uppercase tracking-widest">
          REGISTRO CARTORIAL DE DADOS PÚBLICOS // LEI 13.709/2018
        </p>
        <p className="text-[11px] text-[#1B1A17]/70 italic mt-0.5">
          São Paulo - Capital · Campo Investigativo Ativo · 100% no Navegador
        </p>
      </footer>
    </div>
  );
};
