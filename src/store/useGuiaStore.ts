import { useState, useEffect, useCallback } from 'react';
import { get, set, del } from 'idb-keyval';
import { Ficha, FiltrosState, ModoConciliacao, OrdenacaoTipo, Prioridade, TipoVisualizacao } from '../types';


const IDB_FICHAS_KEY = 'guia_campo_fichas_v1';
const IDB_NOTAS_RONDA_KEY = 'guia_campo_notas_ronda_v1';
const IDB_TEMA_KEY = 'guia_campo_tema_dark_v1';

export const FILTROS_INICIAIS: FiltrosState = {
  busca: '',
  prioridades: [],
  nichos: [],
  bairros: [],
  cidades: [],
  apenasSemAnuncios: false,
  apenasMetaAds: false,
  apenasGoogleAds: false,
  apenasComSite: false,
  apenasSemSite: false,
  apenasComWhats: false,
  servico: '',
  pontuacaoMin: 0,
  pontuacaoMax: 100,
  ordenacao: 'pontuacao-desc',
  visualizacao: 'fichas',
};

// Carregar filtros da URL query string
function carregarFiltrosDaUrl(): Partial<FiltrosState> {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const parciais: Partial<FiltrosState> = {};

    const busca = params.get('q');
    if (busca) parciais.busca = busca;

    const prio = params.get('prio');
    if (prio) parciais.prioridades = prio.split(',') as Prioridade[];

    const nicho = params.get('nicho');
    if (nicho) parciais.nichos = nicho.split(',');

    const bairro = params.get('bairro');
    if (bairro) parciais.bairros = bairro.split(',');

    const ord = params.get('ord');
    if (ord) parciais.ordenacao = ord as OrdenacaoTipo;

    const vis = params.get('vis');
    if (vis) parciais.visualizacao = vis as TipoVisualizacao;

    const semAds = params.get('semAds');
    if (semAds === '1') parciais.apenasSemAnuncios = true;

    return parciais;
  } catch {
    return {};
  }
}

// Atualizar URL com filtros sem recarregar a página
function sincronizarUrlComFiltros(filtros: FiltrosState): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams();

    if (filtros.busca) params.set('q', filtros.busca);
    if (filtros.prioridades.length > 0) params.set('prio', filtros.prioridades.join(','));
    if (filtros.nichos.length > 0) params.set('nicho', filtros.nichos.join(','));
    if (filtros.bairros.length > 0) params.set('bairro', filtros.bairros.join(','));
    if (filtros.ordenacao !== 'pontuacao-desc') params.set('ord', filtros.ordenacao);
    if (filtros.visualizacao !== 'fichas') params.set('vis', filtros.visualizacao);
    if (filtros.apenasSemAnuncios) params.set('semAds', '1');

    const novaSearch = params.toString();
    const novoUrl = `${window.location.pathname}${novaSearch ? `?${novaSearch}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', novoUrl);
  } catch {
    // Ignorar se ambiente restrito
  }
}

// Singleton state listeners
type Listener = () => void;
const listeners = new Set<Listener>();

// Estado interno mantido em memória
let stateFichas: Ficha[] = [];
let stateNotasRonda: string = '';
let stateTemaKraft: boolean = false;
let stateFiltros: FiltrosState = { ...FILTROS_INICIAIS, ...carregarFiltrosDaUrl() };
let stateFichaSelecionadaId: string | null = null;
let stateAbaMobile: 'fichas' | 'filtros' | 'separadas' | 'importar' = 'fichas';
let stateModalImportacao: boolean = false;
let stateModalFiltros: boolean = false;
let stateModalConfig: boolean = false;
let stateToast: { texto: string; onUndo?: () => void } | null = null;
let toastTimeout: ReturnType<typeof setTimeout> | null = null;
let inicializado: boolean = false;

function emitChange() {
  listeners.forEach((l) => l());
}

// Inicializador assíncrono para IndexedDB
export async function inicializarGuiaStore(): Promise<void> {
  if (inicializado) return;
  try {
    const fichasSalvas = await get<Ficha[]>(IDB_FICHAS_KEY);
    if (fichasSalvas && Array.isArray(fichasSalvas) && fichasSalvas.length > 0) {
      stateFichas = fichasSalvas;
    } else {
      // Primeira execução: começa com lista vazia
      stateFichas = [];
    }

    const notas = await get<string>(IDB_NOTAS_RONDA_KEY);
    if (typeof notas === 'string') {
      stateNotasRonda = notas;
    }

    const tema = await get<boolean>(IDB_TEMA_KEY);
    if (tema !== undefined) {
      stateTemaKraft = tema;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', tema);
      }
    } else {
      // Detectar preferência do sistema operacional
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        stateTemaKraft = true;
        document.documentElement.classList.add('dark');
        // Salvar preferência detectada
        await set(IDB_TEMA_KEY, true);
        try { localStorage.setItem(IDB_TEMA_KEY, 'true'); } catch {}
      }
    }

    // Verificar hash da rota para ficha específica ex: #/ficha/sorriso-vivo-123
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/#\/ficha\/(.+)/);
      if (match && match[1]) {
        stateFichaSelecionadaId = match[1];
      }
    }
  } catch (err) {
    console.error('Erro ao inicializar IndexedDB:', err);
    stateFichas = [];
  } finally {
    inicializado = true;
    emitChange();
  }
}

// Hook principal de consumo
export function useGuiaStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    listeners.add(onChange);
    if (!inicializado) {
      inicializarGuiaStore();
    }
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  // Sincronizar rota hash com ficha selecionada
  const selecionarFicha = useCallback((id: string | null) => {
    stateFichaSelecionadaId = id;
    if (typeof window !== 'undefined') {
      if (id) {
        window.location.hash = `#/ficha/${id}`;
      } else {
        if (window.location.hash.startsWith('#/ficha/')) {
          window.location.hash = '';
        }
      }
    }
    emitChange();
  }, []);

  const setFiltros = useCallback((novosFiltros: Partial<FiltrosState>) => {
    stateFiltros = { ...stateFiltros, ...novosFiltros };
    sincronizarUrlComFiltros(stateFiltros);
    emitChange();
  }, []);

  const limparFiltros = useCallback(() => {
    stateFiltros = {
      ...FILTROS_INICIAIS,
      visualizacao: stateFiltros.visualizacao,
      ordenacao: stateFiltros.ordenacao,
    };
    sincronizarUrlComFiltros(stateFiltros);
    emitChange();
  }, []);

  const alternarSeparada = useCallback(async (id: string) => {
    stateFichas = stateFichas.map((f) => (f.id === id ? { ...f, separada: !f.separada } : f));
    await set(IDB_FICHAS_KEY, stateFichas);
    emitChange();
  }, []);

  const descartarFicha = useCallback(async (id: string) => {
    const ficha = stateFichas.find((f) => f.id === id);
    if (!ficha) return;

    stateFichas = stateFichas.map((f) => (f.id === id ? { ...f, descartada: true } : f));
    await set(IDB_FICHAS_KEY, stateFichas);

    // Toast com opção de desfazer
    if (toastTimeout) clearTimeout(toastTimeout);
    stateToast = {
      texto: `Ficha "${ficha.empresa}" descartada.`,
      onUndo: async () => {
        stateFichas = stateFichas.map((f) => (f.id === id ? { ...f, descartada: false } : f));
        await set(IDB_FICHAS_KEY, stateFichas);
        stateToast = null;
        emitChange();
      },
    };
    toastTimeout = setTimeout(() => {
      stateToast = null;
      emitChange();
    }, 5000);

    emitChange();
  }, []);

  const restaurarFicha = useCallback(async (id: string) => {
    stateFichas = stateFichas.map((f) => (f.id === id ? { ...f, descartada: false } : f));
    await set(IDB_FICHAS_KEY, stateFichas);
    emitChange();
  }, []);

  const salvarAnotacaoFicha = useCallback(async (id: string, anotacao: string) => {
    stateFichas = stateFichas.map((f) => (f.id === id ? { ...f, anotacao } : f));
    await set(IDB_FICHAS_KEY, stateFichas);
    emitChange();
  }, []);

  const salvarNotasRonda = useCallback(async (notas: string) => {
    stateNotasRonda = notas;
    await set(IDB_NOTAS_RONDA_KEY, notas);
    emitChange();
  }, []);

  const importarLote = useCallback(
    async (
      fichasImportadas: Ficha[],
      modo: ModoConciliacao = 'atualizar'
    ) => {
      if (modo === 'somar') {
        // Gera novos IDs para as que já existem
        const ajustadas = fichasImportadas.map((f) => {
          const existe = stateFichas.some((existente) => existente.id === f.id);
          return existe ? { ...f, id: `${f.id}_dupl_${Date.now()}` } : f;
        });
        stateFichas = [...stateFichas, ...ajustadas];
      } else if (modo === 'ignorar') {
        // Apenas as novas que não existem
        const idsExistentes = new Set(stateFichas.map((f) => f.id));
        const apenasNovas = fichasImportadas.filter((f) => !idsExistentes.has(f.id));
        stateFichas = [...stateFichas, ...apenasNovas];
      } else {
        // 'atualizar': substitui ou atualiza dados mantendo anotações existentes
        const mapa = new Map<string, Ficha>();
        stateFichas.forEach((f) => mapa.set(f.id, f));

        fichasImportadas.forEach((nova) => {
          const antiga = mapa.get(nova.id);
          if (antiga) {
            mapa.set(nova.id, {
              ...nova,
              separada: antiga.separada ?? nova.separada,
              anotacao: antiga.anotacao || nova.anotacao,
            });
          } else {
            mapa.set(nova.id, nova);
          }
        });

        stateFichas = Array.from(mapa.values());
      }

      await set(IDB_FICHAS_KEY, stateFichas);
      emitChange();
    },
    []
  );


  const limparTudo = useCallback(async () => {
    stateFichas = [];
    stateNotasRonda = '';
    await del(IDB_FICHAS_KEY);
    await del(IDB_NOTAS_RONDA_KEY);
    emitChange();
  }, []);

  const alternarTemaKraft = useCallback(async () => {
    stateTemaKraft = !stateTemaKraft;
    await set(IDB_TEMA_KEY, stateTemaKraft);
    // Sincronizar também no localStorage para o script anti-flash no index.html
    try { localStorage.setItem(IDB_TEMA_KEY, String(stateTemaKraft)); } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', stateTemaKraft);
    }
    emitChange();
  }, []);

  const fecharToast = useCallback(() => {
    if (toastTimeout) clearTimeout(toastTimeout);
    stateToast = null;
    emitChange();
  }, []);

  return {
    fichas: stateFichas,
    notasRonda: stateNotasRonda,
    temaKraft: stateTemaKraft,
    filtros: stateFiltros,
    fichaSelecionadaId: stateFichaSelecionadaId,
    abaMobile: stateAbaMobile,
    modalImportacaoAberto: stateModalImportacao,
    modalFiltrosAberto: stateModalFiltros,
    modalConfigAberto: stateModalConfig,
    toast: stateToast,

    // Setters
    selecionarFicha,
    setFiltros,
    limparFiltros,
    alternarSeparada,
    descartarFicha,
    restaurarFicha,
    salvarAnotacaoFicha,
    salvarNotasRonda,
    importarLote,
    limparTudo,
    alternarTemaKraft,
    fecharToast,
    setAbaMobile: (aba: 'fichas' | 'filtros' | 'separadas' | 'importar') => {
      stateAbaMobile = aba;
      emitChange();
    },
    setModalImportacao: (aberto: boolean) => {
      stateModalImportacao = aberto;
      emitChange();
    },
    setModalFiltros: (aberto: boolean) => {
      stateModalFiltros = aberto;
      emitChange();
    },
    setModalConfig: (aberto: boolean) => {
      stateModalConfig = aberto;
      emitChange();
    },
  };
}
