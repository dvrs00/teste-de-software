// Em cypress/e2e/pessoas.cy.ts

describe('CRUD de Pessoas', () => {
  it('deve permitir criar uma nova pessoa, exibi-la na lista e depois removê-la', () => {
    // --- Parte 1: CRIAÇÃO ---
    const novaPessoa = {
      nome: 'Joana da Silva',
      cpf: '84333748027', // Use um CPF válido e único para o teste
      email: 'joana.silva@teste.com',
      dataNascimento: '1995-10-20', // Formato YYYY-MM-DD para input[type=date]
    };

    // Visita a página principal
    cy.visit('/');

    // Procura um botão/link para criar e clica nele
    cy.contains('Nova Pessoa').click();

    // Preenche o formulário
    cy.get('input[name="nome"]').type(novaPessoa.nome);
    cy.get('input[name="cpf"]').type(novaPessoa.cpf);
    cy.get('input[name="email"]').type(novaPessoa.email);
    cy.get('input[name="dataNascimento"]').type(novaPessoa.dataNascimento);

    // Clica em salvar
    cy.contains('button', 'Salvar').click();

    // --- Parte 2: VERIFICAÇÃO ---
    // Verifica se o nome da nova pessoa aparece na lista
    cy.contains('td', novaPessoa.nome).should('be.visible');

    // --- Parte 3: REMOÇÃO (Bônus para um teste mais completo) ---
    // Encontra a linha da Joana e clica no botão de remover
    cy.contains('td', novaPessoa.nome)
      .parent('tr') // Pega a linha inteira (o <tr>)
      .within(() => { // Limita a busca a esta linha
        cy.contains('button', 'Remover').click();
      });

    // Confirma que a pessoa foi removida e não está mais na lista
    cy.contains('td', novaPessoa.nome).should('not.exist');
  });
});