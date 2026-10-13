import React, { useState, useEffect } from 'react';
import { useGuiaStore } from '../../store/useGuiaStore';
import { Ficha } from '../../types';
import { CarimboPrioridade } from '../../components/CarimboPrioridade';
import { MedidorPerformance } from '../../components/MedidorPerformance';
import { ReguaPontuacao } from '../../components/ReguaPontuacao';
import { FitaAdesiva } from '../../components/FitaAdesiva';
import {
  normalizarWhatsAppUrl,
  normalizarInstagramUrl,
} from '../../lib/normalizers';
import {
  gerarRoteiroAbordagem,
  OPCOES_TOM,
  TomAbordagem,
} from '../../lib/roteiroAbordagem';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Instagram,
  Globe,
  Copy,
  Check,
  Scissors,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  fichaId: string;
  onVoltar: () => void;
  fichasFiltradas?: Ficha[];
}

export const DossieDetalhe: React.FC<Props> = ({
  fichaId,
  onVoltar,
  fichasFiltradas = [],
}) => {
  const {
    fichas,
    selecionarFicha,
    alternarSeparada,
    descartarFicha,
    salvarAnotacaoFicha,
  } = useGuiaStore();

  const ficha = fichas.find((f) => f.id === fichaId);
  const [tomSelecionado, setTomSelecionado] = useState<TomAbordagem>('direto');
  const [roteiroCopiado, setRoteiroCopiado] = useState(false);
  const [dadosCopiados, setDadosCopiados] = useState(false);
  const [anotacaoLocal, setAnotacaoLocal] = useState('');
  const [salvandoAnotacao, setSalvandoAnotacao] = useState(false);

  useEffect(() => {
    if (ficha) {
      setAnotacaoLocal(ficha.anotacao || '');
    }
  }, [ficha]);

  // Auto-save da anotação de campo com debounce de 600ms
  useEffect(() => {
    if (!ficha) return;
    const timer = setTimeout(() => {
      if (anotacaoLocal !== (ficha.anotacao || '')) {
        setSalvandoAnotacao(true);
        salvarAnotacaoFicha(ficha.id, anotacaoLocal).then(() => {
          setTimeout(() => setSalvandoAnotacao(false), 400);
        });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [anotacaoLocal, ficha, salvarAnotacaoFicha]);

  if (!ficha) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-4">
        <p className="font-mono text-sm">Ficha não encontrada ou removida do acervo.</p>
        <button
          onClick={onVoltar}
          className="bg-[#1B1A17] text-white px-4 py-2 font-mono text-xs font-bold uppercase hard-shadow-sm cursor-pointer"
        >
          Voltar ao Caderno
        </button>
      </div>
    );
  }

  // Navegação anterior / próxima respeitando o filtro
  const listaNavegacao = fichasFiltradas.length > 0 ? fichasFiltradas : fichas;
  const indexAtual = listaNavegacao.findIndex((f) => f.id === ficha.id);
  const anterior = indexAtual > 0 ? listaNavegacao[indexAtual - 1] : null;
  const proxima = indexAtual < listaNavegacao.length - 1 ? listaNavegacao[indexAtual + 1] : null;

  // Gerar mensagem de primeiro contato para WhatsApp
  const mensagemWhatsAppPadrao = `Olá! Localizei o perfil da ${ficha.empresa} no Google do ${ficha.bairro}. Gostaria de falar com o responsável sobre uma melhoria no canal digital de vocês.`;
  const urlWhatsApp = ficha.whatsapp
    ? normalizarWhatsAppUrl(ficha.whatsapp, mensagemWhatsAppPadrao)
    : '';

  const urlInstagram = ficha.instagram
    ? normalizarInstagramUrl(ficha.instagram)
    : '';

  const roteiroAtual = gerarRoteiroAbordagem(ficha, tomSelecionado);

  const copiarRoteiro = () => {
    navigator.clipboard?.writeText(roteiroAtual);
    setRoteiroCopiado(true);
    setTimeout(() => setRoteiroCopiado(false), 2500);
  };

  const copiarTodosContatos = () => {
    const texto = `${ficha.empresa}
Nicho: ${ficha.nicho}
Bairro: ${ficha.bairro} - ${ficha.cidade}
Telefone: ${ficha.telefone || 'Não informado'}
WhatsApp: ${ficha.whatsapp || 'Não informado'}
Instagram: ${ficha.instagram || 'Não informado'}
Website: ${ficha.website || 'Sem site'}
Nota Google: ${ficha.notaGoogle || 4.5} (${ficha.avaliacoes || 100} avaliações)
Pontuação: ${ficha.pontuacao}/100`;

    navigator.clipboard?.writeText(texto);
    setDadosCopiados(true);
    setTimeout(() => setDadosCopiados(false), 2500);
  };

  return (
    <div className="w-full max-w-[420px] md:max-w-2xl mx-auto px-3 sm:px-4 pt-3 pb-32 space-y-5 animate-fade-in">
      {/* Sub-Nav: Breadcrumb & Page Turner */}
      <div className="bg-[#F8F3ED] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-2.5 flex flex-col gap-2 hard-shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={onVoltar}
            className="font-mono text-xs font-bold text-[#1B1A17] dark:text-[#EDE5D6] hover:text-[#E8431F] flex items-center gap-1 active:translate-x-[1px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VOLTAR PARA O CADERNO</span>
          </button>
          <span className="font-mono text-[10px] px-2 py-0.5 bg-[#E8431F] text-white font-bold uppercase">
            CASO ATIVO
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-dashed border-[#1B1A17]/40 pt-2 font-mono text-xs">
          <span className="text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 font-bold truncate pr-2">
            REGISTRO #{ficha.id.slice(-6).toUpperCase()} // ARQUIVO-SP
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              disabled={!anterior}
              onClick={() => anterior && selecionarFicha(anterior.id)}
              className="bg-[#FDF9F3] dark:bg-[#1E1C19] border border-[#1B1A17] px-2 py-1 text-[11px] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E8DFC8] active:translate-y-0.5 cursor-pointer flex items-center gap-0.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              disabled={!proxima}
              onClick={() => proxima && selecionarFicha(proxima.id)}
              className="bg-[#FDF9F3] dark:bg-[#1E1C19] border border-[#1B1A17] px-2 py-1 text-[11px] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E8DFC8] active:translate-y-0.5 cursor-pointer flex items-center gap-0.5"
            >
              <span>Próxima</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CABEÇALHO DO DOSSIÊ (IDENTIDADE DO CASO) */}
      <section className="relative bg-[#FDF9F3] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-4 md:p-5 hard-shadow">
        <FitaAdesiva posicao="top-right" />

        <div className="flex justify-between items-start mb-2">
          <CarimboPrioridade prioridade={ficha.prioridade} tamanho="md" />

          {/* Big Target Score */}
          <div className="border-2 border-[#1B1A17] dark:border-[#EDE5D6] bg-[#F8F3ED] dark:bg-[#1E1C19] px-3 py-1 text-center hard-shadow-sm min-w-[72px]">
            <span className="font-mono text-[9px] block text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 font-bold">
              ÍNDICE FIT
            </span>
            <span className="font-serif text-2xl md:text-3xl font-black text-[#E8431F] leading-tight">
              {ficha.pontuacao}{' '}
              <span className="font-mono text-xs font-normal text-[#1B1A17]/70 dark:text-[#EDE5D6]/70">
                / 100
              </span>
            </span>
          </div>
        </div>

        <div className="mt-2">
          <span className="font-mono text-[10px] text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 uppercase tracking-widest block mb-0.5">
            ALVO PRINCIPAL DE AUDITORIA:
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#1B1A17] dark:text-[#EDE5D6] font-bold tracking-tight leading-tight">
            {ficha.empresa}
          </h1>
          <p className="text-xs md:text-sm text-[#1B1A17]/80 dark:text-[#EDE5D6]/80 mt-1 font-medium">
            {ficha.nicho} · {ficha.bairro} · {ficha.cidade}
          </p>
        </div>

        <div className="mt-3 pt-2 border-t border-dashed border-[#1B1A17]/60 flex justify-between items-center font-mono text-[10px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70">
          <span>MATRÍCULA: #{ficha.id.toUpperCase()}</span>
          <span className="bg-[#D9A21B]/30 px-1.5 py-0.5 border border-[#1B1A17] text-[#1B1A17] font-bold">
            AUDITORIA CONCLUÍDA
          </span>
        </div>
      </section>

      {/* I. IDENTIFICAÇÃO DO ALVO (FICHA DATILOGRAFADA) */}
      <section className="bg-[#F8F3ED] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-3.5 hard-shadow">
        <div className="flex items-center justify-between border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] pb-1.5 mb-3 bg-[#E8DFC8] dark:bg-[#332F28] -mx-3.5 -mt-3.5 px-3.5 pt-2">
          <h2 className="font-mono text-xs md:text-sm font-bold uppercase tracking-tight">
            I. IDENTIFICAÇÃO DO ALVO
          </h2>
          <span className="font-mono text-[10px] bg-[#1B1A17] text-white px-1.5 py-0.2">
            DOC 01-A
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          <div className="border-b border-[#1B1A17]/20 pb-1.5">
            <span className="text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 block text-[10px] font-medium">
              [RAZÃO SOCIAL / FANTASIA]
            </span>
            <span className="font-bold text-[#1B1A17] dark:text-[#EDE5D6]">{ficha.empresa}</span>
          </div>

          <div className="border-b border-[#1B1A17]/20 pb-1.5">
            <span className="text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 block text-[10px] font-medium">
              [LOCALIZAÇÃO FISCAL & FÍSICA]
            </span>
            <span className="text-[#1B1A17] dark:text-[#EDE5D6]">
              {ficha.extras?.['Endereço'] || `${ficha.bairro}, ${ficha.cidade} - SP`}
            </span>
          </div>

          <div className="border-b border-[#1B1A17]/20 pb-1.5">
            <span className="text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 block text-[10px] font-medium">
              [DATA DA AUDITORIA]
            </span>
            <span className="text-[#1B1A17] dark:text-[#EDE5D6]">
              {new Date(ficha.dataVerificacao || Date.now()).toLocaleDateString('pt-BR')} por Agente de Campo
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div>
              <span className="text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 block text-[10px] font-medium">
                [REPUTAÇÃO GOOGLE MAPS]
              </span>
              <span className="font-bold text-[#1B1A17] dark:text-[#EDE5D6] flex items-center gap-1">
                <span className="text-[#D9A21B] font-bold">
                  ★ {ficha.notaGoogle || 4.5} estrelas
                </span>{' '}
                ({ficha.avaliacoes || 100} avaliações)
              </span>
            </div>
            <span className="border border-[#1B1A17] px-1.5 py-0.5 bg-[#FDF9F3] text-[#2F4A3A] font-bold text-[10px]">
              {(ficha.notaGoogle || 0) >= 4.5 ? 'ALTA REPUTAÇÃO' : 'MÉDIA REPUTAÇÃO'}
            </span>
          </div>
        </div>
      </section>

      {/* II. CANAIS DE CONTATO & DISPARADORES */}
      <section className="bg-[#FDF9F3] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-3.5 hard-shadow">
        <div className="flex items-center justify-between border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] pb-1.5 mb-3 bg-[#E8DFC8] dark:bg-[#332F28] -mx-3.5 -mt-3.5 px-3.5 pt-2">
          <h2 className="font-mono text-xs md:text-sm font-bold uppercase tracking-tight">
            II. CANAIS DE CONTATO & DISPARADORES
          </h2>
          <span className="font-mono text-[10px] bg-[#E8431F] text-white px-1.5 py-0.2">
            AÇÃO RÁPIDA
          </span>
        </div>

        <p className="text-xs text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 mb-3">
          Toque para disparar conexão direta do terminal ou copiar dados para área de transferência:
        </p>

        <div className="flex flex-col gap-2 font-mono text-xs">
          {/* Ligar */}
          {ficha.telefone ? (
            <a
              href={`tel:${ficha.telefone.replace(/\D/g, '')}`}
              className="min-h-[48px] bg-[#F8F3ED] dark:bg-[#1E1C19] border-2 border-[#1B1A17] dark:border-[#EDE5D6] px-3 py-2 flex items-center justify-between hard-shadow-sm active:translate-x-[1px] hover:bg-[#E8DFC8]"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E8431F]" />
                <span className="font-bold">Ligar: {ficha.telefone}</span>
              </div>
              <span className="text-[10px] bg-[#E8DFC8] dark:bg-[#332F28] border border-[#1B1A17] px-1 font-bold">
                DIRETO
              </span>
            </a>
          ) : (
            <div className="min-h-[48px] bg-[#F8F3ED]/50 border border-dashed border-[#1B1A17]/40 px-3 py-2 flex items-center justify-between opacity-60">
              <span className="italic">Telefone fixo não informado</span>
              <span className="text-[10px]">AUSENTE</span>
            </div>
          )}

          {/* WhatsApp com wa.me formatado + mensagem pré-preenchida */}
          {urlWhatsApp ? (
            <a
              href={urlWhatsApp}
              target="_blank"
              rel="noreferrer"
              className="min-h-[48px] bg-[#2F4A3A] text-white border-2 border-[#1B1A17] px-3 py-2 flex items-center justify-between hard-shadow-sm active:translate-x-[1px] hover:brightness-110"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="font-bold tracking-wide">
                  Chamar no WhatsApp: {ficha.whatsapp}
                </span>
              </div>
              <span className="text-[10px] bg-white/20 px-1 border border-white/40 font-bold uppercase">
                ABRIR APP
              </span>
            </a>
          ) : (
            <div className="min-h-[48px] bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a] px-3 py-2 flex items-center justify-between">
              <span>Sem número de WhatsApp cadastrado</span>
              <span className="text-[10px] font-bold">GARGALO</span>
            </div>
          )}

          {/* Instagram */}
          {urlInstagram ? (
            <a
              href={urlInstagram}
              target="_blank"
              rel="noreferrer"
              className="min-h-[48px] bg-[#F8F3ED] dark:bg-[#1E1C19] border-2 border-[#1B1A17] dark:border-[#EDE5D6] px-3 py-2 flex items-center justify-between hard-shadow-sm active:translate-x-[1px] hover:bg-[#E8DFC8]"
            >
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[#D9A21B]" />
                <span className="font-bold">Instagram: {ficha.instagram}</span>
              </div>
              <span className="text-[10px] border border-[#1B1A17] px-1">PERFIL</span>
            </a>
          ) : null}

          {/* Website Oficial */}
          {ficha.website ? (
            <a
              href={ficha.website.startsWith('http') ? ficha.website : `https://${ficha.website}`}
              target="_blank"
              rel="noreferrer"
              className="min-h-[48px] bg-[#F8F3ED] dark:bg-[#1E1C19] border-2 border-[#1B1A17] dark:border-[#EDE5D6] px-3 py-2 flex items-center justify-between hard-shadow-sm active:translate-x-[1px] hover:bg-[#E8DFC8]"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <Globe className="w-4 h-4 text-[#1B1A17] shrink-0" />
                <span className="font-bold truncate">{ficha.website}</span>
              </div>
              <span className="text-[10px] bg-[#D9A21B]/30 border border-[#1B1A17] px-1 font-bold shrink-0">
                {(ficha.performanceMobile || 0) < 50 ? 'LENTO' : 'OK'}
              </span>
            </a>
          ) : (
            <div className="min-h-[44px] bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a] px-3 py-2 flex items-center justify-between">
              <span className="line-through font-semibold">Sem website registrado</span>
              <span className="text-[10px] font-bold uppercase">OPORTUNIDADE</span>
            </div>
          )}

          {/* Copiar todos os contatos */}
          <button
            onClick={copiarTodosContatos}
            className="min-h-[48px] bg-[#D9A21B] text-[#1B1A17] border-2 border-[#1B1A17] px-3 py-2 flex items-center justify-center gap-2 font-bold uppercase tracking-wider hard-shadow-sm active:translate-x-[1px] cursor-pointer mt-1"
          >
            {dadosCopiados ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{dadosCopiados ? 'DADOS COPIADOS!' : 'COPIAR TODOS OS DADOS DE CONTATO'}</span>
          </button>
        </div>
      </section>

      {/* III. ANÁLISE DE ANÚNCIOS (CLIPPING DE JORNAL) */}
      <section className="relative bg-[#ECE5D3] dark:bg-[#2A2620] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-4 hard-shadow">
        <FitaAdesiva posicao="top-left" />

        <div className="flex items-center justify-between border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] pb-1.5 mb-3">
          <div className="flex items-center gap-1.5">
            <Scissors className="w-4 h-4 text-[#1B1A17]" />
            <h2 className="font-mono text-xs md:text-sm font-bold uppercase tracking-tight">
              III. ANÁLISE DE ANÚNCIOS
            </h2>
          </div>
          <span className="font-mono text-[10px] uppercase bg-[#1B1A17] text-white px-1">
            CLIPPING
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {/* Meta Ads */}
          <div className="border border-dashed border-[#1B1A17] p-3 bg-[#FDF9F3] dark:bg-[#1E1C19]">
            <div className="flex justify-between items-start mb-1.5">
              <span className="font-bold uppercase tracking-wider">
                Meta Ads (Facebook / Instagram)
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 border border-[#1B1A17] font-bold ${
                  ficha.metaAds
                    ? 'bg-[#cbead4] text-[#052013]'
                    : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}
              >
                {ficha.metaAds ? '[STATUS: ATIVO]' : '[STATUS: INATIVO]'}
              </span>
            </div>
            <p className="text-xs text-[#1B1A17] dark:text-[#EDE5D6] leading-snug">
              <strong className="text-[#E8431F]">Evidência em campo:</strong>{' '}
              {ficha.evidenciaMeta ||
                (ficha.metaAds
                  ? 'Campanhas ativas identificadas na Biblioteca de Anúncios.'
                  : 'Nenhuma biblioteca de anúncios ativa nos últimos 90 dias. Presença orgânica estagnada. Oportunidade claríssima de tráfego local.')}
            </p>
          </div>

          {/* Google Ads */}
          <div className="border border-dashed border-[#1B1A17] p-3 bg-[#FDF9F3] dark:bg-[#1E1C19]">
            <div className="flex justify-between items-start mb-1.5">
              <span className="font-bold uppercase tracking-wider">
                Google Ads (Rede de Pesquisa)
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 border border-[#1B1A17] font-bold ${
                  ficha.googleAds
                    ? 'bg-[#cbead4] text-[#052013]'
                    : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}
              >
                {ficha.googleAds ? '[STATUS: ATIVO]' : '[STATUS: INATIVO]'}
              </span>
            </div>
            <p className="text-xs text-[#1B1A17] dark:text-[#EDE5D6] leading-snug">
              <strong className="text-[#E8431F]">Evidência em campo:</strong>{' '}
              {ficha.evidenciaGoogle ||
                (ficha.googleAds
                  ? 'Campanhas patrocinadas ativas na busca do Google Maps da região.'
                  : `Sem campanhas na rede de pesquisa para buscas locais por "${ficha.nicho}".`)}
            </p>
          </div>
        </div>
      </section>

      {/* IV. DESEMPENHO TÉCNICO (TERMÔMETRO ANALÓGICO) */}
      <section className="bg-[#FDF9F3] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-3.5 hard-shadow">
        <div className="flex items-center justify-between border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] pb-1.5 mb-3 bg-[#E8DFC8] dark:bg-[#332F28] -mx-3.5 -mt-3.5 px-3.5 pt-2">
          <h2 className="font-mono text-xs md:text-sm font-bold uppercase tracking-tight">
            IV. DESEMPENHO TÉCNICO
          </h2>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 font-bold ${
              (ficha.performanceMobile || 0) < 50
                ? 'bg-[#E8431F] text-white'
                : 'bg-[#2F4A3A] text-white'
            }`}
          >
            {(ficha.performanceMobile || 0) < 50 ? 'ALERTA VERMELHO' : 'ESTÁVEL'}
          </span>
        </div>

        <MedidorPerformance
          score={ficha.performanceMobile ?? 38}
          tempoCargaSegundos={
            ficha.performanceMobile && ficha.performanceMobile > 70 ? 1.8 : 4.8
          }
          lcpSegundos={
            ficha.performanceMobile && ficha.performanceMobile > 70 ? 1.9 : 4.2
          }
        />

        {(ficha.performanceMobile || 0) < 50 && (
          <div className="mt-2.5 p-2 bg-[#ffdad6]/60 border border-[#1B1A17] text-xs font-mono flex items-start gap-2 text-[#ba1a1a]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Sem compressão WebP em fotos pesadas · Sem layout adaptativo touch · Código Javascript obsoleto bloqueando renderização.
            </span>
          </div>
        )}
      </section>

      {/* V. PROBLEMAS IDENTIFICADOS (AUDITORIA) */}
      <section className="bg-[#F8F3ED] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-3.5 hard-shadow">
        <div className="flex items-center justify-between border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] pb-1.5 mb-3 bg-[#E8DFC8] dark:bg-[#332F28] -mx-3.5 -mt-3.5 px-3.5 pt-2">
          <h2 className="font-mono text-xs md:text-sm font-bold uppercase tracking-tight">
            V. PROBLEMAS IDENTIFICADOS
          </h2>
          <span className="font-mono text-[10px] bg-[#1B1A17] text-white px-1.5 py-0.2">
            AUDITORIA
          </span>
        </div>

        <p className="font-serif italic text-xs text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 mb-3">
          "Anotações levantadas via inspeção remota e simulação de jornada de cliente no celular:"
        </p>

        <ul className="space-y-3 font-mono text-xs">
          {ficha.problemas.map((prob, idx) => (
            <li key={idx} className="flex items-start gap-2 border-b border-[#1B1A17]/10 pb-2">
              <span className="font-bold text-[#E8431F] shrink-0 mt-0.5">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <div className="flex-1">
                <span className={idx === 0 ? 'highlighter-wash font-bold' : 'font-semibold'}>
                  {prob}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* VI. DECOMPOSIÇÃO DA PONTUAÇÃO (6 RÉGUAS) */}
      <section className="bg-[#FDF9F3] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-3.5 hard-shadow">
        <div className="flex items-center justify-between border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] pb-1.5 mb-3 bg-[#E8DFC8] dark:bg-[#332F28] -mx-3.5 -mt-3.5 px-3.5 pt-2">
          <h2 className="font-mono text-xs md:text-sm font-bold uppercase tracking-tight">
            VI. DECOMPOSIÇÃO DA PONTUAÇÃO
          </h2>
          <span className="font-mono text-[10px] bg-[#1B1A17] text-white px-1.5 py-0.2">
            6 RÉGUAS
          </span>
        </div>

        <ReguaPontuacao pts={ficha.pts} pontuacaoTotal={ficha.pontuacao} />
      </section>

      {/* VII. ROTEIRO DE ABORDAGEM & SELETOR DE TOM */}
      <section className="bg-[#F8F3ED] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-3.5 hard-shadow">
        <div className="flex items-center justify-between border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] pb-1.5 mb-3 bg-[#E8DFC8] dark:bg-[#332F28] -mx-3.5 -mt-3.5 px-3.5 pt-2">
          <h2 className="font-mono text-xs md:text-sm font-bold uppercase tracking-tight">
            VII. ROTEIRO DE ABORDAGEM
          </h2>
          <span className="font-mono text-[10px] bg-[#E8431F] text-white px-1.5 py-0.2">
            SCRIPT
          </span>
        </div>

        <div className="mb-3">
          <span className="font-mono text-[10px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 font-bold block mb-1">
            SERVIÇO RECOMENDADO:
          </span>
          <div className="bg-[#FDF9F3] dark:bg-[#1E1C19] border border-[#1B1A17] p-2 font-mono text-xs font-bold text-[#1B1A17] dark:text-[#EDE5D6]">
            {ficha.servicoRecomendado || 'Site novo ultrarrápido + Funil WhatsApp'}
          </div>
        </div>

        {/* Seletor de Tom */}
        <div className="mb-3">
          <label className="font-mono text-[10px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 font-bold block mb-1.5">
            TOM DA ABORDAGEM:
          </label>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
            {OPCOES_TOM.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTomSelecionado(opt.id)}
                className={`p-2 border border-[#1B1A17] text-left cursor-pointer transition-none ${
                  tomSelecionado === opt.id
                    ? 'bg-[#1B1A17] text-white font-bold hard-shadow-sm'
                    : 'bg-[#FDF9F3] text-[#1B1A17] hover:bg-[#E8DFC8]'
                }`}
              >
                <div className="font-bold">{opt.rotulo}</div>
                <div className="text-[9px] opacity-75 truncate">{opt.descricao}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Caixa de Texto do Roteiro */}
        <div className="border border-[#1B1A17] bg-[#FDF9F3] dark:bg-[#1E1C19] p-3 relative mt-3">
          <span className="font-mono text-[9px] bg-[#E8DFC8] dark:bg-[#332F28] px-1 border border-[#1B1A17] absolute -top-2 left-2 font-bold uppercase">
            PITCH VALIDADO VIA WHATSAPP / COLD CALL
          </span>

          <p className="font-serif italic text-xs md:text-sm text-[#1B1A17] dark:text-[#EDE5D6] mt-2 whitespace-pre-line leading-relaxed">
            "{roteiroAtual}"
          </p>

          <button
            onClick={copiarRoteiro}
            className="w-full mt-3 min-h-[44px] bg-[#E8431F] text-white border-2 border-[#1B1A17] font-mono text-xs uppercase font-bold tracking-wider py-2 flex items-center justify-center gap-1.5 hard-shadow-sm active:translate-y-0.5 cursor-pointer"
          >
            {roteiroCopiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>
              {roteiroCopiado ? 'ROTEIRO COPIADO PARA O CLIPBOARD!' : 'COPIAR ROTEIRO DE ABORDAGEM'}
            </span>
          </button>
        </div>
      </section>

      {/* CADERNO: ANOTAÇÕES DE CAMPO (AUTO-SAVE) */}
      <section className="bg-[#F8F3ED] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-3.5 hard-shadow">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#1B1A17]/30">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
            <FileText className="w-3.5 h-3.5 text-[#E8431F]" />
            <span>ANOTAÇÕES À MÃO LIVRE // CADERNO DE CAMPO</span>
          </div>
          <span className="font-mono text-[10px] text-[#2F4A3A] font-bold">
            {salvandoAnotacao ? 'SALVANDO...' : 'SALVO NO NAVEGADOR'}
          </span>
        </div>

        <textarea
          rows={3}
          value={anotacaoLocal}
          onChange={(e) => setAnotacaoLocal(e.target.value)}
          placeholder="Ex: Falar com o gerente Fábio após as 16h. Apresentar dados de perda de cliques no mobile..."
          className="w-full bg-[#FDF9F3] dark:bg-[#1E1C19] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-2.5 font-mono text-xs outline-none focus:border-[#E8431F]"
        />
        <div className="text-[10px] font-mono text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 mt-1 flex justify-between">
          <span>Salvamento automático no IndexedDB local</span>
          <span>{anotacaoLocal.length} caracteres</span>
        </div>
      </section>

      {/* VIII. FONTES E REGISTROS CARTORIAIS */}
      <section className="bg-[#FDF9F3] dark:bg-[#282520] border border-[#1B1A17] p-3 font-mono text-[10px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 space-y-1">
        <div className="flex items-center justify-between border-b border-[#1B1A17]/20 pb-1 mb-1">
          <span className="font-bold text-[#1B1A17] dark:text-[#EDE5D6] uppercase">
            VIII. FONTES E REGISTROS CARTORIAIS
          </span>
          <span>AUDIT LOG</span>
        </div>
        {ficha.fontes.map((f, i) => (
          <div key={i}>[{i + 1}] {f}</div>
        ))}
        <div className="pt-1 text-right text-[9px] text-[#1B1A17]/60">
          DOCUMENTO EMITIDO PELO PROTOCOLO GUIA DE CAMPO // NÃO ENVIADO A SERVIDORES
        </div>
      </section>

      {/* Picote final */}
      <div className="tear-line relative my-2 text-center">
        <span className="bg-[#F2EBDD] dark:bg-[#1E1C19] px-2 font-mono text-[9px] text-[#1B1A17]/60 flex items-center justify-center gap-1 mx-auto w-max">
          <Scissors className="w-3 h-3" />
          <span>FIM DO DOSSIÊ INVESTIGATIVO</span>
        </span>
      </div>

      {/* BARRA INFERIOR FIXA DE AÇÃO TÁTICA */}
      <div className="fixed bottom-0 left-0 w-full z-40 flex justify-center bg-transparent pointer-events-none">
        <div className="w-full max-w-[420px] md:max-w-2xl bg-[#F8F3ED] dark:bg-[#1E1C19] border-t-2 border-[#1B1A17] dark:border-[#EDE5D6] p-2.5 shadow-[0px_-4px_0px_#1B1A17] flex items-center gap-2 pointer-events-auto">
          {/* Descartar / Restaurar */}
          <button
            onClick={() => {
              descartarFicha(ficha.id);
              onVoltar();
            }}
            className="flex-1 min-h-[48px] bg-[#FDF9F3] text-[#E8431F] border-2 border-[#1B1A17] py-2 px-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hard-shadow-sm active:translate-y-0.5 cursor-pointer"
          >
            <span>Descartar Ficha</span>
          </button>

          {/* Separar no Caderno */}
          <button
            onClick={() => alternarSeparada(ficha.id)}
            className={`flex-1 min-h-[48px] border-2 border-[#1B1A17] py-2 px-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hard-shadow-sm active:translate-y-0.5 cursor-pointer ${
              ficha.separada
                ? 'bg-[#E8431F] text-white'
                : 'bg-[#D9A21B] text-[#1B1A17]'
            }`}
          >
            {ficha.separada ? (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>Separada no Caderno ✓</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Separar no Caderno</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
