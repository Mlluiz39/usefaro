import React, { useState } from 'react';
import { Ficha } from '../../types';
import { useGuiaStore } from '../../store/useGuiaStore';
import { CarimboPrioridade } from '../../components/CarimboPrioridade';
import { SeloPresenca } from '../../components/SeloPresenca';
import { FitaAdesiva } from '../../components/FitaAdesiva';
import { Star, Bookmark, BookmarkCheck, ArrowRight, Trash2, Edit3 } from 'lucide-react';

interface Props {
  ficha: Ficha;
  numeroFicha?: number;
  compacto?: boolean;
}

export const FichaCard: React.FC<Props> = ({ ficha, numeroFicha = 1, compacto = false }) => {
  const { selecionarFicha, alternarSeparada, descartarFicha } = useGuiaStore();
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  // Manipulador de swipe no mobile (direita = separar, esquerda = descartar)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.touches[0].clientX - touchStartX;
    // Limita o deslocamento para feedback tátil suave
    if (Math.abs(diff) < 120) {
      setSwipeOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 70) {
      // Swipe para a direita: separar no caderno
      alternarSeparada(ficha.id);
    } else if (swipeOffset < -70) {
      // Swipe para a esquerda: descartar
      descartarFicha(ficha.id);
    }
    setTouchStartX(null);
    setSwipeOffset(0);
  };

  const numeroFormatado = `FICHA Nº ${String(numeroFicha).padStart(3, '0')}`;

  if (compacto) {
    return (
      <article
        onClick={() => selecionarFicha(ficha.id)}
        className="bg-[#FDF9F3] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-3 hard-shadow-sm hover:bg-[#F8F3ED] cursor-pointer flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="text-center min-w-[42px] bg-[#E8DFC8] dark:bg-[#332F28] p-1 border border-[#1B1A17]">
            <span className="font-serif text-lg font-bold text-[#E8431F] block leading-none">
              {ficha.pontuacao}
            </span>
            <span className="font-mono text-[8px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 leading-none">
              PTS
            </span>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="text-[#E8431F] font-bold">{ficha.bairro}</span>
              <span className="text-[#1B1A17]/50">·</span>
              <span className="text-[#1B1A17]/70 dark:text-[#EDE5D6]/70">{ficha.nicho}</span>
            </div>
            <h4 className="font-serif text-base font-bold text-[#1B1A17] dark:text-[#EDE5D6] truncate">
              {ficha.empresa}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <CarimboPrioridade prioridade={ficha.prioridade} tamanho="sm" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              alternarSeparada(ficha.id);
            }}
            className={`p-1 border border-[#1B1A17] ${
              ficha.separada ? 'bg-[#E8431F] text-white' : 'bg-[#FDF9F3] text-[#1B1A17]'
            }`}
            title={ficha.separada ? 'Separada no Caderno' : 'Separar'}
          >
            {ficha.separada ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : undefined,
        transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none',
      }}
      className="relative bg-[#FDF9F3] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] hard-shadow p-3.5 md:p-4 group"
    >
      {/* Fita adesiva no canto superior direito da ficha */}
      <FitaAdesiva posicao="top-right" />

      {/* Indicador de gesto de swipe quando arrastado */}
      {swipeOffset > 30 && (
        <div className="absolute inset-y-0 left-0 bg-[#2F4A3A]/20 flex items-center px-4 font-mono text-xs font-bold text-[#2F4A3A]">
          ✓ SEPARAR NO CADERNO
        </div>
      )}
      {swipeOffset < -30 && (
        <div className="absolute inset-y-0 right-0 bg-[#E8431F]/20 flex items-center px-4 font-mono text-xs font-bold text-[#E8431F]">
          ✕ DESCARTAR FICHA
        </div>
      )}

      {/* Cabeçalho da Ficha */}
      <div className="flex justify-between items-start border-b border-[#1B1A17]/20 pb-2 mb-2">
        <div className="pr-2">
          <div className="flex items-center space-x-1.5 mb-1 font-mono text-[10px]">
            <span className="bg-[#E8DFC8] dark:bg-[#332F28] px-1 py-0.2 border border-[#1B1A17] text-[#1B1A17] dark:text-[#EDE5D6] font-bold">
              {numeroFormatado}
            </span>
            <span className="text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 font-medium">
              LOTE: 2024-SP
            </span>
          </div>

          <button
            onClick={() => selecionarFicha(ficha.id)}
            className="text-left font-serif text-xl md:text-2xl font-bold text-[#1B1A17] dark:text-[#EDE5D6] tracking-tight leading-tight hover:underline cursor-pointer"
          >
            {ficha.empresa}
          </button>

          <p className="font-mono text-[10px] md:text-xs text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 uppercase tracking-wider font-semibold mt-0.5">
            {ficha.nicho} · {ficha.bairro} · {ficha.cidade}
          </p>
        </div>

        {/* Placar Vintage com Score Gigante */}
        <div className="flex flex-col items-end shrink-0">
          <div className="bg-[#F8F3ED] dark:bg-[#1E1C19] border-2 border-[#1B1A17] dark:border-[#EDE5D6] px-2.5 py-1 text-center min-w-[54px] hard-shadow-sm">
            <span className="block font-mono text-[8px] text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 font-bold leading-none tracking-tighter">
              SCORE
            </span>
            <span className="font-serif text-2xl font-black text-[#E8431F] leading-none">
              {ficha.pontuacao ?? 50}
            </span>
          </div>
        </div>
      </div>

      {/* Reputação Google & Carimbo de Prioridade */}
      <div className="flex justify-between items-center my-2.5">
        <div className="flex items-center space-x-1 font-mono text-xs text-[#1B1A17] dark:text-[#EDE5D6]">
          <span className="font-bold text-[#D9A21B] flex items-center gap-0.5">
            <Star className="w-3.5 h-3.5 fill-[#D9A21B] text-[#D9A21B]" />
            {ficha.notaGoogle ? String(ficha.notaGoogle).replace('.', ',') : '4,5'}
          </span>
          <span className="text-[10px] text-[#1B1A17]/60 dark:text-[#EDE5D6]/60">
            ({ficha.avaliacoes || 100} avaliações no Google)
          </span>
        </div>

        <CarimboPrioridade prioridade={ficha.prioridade} tamanho="sm" />
      </div>

      {/* Marca-texto Amarelo Vibrante: Serviço Recomendado */}
      <div className="my-2 bg-[#F8F3ED] dark:bg-[#1E1C19] p-2 border-l-3 border-[#D9A21B]">
        <p className="text-xs md:text-sm text-[#1B1A17] dark:text-[#EDE5D6] leading-snug">
          <span className="highlighter-wash font-medium">
            Serviço recomendado: {ficha.servicoRecomendado || 'Site novo responsivo + Funil WhatsApp'}
          </span>
        </p>
      </div>

      {/* Selos de Presença Digital (5 Pontos) */}
      <div className="pt-1 pb-2">
        <span className="block font-mono text-[9px] uppercase text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 font-bold mb-1.5 tracking-wider">
          DIAGNÓSTICO DIGITAL // 5 PONTOS:
        </span>
        <SeloPresenca ficha={ficha} layout="grid" />
      </div>

      {/* Anotação rápida do caderno (se houver) */}
      {ficha.anotacao && (
        <div className="my-2 p-2 bg-[#E8DFC8]/50 dark:bg-[#332F28] border border-dashed border-[#1B1A17]/50 font-mono text-[11px] italic text-[#1B1A17] dark:text-[#EDE5D6] flex items-start gap-1.5">
          <Edit3 className="w-3 h-3 text-[#E8431F] mt-0.5 shrink-0" />
          <span>"{ficha.anotacao}"</span>
        </div>
      )}

      {/* Picote & Barra de Ações Rápidas */}
      <div className="mt-3 pt-2.5 border-t border-dashed border-[#1B1A17] flex justify-between items-center text-xs font-mono">
        <button
          onClick={() => descartarFicha(ficha.id)}
          className="text-[#E8431F] hover:underline flex items-center gap-1 font-medium cursor-pointer p-1"
          title="Descartar ficha da lista"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Descartar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alternarSeparada(ficha.id)}
            className={`px-2 py-1 border border-[#1B1A17] flex items-center gap-1 font-bold text-[11px] cursor-pointer ${
              ficha.separada
                ? 'bg-[#E8431F] text-white shadow-[1px_1px_0px_#1B1A17]'
                : 'bg-[#FDF9F3] text-[#1B1A17] hover:bg-[#E8DFC8]'
            }`}
          >
            {ficha.separada ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Separada ✓</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Separar</span>
              </>
            )}
          </button>

          <button
            onClick={() => selecionarFicha(ficha.id)}
            className="bg-[#1B1A17] text-white dark:bg-[#EDE5D6] dark:text-[#1B1A17] border border-[#1B1A17] px-2.5 py-1 flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider hard-shadow-sm active:translate-y-0.5 cursor-pointer"
          >
            <span>Dossiê</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
};
