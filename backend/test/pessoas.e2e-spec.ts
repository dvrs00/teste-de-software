import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Pessoa } from '../src/pessoas/entities/pessoa.entity';
import { PessoasController } from '../src/pessoas/pessoas.controller';
import { PessoasService } from '../src/pessoas/pessoas.service';
import { IsCpfConstraint } from '../src/validators/is-cpf.validator';
import { Repository } from 'typeorm';

describe('Pessoas E2E', () => {
  let app: INestApplication;
  let pessoaRepository: Repository<Pessoa>; 

 beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Pessoa],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Pessoa]),
      ],
      controllers: [PessoasController],
      providers: [PessoasService, IsCpfConstraint], 
    }).compile();

    app = moduleFixture.createNestApplication();
    pessoaRepository = moduleFixture.get<Repository<Pessoa>>(getRepositoryToken(Pessoa));

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();
  });

  beforeEach(async () =>{ 
    await pessoaRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /pessoas', () => {
    it('deve retornar 400 (Bad Request) para um CPF inválido', () => {
      
      const pessoaComCpfInvalido = {
        nome: 'Pessoa Inválida',
        cpf: '111.111.111-11', 
        email: 'valido@email.com',
        dataNascimento: new Date('2000-01-02'),
      };
  
      return request(app.getHttpServer())
        .post('/pessoas')
        .send(pessoaComCpfInvalido)
        .expect(400)
        .expect(res => {
          expect(res.body.message).toContain('O CPF informado é inválido.');
        });
    });

    it('deve retornar 201 (Created) para dados válidos', () => {
        const pessoaValida = {
          nome: 'Pessoa Válida',
          cpf: '03931775216', 
          email: 'pessoavalida@email.com',
          dataNascimento: new Date('2000-01-01'),
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

  describe('GET /pessoas', () =>{
    it('deve retornar 200 (OK) e um array com todas pessoas cadastradas', async () => {

      //given 
      const primeiraPessoa = {
        nome: 'ciclano',
        cpf: '039.317.752-16',
        email: 'cliclano@gmail.com',
        dataNascimento: new Date('2000-01-01'),
      }

      const segundaPessoa = {
        nome: 'beltrano',
        cpf: '57270619972',
        email: 'beltrano@gmail.com',
        dataNascimento: new Date('2000-02-02'),
      }

      await request(app.getHttpServer()).post('/pessoas').send(primeiraPessoa);
      await request(app.getHttpServer()).post('/pessoas').send(segundaPessoa);

      //when
      const response = await request(app.getHttpServer())
        .get('/pessoas')
        .expect(200);

      //then
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      expect(response.body[0].nome).toEqual(primeiraPessoa.nome);
      expect(response.body[1].email).toEqual(segundaPessoa.email);
    });
  });

  describe('GET /pessoas/:id', () => {
    it('deve retornar 200 (OK) e os dados de pessoa encontrada', async () =>{
      // given
      const pessoaCriada = {
        nome: 'fulano',
        cpf: '03931775216',
        email: 'fulano@gmail.com',
        dataNascimento: new Date('2000-01-01'),
      };

      // when e then
      const resposta = await request(app.getHttpServer())
        .post('/pessoas')
        .send(pessoaCriada)
        .expect(201);

      const idPessoa = resposta.body.id;

      return request(app.getHttpServer())
      .get(`/pessoas/${idPessoa}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toEqual(idPessoa);
        expect(res.body.nome).toEqual(pessoaCriada.nome);
      });
    });

    it('deve retornar 404 (NotFound) para um ID que não existe', async () =>{
      const idInexistente = 'asdasd2easd123121231d';

      return request(app.getHttpServer())
        .get(`/pessoas/${idInexistente}`)
        .expect(404);
    });
  });

  describe('PATCH /pessoas/:id', () =>{ 
    it('deve retornar 200 (OK) e os dados da pessoa atualizados', async () => {
      //given
      const pessoaOriginal = {
        nome: 'Nome da pessoa',
        cpf: '03931775216',
        email: 'fulano@gmail.com',
        dataNascimento: new Date('2000-01-01'),
      };

      const resposta = await request(app.getHttpServer())
        .post('/pessoas')
        .send(pessoaOriginal);

        const pessoaId = resposta.body.id;

        const updatePessoaDto = {
          nome: 'Novo nome da pessoa',
        }

        //when then
        return request(app.getHttpServer())
          .patch(`/pessoas/${pessoaId}`)
          .send(updatePessoaDto)
          .expect(200)
          .expect((res) => {
            expect(res.body.id).toEqual(pessoaId);
            expect(res.body.nome).toEqual('Novo nome da pessoa');
            expect(res.body.email).toEqual(pessoaOriginal.email);
          });
    });

    it('deve retornar 404 (Not Found) ao tentar atualizar um ID que não existe', () => {
      const idInexistente = 'asd1231i2j31oj231o2j3';

      return request(app.getHttpServer())
        .patch(`/pessoas/${idInexistente}`)
        .send({nome: 'Nome'})
        .expect(404);
    });
  });

  describe('DELETE /pessoas/:id', () =>{
    it('deve retornar 204 (No Content) e remover a pessoa com sucesso', async () =>{
      //given 
      const pessoa = {
        nome: 'Nome da Pessoa',
        cpf: '039.317.752-16',
        email: 'fulano@gmail.com',
        dataNascimento: new Date('2000-01-01'),
      }

      const resposta = await request(app.getHttpServer())
        .post('/pessoas')
        .send(pessoa);

      const pessoaId = resposta.body.id;

      //when
      await request(app.getHttpServer())
        .delete(`/pessoas/${pessoaId}`)
        .expect(204);

      //then
      return request(app.getHttpServer())
        .get(`/pessoas/${pessoaId}`)
        .expect(404);
    });
    it('deve retornar 404 (NotFoundException) ao tentar remover um ID que não existe', () =>{
      const idInexistente = 'uuid-invalido';

      return request(app.getHttpServer())
        .delete(`/pessoas/${idInexistente}`)
        .expect(404);
    });
  });

});