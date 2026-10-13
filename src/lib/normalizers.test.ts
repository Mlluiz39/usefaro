import { describe, it, expect } from 'vitest';
import {
  normalizarTexto,
  normalizarCabecalho,
  parseBooleanBR,
  parseNumeroBR,
  parseDataBR,
  derivarPrioridade,
  calcularPontuacao,
  normalizarWhatsAppUrl,
  normalizarInstagramUrl,
  separarLista,
} from './normalizers';
import { gerarIdEstavel } from './hash';
import { autoMapearColunas } from './parsers';

describe('Funções de Normalização e Parser do Guia de Campo', () => {
  describe('normalizarTexto e normalizarCabecalho', () => {
    it('remove acentos, pontuações e converte para minúsculas', () => {
      expect(normalizarCabecalho('WhatsApp (site)')).toBe('whatsapp site');
      expect(normalizarCabecalho('Pts anúncios')).toBe('pts anuncios');
      expect(normalizarCabecalho('Avaliações & Notas')).toBe('avaliacoes notas');
      expect(normalizarCabecalho('  Clínica   Odontológica ')).toBe('clinica odontologica');
    });

    it('trata valores nulos ou vazios de forma segura', () => {
      expect(normalizarCabecalho('')).toBe('');
      expect(normalizarCabecalho(null)).toBe('');
      expect(normalizarCabecalho(undefined)).toBe('');
    });
  });

  describe('parseBooleanBR', () => {
    it('reconhece variações afirmativas em pt-BR e inglês', () => {
      expect(parseBooleanBR('sim')).toBe(true);
      expect(parseBooleanBR('Sim')).toBe(true);
      expect(parseBooleanBR('S')).toBe(true);
      expect(parseBooleanBR('true')).toBe(true);
      expect(parseBooleanBR(true)).toBe(true);
      expect(parseBooleanBR(1)).toBe(true);
      expect(parseBooleanBR('1')).toBe(true);
      expect(parseBooleanBR('ativo')).toBe(true);
      expect(parseBooleanBR('presente')).toBe(true);
    });

    it('reconhece variações negativas', () => {
      expect(parseBooleanBR('não')).toBe(false);
      expect(parseBooleanBR('nao')).toBe(false);
      expect(parseBooleanBR('N')).toBe(false);
      expect(parseBooleanBR('false')).toBe(false);
      expect(parseBooleanBR(false)).toBe(false);
      expect(parseBooleanBR(0)).toBe(false);
      expect(parseBooleanBR('inativo')).toBe(false);
      expect(parseBooleanBR('ausente')).toBe(false);
      expect(parseBooleanBR('riscado')).toBe(false);
    });

    it('retorna undefined para valores indeterminados', () => {
      expect(parseBooleanBR(null)).toBeUndefined();
      expect(parseBooleanBR('')).toBeUndefined();
    });
  });

  describe('parseNumeroBR', () => {
    it('converte decimais com vírgula e inteiros', () => {
      expect(parseNumeroBR('4,7')).toBe(4.7);
      expect(parseNumeroBR('4.7')).toBe(4.7);
      expect(parseNumeroBR('212')).toBe(212);
      expect(parseNumeroBR(86)).toBe(86);
      expect(parseNumeroBR('86%')).toBe(86);
      expect(parseNumeroBR('★ 4,8 notas')).toBe(4.8);
    });

    it('retorna undefined para strings sem números', () => {
      expect(parseNumeroBR('nenhuma')).toBeUndefined();
      expect(parseNumeroBR('')).toBeUndefined();
    });
  });

  describe('parseDataBR', () => {
    it('converte formato brasileiro DD/MM/AAAA para string ISO', () => {
      const dataIso = parseDataBR('13/10/2026');
      expect(dataIso).toContain('2026-10-13');
    });

    it('preserva ISO existente', () => {
      const iso = '2026-10-13T14:32:00.000Z';
      expect(parseDataBR(iso)).toBe(iso);
    });
  });

  describe('derivarPrioridade', () => {
    it('extrai prioridade de texto independente de maiúsculas', () => {
      expect(derivarPrioridade('Alta')).toBe('Alta');
      expect(derivarPrioridade('alta')).toBe('Alta');
      expect(derivarPrioridade('urgente')).toBe('Alta');
      expect(derivarPrioridade('média')).toBe('Média');
      expect(derivarPrioridade('media')).toBe('Média');
      expect(derivarPrioridade('baixa')).toBe('Baixa');
    });

    it('deriva da pontuação se o texto for nulo', () => {
      expect(derivarPrioridade(undefined, 86)).toBe('Alta');
      expect(derivarPrioridade(undefined, 71)).toBe('Média');
      expect(derivarPrioridade(undefined, 34)).toBe('Baixa');
    });
  });

  describe('gerarIdEstavel', () => {
    it('produz o mesmo ID determinístico para empresa e bairro iguais', () => {
      const id1 = gerarIdEstavel('Clínica Sorriso Vivo', 'Tatuapé');
      const id2 = gerarIdEstavel('clinica sorriso vivo', 'tatuape');
      expect(id1).toBe(id2);
      expect(id1).toContain('clinica_sorriso_vi');
    });

    it('produz IDs diferentes para bairros diferentes', () => {
      const id1 = gerarIdEstavel('Sorriso Vivo', 'Tatuapé');
      const id2 = gerarIdEstavel('Sorriso Vivo', 'Mooca');
      expect(id1).not.toBe(id2);
    });
  });

  describe('calcularPontuacao', () => {
    it('soma os pontos parciais se a pontuação geral não estiver preenchida', () => {
      const score = calcularPontuacao({
        anuncios: 18,
        site: 19,
        seo: 14,
        conversao: 15,
        contato: 10,
        fit: 10,
      });
      expect(score).toBe(86);
    });

    it('prioriza pontuação direta se fornecida', () => {
      expect(calcularPontuacao({ site: 10 }, 90)).toBe(90);
    });
  });

  describe('normalizarWhatsAppUrl', () => {
    it('adiciona código do Brasil 55 e limpa pontuações', () => {
      const url = normalizarWhatsAppUrl('(11) 98765-4321');
      expect(url).toBe('https://wa.me/5511987654321');
    });

    it('injeta mensagem com encodeURI se fornecida', () => {
      const url = normalizarWhatsAppUrl('11987654321', 'Olá, Dr. Marcelo!');
      expect(url).toContain('wa.me/5511987654321?text=Ol%C3%A1%2C%20Dr.%20Marcelo!');
    });
  });

  describe('normalizarInstagramUrl', () => {
    it('converte @usuario para link do instagram', () => {
      expect(normalizarInstagramUrl('@sorrisovivo')).toBe('https://instagram.com/sorrisovivo');
    });
  });

  describe('separarLista', () => {
    it('separa strings com ponto e vírgula, barra vertical ou quebras de linha', () => {
      const itens = separarLista('Problema 1; Problema 2 | Problema 3\nProblema 4');
      expect(itens).toEqual(['Problema 1', 'Problema 2', 'Problema 3', 'Problema 4']);
    });
  });

  describe('autoMapearColunas', () => {
    it('mapeia colunas esperadas do arquivo padrão para os campos do Guia', () => {
      const colunas = [
        'Empresa',
        'Nicho',
        'Bairro',
        'Cidade',
        'Website',
        'Telefone (Google Maps)',
        'WhatsApp (site)',
        'Instagram',
        'Nota Google',
        'Avaliações',
        'Meta Ads',
        'Google Ads',
        'Problemas identificados',
        'Serviço recomendado',
        'Pontuação',
        'Prioridade',
      ];

      const mapeamento = autoMapearColunas(colunas);
      expect(mapeamento['Empresa']).toBe('empresa');
      expect(mapeamento['Nicho']).toBe('nicho');
      expect(mapeamento['Bairro']).toBe('bairro');
      expect(mapeamento['WhatsApp (site)']).toBe('whatsapp');
      expect(mapeamento['Telefone (Google Maps)']).toBe('telefone');
      expect(mapeamento['Problemas identificados']).toBe('problemas');
      expect(mapeamento['Serviço recomendado']).toBe('servicoRecomendado');
      expect(mapeamento['Pontuação']).toBe('pontuacao');
      expect(mapeamento['Prioridade']).toBe('prioridade');
    });
  });
});
