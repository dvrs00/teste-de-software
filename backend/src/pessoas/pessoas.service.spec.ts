import { Test, TestingModule } from '@nestjs/testing';
import { PessoasService } from './pessoas.service';
import { Repository } from 'typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePessoaDto } from './dto/create-pessoa.dto';

describe('PessoasService', () => {
  let service: PessoasService;
  let repository: Repository<Pessoa>;

  const mockPessoaRepository = {
    create: jest.fn(),
    save: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma pessoa e retorná-la com sucesso', async () => {
      
      // arrange ou given
      const createPessoaDto: CreatePessoaDto = {
        nome: 'fulano',
        cpf: '000.000.000-00',
        dataNascimento: new Date('2000-02-19'),
        email: 'fulano@gmail.com',
      };

      const pessoaSalvaNoBanco = {
        id: 'um-uuid-gerado-pelo-banco',
        ... createPessoaDto,
      };

      jest.spyOn(repository, 'create').mockReturnValue(createPessoaDto as unknown as Pessoa);
      jest.spyOn(repository, 'save').mockResolvedValue(pessoaSalvaNoBanco as unknown as Pessoa);
      
      // act ou when
      const result = await service.create(createPessoaDto);

      //assert ou then 
      expect(result).toEqual(pessoaSalvaNoBanco);

      expect(repository.create).toHaveBeenCalledWith(createPessoaDto);
      expect(repository.save).toHaveBeenCalledWith(createPessoaDto);

    }); 
  });
});
