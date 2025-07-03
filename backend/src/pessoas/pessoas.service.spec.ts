import { Test, TestingModule } from '@nestjs/testing';
import { PessoasService } from './pessoas.service';
import { Repository } from 'typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { ConflictException} from '@nestjs/common';

describe('PessoasService', () => {

  let service: PessoasService;
  let repository: Repository<Pessoa>;

  const mockPessoaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
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
});
