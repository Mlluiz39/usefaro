import React from 'react';
import { Prioridade } from '../types';

interface Props {
  prioridade?: Prioridade;
  tamanho?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CarimboPrioridade: React.FC<Props> = ({
  prioridade = 'Média',
  tamanho = 'md',
  className = '',
}) => {
  const estiloTamanho = {
    sm: 'text-[9px] px-1.5 py-0.5 border-[1.5px]',
    md: 'text-xs px-2 py-0.5 border-2',
    lg: 'text-sm px-3 py-1 border-[2.5px]',
  }[tamanho];

  if (prioridade === 'Alta') {
    return (
      <div
        className={`stamp-alta font-mono font-black uppercase tracking-widest ${estiloTamanho} ${className}`}
        style={{
          borderStyle: 'double',
        }}
      >
        ★ PRIORIDADE ALTA
      </div>
    );
  }

  if (prioridade === 'Média') {
    return (
      <div
        className={`stamp-media font-mono font-bold uppercase tracking-wider ${estiloTamanho} ${className}`}
        style={{
          borderStyle: 'double',
        }}
      >
        ▲ PRIORIDADE MÉDIA
      </div>
    );
  }

  return (
    <div
      className={`stamp-baixa font-mono font-semibold uppercase tracking-wider ${estiloTamanho} ${className}`}
    >
      ■ PRIORIDADE BAIXA
    </div>
  );
};
