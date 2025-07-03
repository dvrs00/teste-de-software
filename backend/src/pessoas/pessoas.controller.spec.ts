import { Test, TestingModule } from '@nestjs/testing';
import { PessoasController } from './pessoas.controller';
import { PessoasService } from './pessoas.service';

describe('PessoasController', () => {
  let controller: PessoasController;

  const mockPessoaService = {
    create: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PessoasController],
      providers: [{
        provide: PessoasService,
        useValue: mockPessoaService,
      }],
    }).compile();

    controller = module.get<PessoasController>(PessoasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar o pessoaService.create com o DTO correto', async () => {
      // given
      const createPessoaDto = {
        nome: 'fulano',
        cpf: '000.000.000-11',
        email: 'fulano@gmailcom',
        dataNascimento: new Date('2000-02-19')
      };

      // when 
      await controller.create(createPessoaDto);

      //then
      expect(mockPessoaService.create).toHaveBeenCalledWith(createPessoaDto);
      expect(mockPessoaService.create).toHaveBeenCalledTimes(1);
    });
  });
});
