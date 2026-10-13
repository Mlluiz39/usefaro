import * as XLSX from 'xlsx';
import { Ficha } from '../types';

/**
 * Transforma uma lista de fichas em linhas tabulares planas
 */
function fichasParaLinhas(fichas: Ficha[]): Record<string, string | number>[] {
  return fichas.map((f) => ({
    Empresa: f.empresa,
    Nicho: f.nicho,
    Bairro: f.bairro,
    Cidade: f.cidade,
    Website: f.website || '',
    'Telefone (Google Maps)': f.telefone || '',
    'WhatsApp (site)': f.whatsapp || '',
    Instagram: f.instagram || '',
    'Perfil Google Maps': f.perfilMaps || '',
    'Nota Google': f.notaGoogle !== undefined ? f.notaGoogle.toString().replace('.', ',') : '',
    Avaliações: f.avaliacoes ?? '',
    'Anúncios ativos': f.anunciosAtivos ? 'Sim' : 'Não',
    'Meta Ads': f.metaAds ? 'Sim' : 'Não',
    'Evidência Meta': f.evidenciaMeta || '',
    'Google Ads': f.googleAds ? 'Sim' : 'Não',
    'Evidência Google': f.evidenciaGoogle || '',
    'Performance mobile': f.performanceMobile ?? '',
    'Problemas identificados': f.problemas.join('; '),
    'Serviço recomendado': f.servicoRecomendado || '',
    'Pts anúncios': f.pts.anuncios ?? '',
    'Pts site': f.pts.site ?? '',
    'Pts SEO': f.pts.seo ?? '',
    'Pts conversão': f.pts.conversao ?? '',
    'Pts contato': f.pts.contato ?? '',
    'Pts fit': f.pts.fit ?? '',
    Pontuação: f.pontuacao ?? '',
    Prioridade: f.prioridade || '',
    Fontes: f.fontes.join('; '),
    'Data da verificação': f.dataVerificacao || '',
    'Caderno (Separada)': f.separada ? 'Sim' : 'Não',
    'Anotações de campo': f.anotacao || '',
  }));
}

/**
 * Exporta para CSV com UTF-8 BOM e separador ";" (padrão Excel brasileiro)
 */
export function exportarCSV(fichas: Ficha[], nomeArquivo = 'guia_de_campo_export.csv'): void {
  const dados = fichasParaLinhas(fichas);
  if (dados.length === 0) return;

  const colunas = Object.keys(dados[0]);
  const linhas: string[] = [];

  // Cabeçalho
  linhas.push(colunas.map((col) => `"${col.replace(/"/g, '""')}"`).join(';'));

  // Linhas
  dados.forEach((row) => {
    const valores = colunas.map((col) => {
      const v = row[col];
      const str = v === undefined || v === null ? '' : String(v);
      return `"${str.replace(/"/g, '""')}"`;
    });
    linhas.push(valores.join(';'));
  });

  // UTF-8 BOM \uFEFF para Excel não quebrar acentos
  const csvConteudo = '\uFEFF' + linhas.join('\r\n');
  const blob = new Blob([csvConteudo], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, nomeArquivo);
}

/**
 * Exporta para XLSX
 */
export function exportarXLSX(fichas: Ficha[], nomeArquivo = 'guia_de_campo_export.xlsx'): void {
  const dados = fichasParaLinhas(fichas);
  const worksheet = XLSX.utils.json_to_sheet(dados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Guia de Campo');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, nomeArquivo);
}

/**
 * Exporta para JSON limpo
 */
export function exportarJSON(fichas: Ficha[], nomeArquivo = 'guia_de_campo_export.json'): void {
  const jsonStr = JSON.stringify({ empresas: fichas }, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, nomeArquivo);
}

function downloadBlob(blob: Blob, nomeArquivo: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
