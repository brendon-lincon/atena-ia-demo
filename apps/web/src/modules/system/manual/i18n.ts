import { createT } from '@/core/i18n/create-t';

export const t = createT({
  label: 'Manual',
  description: 'Ajuda por módulo, procedimentos e primeiros passos.',
  title: 'Manual e ajuda',
  subtitle: 'Procedimentos passo a passo, glossário e um roteiro para quem está começando.',
  search: 'Buscar no manual',
  tabs: {
    index: 'Índice por módulo',
    procedures: 'Procedimentos',
    glossary: 'Glossário',
    start: 'Primeiros passos',
    news: 'Novidades',
  },
  open: 'Abrir o módulo',
  procedure: {
    title: 'Como enviar uma medição ao contratante',
    intro: 'Do fechamento do período ao envio do boletim, com a revisão da Atena no meio.',
    steps: {
      one: {
        title: 'Abra Medições e escolha a obra',
        body: 'Em Obras, abra Medições e selecione a obra e o período. O levantamento por item da EAP já vem com fotos e registros do diário.',
      },
      two: {
        title: 'Confira o levantamento',
        body: 'Revise as quantidades do período e o acumulado de cada item. O saldo nunca pode ficar negativo.',
      },
      three: {
        title: 'Revise o boletim',
        body: 'Na aba Boletim, a folha A4 mostra o período, o acumulado, a retenção e o valor líquido, com a identidade da empresa.',
      },
      four: {
        title: 'Aprove na Central de revisão',
        body: 'A medição aparece em "Precisa de você". Aprove ou ajuste.',
      },
      five: {
        title: 'Envie ao contratante',
        body: 'Na aba Solicitação de pagamento, use Enviar ao contratante. O sistema registra o envio e cria a conta a receber.',
      },
    },
  },
  glossary: {
    eap: {
      term: 'EAP',
      def: 'Estrutura analítica do projeto: a árvore de frentes e serviços que liga orçamento, cronograma, medição e custo.',
    },
    bdi: {
      term: 'BDI',
      def: 'Benefícios e despesas indiretas: percentual aplicado sobre o custo para formar o preço de venda.',
    },
    cno: {
      term: 'CNO',
      def: 'Cadastro Nacional de Obras da Receita Federal, exigido para toda obra de construção civil.',
    },
    art: {
      term: 'ART',
      def: 'Anotação de responsabilidade técnica: registro do profissional responsável pelo serviço.',
    },
    aso: {
      term: 'ASO',
      def: 'Atestado de saúde ocupacional: resultado do exame médico do trabalhador.',
    },
    curvaS: {
      term: 'Curva S',
      def: 'Gráfico do avanço acumulado previsto e realizado ao longo do tempo.',
    },
    caminhoCritico: {
      term: 'Caminho crítico',
      def: 'Sequência de atividades sem folga: qualquer atraso nelas atrasa o fim da obra.',
    },
    lp: {
      term: 'LP, LI e LO',
      def: 'Licença prévia, de instalação e de operação, etapas do licenciamento ambiental.',
    },
  },
  start: {
    one: 'Entre pelo painel e veja o que precisa de você.',
    two: 'Abra uma obra e percorra a linha do tempo.',
    three: 'Pergunte algo à Atena com Ctrl+K (ou ⌘K).',
    four: 'Confira um item na Central de revisão.',
    five: 'Emita um documento a partir de um modelo.',
  },
  news: {
    one: 'Versão de demonstração: dados fictícios, envio de mensagens e e-mails simulados.',
    two: 'Todo cálculo e toda leitura de arquivo são ilustrativos nesta fase.',
  },
  emptyTitle: 'Nada encontrado no manual',
  emptyDescription: 'Tente outra palavra ou veja o índice por módulo.',
});
