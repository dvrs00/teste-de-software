import { Test, TestingModule } from '@nestjs/testing';
import { PessoasController } from './pessoas.controller';
import { PessoasService } from './pessoas.service';
import { randomUUID } from 'crypto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

describe('PessoasController', () => {
  let controller: PessoasController;

  let service: PessoasService;

 const mockPessoaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PessoasController],
      providers: [{
        provide: PessoasService,
        useValue: mockPessoaService,
      }],
    }).compile();

    controller = module.get<PessoasController>(PessoasController);
    service = module.get<PessoasService>(PessoasService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar o pessoaService.create com o DTO correto', async () => {
      // given
      const createPessoaDto = {
        nome: 'fulano',
        cpf: '039.317.752-16',
        email: 'fulano@gmailcom',
        dataNascimento: new Date('2000-02-19')
      };

      // when 
      await controller.create(createPessoaDto);

      //then
      expect(mockPessoaService.create).toHaveBeenCalledWith(createPessoaDto);
      expect(mockPessoaService.create).toHaveBeenCalledTimes(1);
    });

    it('deve chamar o pessoaService.findAll', async () => {
      //when 
      await controller.findAll();

      //then
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });
  describe('findOne', () => {
    it('deve chamar o pessoaService.findOne com o id correto', async () => {
      //given

      const id = randomUUID();

      //when 
      await controller.findOne(id);

      //then
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('update', () => {
    it('deve chamar o pessoaService.update com id e o DTO corretos', async () => {
      // given 
      const id = randomUUID();
      const updatePessoaDto: UpdatePessoaDto = {
        nome: 'Novo Nome',
      };

      //when 
      await controller.update(id, updatePessoaDto);

      //then 
      expect(service.update).toHaveBeenCalledWith(id, updatePessoaDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('deve chamar o pessoaService.remove com o id correto', async () => {
      // given
      const id = randomUUID();

      //when
      await controller.remove(id);

      //then
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
