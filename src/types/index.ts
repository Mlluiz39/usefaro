export type Prioridade = 'Alta' | 'Média' | 'Baixa';

export interface PontosFicha {
  anuncios?: number;
  site?: number;
  seo?: number;
  conversao?: number;
  contato?: number;
  fit?: number;
}

export interface Ficha {
  id: string; // Hash estável de (empresa + bairro)
  empresa: string;
  nicho: string;
  bairro: string;
  cidade: string;
  website?: string;
  telefone?: string;
  whatsapp?: string;
  instagram?: string;
  perfilMaps?: string;
  notaGoogle?: number;
  avaliacoes?: number;
  anunciosAtivos?: boolean;
  metaAds?: boolean;
  evidenciaMeta?: string;
  googleAds?: boolean;
  evidenciaGoogle?: string;
  performanceMobile?: number; // 0 a 100
  problemas: string[];
  servicoRecomendado?: string;
  pts: PontosFicha;
  pontuacao?: number;
  prioridade?: Prioridade;
  fontes: string[];
  dataVerificacao?: string; // ISO ou formatada
  separada?: boolean; // marcada no caderno
  descartada?: boolean;
  anotacao?: string;
  extras?: Record<string, string>;
}

export type CampoGuia =
  | 'empresa'
  | 'nicho'
  | 'bairro'
  | 'cidade'
  | 'website'
  | 'telefone'
  | 'whatsapp'
  | 'instagram'
  | 'perfilMaps'
  | 'notaGoogle'
  | 'avaliacoes'
  | 'anunciosAtivos'
  | 'metaAds'
  | 'evidenciaMeta'
  | 'googleAds'
  | 'evidenciaGoogle'
  | 'performanceMobile'
  | 'problemas'
  | 'servicoRecomendado'
  | 'ptsAnuncios'
  | 'ptsSite'
  | 'ptsSEO'
  | 'ptsConversao'
  | 'ptsContato'
  | 'ptsFit'
  | 'pontuacao'
  | 'prioridade'
  | 'fontes'
  | 'dataVerificacao'
  | 'ignorar'
  | 'extra';

export interface MapeamentoColuna {
  colunaArquivo: string;
  campoGuia: CampoGuia;
  obrigatorio?: boolean;
  confianca?: number; // 0 a 1
}

export type ModoConciliacao = 'atualizar' | 'somar' | 'ignorar';

export interface ErroLinha {
  linha: number;
  empresa?: string;
  motivo: string;
}

export interface ResultadoAnaliseImportacao {
  totalLidas: number;
  novas: Ficha[];
  repetidas: Ficha[];
  erros: ErroLinha[];
  colunasDetectadas: string[];
  mapeamento: Record<string, CampoGuia>;
}

export type TipoVisualizacao = 'fichas' | 'compacta' | 'bairros';

export type OrdenacaoTipo =
  | 'pontuacao-desc'
  | 'pontuacao-asc'
  | 'nota-desc'
  | 'avaliacoes-desc'
  | 'nome-asc';

export interface FiltrosState {
  busca: string;
  prioridades: Prioridade[];
  nichos: string[];
  bairros: string[];
  cidades: string[];
  apenasSemAnuncios: boolean;
  apenasMetaAds: boolean;
  apenasGoogleAds: boolean;
  apenasComSite: boolean;
  apenasSemSite: boolean;
  apenasComWhats: boolean;
  servico: string;
  pontuacaoMin: number;
  pontuacaoMax: number;
  ordenacao: OrdenacaoTipo;
  visualizacao: TipoVisualizacao;
}
