import { Prioridade, PontosFicha } from '../types';

/**
 * Remove acentos, pontuações excedentes e espaços duplicados.
 */
export function normalizarTexto(texto: unknown): string {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Normaliza o cabeçalho de uma coluna para comparação por similaridade.
 * Ex: "WhatsApp (site)" -> "whatsapp site"
 * "Pts anúncios" -> "pts anuncios"
 */
export function normalizarCabecalho(cabecalho: unknown): string {
  if (!cabecalho) return '';
  return String(cabecalho)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza valores booleanos em pt-BR e inglês.
 * Aceita: sim, não, true, false, 1, 0, ativo, inativo, presente, ausente, s, n.
 */
export function parseBooleanBR(valor: unknown): boolean | undefined {
  if (valor === null || valor === undefined) return undefined;
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'number') return valor === 1;

  const limpo = normalizarTexto(valor);
  if (!limpo) return undefined;

  const positivos = ['sim', 's', 'true', '1', 'ativo', 'ativa', 'presente', 'sim/ativo', 'sim/com botao', 'com botao'];
  const negativos = ['nao', 'n', 'false', '0', 'inativo', 'inativa', 'ausente', 'riscado', 'sem botao', 's/ botao'];

  if (positivos.includes(limpo)) return true;
  if (negativos.includes(limpo)) return false;

  // Se contiver substring indicando atividade
  if (limpo.startsWith('sim') || limpo.includes('ativo')) return true;
  if (limpo.startsWith('nao') || limpo.includes('inativo') || limpo.includes('ausente')) return false;

  return undefined;
}

/**
 * Converte strings numéricas em formato pt-BR ou internacional para number.
 * Exemplos:
 * "4,7" -> 4.7
 * "4.7" -> 4.7
 * "86%" -> 86
 * "212 avaliações" -> 212
 */
export function parseNumeroBR(valor: unknown): number | undefined {
  if (valor === null || valor === undefined) return undefined;
  if (typeof valor === 'number') {
    return isNaN(valor) ? undefined : valor;
  }

  const str = String(valor).trim();
  if (!str) return undefined;

  // Procura primeiro padrão numérico incluindo vírgula ou ponto decimal
  const match = str.match(/[-+]?[0-9]+([.,][0-9]+)?/);
  if (!match) return undefined;

  const numNormalizado = match[0].replace(',', '.');
  const parsed = parseFloat(numNormalizado);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Converte datas para ISO string formatada.
 * Suporta DD/MM/AAAA, DD/MM/AA, AAAA-MM-DD e variações.
 */
export function parseDataBR(valor: unknown): string | undefined {
  if (!valor) return undefined;
  const str = String(valor).trim();
  if (!str) return undefined;

  // DD/MM/AAAA ou DD/MM/AA
  const brMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{1,2}))?/);
  if (brMatch) {
    const dia = brMatch[1].padStart(2, '0');
    const mes = brMatch[2].padStart(2, '0');
    let ano = brMatch[3];
    if (ano.length === 2) {
      ano = `20${ano}`;
    }
    const hora = brMatch[4] ? brMatch[4].padStart(2, '0') : '12';
    const min = brMatch[5] ? brMatch[5].padStart(2, '0') : '00';
    return `${ano}-${mes}-${dia}T${hora}:${min}:00.000Z`;
  }

  // Já em formato ISO ou standard
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }

  return str;
}

/**
 * Deriva a prioridade com base no texto explícito ou na pontuação.
 * >= 75 Alta, 50 a 74 Média, < 50 Baixa
 */
export function derivarPrioridade(prioridadeRaw: unknown, pontuacao?: number): Prioridade {
  const norm = normalizarTexto(prioridadeRaw);
  if (norm.includes('alta') || norm === 'alto' || norm === 'a' || norm === 'urgente') {
    return 'Alta';
  }
  if (norm.includes('media') || norm === 'medio' || norm === 'm') {
    return 'Média';
  }
  if (norm.includes('baixa') || norm === 'baixo' || norm === 'b') {
    return 'Baixa';
  }

  // Se não foi informada, deriva da pontuação
  if (pontuacao !== undefined && !isNaN(pontuacao)) {
    if (pontuacao >= 75) return 'Alta';
    if (pontuacao >= 50) return 'Média';
    return 'Baixa';
  }

  return 'Média';
}

/**
 * Calcula a pontuação total: se faltar pontuação, soma os pontos parciais
 */
export function calcularPontuacao(pts: PontosFicha, pontuacaoRaw?: number): number {
  if (pontuacaoRaw !== undefined && !isNaN(pontuacaoRaw) && pontuacaoRaw > 0) {
    return Math.round(pontuacaoRaw);
  }

  const soma =
    (pts.anuncios || 0) +
    (pts.site || 0) +
    (pts.seo || 0) +
    (pts.conversao || 0) +
    (pts.contato || 0) +
    (pts.fit || 0);

  return Math.round(soma > 0 ? soma : 50);
}

/**
 * Normaliza número de telefone para WhatsApp no formato internacional:
 * Ex: "(11) 98765-4321" -> "5511987654321"
 */
export function normalizarWhatsAppUrl(numero: string, mensagem?: string): string {
  const limpo = numero.replace(/\D/g, '');
  if (!limpo) return '';

  // Se tiver 10 ou 11 dígitos (DDD + número), adiciona 55 (Brasil)
  let internacional = limpo;
  if (limpo.length === 10 || limpo.length === 11) {
    internacional = `55${limpo}`;
  }

  const baseUrl = `https://wa.me/${internacional}`;
  if (mensagem) {
    return `${baseUrl}?text=${encodeURIComponent(mensagem)}`;
  }
  return baseUrl;
}

/**
 * Formata link de Instagram aceitando @usuario ou URL completa
 */
export function normalizarInstagramUrl(input: string): string {
  const limpo = input.trim();
  if (!limpo) return '';
  if (limpo.startsWith('http://') || limpo.startsWith('https://')) {
    return limpo;
  }
  const username = limpo.replace(/^@/, '').replace(/\/$/, '');
  return `https://instagram.com/${username}`;
}

/**
 * Separa listas de problemas ou fontes delimitadas por ;, |, quebra de linha ou vírgulas
 */
export function separarLista(texto: unknown): string[] {
  if (!texto) return [];
  if (Array.isArray(texto)) return texto.map(String).filter(Boolean);

  const str = String(texto);
  return str
    .split(/[;|\n\r]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
