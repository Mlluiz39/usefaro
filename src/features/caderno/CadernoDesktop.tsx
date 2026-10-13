import React, { useState, useEffect } from 'react';
import { useGuiaStore } from '../../store/useGuiaStore';
import { exportarCSV, exportarJSON, exportarXLSX } from '../../lib/exporters';
import { gerarRoteiroAbordagem } from '../../lib/roteiroAbordagem';
import {
  Bookmark,
  Paperclip,
  Phone,
  Copy,
  Check,
  Download,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const CadernoDesktop: React.FC = () => {
  const {
    fichas,
    notasRonda,
    salvarNotasRonda,
    salvarAnotacaoFicha,
    alternarSeparada,
    selecionarFicha,
  } = useGuiaStore();

  const separadas = fichas.filter((f) => f.separada && !f.descartada);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [textoNotasLocal, setTextoNotasLocal] = useState(notasRonda);

  useEffect(() => {
    setTextoNotasLocal(notasRonda);
  }, [notasRonda]);

  const handleCopiarRoteiro = (ficha: typeof fichas[0]) => {
    const roteiro = gerarRoteiroAbordagem(ficha, 'direto');
    navigator.clipboard?.writeText(roteiro);
    setCopiadoId(ficha.id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const handleSalvarNotasRonda = (texto: string) => {
    setTextoNotasLocal(texto);
    salvarNotasRonda(texto);
  };

  const dataHoje = new Date().toLocaleDateString('pt-BR');

  return (
    <aside className="sticky top-16 space-y-4 font-mono">
      {/* Prancheta / Caderno de Campo */}
      <div className="bg-[#F4EFEA] dark:bg-[#201D1A] border-2 border-[#1B1A17] dark:border-[#EDE5D6] hard-shadow flex flex-col relative">
        {/* Grampo de Prancheta Superior */}
        <div className="w-full bg-[#1B1A17] text-[#EDE5D6] px-4 py-2 border-b-2 border-[#1B1A17] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D9A21B] border border-[#1B1A17] inline-block" />
            <span className="text-xs font-bold tracking-wider uppercase">
              CADERNO DE CAMPO
            </span>
          </div>
          <span className="text-[10px] bg-[#E8431F] text-white px-1.5 py-0.2 font-bold">
            SEPARADAS ({separadas.length})
          </span>
        </div>

        {/* Subcabeçalho de Expedição */}
        <div className="p-3 bg-[#F8F3ED] dark:bg-[#282520] border-b-2 border-[#1B1A17]/40 flex justify-between items-center text-[10px]">
          <div>
            <span className="text-[#1B1A17]/60 dark:text-[#EDE5D6]/60">RONDA DE HOJE:</span>
            <strong className="text-[#1B1A17] dark:text-[#EDE5D6] ml-1">
              {dataHoje} · SÃO PAULO
            </strong>
          </div>
          <span className="text-[#2F4A3A] font-bold">
            {separadas.length > 0 ? '✓ PRONTO P/ DISPARO' : 'NENHUMA SEPARADA'}
          </span>
        </div>

        {/* Lista de Fichas Separadas */}
        <div className="p-3.5 space-y-3.5 max-h-[460px] overflow-y-auto">
          {separadas.length === 0 ? (
            <div className="p-6 border-2 border-dashed border-[#1B1A17]/40 text-center space-y-2 bg-[#FDF9F3] dark:bg-[#1E1C19]">
              <Bookmark className="w-8 h-8 text-[#1B1A17]/30 mx-auto" />
              <p className="text-xs font-serif italic text-[#1B1A17]/70 dark:text-[#EDE5D6]/70">
                Nenhuma empresa separada no caderno.
              </p>
              <p className="text-[10px] text-[#1B1A17]/60">
                Clique no botão "Separar" em qualquer ficha à esquerda para fixá-la na sua rota de abordagem.
              </p>
            </div>
          ) : (
            separadas.map((f) => (
              <div
                key={f.id}
                className="bg-[#FDF9F3] dark:bg-[#282520] border-2 border-[#1B1A17] dark:border-[#EDE5D6] p-3 hard-shadow-sm relative"
              >
                {/* Clip Decorativo */}
                <div className="absolute -top-3 -right-2 w-7 h-7 flex items-center justify-center text-[#E8431F]">
                  <Paperclip className="w-6 h-6 rotate-45" strokeWidth={2.5} />
                </div>

                <div className="flex justify-between items-start pr-4">
                  <div>
                    <span className="text-[9px] bg-[#E8431F] text-white px-1 py-0.2 font-bold uppercase">
                      {f.prioridade} PRIORIDADE
                    </span>
                    <h4 className="font-serif text-base font-bold text-[#1B1A17] dark:text-[#EDE5D6] mt-1 leading-snug">
                      {f.empresa}
                    </h4>
                    <p className="text-[10px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70">
                      {f.nicho} · {f.bairro}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-serif text-xl font-bold text-[#E8431F]">
                      {f.pontuacao}
                    </span>
                  </div>
                </div>

                {/* Campo de Anotações com Auto-Save */}
                <div className="mt-2.5 pt-2 border-t border-[#1B1A17]/20 bg-[#F8F3ED]/70 dark:bg-[#1E1C19] p-2 border border-dashed border-[#1B1A17]/30">
                  <div className="flex items-center justify-between text-[9px] text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <Edit3 className="w-3 h-3 text-[#E8431F]" />
                      <span>ANOTAÇÃO DE CAMPO:</span>
                    </span>
                    <span className="text-[#2F4A3A]">SALVO</span>
                  </div>

                  <input
                    type="text"
                    value={f.anotacao || ''}
                    onChange={(e) => salvarAnotacaoFicha(f.id, e.target.value)}
                    placeholder="Adicionar anotação (ex: falar c/ gerente após 16h)..."
                    className="w-full bg-transparent text-[11px] italic font-serif text-[#1B1A17] dark:text-[#EDE5D6] outline-none border-b border-[#1B1A17]/20 pb-0.5"
                  />
                </div>

                {/* Ações Rápidas */}
                <div className="mt-2.5 flex items-center gap-1.5 pt-1 border-t border-[#1B1A17]/10">
                  <button
                    onClick={() => handleCopiarRoteiro(f)}
                    className="flex-1 bg-[#E8DFC8] dark:bg-[#332F28] border border-[#1B1A17] py-1 px-1.5 text-[10px] font-bold uppercase flex items-center justify-center gap-1 hover:bg-[#D9A21B] active:translate-y-0.5 cursor-pointer"
                  >
                    {copiadoId === f.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiadoId === f.id ? 'COPIADO!' : 'ROTEIRO WHATS'}</span>
                  </button>

                  {f.telefone && (
                    <a
                      href={`tel:${f.telefone.replace(/\D/g, '')}`}
                      className="bg-[#2F4A3A] text-white border border-[#1B1A17] py-1 px-2 text-[10px] font-bold uppercase flex items-center justify-center gap-1 hover:brightness-110"
                      title={`Ligar: ${f.telefone}`}
                    >
                      <Phone className="w-3 h-3" />
                      <span>Ligar</span>
                    </a>
                  )}

                  <button
                    onClick={() => selecionarFicha(f.id)}
                    className="p-1 border border-[#1B1A17] bg-[#FDF9F3] hover:bg-[#E8DFC8]"
                    title="Ver dossiê completo"
                  >
                    <ExternalLink className="w-3 h-3 text-[#1B1A17]" />
                  </button>

                  <button
                    onClick={() => alternarSeparada(f.id)}
                    className="p-1 border border-[#1B1A17] text-[#E8431F] hover:bg-[#ffdad6]"
                    title="Remover do caderno"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Bloco Pautado: Notas da Ronda (Pauta Livre) */}
          <div className="border-2 border-[#1B1A17] dark:border-[#EDE5D6] bg-[#FDF9F3] dark:bg-[#1E1C19] p-3 hard-shadow-sm">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1B1A17]/30">
              <div className="font-bold flex items-center space-x-1.5 text-[11px]">
                <FileText className="w-3.5 h-3.5 text-[#E8431F]" />
                <span>NOTAS DA RONDA // SÃO PAULO</span>
              </div>
              <span className="text-[9px] bg-[#E8DFC8] dark:bg-[#332F28] px-1 font-bold">
                PAUTA LIVRE
              </span>
            </div>

            <textarea
              rows={4}
              value={textoNotasLocal}
              onChange={(e) => handleSalvarNotasRonda(e.target.value)}
              placeholder="Anotações gerais da ronda de hoje..."
              className="w-full mt-2 bg-transparent text-xs notebook-lines outline-none resize-none font-sans text-[#1B1A17] dark:text-[#EDE5D6]"
            />
            <div className="text-[9px] text-[#1B1A17]/60 dark:text-[#EDE5D6]/60 text-right mt-1">
              Sincronizado automaticamente no IndexedDB
            </div>
          </div>
        </div>

        {/* Base do Caderno: Exportações */}
        <div className="p-3 bg-[#E8DFC8] dark:bg-[#2D2A24] border-t-2 border-[#1B1A17] dark:border-[#EDE5D6] space-y-2">
          <div className="flex gap-1.5">
            <button
              onClick={() =>
                exportarCSV(separadas.length > 0 ? separadas : fichas, 'caderno_de_campo.csv')
              }
              className="flex-1 bg-[#1B1A17] text-white border-2 border-[#1B1A17] py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider hard-shadow-sm active:translate-y-0.5 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={() =>
                exportarXLSX(separadas.length > 0 ? separadas : fichas, 'caderno_de_campo.xlsx')
              }
              className="flex-1 bg-[#FDF9F3] text-[#1B1A17] border-2 border-[#1B1A17] py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider hard-shadow-sm active:translate-y-0.5 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>XLSX</span>
            </button>
            <button
              onClick={() =>
                exportarJSON(separadas.length > 0 ? separadas : fichas, 'caderno_de_campo.json')
              }
              className="p-1.5 bg-[#FDF9F3] text-[#1B1A17] border-2 border-[#1B1A17] text-[10px] font-bold uppercase hard-shadow-sm active:translate-y-0.5 cursor-pointer"
              title="Exportar JSON"
            >
              JSON
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1 text-[#1B1A17]/70 dark:text-[#EDE5D6]/70">
            <span>
              TOTAL: <strong>{separadas.length} ALVOS SELECIONADOS</strong>
            </span>
            {separadas.length > 0 && (
              <button
                onClick={() => {
                  separadas.forEach((f) => alternarSeparada(f.id));
                }}
                className="text-[#E8431F] hover:underline cursor-pointer"
              >
                Limpar Caderno
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cartorial Trust Badge */}
      <div className="p-2.5 bg-[#F8F3ED] dark:bg-[#282520] border border-[#1B1A17]/40 flex items-center gap-2.5 text-[10px] text-[#1B1A17]/80 dark:text-[#EDE5D6]/80">
        <ShieldCheck className="w-5 h-5 text-[#2F4A3A] shrink-0" />
        <div>
          <div className="font-bold text-[#1B1A17] dark:text-[#EDE5D6]">LEI DE PROTEÇÃO B2B</div>
          <div>Dossiê gerado com base em dados públicos do Google Maps e Receita Federal.</div>
        </div>
      </div>
    </aside>
  );
};
