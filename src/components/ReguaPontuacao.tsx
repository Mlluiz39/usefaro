import React from 'react';
import { PontosFicha } from '../types';

interface Props {
  pts: PontosFicha;
  pontuacaoTotal?: number;
}

interface ItemRegua {
  id: string;
  titulo: string;
  valor: number;
  max: number;
  descricao: string;
  corBarra?: string;
}

export const ReguaPontuacao: React.FC<Props> = ({ pts, pontuacaoTotal }) => {
  const reguas: ItemRegua[] = [
    {
      id: 'anuncios',
      titulo: '1. ANÚNCIOS (POTENCIAL)',
      valor: pts.anuncios ?? 14,
      max: 20,
      descricao: 'Oportunidade urgente de tráfego local e reestruturação',
      corBarra: '#1B1A17',
    },
    {
      id: 'site',
      titulo: '2. SITE (NECESSIDADE DE REFATORAÇÃO)',
      valor: pts.site ?? 15,
      max: 20,
      descricao: 'Site atual lento prejudica reputação e queima cliques',
      corBarra: '#1B1A17',
    },
    {
      id: 'seo',
      titulo: '3. SEO LOCAL & AVALIAÇÕES',
      valor: pts.seo ?? 12,
      max: 15,
      descricao: 'Autoridade orgânica no Google Meu Negócio',
      corBarra: '#2F4A3A',
    },
    {
      id: 'conversao',
      titulo: '4. CONVERSÃO DIRETA',
      valor: pts.conversao ?? 11,
      max: 15,
      descricao: 'Funil e velocidade para contato imediato',
      corBarra: '#1B1A17',
    },
    {
      id: 'contato',
      titulo: '5. CANAIS DE CONTATO',
      valor: pts.contato ?? 8,
      max: 15,
      descricao: 'Disponibilidade de botão WhatsApp e telefone direto',
      corBarra: '#D9A21B',
    },
    {
      id: 'fit',
      titulo: '6. FIT COMERCIAL (TICKET MÉDIO)',
      valor: pts.fit ?? 8,
      max: 15,
      descricao: 'Serviços de alto valor agregado e potencial de fechamento',
      corBarra: '#2F4A3A',
    },
  ];

  return (
    <div className="space-y-3 font-mono">
      {reguas.map((r) => {
        const perc = Math.min(100, Math.max(0, Math.round((r.valor / r.max) * 100)));
        return (
          <div key={r.id} className="border-b border-[#1B1A17]/20 pb-2">
            <div className="flex justify-between items-baseline mb-1 text-[11px]">
              <span className="font-bold text-[#1B1A17]">{r.titulo}</span>
              <span className="font-bold text-[#E8431F]">
                {r.valor} / {r.max} pts
              </span>
            </div>

            {/* Régua analógica com marcações de nanquim */}
            <div className="relative h-4 border border-[#1B1A17] bg-[#E6E2DC] overflow-hidden flex items-center">
              {/* Preenchimento */}
              <div
                className="h-full border-r border-[#1B1A17] transition-all duration-300"
                style={{
                  width: `${perc}%`,
                  backgroundColor: r.corBarra || '#1B1A17',
                }}
              />

              {/* Tracinhos graduados de escala impressa */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to right, #1B1A17 0, #1B1A17 1px, transparent 1px, transparent 8px)',
                }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#1B1A17]/70 mt-0.5">
              <span>{r.descricao}</span>
              <span className="font-semibold">{perc}%</span>
            </div>
          </div>
        );
      })}

      {pontuacaoTotal !== undefined && (
        <div className="mt-3 p-2.5 bg-[#F8F3ED] border-2 border-[#1B1A17] text-center hard-shadow-sm">
          <span className="font-mono text-xs font-bold text-[#E8431F] uppercase tracking-wider block">
            TOTAL CONSOLIDADO: {pontuacaoTotal} PONTOS
          </span>
        </div>
      )}
    </div>
  );
};
