import { Ficha } from '../types';

export type TomAbordagem = 'direto' | 'amigavel' | 'consultivo' | 'urgente';

export interface OpcaoTom {
  id: TomAbordagem;
  rotulo: string;
  descricao: string;
}

export const OPCOES_TOM: OpcaoTom[] = [
  { id: 'direto', rotulo: 'Direto & Objetivo', descricao: 'Foco rápido no gargalo e na perda de clientes' },
  { id: 'amigavel', rotulo: 'Amigável & Cordial', descricao: 'Tom de elogio inicial seguido de oportunidade de melhoria' },
  { id: 'consultivo', rotulo: 'Auditoria Técnica', descricao: 'Postura de especialista apresentando dados de diagnóstico' },
  { id: 'urgente', rotulo: 'Alerta Comercial', descricao: 'Foco no desperdício de verba de anúncios ativos' },
];

export function gerarRoteiroAbordagem(ficha: Ficha, tom: TomAbordagem = 'direto'): string {
  const empresa = ficha.empresa;
  const bairro = ficha.bairro;
  const nicho = ficha.nicho;

  const problema1 = ficha.problemas[0] || 'site com carregamento lento no celular';
  const problema2 =
    ficha.problemas[1] ||
    (ficha.whatsapp ? 'falta de botão direto de WhatsApp na tela principal' : 'ausência de canal direto de agendamento');

  const temGoogleAds = ficha.googleAds === true;
  const temMetaAds = ficha.metaAds === true;
  const temAnuncios = temGoogleAds || temMetaAds || ficha.anunciosAtivos === true;

  switch (tom) {
    case 'amigavel':
      return `Olá! Acompanho o trabalho da ${empresa} aqui no ${bairro} e sou fã do padrão de atendimento de vocês.

Estava analisando a presença digital de estabelecimentos de ${nicho} na nossa região e notei duas oportunidades rápidas que podem dobrar os agendamentos de vocês:
1) ${problema1}
2) ${problema2}

Preparei uma análise em vídeo de 90 segundos sem custo mostrando como destravar isso. Posso enviar o link por aqui para vocês darem uma olhada?`;

    case 'consultivo':
      return `Olá, responsável pela ${empresa}! Sou especialista em presença digital e tráfego local para o segmento de ${nicho}.

Durante nossa auditoria territorial no ${bairro}, levantamos o índice técnico do estabelecimento:
• Reputação Google: ${ficha.notaGoogle || 4.7} estrelas (${ficha.avaliacoes || 100}+ avaliações)
• Gargalo 1: ${problema1}
• Gargalo 2: ${problema2}
${ficha.performanceMobile ? `• Performance Mobile estimada em apenas ${ficha.performanceMobile}/100.` : ''}

Corrigir esses dois pontos costuma reduzir o custo por contato em até 40%. Faz sentido eu compartilhar a ficha técnica completa com vocês?`;

    case 'urgente':
      if (temAnuncios) {
        return `Atenção, gestão da ${empresa}! Notei que vocês estão investindo verba em anúncios pagos no ${bairro}, mas há um vazamento crítico na conversão:

O anúncio atrai o cliente, porém encontramos:
→ ${problema1}
→ ${problema2}

Cada clique pago sem canal de fechamento imediato queima dinheiro da clínica/empresa. Gravei uma demonstração rápida de 1 minuto mostrando como estancar essa perda hoje. Para quem posso encaminhar?`;
      }
      return `Olá, time da ${empresa}! Seus concorrentes de ${nicho} no ${bairro} estão captando a maior parte das buscas orgânicas porque:
1. ${problema1}
2. ${problema2}

A boa notícia é que o ajuste é simples e imediato. Gostariam de ver o plano de ação de 3 passos que desenhamos para vocês?`;

    case 'direto':
    default:
      return `Olá, equipe da ${empresa}! Tudo bem?

Fiz uma inspeção técnica rápida no canal digital de vocês aqui no ${bairro} e notei dois pontos travando novos clientes:
1. ${problema1}
2. ${problema2}

${ficha.servicoRecomendado ? `Nossa recomendação para o caso de vocês: ${ficha.servicoRecomendado}.` : ''}

Tenho um resumo rápido de 1 minuto mostrando exatamente como corrigir. Quem aí na ${empresa} cuida dessa parte para eu enviar?`;
  }
}
