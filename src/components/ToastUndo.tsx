import React from 'react';
import { useGuiaStore } from '../store/useGuiaStore';
import { RotateCcw, X } from 'lucide-react';

export const ToastUndo: React.FC = () => {
  const { toast, fecharToast } = useGuiaStore();

  if (!toast) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-[#1B1A17] text-[#F2EBDD] border-2 border-[#1B1A17] p-3 hard-shadow-lg flex items-center justify-between gap-3 animate-fade-in"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="w-2.5 h-2.5 bg-[#E8431F] shrink-0" />
        <span className="font-mono text-xs font-medium truncate">{toast.texto}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {toast.onUndo && (
          <button
            onClick={() => {
              if (toast.onUndo) toast.onUndo();
              fecharToast();
            }}
            className="bg-[#D9A21B] text-[#1B1A17] px-2.5 py-1 font-mono text-xs font-bold uppercase border border-[#1B1A17] flex items-center gap-1 hover:brightness-105 active:translate-y-0.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Desfazer</span>
          </button>
        )}

        <button
          onClick={fecharToast}
          aria-label="Fechar notificação"
          className="text-[#F2EBDD]/70 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
