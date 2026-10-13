import React from 'react';

interface Props {
  posicao?: 'top-right' | 'top-left' | 'center-top';
  className?: string;
  rotacao?: string;
}

export const FitaAdesiva: React.FC<Props> = ({
  posicao = 'top-right',
  className = '',
  rotacao,
}) => {
  const rot = rotacao || (posicao === 'top-right' ? 'rotate-2' : '-rotate-2');
  const posClasse = {
    'top-right': '-top-2.5 right-6 w-20 h-5',
    'top-left': '-top-2.5 left-6 w-20 h-5',
    'center-top': '-top-2.5 left-1/2 -translate-x-1/2 w-24 h-5',
  }[posicao];

  return (
    <div
      aria-hidden="true"
      className={`absolute ${posClasse} ${rot} tape-accent pointer-events-none z-20 ${className}`}
    />
  );
};
