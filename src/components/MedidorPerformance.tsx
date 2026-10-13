import React from 'react';

interface Props {
  score?: number; // 0 a 100
  tempoCargaSegundos?: number;
  lcpSegundos?: number;
}

export const MedidorPerformance: React.FC<Props> = ({
  score = 38,
  tempoCargaSegundos = 4.8,
  lcpSegundos = 4.2,
}) => {
  const scoreVal = Math.min(100, Math.max(0, score));

  // Determinar status
  let statusTexto = 'CRÍTICO';
  let corDestaque = '#E8431F'; // tomate
  let tagClass = 'bg-[#ffdad6] text-[#ba1a1a]';

  if (scoreVal >= 70) {
    statusTexto = 'IDEAL';
    corDestaque = '#2F4A3A'; // musgo
    tagClass = 'bg-[#cbead4] text-[#052013]';
  } else if (scoreVal >= 50) {
    statusTexto = 'REGULAR';
    corDestaque = '#D9A21B'; // mostarda
    tagClass = 'bg-[#fec33e]/30 text-[#7a5900]';
  }

  return (
    <div className="border-2 border-[#1B1A17] bg-[#F8F3ED] p-3 hard-shadow-sm font-mono">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B1A17]">
          VELOCIDADE MOBILE (PAGESPEED)
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 border border-[#1B1A17] ${tagClass}`}>
            {statusTexto}
          </span>
          <span className="text-xl font-black text-[#1B1A17]">
            <span style={{ color: corDestaque }}>{scoreVal}</span>
            <span className="text-xs font-normal text-[#1B1A17]/60"> / 100</span>
          </span>
        </div>
      </div>

      {/* Barra tipo termômetro analógico com escala impressa */}
      <div className="relative w-full h-6 bg-[#E6E2DC] border-2 border-[#1B1A17] flex items-center p-0.5 my-2">
        {/* Zonas de fundo (0-49 Crítico, 50-69 Regular, 70-100 Ideal) */}
        <div className="absolute inset-0 flex pointer-events-none opacity-20">
          <div className="w-[50%] bg-[#E8431F] border-r border-[#1B1A17]" />
          <div className="w-[20%] bg-[#D9A21B] border-r border-[#1B1A17]" />
          <div className="w-[30%] bg-[#2F4A3A]" />
        </div>

        {/* Barra preenchida */}
        <div
          className="h-full border-r-2 border-[#1B1A17] flex items-center justify-end px-1 transition-all duration-300 relative z-10"
          style={{
            width: `${Math.max(8, scoreVal)}%`,
            backgroundColor: corDestaque,
          }}
        >
          <span className="text-[9px] text-white font-bold leading-none">
            {scoreVal}%
          </span>
        </div>

        {/* Ponteiro indicador analógico */}
        <div
          className="absolute -top-2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-[#1B1A17] transition-all duration-300 z-20"
          style={{
            left: `calc(${scoreVal}% - 5px)`,
          }}
        />
      </div>

      {/* Rótulos da escala */}
      <div className="flex justify-between text-[9px] text-[#1B1A17]/70 font-semibold mb-3">
        <span>0 [PÉSSIMO]</span>
        <span className={scoreVal < 50 ? 'font-bold text-[#E8431F]' : ''}>50 [CRÍTICO]</span>
        <span className={scoreVal >= 50 && scoreVal < 70 ? 'font-bold text-[#D9A21B]' : ''}>
          70 [REGULAR]
        </span>
        <span className={scoreVal >= 70 ? 'font-bold text-[#2F4A3A]' : ''}>100 [IDEAL]</span>
      </div>

      {/* Cartões técnicos de latência */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="border border-[#1B1A17] p-2 bg-[#FDF9F3]">
          <span className="text-[10px] text-[#1B1A17]/70 block font-medium">TEMPO CARGA 4G</span>
          <span className="text-lg font-bold text-[#E8431F]">{tempoCargaSegundos}s</span>
          <span className="text-[9px] text-[#1B1A17]/60 block mt-0.5">Limite aceitável: 2.0s</span>
        </div>

        <div className="border border-[#1B1A17] p-2 bg-[#FDF9F3]">
          <span className="text-[10px] text-[#1B1A17]/70 block font-medium">LCP (RENDER PRINCIPAL)</span>
          <span className="text-lg font-bold text-[#E8431F]">{lcpSegundos}s</span>
          <span className="text-[9px] text-[#1B1A17]/60 block mt-0.5">LCP Crítico no celular</span>
        </div>
      </div>
    </div>
  );
};
