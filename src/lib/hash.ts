/**
 * Gera um identificador estável baseado na normalização de empresa + bairro.
 * Garante que a mesma empresa no mesmo bairro sempre produza o mesmo ID.
 */
export function normalizarStringParaId(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function gerarIdEstavel(empresa: string, bairro: string): string {
  const normEmpresa = normalizarStringParaId(empresa || 'empresa_sem_nome');
  const normBairro = normalizarStringParaId(bairro || 'centro');

  // Algoritmo MurmurHash/DJB2 simples e rápido de 32 bits em string hexadecimal
  const str = `${normEmpresa}__${normBairro}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');

  // Slug legível com sufixo hash
  const slug = normEmpresa.slice(0, 18);
  return `${slug}-${hex}`;
}
