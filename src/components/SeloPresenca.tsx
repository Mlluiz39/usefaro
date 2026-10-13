import React from 'react';
import { Ficha } from '../types';

interface Props {
  ficha: Ficha;
  layout?: 'grid' | 'linha';
}

export const SeloPresenca: React.FC<Props> = ({ ficha, layout = 'grid' }) => {
  const metaAtivo = ficha.metaAds === true;
  const googleAtivo = ficha.googleAds === true;
  const instaPresente = Boolean(ficha.instagram && ficha.instagram.trim().length > 0);
  const whatsPresente = Boolean(ficha.whatsapp && ficha.whatsapp.trim().length > 0);
  const sitePresente = Boolean(ficha.website && ficha.website.trim().length > 0);

  if (layout === 'linha') {
    return (
      <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
        {/* Meta Ads */}
        <span
          className={`px-1.5 py-0.5 border border-[#1B1A17] flex items-center gap-1 ${
            metaAtivo
              ? 'bg-[#2F4A3A] text-[#F2EBDD] font-bold'
              : 'bg-[#F8F3ED] text-[#1B1A17]/60 line-through'
          }`}
        >
          {metaAtivo ? 'Meta Ads: Ativo' : 'Meta Ads: Inativo'}
        </span>

        {/* Google Ads */}
        <span
          className={`px-1.5 py-0.5 border border-[#1B1A17] flex items-center gap-1 ${
            googleAtivo
              ? 'bg-[#2F4A3A] text-[#F2EBDD] font-bold'
              : 'bg-[#F8F3ED] text-[#1B1A17]/60 line-through'
          }`}
        >
          {googleAtivo ? 'Google Ads: Ativo' : 'Google Ads: Inativo'}
        </span>

        {/* Instagram */}
        <span
          className={`px-1.5 py-0.5 border border-[#1B1A17] flex items-center gap-1 ${
            instaPresente
              ? 'bg-[#FDF9F3] text-[#1B1A17] font-semibold'
              : 'bg-[#F8F3ED] text-[#1B1A17]/60 line-through'
          }`}
        >
          Instagram
        </span>

        {/* WhatsApp */}
        <span
          className={`px-1.5 py-0.5 border border-[#1B1A17] flex items-center gap-1 ${
            whatsPresente
              ? 'bg-[#2F4A3A]/20 text-[#2F4A3A] font-bold'
              : 'bg-[#ffdad6] text-[#ba1a1a] font-semibold'
          }`}
        >
          {whatsPresente ? 'WhatsApp: Ok' : 'WhatsApp: S/ Botão'}
        </span>

        {/* Site */}
        <span
          className={`px-1.5 py-0.5 border border-[#1B1A17] flex items-center gap-1 ${
            sitePresente
              ? 'bg-[#FDF9F3] text-[#1B1A17]'
              : 'bg-[#ffdad6] text-[#ba1a1a] line-through font-semibold'
          }`}
        >
          {sitePresente
            ? `Site (${ficha.performanceMobile ? `${ficha.performanceMobile}pts` : 'Ok'})`
            : 'Site: Ausente'}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
      {/* Meta Ads */}
      <div
        className={`border border-[#1B1A17] px-2 py-1 flex items-center justify-between ${
          metaAtivo
            ? 'bg-[#FDF9F3] shadow-[1px_1px_0px_#1B1A17]'
            : 'bg-[#E8DFC8] opacity-80'
        }`}
      >
        <span className={metaAtivo ? 'font-bold' : 'line-through text-[#1B1A17]/70'}>
          Meta Ads
        </span>
        <span
          className={`text-[9px] font-bold uppercase px-1 border border-[#1B1A17]/30 ${
            metaAtivo ? 'bg-[#2F4A3A] text-white' : 'bg-[#E8431F]/20 text-[#E8431F]'
          }`}
        >
          {metaAtivo ? 'ATIVO' : 'RISCADO'}
        </span>
      </div>

      {/* Google Ads */}
      <div
        className={`border border-[#1B1A17] px-2 py-1 flex items-center justify-between ${
          googleAtivo
            ? 'bg-[#FDF9F3] shadow-[1px_1px_0px_#1B1A17]'
            : 'bg-[#E8DFC8] opacity-80'
        }`}
      >
        <span className={googleAtivo ? 'font-bold' : 'line-through text-[#1B1A17]/70'}>
          Google Ads
        </span>
        <span
          className={`text-[9px] font-bold uppercase px-1 border border-[#1B1A17]/30 ${
            googleAtivo ? 'bg-[#2F4A3A] text-white' : 'bg-[#E8431F]/20 text-[#E8431F]'
          }`}
        >
          {googleAtivo ? 'ATIVO' : 'INATIVO'}
        </span>
      </div>

      {/* Instagram */}
      <div className="border border-[#1B1A17] bg-[#FDF9F3] px-2 py-1 flex items-center justify-between shadow-[1px_1px_0px_#1B1A17]">
        <span className="font-medium">Instagram</span>
        <span
          className={`text-[9px] font-bold px-1 ${
            instaPresente ? 'bg-[#2F4A3A]/20 text-[#2F4A3A]' : 'text-[#E8431F] line-through'
          }`}
        >
          {instaPresente ? 'PRESENTE' : 'AUSENTE'}
        </span>
      </div>

      {/* WhatsApp */}
      <div
        className={`border border-[#1B1A17] px-2 py-1 flex items-center justify-between ${
          whatsPresente
            ? 'bg-[#FDF9F3] shadow-[1px_1px_0px_#1B1A17]'
            : 'bg-[#ffdad6] text-[#ba1a1a]'
        }`}
      >
        <span className={whatsPresente ? 'font-medium' : 'line-through'}>WhatsApp</span>
        <span
          className={`text-[9px] font-bold px-1 ${
            whatsPresente ? 'bg-[#2F4A3A] text-white' : 'bg-[#E8431F] text-white'
          }`}
        >
          {whatsPresente ? 'ATIVO' : 'S/ BOTÃO'}
        </span>
      </div>

      {/* Site Oficial */}
      <div
        className={`col-span-2 border border-[#1B1A17] px-2 py-1 flex items-center justify-between ${
          sitePresente ? 'bg-[#FDF9F3]' : 'bg-[#ffdad6]'
        }`}
      >
        <span className={sitePresente ? 'font-medium' : 'line-through text-[#ba1a1a]'}>
          Site Oficial
        </span>
        <span
          className={`text-[9px] font-bold px-1 border border-[#1B1A17]/30 ${
            sitePresente
              ? (ficha.performanceMobile || 0) < 50
                ? 'bg-[#D9A21B]/40 text-[#7a5900]'
                : 'bg-[#2F4A3A]/30 text-[#2F4A3A]'
              : 'bg-[#ba1a1a] text-white'
          }`}
        >
          {sitePresente
            ? `PRESENTE (${ficha.performanceMobile ? `${ficha.performanceMobile}pts` : 'Ok'})`
            : 'AUSENTE'}
        </span>
      </div>
    </div>
  );
};
