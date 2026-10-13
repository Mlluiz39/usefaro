import React, { useState } from 'react';
import { useGuiaStore } from './store/useGuiaStore';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastUndo } from './components/ToastUndo';
import { CapaView } from './features/capa/CapaView';
import { ListaFichas } from './features/fichas/ListaFichas';
import { DossieDetalhe } from './features/dossie/DossieDetalhe';
import { CadernoDesktop } from './features/caderno/CadernoDesktop';
import { FiltrosModal } from './features/fichas/FiltrosModal';
import { ImportacaoModal } from './features/importacao/ImportacaoModal';
import { ConfiguracoesModal } from './features/configuracoes/ConfiguracoesModal';

export default function App() {
  const {
    fichaSelecionadaId,
    selecionarFicha,
    abaMobile,
    setAbaMobile,
    fichas,
  } = useGuiaStore();

  const [mostrarCapa, setMostrarCapa] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-[#F2EBDD] dark:bg-[#1E1C19] text-[#1B1A17] dark:text-[#EDE5D6] transition-colors pb-24 md:pb-12">
      {/* Top App Bar */}
      <Header
        mostrarBotaoCapa={!mostrarCapa && !fichaSelecionadaId}
        onAbrirCapa={() => {
          setMostrarCapa(true);
          selecionarFicha(null);
        }}
      />

      {/* Conteúdo Principal */}
      <main className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 pt-4">
        {/* CASO 1: DETALHE DO DOSSIÊ (/ficha/:id) */}
        {fichaSelecionadaId ? (
          <DossieDetalhe
            fichaId={fichaSelecionadaId}
            onVoltar={() => selecionarFicha(null)}
          />
        ) : mostrarCapa ? (
          /* CASO 2: CAPA E ÍNDICE DO GUIA */
          <CapaView
            onVerTodasFichas={() => {
              setMostrarCapa(false);
              setAbaMobile('fichas');
            }}
          />
        ) : (
          /* CASO 3: MURAL DE FICHAS / LISTA (ADAPTADO MOBILE & DESKTOP 1440PX) */
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Coluna Esquerda: Mural de Fichas (Mobile 100%, Desktop 8 de 12 colunas) */}
            <div className="col-span-12 lg:col-span-8">
              <ListaFichas apenasSeparadas={abaMobile === 'separadas'} />
            </div>

            {/* Coluna Direita: O Caderno de Campo (Apenas Desktop 4 de 12 colunas) */}
            <div className="hidden lg:block lg:col-span-4">
              <CadernoDesktop />
            </div>
          </div>
        )}
      </main>

      {/* Barra de Navegação Inferior para Mobile */}
      <BottomNav />

      {/* Notificação Toast com Desfazer */}
      <ToastUndo />

      {/* Modais Globais */}
      <FiltrosModal />
      <ImportacaoModal />
      <ConfiguracoesModal />

      {/* Rodapé Editorial Desktop */}
      <footer className="hidden md:block mt-16 border-t-2 border-[#1B1A17] dark:border-[#EDE5D6] bg-[#E8DFC8] dark:bg-[#282520] py-4 text-[#1B1A17] dark:text-[#EDE5D6] font-mono text-xs">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <span>GUIA DE CAMPO B2B © 2026</span>
            <span>·</span>
            <span>PROSPECÇÃO ATIVA LOCAL</span>
            <span>·</span>
            <span className="text-[#2F4A3A] font-bold">100% NO NAVEGADOR (INDEXEDDB)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>AUDITORIA DE DADOS PÚBLICOS</span>
            <span className="bg-[#FDF9F3] dark:bg-[#1E1C19] px-2 py-0.5 border border-[#1B1A17] font-bold">
              DESKTOP 1440PX // ESTAÇÃO PRIMÁRIA
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
