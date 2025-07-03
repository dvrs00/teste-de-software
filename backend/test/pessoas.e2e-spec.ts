import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pessoa } from '../src/pessoas/entities/pessoa.entity';

describe('Pessoas E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule,
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [Pessoa],
            synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Garante que a aplicação só receba as propriedades definidas no DTO
      forbidNonWhitelisted: true, // Lança um erro se propriedades extras forem enviadas
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /pessoas', () => {
    it('deve retornar 400 (Bad Request) para um CPF inválido', () => {
      const pessoaComCpfInvalido = {
        nome: 'Pessoa Inválida',
        cpf: '111.111.111-11', // CPF com todos os dígitos iguais é inválido
        email: 'valido@email.com',
        dataNascimento: '2000-01-01',
      };
  
      return request(app.getHttpServer())
        .post('/pessoas')
        .send(pessoaComCpfInvalido)
        .expect(400)
        .expect(res => {
          expect(res.body.message).toContain('O CPF informado é inválido.');
        });
    });

    // Você pode adicionar mais testes aqui, como um para e-mail inválido, etc.
    it('deve retornar 201 (Created) para dados válidos', () => {
        const pessoaValida = {
          nome: 'Pessoa Válida',
          // Use um CPF válido para este teste
          cpf: '12345678901', // Substitua por um CPF realmente válido
          email: 'pessoavalida@email.com',
          dataNascimento: '1995-05-10',
        };

        return request(app.getHttpServer())
            .post('/pessoas')
            .send(pessoaValida)
            .expect(201)
            .expect(res => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.nome).toEqual(pessoaValida.nome);
            });
    });
  });

});