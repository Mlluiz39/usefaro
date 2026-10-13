# Guia de Campo // Dossiê de Prospecção Ativa B2B

Aplicativo web em Português do Brasil construído com **React 19 + Vite + TypeScript + Tailwind CSS** para consulta e decisão de abordagem de empresas locais com base em auditoria de presença digital (anúncios, site, PageSpeed, Google Maps).

Opera **100% no navegador do usuário**, sem necessidade de backend, com persistência local via **IndexedDB** (`idb-keyval`).

---

## 🛠️ Como Executar o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O aplicativo estará disponível em `http://localhost:3000`.

3. Para executar os testes unitários (Vitest):
   ```bash
   npm run test
   ```

4. Para compilar para produção:
   ```bash
   npm run build
   ```

---

## 🎨 Decisões de Design (Identidade Visual & Filosofia)

O aplicativo rejeita totalmente a estética genérica de dashboards SaaS, gradientes violetas e cantos redondos em pílula, adotando a metáfora tátil de um **dossiê investigativo de campo / caderno impresso**:

- **Paleta de Papel & Nanquim:**
  - Papel: `#F2EBDD` (superfície vellum não branqueada)
  - Nanquim/Tinta: `#1B1A17` (contornos e tipografia)
  - Tomate: `#E8431F` (carimbos e alertas de prioridade alta)
  - Mostarda: `#D9A21B` (marca-texto e prioridade média)
  - Musgo: `#2F4A3A` (selos de conformidade e status positivo)
  - Modo Papel Kraft Escuro disponível nas Configurações.
- **Tipografia Editorial e Técnica:**
  - *Fraunces* (Google Fonts): Títulos com presença editorial e contraste humanista.
  - *IBM Plex Mono* (Google Fonts): Rótulos, números, códigos de lote e carimbos.
  - *Instrument Sans*: Texto de leitura e corpo do dossiê.
- **Construção Tátil:**
  - Sombras duras deslocadas de nanquim (`4px 4px 0 #1B1A17` e `2px 2px 0`).
  - Carimbos inclinados em -3° com bordas duplas (`stamp-alta` e `stamp-media`).
  - Fitas adesivas translúcidas (`tape-accent`) nos cantos superiores das fichas.
  - Termômetro analógico desenhado em SVG para velocidade mobile (PageSpeed).
  - 6 réguas graduadas com tracinhos impressos para decomposição da pontuação.
  - Linhas pontilhadas de índice de livro com números alinhados mecanicamente.
  - Alvos de toque de no mínimo 48px e total aderência às diretrizes de acessibilidade (WCAG AA).

---

## 📂 Formatos de Arquivo Aceitos na Importação

O módulo de importação em 3 etapas aceita:
1. **CSV e TSV:** Delimitadores automáticos (vírgula `,` ou ponto-e-vírgula `;`) com suporte a UTF-8 e codificações locais.
2. **Excel (.xlsx e .xls):** Processamento via SheetJS com suporte a seleção de abas.
3. **JSON:** Aceita array de objetos direto `[...]` ou objeto envelope `{ "empresas": [...] }`.

### Colunas Esperadas e Reconhecidas Automaticamente:
- `Empresa` *(Obrigatório)*
- `Nicho`
- `Bairro`
- `Cidade`
- `Website`
- `Telefone (Google Maps)`
- `WhatsApp (site)`
- `Instagram`
- `Perfil Google Maps`
- `Nota Google` *(suporta vírgula decimal ex: "4,7")*
- `Avaliações`
- `Anúncios ativos` *(Sim/Não, 1/0, Ativo/Inativo)*
- `Meta Ads`
- `Evidência Meta`
- `Google Ads`
- `Evidência Google`
- `Performance mobile` *(0 a 100)*
- `Problemas identificados` *(separados por `;`, `|` ou quebra de linha)*
- `Serviço recomendado`
- `Pts anúncios`, `Pts site`, `Pts SEO`, `Pts conversão`, `Pts contato`, `Pts fit`
- `Pontuação` *(se ausente, somada a partir dos pontos)*
- `Prioridade` *(se ausente, derivada automaticamente: ≥75 Alta, 50-74 Média, <50 Baixa)*
- `Fontes`
- `Data da verificação` *(DD/MM/AAAA ou ISO)*

### Tratamento Inteligente:
- **Auto-mapeamento por similaridade** com remoção de acentos (`normalize("NFD")`).
- **Detecção de duplicatas estável** por hash de `(empresa + bairro)`.
- **Modos de conciliação:** Atualizar dados existentes (preserva anotações), Somar como novos registros ou Ignorar duplicatas.
- **Bilhete rasgado de erros:** Linhas sem coluna Empresa são listadas sem interromper o restante do lote.
- **Exportação:** Exportação em CSV (com UTF-8 BOM e separador `;` para Excel brasileiro), XLSX e JSON.
