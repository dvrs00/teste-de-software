import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@Injectable()
export class PessoasService {
  private readonly logger = new Logger(PessoasService.name);

  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>
  ){}

  async create(createPessoaDto: CreatePessoaDto): Promise<Pessoa> {
    this.logger.log('Iniciando processo de criação no serviço...');
    await this.validarUnicidade(createPessoaDto);
    const pessoa = this.pessoaRepository.create(createPessoaDto);
    this.logger.log('Pessoa criada, salvando no banco...');
    return await this.pessoaRepository.save(pessoa);
  }

  async findAll(): Promise<Pessoa[]> {
    this.logger.log('Buscando todas as pessoas no serviço.');
    return this.pessoaRepository.find();
  }

  async findOne(id: string): Promise<Pessoa>{
    this.logger.log(`Buscando pessoa com id: ${id} no serviço.`);
    const pessoa = await this.pessoaRepository.findOneBy({id});

    if(!pessoa) {
      this.logger.warn(`Pessoa com id ${id} não encontrada. Lançando NotFoundException.`);
      throw new NotFoundException(`Pessoa com o ID "${id}" não encontrada.`);
    }

    return pessoa;
  }

  async update(id: string, updatePessoaDto: UpdatePessoaDto): Promise<Pessoa> {
    this.logger.log(`Iniciando processo de atualização para id: ${id}`);
    const pessoa = await this.findOne(id);
    Object.assign(pessoa, updatePessoaDto);
    this.logger.log('Pessoa atualizada, salvando no banco...');
    return this.pessoaRepository.save(pessoa);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Iniciando processo de remoção para id: ${id}`);
    await this.findOne(id);
    await this.pessoaRepository.delete(id);
    this.logger.log(`Pessoa com id: ${id} removida com sucesso.`);
  }

  private async validarUnicidade(createPessoaDto: CreatePessoaDto): Promise<void> {
    const { cpf, email } = createPessoaDto;
    const [cpfExists, emailExists] = await Promise.all([
      this.pessoaRepository.findOneBy({ cpf }),
      this.pessoaRepository.findOneBy({ email }),
    ]);

    if (cpfExists) {
      throw new ConflictException('O CPF informado já está em uso.');
    }
    if (emailExists) {
      throw new ConflictException('O e-mail informado já está em uso.');
    }
  }
}
