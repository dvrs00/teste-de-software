
describe('CRUD de Pessoas', () => {
  it('deve permitir criar uma nova pessoa, exibi-la na lista e depois removê-la', () => {

    const novaPessoa = {
      nome: 'Joana da Silva',
      cpf: '039.317.752-16', 
      email: 'jojo.silva@teste.com',
      dataNascimento: '1995-10-20', 
    };

    cy.visit('/');

    cy.contains('Nova Pessoa').click();

    cy.get('input[name="nome"]').type(novaPessoa.nome);
    cy.get('input[name="cpf"]').type(novaPessoa.cpf);
    cy.get('input[name="email"]').type(novaPessoa.email);
    cy.get('input[name="dataNascimento"]').type(novaPessoa.dataNascimento);

    cy.contains('button', 'Salvar').click();

    cy.contains('td', novaPessoa.nome).should('be.visible');

    cy.contains('td', novaPessoa.nome)
      .parent('tr') // Pega a linha inteira (o <tr>)
      .within(() => { // Limita a busca a esta linha
        cy.contains('button', 'Remover').click();
      });

    cy.contains('td', novaPessoa.nome).should('not.exist');
  });

  it('deve permitir editar uma pessoa existente', () => {
    
    const pessoaOriginal = {
      nome: 'Carlos Antigo',
      cpf: '57270619972', 
      email: 'carlos.antigo@teste.com',
      dataNascimento: new Date('1992-04-15').toISOString(),
    };

    cy.request('POST', 'http://localhost:3000/pessoas', pessoaOriginal).then(
      (response) => {
        const pessoaId = response.body.id;
        const nomeAtualizado = 'Carlos Nogueira Atualizado';

        cy.visit('/');

        cy.contains('td', pessoaOriginal.nome)
          .parent('tr')
          .within(() => {
            cy.contains('button', 'Editar').click();
          });

        cy.get('input[name="nome"]').should('have.value', pessoaOriginal.nome);
        
        cy.get('input[name="nome"]').clear().type(nomeAtualizado);

        cy.contains('button', 'Salvar').click();

        cy.contains('td', pessoaOriginal.nome).should('not.exist');

        cy.contains('td', nomeAtualizado).should('be.visible');
      },
    );
  });
}); 