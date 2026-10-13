import React from 'react';
import { useGuiaStore } from '../store/useGuiaStore';
import { FolderOpen, Settings, Upload, BookOpen, Sun, Moon } from 'lucide-react';

interface Props {
  onAbrirCapa?: () => void;
  mostrarBotaoCapa?: boolean;
}

export const Header: React.FC<Props> = ({ onAbrirCapa, mostrarBotaoCapa = false }) => {
  const {
    fichas,
    setModalImportacao,
    setModalConfig,
    temaKraft,
    alternarTemaKraft,
    selecionarFicha,
  } = useGuiaStore();

  const totalAtivas = fichas.filter((f) => !f.descartada).length;

  return (
    <header className="w-full bg-[#F2EBDD] dark:bg-[#1E1C19] border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] shadow-[0px_4px_0px_#1B1A17] sticky top-0 z-40 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-2.5 flex justify-between items-center">
        {/* Marca & Título */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              selecionarFicha(null);
              if (onAbrirCapa) onAbrirCapa();
            }}
            title="Ir para Capa / Sumário"
            className="w-9 h-9 border-2 border-[#1B1A17] dark:border-[#EDE5D6] bg-[#FDF9F3] dark:bg-[#282520] flex items-center justify-center hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <FolderOpen className="w-5 h-5 text-[#E8431F]" strokeWidth={2.5} />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  selecionarFicha(null);
                  if (onAbrirCapa) onAbrirCapa();
                }}
                className="font-serif text-lg md:text-xl font-bold tracking-tight text-[#1B1A17] dark:text-[#EDE5D6] uppercase hover:underline text-left cursor-pointer"
              >
                GUIA DE CAMPO // DOSSIÊ
              </button>
              <span className="hidden sm:inline-block font-mono text-[10px] bg-[#E8431F] text-white px-1.5 py-0.2 border border-[#1B1A17] font-bold">
                CONFIDENCIAL
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 leading-none">
              CADERNO LOCAL · {totalAtivas} FICHAS ATIVAS
            </span>
          </div>
        </div>

        {/* Metadados Cartoriais no Desktop (1200px+) */}
        <div className="hidden lg:flex items-center space-x-6 border-l-2 border-r-2 border-[#1B1A17] dark:border-[#EDE5D6] px-5 py-1 bg-[#F8F3ED] dark:bg-[#282520] font-mono text-[10px]">
          <div>
            <div className="text-[#1B1A17]/60 dark:text-[#EDE5D6]/60">CIRCUNSCRIÇÃO:</div>
            <div className="font-bold text-[#1B1A17] dark:text-[#EDE5D6]">SÃO PAULO // SP</div>
          </div>
          <div className="h-5 w-[1px] bg-[#1B1A17]/30 dark:bg-[#EDE5D6]/30" />
          <div>
            <div className="text-[#1B1A17]/60 dark:text-[#EDE5D6]/60">AUDITOR:</div>
            <div className="font-bold text-[#1B1A17] dark:text-[#EDE5D6]">AGENTE LOCAL</div>
          </div>
          <div className="h-5 w-[1px] bg-[#1B1A17]/30 dark:bg-[#EDE5D6]/30" />
          <div>
            <div className="text-[#1B1A17]/60 dark:text-[#EDE5D6]/60">STORAGE:</div>
            <div className="font-bold text-[#2F4A3A] dark:text-[#4C755E]">INDEXEDDB (100% LOCAL)</div>
          </div>
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center space-x-2">
          {mostrarBotaoCapa && (
            <button
              onClick={onAbrirCapa}
              className="hidden sm:flex items-center gap-1 bg-[#FDF9F3] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] px-2.5 py-1 font-mono text-xs font-bold hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px]"
              title="Ver Capa e Índice"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#E8431F]" strokeWidth={2.5} />
              <span>Capa</span>
            </button>
          )}

          <button
            onClick={() => setModalImportacao(true)}
            className="bg-[#1B1A17] text-[#F2EBDD] dark:bg-[#EDE5D6] dark:text-[#1B1A17] border-2 border-[#1B1A17] px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 cursor-pointer"
            title="Importar Planilhas (CSV, XLSX, JSON)"
          >
            <Upload className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Importar</span>
          </button>

          <button
            onClick={alternarTemaKraft}
            className="p-1.5 bg-[#FDF9F3] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px]"
            title={temaKraft ? 'Modo Papel Claro' : 'Modo Papel Kraft Escuro'}
            aria-label="Alternar tema"
          >
            {temaKraft ? (
              <Sun className="w-4 h-4 text-[#D9A21B]" strokeWidth={2.5} />
            ) : (
              <Moon className="w-4 h-4 text-[#1B1A17]" strokeWidth={2.5} />
            )}
          </button>

          <button
            onClick={() => setModalConfig(true)}
            className="p-1.5 bg-[#FDF9F3] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px]"
            title="Configurações e Limpeza de Dados"
            aria-label="Configurações"
          >
            <Settings className="w-4 h-4 text-[#1B1A17] dark:text-[#EDE5D6]" strokeWidth={2.5} />
          </button>

          <div className="border border-[#1B1A17] dark:border-[#EDE5D6] px-1.5 py-0.5 bg-[#E8DFC8] dark:bg-[#332F28] hard-shadow-sm">
            <span className="font-mono text-[10px] font-bold text-[#1B1A17] dark:text-[#EDE5D6] tracking-wider">
              REF: 2024-B
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
