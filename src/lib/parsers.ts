import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { CampoGuia, Ficha, ErroLinha, ResultadoAnaliseImportacao, PontosFicha } from '../types';
import {
  normalizarCabecalho,
  parseBooleanBR,
  parseNumeroBR,
  parseDataBR,
  derivarPrioridade,
  calcularPontuacao,
  separarLista,
} from './normalizers';
import { gerarIdEstavel } from './hash';

// Dicionário de sinônimos conhecidos para mapeamento automático
const SINONIMOS_CAMPOS: Record<CampoGuia, string[]> = {
  empresa: [
    'empresa',
    'nome',
    'nome fantasia',
    'razao social',
    'estabelecimento',
    'negocio',
    'cliente',
    'alvo',
    'nome empresa',
  ],
  nicho: ['nicho', 'categoria', 'segmento', 'ramo', 'atividade', 'area', 'especialidade'],
  bairro: ['bairro', 'regiao', 'localizacao', 'perimetro', 'distrito', 'zona'],
  cidade: ['cidade', 'municipio', 'cidade uf', 'praca'],
  website: ['website', 'site', 'url', 'site oficial', 'pagina', 'link site', 'site proprio'],
  telefone: ['telefone', 'fone', 'tel', 'telefone google maps', 'telefone maps', 'contato'],
  whatsapp: ['whatsapp', 'whats', 'zap', 'whatsapp site', 'wpp', 'celular whatsapp'],
  instagram: ['instagram', 'insta', 'perfil instagram', '@instagram', 'social instagram'],
  perfilMaps: ['perfil google maps', 'maps', 'google maps', 'perfil maps', 'link maps', 'gmb'],
  notaGoogle: ['nota google', 'nota', 'rating', 'estrelas', 'avaliacao', 'score google'],
  avaliacoes: ['avaliacoes', 'num avaliacoes', 'contagem avaliacoes', 'total avaliacoes', 'reviews', 'qtd avaliacoes'],
  anunciosAtivos: ['anuncios ativos', 'anuncios', 'trafego ativo', 'tem anuncios', 'anunciando'],
  metaAds: ['meta ads', 'facebook ads', 'face ads', 'anuncios meta', 'anuncios facebook'],
  evidenciaMeta: ['evidencia meta', 'evidencia facebook', 'detalhe meta', 'status meta ads'],
  googleAds: ['google ads', 'adwords', 'anuncios google', 'rede de pesquisa'],
  evidenciaGoogle: ['evidencia google', 'detalhe google ads', 'status google ads'],
  performanceMobile: ['performance mobile', 'velocidade mobile', 'pagespeed', 'score mobile', 'performance', 'velocidade'],
  problemas: ['problemas identificados', 'problemas', 'gargalos', 'diagnostico', 'falhas', 'pontos fracos'],
  servicoRecomendado: ['servico recomendado', 'servico', 'oportunidade', 'recomendacao', 'oferta', 'proposta'],
  ptsAnuncios: ['pts anuncios', 'pontos anuncios', 'pts meta', 'score anuncios', 'pts ads'],
  ptsSite: ['pts site', 'pontos site', 'score site'],
  ptsSEO: ['pts seo', 'pontos seo', 'score seo', 'seo local'],
  ptsConversao: ['pts conversao', 'pontos conversao', 'score conversao'],
  ptsContato: ['pts contato', 'pontos contato', 'score contato', 'canais contato'],
  ptsFit: ['pts fit', 'pontos fit', 'fit comercial', 'score fit'],
  pontuacao: ['pontuacao', 'score', 'pontos', 'nota total', 'score final', 'pontuacao total'],
  prioridade: ['prioridade', 'classificacao', 'grau prioridade', 'nivel', 'urgencia'],
  fontes: ['fontes', 'links', 'referencias', 'urls', 'audit log'],
  dataVerificacao: ['data da verificacao', 'data verificacao', 'data auditado', 'data', 'auditado em', 'verificado em'],
  ignorar: [],
  extra: [],
};

/**
 * Calcula similaridade entre duas strings normalizadas (Dice / Jaccard simplificado)
 */
function calcularSimilaridade(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.includes(b) || b.includes(a)) return 0.85;

  const palavrasA = new Set(a.split(' ').filter(Boolean));
  const palavrasB = new Set(b.split(' ').filter(Boolean));

  let comuns = 0;
  for (const p of palavrasA) {
    if (palavrasB.has(p)) comuns++;
  }

  const uniao = new Set([...palavrasA, ...palavrasB]).size;
  return uniao === 0 ? 0 : comuns / uniao;
}

/**
 * Tenta mapear automaticamente cada coluna do arquivo para um campo do Guia
 */
export function autoMapearColunas(colunasArquivo: string[]): Record<string, CampoGuia> {
  const mapeamento: Record<string, CampoGuia> = {};
  const camposJaMapeados = new Set<CampoGuia>();

  for (const col of colunasArquivo) {
    const colNorm = normalizarCabecalho(col);
    let melhorCampo: CampoGuia = 'extra';
    let maiorScore = 0;

    for (const [campo, sinonimos] of Object.entries(SINONIMOS_CAMPOS) as [CampoGuia, string[]][]) {
      if (campo === 'ignorar' || campo === 'extra') continue;

      for (const sin of sinonimos) {
        const sinNorm = normalizarCabecalho(sin);
        const score = calcularSimilaridade(colNorm, sinNorm);
        if (score > maiorScore) {
          maiorScore = score;
          melhorCampo = campo;
        }
      }
    }

    if (maiorScore >= 0.6 && !camposJaMapeados.has(melhorCampo)) {
      mapeamento[col] = melhorCampo;
      camposJaMapeados.add(melhorCampo);
    } else {
      mapeamento[col] = 'extra';
    }
  }

  return mapeamento;
}

/**
 * Cria uma assinatura das colunas para salvar/recuperar preferências de mapeamento
 */
export function gerarAssinaturaColunas(colunas: string[]): string {
  return colunas.map(normalizarCabecalho).sort().join('|');
}

export function salvarMapeamentoHistorico(assinatura: string, mapeamento: Record<string, CampoGuia>): void {
  try {
    const key = `guia_campo_map_${assinatura}`;
    localStorage.setItem(key, JSON.stringify(mapeamento));
  } catch (err) {
    console.warn('Erro ao salvar mapeamento no localStorage:', err);
  }
}

export function recuperarMapeamentoHistorico(assinatura: string): Record<string, CampoGuia> | null {
  try {
    const key = `guia_campo_map_${assinatura}`;
    const salvo = localStorage.getItem(key);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

/**
 * Lê arquivo CSV / TSV e retorna matriz de objetos e colunas
 */
export async function parseCSVouTSV(arquivo: File): Promise<{ colunas: string[]; linhas: Record<string, unknown>[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(arquivo, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      encoding: 'UTF-8',
      complete: (results) => {
        const colunas = (results.meta.fields || []).filter((c) => c && c.trim().length > 0);
        resolve({
          colunas,
          linhas: results.data,
        });
      },
      error: (err) => reject(new Error(`Erro ao ler CSV/TSV: ${err.message}`)),
    });
  });
}

/**
 * Lê arquivo Excel (.xlsx / .xls)
 */
export async function parseExcel(arquivo: File, abaEscolhida?: string): Promise<{
  abas: string[];
  abaAtual: string;
  colunas: string[];
  linhas: Record<string, unknown>[];
}> {
  const buffer = await arquivo.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const abas = workbook.SheetNames;
  if (abas.length === 0) {
    throw new Error('Nenhuma planilha encontrada no arquivo Excel.');
  }

  const aba = abaEscolhida && abas.includes(abaEscolhida) ? abaEscolhida : abas[0];
  const worksheet = workbook.Sheets[aba];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  // Extrair cabeçalhos da primeira linha
  const colunasSet = new Set<string>();
  jsonData.forEach((row) => {
    Object.keys(row).forEach((col) => colunasSet.add(col));
  });

  return {
    abas,
    abaAtual: aba,
    colunas: Array.from(colunasSet),
    linhas: jsonData,
  };
}

/**
 * Lê arquivo JSON (aceita array direto ou objeto { empresas: [...] })
 */
export async function parseJSON(arquivo: File): Promise<{ colunas: string[]; linhas: Record<string, unknown>[] }> {
  const texto = await arquivo.text();
  const parsed = JSON.parse(texto);

  let arrayFinal: Record<string, unknown>[] = [];
  if (Array.isArray(parsed)) {
    arrayFinal = parsed;
  } else if (typeof parsed === 'object' && parsed !== null) {
    // Procura por chaves como 'empresas', 'fichas', 'dados', 'data', 'records'
    const possiveisChaves = ['empresas', 'fichas', 'dados', 'data', 'records', 'items', 'caderno'];
    let encontrou = false;
    for (const k of possiveisChaves) {
      if (Array.isArray(parsed[k])) {
        arrayFinal = parsed[k];
        encontrou = true;
        break;
      }
    }
    if (!encontrou) {
      // Pega o primeiro array dentro do objeto
      for (const val of Object.values(parsed)) {
        if (Array.isArray(val)) {
          arrayFinal = val as Record<string, unknown>[];
          break;
        }
      }
    }
  }

  if (!arrayFinal || arrayFinal.length === 0) {
    throw new Error('O arquivo JSON não contém um array de empresas reconhecível.');
  }

  const colunasSet = new Set<string>();
  arrayFinal.forEach((row) => {
    if (typeof row === 'object' && row !== null) {
      Object.keys(row).forEach((k) => colunasSet.add(k));
    }
  });

  return {
    colunas: Array.from(colunasSet),
    linhas: arrayFinal,
  };
}

/**
 * Processa as linhas cruas com o mapeamento e valida cada registro gerando Fichas ou Erros
 */
export function converterLinhasEmFichas(
  linhas: Record<string, unknown>[],
  mapeamento: Record<string, CampoGuia>,
  fichasExistentes: Ficha[] = []
): ResultadoAnaliseImportacao {
  const mapaExistentes = new Map<string, Ficha>();
  fichasExistentes.forEach((f) => mapaExistentes.set(f.id, f));

  const novas: Ficha[] = [];
  const repetidas: Ficha[] = [];
  const erros: ErroLinha[] = [];

  linhas.forEach((linha, idx) => {
    const numLinha = idx + 2; // Linha 1 = cabeçalho
    const registroTemp: Partial<Ficha> = {
      pts: {},
      problemas: [],
      fontes: [],
      extras: {},
    };

    const extras: Record<string, string> = {};

    for (const [colunaOrigem, valor] of Object.entries(linha)) {
      const campoDestino = mapeamento[colunaOrigem] || 'extra';
      if (campoDestino === 'ignorar') continue;

      if (campoDestino === 'extra') {
        if (valor !== undefined && valor !== null && String(valor).trim()) {
          extras[colunaOrigem] = String(valor).trim();
        }
        continue;
      }

      switch (campoDestino) {
        case 'empresa':
          registroTemp.empresa = String(valor ?? '').trim();
          break;
        case 'nicho':
          registroTemp.nicho = String(valor ?? '').trim();
          break;
        case 'bairro':
          registroTemp.bairro = String(valor ?? '').trim();
          break;
        case 'cidade':
          registroTemp.cidade = String(valor ?? '').trim();
          break;
        case 'website':
          registroTemp.website = String(valor ?? '').trim();
          break;
        case 'telefone':
          registroTemp.telefone = String(valor ?? '').trim();
          break;
        case 'whatsapp':
          registroTemp.whatsapp = String(valor ?? '').trim();
          break;
        case 'instagram':
          registroTemp.instagram = String(valor ?? '').trim();
          break;
        case 'perfilMaps':
          registroTemp.perfilMaps = String(valor ?? '').trim();
          break;
        case 'notaGoogle':
          registroTemp.notaGoogle = parseNumeroBR(valor);
          break;
        case 'avaliacoes':
          registroTemp.avaliacoes = parseNumeroBR(valor);
          break;
        case 'anunciosAtivos':
          registroTemp.anunciosAtivos = parseBooleanBR(valor);
          break;
        case 'metaAds':
          registroTemp.metaAds = parseBooleanBR(valor);
          break;
        case 'evidenciaMeta':
          registroTemp.evidenciaMeta = String(valor ?? '').trim();
          break;
        case 'googleAds':
          registroTemp.googleAds = parseBooleanBR(valor);
          break;
        case 'evidenciaGoogle':
          registroTemp.evidenciaGoogle = String(valor ?? '').trim();
          break;
        case 'performanceMobile':
          registroTemp.performanceMobile = parseNumeroBR(valor);
          break;
        case 'problemas':
          registroTemp.problemas = separarLista(valor);
          break;
        case 'servicoRecomendado':
          registroTemp.servicoRecomendado = String(valor ?? '').trim();
          break;
        case 'ptsAnuncios':
          if (!registroTemp.pts) registroTemp.pts = {};
          registroTemp.pts.anuncios = parseNumeroBR(valor);
          break;
        case 'ptsSite':
          if (!registroTemp.pts) registroTemp.pts = {};
          registroTemp.pts.site = parseNumeroBR(valor);
          break;
        case 'ptsSEO':
          if (!registroTemp.pts) registroTemp.pts = {};
          registroTemp.pts.seo = parseNumeroBR(valor);
          break;
        case 'ptsConversao':
          if (!registroTemp.pts) registroTemp.pts = {};
          registroTemp.pts.conversao = parseNumeroBR(valor);
          break;
        case 'ptsContato':
          if (!registroTemp.pts) registroTemp.pts = {};
          registroTemp.pts.contato = parseNumeroBR(valor);
          break;
        case 'ptsFit':
          if (!registroTemp.pts) registroTemp.pts = {};
          registroTemp.pts.fit = parseNumeroBR(valor);
          break;
        case 'pontuacao':
          registroTemp.pontuacao = parseNumeroBR(valor);
          break;
        case 'prioridade':
          registroTemp.prioridade = derivarPrioridade(valor);
          break;
        case 'fontes':
          registroTemp.fontes = separarLista(valor);
          break;
        case 'dataVerificacao':
          registroTemp.dataVerificacao = parseDataBR(valor);
          break;
      }
    }

    // Validação mandatória: Nome da Empresa é obrigatório
    if (!registroTemp.empresa || registroTemp.empresa.trim().length === 0) {
      erros.push({
        linha: numLinha,
        motivo: 'Coluna obrigatória "Empresa" está vazia ou não foi identificada.',
      });
      return;
    }

    const bairro = registroTemp.bairro || 'Centro';
    const cidade = registroTemp.cidade || 'São Paulo';
    const nicho = registroTemp.nicho || 'Comércio Local';

    const pts: PontosFicha = registroTemp.pts || {};
    const pontuacao = calcularPontuacao(pts, registroTemp.pontuacao);
    const prioridade = registroTemp.prioridade || derivarPrioridade(undefined, pontuacao);

    const id = gerarIdEstavel(registroTemp.empresa, bairro);

    const fichaCompleta: Ficha = {
      id,
      empresa: registroTemp.empresa,
      nicho,
      bairro,
      cidade,
      website: registroTemp.website || undefined,
      telefone: registroTemp.telefone || undefined,
      whatsapp: registroTemp.whatsapp || undefined,
      instagram: registroTemp.instagram || undefined,
      perfilMaps: registroTemp.perfilMaps || undefined,
      notaGoogle: registroTemp.notaGoogle ?? 4.5,
      avaliacoes: registroTemp.avaliacoes ?? 120,
      anunciosAtivos:
        registroTemp.anunciosAtivos ??
        (registroTemp.metaAds === true || registroTemp.googleAds === true),
      metaAds: registroTemp.metaAds,
      evidenciaMeta: registroTemp.evidenciaMeta,
      googleAds: registroTemp.googleAds,
      evidenciaGoogle: registroTemp.evidenciaGoogle,
      performanceMobile: registroTemp.performanceMobile ?? 42,
      problemas:
        registroTemp.problemas && registroTemp.problemas.length > 0
          ? registroTemp.problemas
          : ['Sem site responsivo', 'Sem botão flutuante de WhatsApp'],
      servicoRecomendado:
        registroTemp.servicoRecomendado ||
        'Site novo + Criação de funil para WhatsApp',
      pts,
      pontuacao,
      prioridade,
      fontes:
        registroTemp.fontes && registroTemp.fontes.length > 0
          ? registroTemp.fontes
          : ['Google Maps API / Auditoria Cadastral'],
      dataVerificacao: registroTemp.dataVerificacao || new Date().toISOString(),
      separada: false,
      descartada: false,
      extras: Object.keys(extras).length > 0 ? extras : undefined,
    };

    if (mapaExistentes.has(id)) {
      repetidas.push(fichaCompleta);
    } else {
      novas.push(fichaCompleta);
    }
  });

  return {
    totalLidas: linhas.length,
    novas,
    repetidas,
    erros,
    colunasDetectadas: Object.keys(mapeamento),
    mapeamento,
  };
}
