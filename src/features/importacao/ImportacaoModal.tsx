import React, { useState, useRef } from 'react';
import { useGuiaStore } from '../../store/useGuiaStore';
import { CampoGuia, Ficha, ModoConciliacao, ResultadoAnaliseImportacao } from '../../types';
import {
  parseCSVouTSV,
  parseExcel,
  parseJSON,
  autoMapearColunas,
  gerarAssinaturaColunas,
  recuperarMapeamentoHistorico,
  salvarMapeamentoHistorico,
  converterLinhasEmFichas,
} from '../../lib/parsers';
import { exportarCSV, exportarJSON } from '../../lib/exporters';
import { FitaAdesiva } from '../../components/FitaAdesiva';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  FileText,
  Sparkles,
  Download,
  Scissors,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ImportacaoModal: React.FC = () => {
  const {
    fichas,
    modalImportacaoAberto,
    setModalImportacao,
    importarLote,
    carregarExemplo,
  } = useGuiaStore();

  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // Dados do arquivo
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [tamanhoKb, setTamanhoKb] = useState(0);
  const [colunasArquivo, setColunasArquivo] = useState<string[]>([]);
  const [linhasArquivo, setLinhasArquivo] = useState<Record<string, unknown>[]>([]);
  const [abasDisponiveis, setAbasDisponiveis] = useState<string[]>([]);
  const [abaSelecionada, setAbaSelecionada] = useState<string>('');
  const [arquivoFile, setArquivoFile] = useState<File | null>(null);

  // Mapeamento
  const [mapeamento, setMapeamento] = useState<Record<string, CampoGuia>>({});
  const [assinaturaColunas, setAssinaturaColunas] = useState('');

  // Resultado
  const [resultado, setResultado] = useState<ResultadoAnaliseImportacao | null>(null);
  const [modoConciliacao, setModoConciliacao] = useState<ModoConciliacao>('atualizar');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!modalImportacaoAberto) return null;

  const resetar = () => {
    setPasso(1);
    setCarregando(false);
    setErroGeral(null);
    setNomeArquivo('');
    setColunasArquivo([]);
    setLinhasArquivo([]);
    setResultado(null);
    setArquivoFile(null);
  };

  const processarArquivo = async (file: File, abaParaLer?: string) => {
    setCarregando(true);
    setErroGeral(null);
    setNomeArquivo(file.name);
    setTamanhoKb(Math.round(file.size / 1024));
    setArquivoFile(file);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let cols: string[] = [];
      let rows: Record<string, unknown>[] = [];

      if (ext === 'xlsx' || ext === 'xls') {
        const res = await parseExcel(file, abaParaLer);
        setAbasDisponiveis(res.abas);
        setAbaSelecionada(res.abaAtual);
        cols = res.colunas;
        rows = res.linhas;
      } else if (ext === 'json') {
        const res = await parseJSON(file);
        cols = res.colunas;
        rows = res.linhas;
      } else {
        // CSV / TSV
        const res = await parseCSVouTSV(file);
        cols = res.colunas;
        rows = res.linhas;
      }

      if (cols.length === 0 || rows.length === 0) {
        throw new Error('Nenhuma coluna ou linha encontrada no arquivo selecionado.');
      }

      setColunasArquivo(cols);
      setLinhasArquivo(rows);

      // Calcular assinatura e tentar recuperar mapeamento anterior
      const sig = gerarAssinaturaColunas(cols);
      setAssinaturaColunas(sig);
      const historico = recuperarMapeamentoHistorico(sig);

      if (historico) {
        setMapeamento(historico);
      } else {
        const auto = autoMapearColunas(cols);
        setMapeamento(auto);
      }

      setPasso(2);
    } catch (err: unknown) {
      setErroGeral(err instanceof Error ? err.message : 'Falha ao processar arquivo.');
    } finally {
      setCarregando(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processarArquivo(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processarArquivo(file);
    }
  };

  const mudarCampoMapeamento = (coluna: string, campo: CampoGuia) => {
    setMapeamento((prev) => ({
      ...prev,
      [coluna]: campo,
    }));
  };

  // Avançar para o passo 3: analisar dados e conciliação
  const handleAvancarParaResultado = () => {
    // Validar se pelo menos a coluna "empresa" está mapeada
    const temEmpresa = Object.values(mapeamento).includes('empresa');
    if (!temEmpresa) {
      setErroGeral('Você precisa mapear ao menos uma coluna como "Empresa" para continuar.');
      return;
    }

    setErroGeral(null);
    salvarMapeamentoHistorico(assinaturaColunas, mapeamento);

    const res = converterLinhasEmFichas(linhasArquivo, mapeamento, fichas);
    setResultado(res);
    setPasso(3);
  };

  const handleConcluirImportacao = async () => {
    if (!resultado) return;

    const fichasParaInserir = [...resultado.novas, ...resultado.repetidas];
    await importarLote(fichasParaInserir, modoConciliacao);
    setModalImportacao(false);
    resetar();
  };

  // Lista de campos disponíveis para o select
  const CAMPOS_SELECT: { valor: CampoGuia; rotulo: string }[] = [
    { valor: 'empresa', rotulo: '★ Empresa (Obrigatório)' },
    { valor: 'nicho', rotulo: 'Nicho / Ramo de Atividade' },
    { valor: 'bairro', rotulo: 'Bairro' },
    { valor: 'cidade', rotulo: 'Cidade' },
    { valor: 'website', rotulo: 'Website' },
    { valor: 'telefone', rotulo: 'Telefone (Google Maps)' },
    { valor: 'whatsapp', rotulo: 'WhatsApp' },
    { valor: 'instagram', rotulo: 'Instagram (@ ou URL)' },
    { valor: 'perfilMaps', rotulo: 'Perfil Google Maps' },
    { valor: 'notaGoogle', rotulo: 'Nota Google (ex: 4,7)' },
    { valor: 'avaliacoes', rotulo: 'Avaliações (ex: 212)' },
    { valor: 'anunciosAtivos', rotulo: 'Anúncios Ativos (Sim/Não)' },
    { valor: 'metaAds', rotulo: 'Meta Ads (Sim/Não)' },
    { valor: 'evidenciaMeta', rotulo: 'Evidência Meta Ads' },
    { valor: 'googleAds', rotulo: 'Google Ads (Sim/Não)' },
    { valor: 'evidenciaGoogle', rotulo: 'Evidência Google Ads' },
    { valor: 'performanceMobile', rotulo: 'Performance Mobile (0-100)' },
    { valor: 'problemas', rotulo: 'Problemas Identificados' },
    { valor: 'servicoRecomendado', rotulo: 'Serviço Recomendado' },
    { valor: 'ptsAnuncios', rotulo: 'Pts Anúncios (0-20)' },
    { valor: 'ptsSite', rotulo: 'Pts Site (0-20)' },
    { valor: 'ptsSEO', rotulo: 'Pts SEO (0-15)' },
    { valor: 'ptsConversao', rotulo: 'Pts Conversão (0-15)' },
    { valor: 'ptsContato', rotulo: 'Pts Contato (0-15)' },
    { valor: 'ptsFit', rotulo: 'Pts Fit (0-15)' },
    { valor: 'pontuacao', rotulo: 'Pontuação Total (0-100)' },
    { valor: 'prioridade', rotulo: 'Prioridade (Alta/Média/Baixa)' },
    { valor: 'fontes', rotulo: 'Fontes / Links de Auditoria' },
    { valor: 'dataVerificacao', rotulo: 'Data da Verificação' },
    { valor: 'extra', rotulo: 'Guardar como Campo Extra' },
    { valor: 'ignorar', rotulo: 'Ignorar esta coluna' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Importação de Planilhas"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
    >
      <div className="w-full max-w-xl bg-[#F2EBDD] dark:bg-[#201D1A] border-2 border-[#1B1A17] dark:border-[#EDE5D6] hard-shadow-lg max-h-[92vh] flex flex-col overflow-hidden animate-fade-in relative">
        <FitaAdesiva posicao="top-right" />

        {/* CABEÇALHO DO PROTOCOLO */}
        <div className="bg-[#E8DFC8] dark:bg-[#2D2A24] px-4 py-3 border-b-2 border-[#1B1A17] dark:border-[#EDE5D6] flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 uppercase">
              <span>PROTOCOLO DE ENTRADA // ARQUIVO GERAL</span>
              <span className="font-bold bg-[#D9A21B] text-[#1B1A17] px-1 border border-[#1B1A17]">
                VIA 03
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1B1A17] dark:text-[#EDE5D6] leading-tight">
              Importação de Planilhas
            </h2>
          </div>

          <button
            onClick={() => {
              setModalImportacao(false);
              resetar();
            }}
            className="p-1 border border-[#1B1A17] bg-[#FDF9F3] dark:bg-[#1E1C19] text-[#1B1A17] dark:text-[#EDE5D6] hover:bg-[#ffdad6] active:translate-y-0.5 cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* INDICADOR DAS 3 ETAPAS */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-[#F8F3ED] dark:bg-[#282520] border-b border-[#1B1A17] shrink-0 font-mono text-[10px]">
          <div
            className={`p-1.5 border text-center ${
              passo === 1
                ? 'bg-[#D9A21B] text-[#1B1A17] font-bold border-2 border-[#1B1A17]'
                : passo > 1
                ? 'bg-[#cbead4] text-[#052013] border-[#2F4A3A]'
                : 'bg-[#E8DFC8] opacity-60 border-[#1B1A17]'
            }`}
          >
            <div>1. CARREGAR</div>
            <span className="font-bold">{passo > 1 ? 'OK ✓' : 'EM CURSO'}</span>
          </div>

          <div
            className={`p-1.5 border text-center ${
              passo === 2
                ? 'bg-[#D9A21B] text-[#1B1A17] font-bold border-2 border-[#1B1A17]'
                : passo > 2
                ? 'bg-[#cbead4] text-[#052013] border-[#2F4A3A]'
                : 'bg-[#E8DFC8] opacity-60 border-[#1B1A17]'
            }`}
          >
            <div>2. CONFERIR</div>
            <span className="font-bold">{passo === 2 ? 'EM CURSO' : passo > 2 ? 'OK ✓' : 'PENDENTE'}</span>
          </div>

          <div
            className={`p-1.5 border text-center ${
              passo === 3
                ? 'bg-[#D9A21B] text-[#1B1A17] font-bold border-2 border-[#1B1A17]'
                : 'bg-[#E8DFC8] opacity-60 border-[#1B1A17]'
            }`}
          >
            <div>3. RESULTADO</div>
            <span className="font-bold">{passo === 3 ? 'EM CURSO' : 'PENDENTE'}</span>
          </div>
        </div>

        {/* ERRO GERAL SE HOUVER */}
        {erroGeral && (
          <div className="mx-4 mt-3 p-2.5 bg-[#ffdad6] border-2 border-[#ba1a1a] text-[#ba1a1a] font-mono text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{erroGeral}</span>
          </div>
        )}

        {/* CORPO DO MODAL ROLÁVEL */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* =======================================
              PASSO 1: SOLTAR OU ESCOLHER ARQUIVO
             ======================================= */}
          {passo === 1 && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#1B1A17] dark:border-[#EDE5D6] bg-[#FDF9F3] dark:bg-[#282520] p-6 text-center space-y-3 relative"
              >
                <div className="w-14 h-14 border-2 border-[#1B1A17] bg-[#E8DFC8] dark:bg-[#332F28] mx-auto flex items-center justify-center hard-shadow-sm">
                  <FileSpreadsheet className="w-7 h-7 text-[#E8431F]" strokeWidth={2.5} />
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1B1A17] dark:text-[#EDE5D6]">
                    Solte aqui sua planilha de prospecção
                  </h3>
                  <p className="text-xs text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 mt-1">
                    Arraste o arquivo ou escolha do dispositivo para auditoria imediata.
                  </p>
                </div>

                <div className="flex justify-center items-center gap-1.5 font-mono text-[10px]">
                  <span className="px-2 py-0.5 bg-[#E8DFC8] dark:bg-[#332F28] border border-[#1B1A17] font-bold">
                    .CSV / TSV
                  </span>
                  <span className="px-2 py-0.5 bg-[#E8DFC8] dark:bg-[#332F28] border border-[#1B1A17] font-bold">
                    .XLSX / EXCEL
                  </span>
                  <span className="px-2 py-0.5 bg-[#E8DFC8] dark:bg-[#332F28] border border-[#1B1A17] font-bold">
                    .JSON
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.tsv,.xlsx,.xls,.json"
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={carregando}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-[#1B1A17] text-white border-2 border-[#1B1A17] font-mono text-xs font-bold uppercase tracking-wider hard-shadow active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{carregando ? 'Lendo arquivo...' : 'ESCOLHER ARQUIVO DO DISPOSITIVO'}</span>
                </button>
              </div>

              {/* Opção Rápida de Carregar Exemplo */}
              <div className="border border-[#1B1A17] bg-[#F8F3ED] dark:bg-[#282520] p-3 flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-[#1B1A17] dark:text-[#EDE5D6] flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-[#D9A21B]" />
                    <span>Prefere testar sem planilha?</span>
                  </div>
                  <p className="text-[11px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 mt-0.5">
                    Carregue 8 fichas reais de dentista, pizzaria, academia e adega em São Paulo.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    await carregarExemplo();
                    setModalImportacao(false);
                  }}
                  className="bg-[#D9A21B] text-[#1B1A17] border border-[#1B1A17] px-3 py-1.5 font-mono text-xs font-bold uppercase hard-shadow-sm active:translate-y-0.5 cursor-pointer shrink-0 ml-2"
                >
                  Carregar Exemplo
                </button>
              </div>

              {/* Aviso de Privacidade 100% no navegador */}
              <div className="flex items-center gap-2 text-[11px] text-[#2F4A3A] font-mono bg-[#cbead4]/40 p-2.5 border border-[#2F4A3A]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Privacidade Absoluta:</strong> Seus dados são processados e armazenados apenas no IndexedDB deste navegador. Nenhuma informação é enviada a servidores externos.
                </span>
              </div>
            </div>
          )}

          {/* =======================================
              PASSO 2: CONFERIR COLUNAS E MAPEAMENTO
             ======================================= */}
          {passo === 2 && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center bg-[#FDF9F3] dark:bg-[#282520] p-2.5 border border-[#1B1A17]">
                <div className="truncate pr-2">
                  <div className="font-bold truncate text-[#1B1A17] dark:text-[#EDE5D6]">
                    {nomeArquivo}
                  </div>
                  <div className="text-[10px] text-[#1B1A17]/60 dark:text-[#EDE5D6]/60">
                    {tamanhoKb} KB · {linhasArquivo.length} linhas detectadas
                  </div>
                </div>

                {/* Seletor de abas do Excel */}
                {abasDisponiveis.length > 1 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px]">Aba:</span>
                    <select
                      value={abaSelecionada}
                      onChange={(e) => {
                        if (arquivoFile) processarArquivo(arquivoFile, e.target.value);
                      }}
                      className="bg-[#E8DFC8] border border-[#1B1A17] text-[10px] p-1 font-bold"
                    >
                      {abasDisponiveis.map((aba) => (
                        <option key={aba} value={aba}>
                          {aba}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Pré-visualização das 5 primeiras linhas */}
              <div>
                <span className="font-bold block mb-1 uppercase text-[10px]">
                  PRÉ-VISUALIZAÇÃO (PRIMEIRAS 3 LINHAS):
                </span>
                <div className="overflow-x-auto border border-[#1B1A17] bg-[#FDF9F3] dark:bg-[#1E1C19] p-2 text-[10px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1B1A17]">
                        {colunasArquivo.slice(0, 5).map((col) => (
                          <th key={col} className="p-1 font-bold truncate max-w-[120px]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {linhasArquivo.slice(0, 3).map((linha, i) => (
                        <tr key={i} className="border-b border-[#1B1A17]/10">
                          {colunasArquivo.slice(0, 5).map((col) => (
                            <td key={col} className="p-1 truncate max-w-[120px] opacity-80">
                              {String(linha[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mapeamento Coluna do Arquivo -> Campo do Guia */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase text-[10px]">
                    CONFERÊNCIA DE MAPEAMENTO ({colunasArquivo.length} COLUNAS):
                  </span>
                  <span className="text-[10px] text-[#E8431F] font-bold">
                    * Empresa é obrigatório
                  </span>
                </div>

                <div className="space-y-2 border border-[#1B1A17] p-2 bg-[#FDF9F3] dark:bg-[#282520] max-h-60 overflow-y-auto">
                  {colunasArquivo.map((coluna) => {
                    const campoAtual = mapeamento[coluna] || 'extra';
                    const isObrigatorioNaoMapeado =
                      coluna.toLowerCase().includes('empresa') && campoAtual !== 'empresa';

                    return (
                      <div
                        key={coluna}
                        className={`p-2 border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isObrigatorioNaoMapeado
                            ? 'bg-[#ffdad6] border-[#ba1a1a]'
                            : campoAtual === 'empresa'
                            ? 'bg-[#cbead4]/50 border-[#2F4A3A]'
                            : 'bg-[#F8F3ED] dark:bg-[#1E1C19] border-[#1B1A17]/30'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <span className="text-[9px] text-[#1B1A17]/60 block uppercase">
                            COLUNA DO ARQUIVO:
                          </span>
                          <span className="font-bold truncate block">{coluna}</span>
                        </div>

                        <div className="shrink-0">
                          <select
                            value={campoAtual}
                            onChange={(e) =>
                              mudarCampoMapeamento(coluna, e.target.value as CampoGuia)
                            }
                            className={`border border-[#1B1A17] p-1.5 text-xs font-mono font-medium outline-none ${
                              campoAtual === 'empresa'
                                ? 'bg-[#2F4A3A] text-white font-bold'
                                : campoAtual === 'extra'
                                ? 'bg-[#E8DFC8] text-[#1B1A17]'
                                : 'bg-[#FDF9F3] text-[#1B1A17]'
                            }`}
                          >
                            {CAMPOS_SELECT.map((opt) => (
                              <option key={opt.valor} value={opt.valor}>
                                {opt.rotulo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasso(1)}
                  className="px-3 py-2 bg-[#E8DFC8] border border-[#1B1A17] font-bold uppercase active:translate-y-0.5 cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleAvancarParaResultado}
                  className="flex-1 py-2.5 px-3 bg-[#E8431F] text-white border-2 border-[#1B1A17] font-bold uppercase tracking-wider hard-shadow active:translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Analisar Linhas e Duplicatas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =======================================
              PASSO 3: RESULTADO E CONCILIAÇÃO
             ======================================= */}
          {passo === 3 && resultado && (
            <div className="space-y-4 font-mono text-xs">
              {/* Bilhete de Auditoria */}
              <div className="border-2 border-[#1B1A17] bg-[#FDF9F3] dark:bg-[#282520] p-4 hard-shadow relative">
                <div className="flex justify-between items-center border-b border-dashed border-[#1B1A17] pb-2 mb-3">
                  <span className="font-bold tracking-widest uppercase">
                    [BILHETE DE AUDITORIA]
                  </span>
                  <span className="bg-[#D9A21B] text-[#1B1A17] px-1.5 py-0.2 font-bold border border-[#1B1A17]">
                    LOTE #{Math.floor(100 + Math.random() * 900)}
                  </span>
                </div>

                <h3 className="font-bold uppercase tracking-wide mb-2 text-[#1B1A17] dark:text-[#EDE5D6]">
                  RESUMO DO LOTE IDENTIFICADO:
                </h3>

                <ul className="space-y-2 p-3 bg-[#F8F3ED] dark:bg-[#1E1C19] border border-[#1B1A17]">
                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#2F4A3A] shrink-0" />
                    <span>
                      <strong className="text-[#2F4A3A] font-bold">
                        {resultado.novas.length} fichas novas
                      </strong>{' '}
                      prontas para inclusão.
                    </span>
                  </li>

                  <li className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#D9A21B] shrink-0" />
                    <span>
                      <strong className="text-[#D9A21B] font-bold">
                        {resultado.repetidas.length} fichas repetidas
                      </strong>{' '}
                      detectadas por (empresa + bairro).
                    </span>
                  </li>

                  {resultado.erros.length > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#E8431F] shrink-0" />
                      <span>
                        <strong className="text-[#E8431F] font-bold">
                          {resultado.erros.length} linhas
                        </strong>{' '}
                        com dados inválidos ou sem empresa.
                      </span>
                    </li>
                  )}
                </ul>

                {/* Erros listados em bilhete rasgado */}
                {resultado.erros.length > 0 && (
                  <div className="mt-3 p-2 bg-[#ffdad6] border-2 border-dashed border-[#ba1a1a] text-[#ba1a1a] space-y-1">
                    <div className="flex items-center gap-1 font-bold text-[10px] uppercase">
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Bilhete de Linhas Descartadas:</span>
                    </div>
                    {resultado.erros.slice(0, 5).map((err, idx) => (
                      <div key={idx} className="text-[10px]">
                        • Linha {err.linha}: {err.motivo}
                      </div>
                    ))}
                    {resultado.erros.length > 5 && (
                      <div className="text-[9px] italic">
                        ... e mais {resultado.erros.length - 5} linha(s) com erro.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Regra de Conciliação para Repetidas */}
              {resultado.repetidas.length > 0 && (
                <div className="border border-[#1B1A17] bg-[#FDF9F3] dark:bg-[#282520] p-3 space-y-2">
                  <span className="font-bold uppercase text-[10px] text-[#1B1A17]/70 dark:text-[#EDE5D6]/70 block">
                    REGRA DE CONCILIAÇÃO PARA AS {resultado.repetidas.length} REPETIDAS:
                  </span>

                  <label className="flex items-start gap-2 p-2 border border-[#1B1A17] cursor-pointer hover:bg-[#F8F3ED]">
                    <input
                      type="radio"
                      name="conciliacao"
                      checked={modoConciliacao === 'atualizar'}
                      onChange={() => setModoConciliacao('atualizar')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-bold block">Atualizar dados das fichas repetidas</span>
                      <span className="text-[10px] text-[#1B1A17]/60 block">
                        Sobrescreve dados cadastrais mantendo as anotações do caderno já feitas.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 border border-[#1B1A17] cursor-pointer hover:bg-[#F8F3ED]">
                    <input
                      type="radio"
                      name="conciliacao"
                      checked={modoConciliacao === 'somar'}
                      onChange={() => setModoConciliacao('somar')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-bold block">Somar como novos registros duplicados</span>
                      <span className="text-[10px] text-[#1B1A17]/60 block">
                        Cria nova ficha em anexo gerando novo subcódigo.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 border border-[#1B1A17] cursor-pointer hover:bg-[#F8F3ED]">
                    <input
                      type="radio"
                      name="conciliacao"
                      checked={modoConciliacao === 'ignorar'}
                      onChange={() => setModoConciliacao('ignorar')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-bold block">Ignorar repetidas e manter originais</span>
                      <span className="text-[10px] text-[#1B1A17]/60 block">
                        Importa apenas as {resultado.novas.length} fichas novas.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* Backup do lote bruto */}
              <div className="flex items-center justify-between pt-1 border-t border-dashed border-[#1B1A17] text-[10px]">
                <span className="text-[#1B1A17]/60">Backup do lote processado:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      exportarCSV([...resultado.novas, ...resultado.repetidas], 'lote_importado.csv')
                    }
                    className="p-1 border border-[#1B1A17] bg-[#E8DFC8] font-bold hover:bg-[#D9A21B]"
                  >
                    [Exportar CSV]
                  </button>
                  <button
                    onClick={() =>
                      exportarJSON([...resultado.novas, ...resultado.repetidas], 'lote_importado.json')
                    }
                    className="p-1 border border-[#1B1A17] bg-[#E8DFC8] font-bold hover:bg-[#D9A21B]"
                  >
                    [Exportar JSON]
                  </button>
                </div>
              </div>

              {/* Botão Final de Processamento */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConcluirImportacao}
                  className="w-full py-3.5 px-4 bg-[#E8431F] text-white border-2 border-[#1B1A17] font-mono text-xs font-bold uppercase tracking-wider hard-shadow active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    PROCESSAR E INTEGRAR AO GUIA (
                    {modoConciliacao === 'ignorar'
                      ? resultado.novas.length
                      : resultado.novas.length + resultado.repetidas.length}{' '}
                    FICHAS)
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
