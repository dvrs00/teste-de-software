import { Test, TestingModule } from '@nestjs/testing';
import { PessoasService } from './pessoas.service';
import { Repository } from 'typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { ConflictException, NotFoundException} from '@nestjs/common';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

describe('PessoasService', () => {

  let service: PessoasService;
  let repository: Repository<Pessoa>;

  const mockPessoaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PessoasService, {
        provide: getRepositoryToken(Pessoa),
        useValue: mockPessoaRepository,
      }],
    }).compile();


    service = module.get<PessoasService>(PessoasService);
    repository = module.get<Repository<Pessoa>>(getRepositoryToken(Pessoa));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma pessoa e retorná-la com sucesso', async () => {

      // given
      const createPessoaDto: CreatePessoaDto = {
        nome: 'fulano',
        cpf: '000.000.000-00',
        dataNascimento: new Date('2000-02-19'),
        email: 'fulano@gmail.com',
      };

      const pessoa = {
        id: 'um-uuid-gerado-pelo-banco',
        ... createPessoaDto,
      };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(pessoa as unknown as Pessoa);
      jest.spyOn(repository, 'save').mockResolvedValue(pessoa as unknown as Pessoa);
      
      // when
      const result = await service.create(createPessoaDto);

      //then 
      expect(result).toEqual(pessoa);
      expect(repository.create).toHaveBeenCalledWith(createPessoaDto);
      expect(repository.save).toHaveBeenCalledWith(pessoa);
      expect(repository.findOneBy).toHaveBeenCalledTimes(2);
    }); 
    
    it('deve lançar uma ConflictExpection se o CPF já existir no banco', async () => {

      //given
      const createPessoaDto: CreatePessoaDto = {
        nome: 'fulano',
        cpf: '000.000.000-00',
        dataNascimento: new Date('2000-02-19'),
        email: 'fulano@gmail.com',
      };

      const pessoa = {
        id: 'um-uuid-gerado-pelo-banco',
        ... createPessoaDto,
      };

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(pessoa as Pessoa);

      // when / then 
      await expect(service.create(createPessoaDto)).rejects.toThrow(ConflictException);
      expect(repository.findOneBy).toHaveBeenCalledWith({cpf: createPessoaDto.cpf});
    });

    it('deve lançar uma ConflictExpection se o e-mail já existir no banco', async ()=> {
      //given
      const createPessoaDto: CreatePessoaDto = {
        nome: 'fulano',
        cpf: '000.000.000-00',
        dataNascimento: new Date('2000-02-19'),
        email: 'fulano@gmail.com',
      };

      const pessoaExistente = {
        id: 'um-uuid-gerado-pelo-banco',
        ... createPessoaDto,
      };

      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null).mockResolvedValueOnce(pessoaExistente as Pessoa);

      // when / then
      await expect(service.create(createPessoaDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deve retornar um array de pessoas', async () =>{
      //given 
      const pessoasArray = [ new Pessoa(), new Pessoa()];

      jest.spyOn(repository, 'find').mockResolvedValue(pessoasArray);

      // when 
      const result  = await service.findAll();

      // then 
      expect(result).toEqual(pessoasArray);
    })

    it('deve retornar um array vazio quando não houver pessoas', async () => {
      //given 
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      //when
      const result = await service.findAll();

      //then
      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () =>{
    it('deve retornar uma única pessoa com sucesso', async () => {
      // given
      const pessoa = {
        id: 'uuid-valido',
        nome: 'fulano',
        cpf: '03931775216',
        email: 'fulano@gmail.com',
        dataNascimento: new Date('2000-01-01'),
      }

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(pessoa as Pessoa);

      // when 
      const result = await service.findOne(pessoa.id);

      //then
      expect(result).toEqual(pessoa as Pessoa);
      expect(repository.findOneBy).toHaveBeenCalledWith({id: pessoa.id});
      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('deve atualizar os dados de uma pessoa com sucesso', async () => {
      // given 
      const id = 'uuid-valido';
      const updatePessoaDto: UpdatePessoaDto = {
        nome: 'Novo Nome'
      } 

      const pessoaExistente = new Pessoa();
      pessoaExistente.id = id;
      pessoaExistente.nome = 'Nome Antigo';

      const pessoaAtualizadaEsperada = {
        ...pessoaExistente,
        ...updatePessoaDto,
      }

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(pessoaExistente);
      jest.spyOn(repository, 'save').mockResolvedValue(pessoaAtualizadaEsperada as Pessoa);

      // when 
      const result = await service.update(id, updatePessoaDto);

      // then
      expect(repository.findOneBy).toHaveBeenCalledWith({id});
      expect(repository.save).toHaveBeenCalledWith(pessoaAtualizadaEsperada);
      expect(result).toEqual(pessoaAtualizadaEsperada);
    });

    it('deve lançar uma NotFoundException ao tentar atualizar uma pessoa que não existe', async () => {
      // given
      const idInvalido = 'uuid-valido';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      //when e then
      await expect(service.update(idInvalido, {})).rejects.toThrow(NotFoundException);
    });
  });
  describe('delete', () => {
    it('deve remover uma pessoa com sucesso', async () =>{ 
      //given
      const id = 'uuid-valido';
      const pessoaExistente = new Pessoa();
      pessoaExistente.id = id;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(pessoaExistente);

      jest.spyOn(repository, 'delete').mockResolvedValue({affected: 1, raw: []});

      //when 
      const result = await service.remove(id);

      //then
      expect(repository.findOneBy).toHaveBeenCalledWith({id});
      expect(repository.delete).toHaveBeenCalledWith(id);
      expect(repository.delete).toHaveBeenCalledTimes(1);
    });

    it('deve lançar um NotFoundException ao tentar excluir uma pessoa que não existe no banco de dados', async () =>{
      //given 
      const idInexistente = 'uuid-invalido';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      //when e then
      await expect(service.remove(idInexistente)).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
