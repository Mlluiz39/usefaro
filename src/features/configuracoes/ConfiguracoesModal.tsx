import React, { useState } from 'react';
import { useGuiaStore } from '../../store/useGuiaStore';
import { exportarCSV, exportarJSON } from '../../lib/exporters';
import {
  X,
  Trash2,
  Sparkles,
  Sun,
  Moon,
  Download,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const ConfiguracoesModal: React.FC = () => {
  const {
    fichas,
    modalConfigAberto,
    setModalConfig,
    limparTudo,
    carregarExemplo,
    temaKraft,
    alternarTemaKraft,
  } = useGuiaStore();

  const [confirmandoLimpeza, setConfirmandoLimpeza] = useState(false);

  if (!modalConfigAberto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configurações do Guia de Campo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-md bg-[#F2EBDD] dark:bg-[#201D1A] border-2 border-[#1B1A17] dark:border-[#EDE5D6] hard-shadow-lg flex flex-col overflow-hidden animate-fade-in font-mono">
        {/* Cabeçalho */}
        <div className="bg-[#E8DFC8] dark:bg-[#2D2A24] px-4 py-3 border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] flex justify-between items-center">
          <h2 className="font-serif text-lg font-bold text-[#1B1A17] dark:text-[#EDE5D6]">
            Configurações do Caderno
          </h2>
          <button
            onClick={() => setModalConfig(false)}
            className="p-1 border border-[#1B1A17] bg-[#FDF9F3] text-[#1B1A17] hover:bg-[#ffdad6] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Opções */}
        <div className="p-4 space-y-4 text-xs">
          {/* 1. Tema Visual */}
          <div className="border border-[#1B1A17] p-3 bg-[#FDF9F3] dark:bg-[#282520] space-y-2">
            <span className="font-bold uppercase text-[10px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 block">
              ESTILO VISUAL DO PAPEL:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (temaKraft) alternarTemaKraft();
                }}
                className={`flex-1 py-2 px-3 border border-[#1B1A17] flex items-center justify-center gap-2 font-bold cursor-pointer ${
                  !temaKraft
                    ? 'bg-[#E8431F] text-white hard-shadow-sm'
                    : 'bg-[#E8DFC8] text-[#1B1A17]'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Papel Claro (#F2EBDD)</span>
              </button>

              <button
                onClick={() => {
                  if (!temaKraft) alternarTemaKraft();
                }}
                className={`flex-1 py-2 px-3 border border-[#1B1A17] flex items-center justify-center gap-2 font-bold cursor-pointer ${
                  temaKraft
                    ? 'bg-[#E8431F] text-white hard-shadow-sm'
                    : 'bg-[#E8DFC8] text-[#1B1A17]'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Kraft Escuro</span>
              </button>
            </div>
          </div>

          {/* 2. Gerenciamento do Acervo */}
          <div className="border border-[#1B1A17] p-3 bg-[#FDF9F3] dark:bg-[#282520] space-y-2">
            <span className="font-bold uppercase text-[10px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 block">
              DADOS E ACERVO:
            </span>

            <button
              onClick={async () => {
                await carregarExemplo();
                setModalConfig(false);
              }}
              className="w-full py-2 px-3 bg-[#D9A21B] text-[#1B1A17] border border-[#1B1A17] font-bold uppercase hard-shadow-sm active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Restaurar 8 Fichas de Exemplo (SP)</span>
            </button>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => exportarCSV(fichas, 'backup_completo_guia.csv')}
                className="flex-1 py-1.5 px-2 bg-[#E8DFC8] border border-[#1B1A17] font-bold uppercase text-[10px] flex items-center justify-center gap-1 hover:bg-[#D9A21B] cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Backup CSV</span>
              </button>
              <button
                onClick={() => exportarJSON(fichas, 'backup_completo_guia.json')}
                className="flex-1 py-1.5 px-2 bg-[#E8DFC8] border border-[#1B1A17] font-bold uppercase text-[10px] flex items-center justify-center gap-1 hover:bg-[#D9A21B] cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Backup JSON</span>
              </button>
            </div>
          </div>

          {/* 3. Limpar Tudo (Zona Crítica) */}
          <div className="border-2 border-[#ba1a1a] p-3 bg-[#ffdad6]/40 space-y-2">
            <span className="font-bold uppercase text-[10px] text-[#ba1a1a] block">
              ZONA DE EXCLUSÃO:
            </span>

            {!confirmandoLimpeza ? (
              <button
                onClick={() => setConfirmandoLimpeza(true)}
                className="w-full py-2 px-3 bg-[#ba1a1a] text-white border border-[#1B1A17] font-bold uppercase text-xs flex items-center justify-center gap-2 active:translate-y-0.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar Todo o Caderno ({fichas.length} Fichas)</span>
              </button>
            ) : (
              <div className="space-y-2 text-center bg-[#ffdad6] p-2 border border-[#ba1a1a]">
                <p className="text-[11px] font-bold text-[#ba1a1a]">
                  Tem certeza? Todos os dados salvos no IndexedDB serão apagados!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmandoLimpeza(false)}
                    className="flex-1 py-1 bg-white border border-[#1B1A17] font-bold text-[10px] cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      await limparTudo();
                      setConfirmandoLimpeza(false);
                      setModalConfig(false);
                    }}
                    className="flex-1 py-1 bg-[#ba1a1a] text-white border border-[#1B1A17] font-bold text-[10px] cursor-pointer"
                  >
                    Confirmar e Apagar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Informativo de armazenamento */}
          <div className="flex items-start gap-2 text-[10px] text-[#2F4A3A] bg-[#cbead4]/50 p-2.5 border border-[#2F4A3A]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              O Guia de Campo opera 100% no seu navegador através de IndexedDB (`idb-keyval`). Não há banco de dados na nuvem nem cookies de rastreamento.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
