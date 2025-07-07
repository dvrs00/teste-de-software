import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@Injectable()
export class PessoasService {

  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>
  ){}

  async create(createPessoaDto: CreatePessoaDto): Promise<Pessoa> {
      await this.validarUnicidade(createPessoaDto);
      const pessoa = this.pessoaRepository.create(createPessoaDto);
      return await this.pessoaRepository.save(pessoa);
  }

  async findAll(): Promise<Pessoa[]> {
    return this.pessoaRepository.find();
  }

  async findOne(id: string): Promise<Pessoa>{
    const pessoa = await this.pessoaRepository.findOneBy({id});

    if(!pessoa) {
      throw new NotFoundException(`Pessoa com o ID "${id}" não encontrada.`);
    }

    return pessoa;
  }

  async update(id: string, updatePessoaDto: UpdatePessoaDto): Promise<Pessoa> {
    const pessoa = await this.findOne(id);
    Object.assign(pessoa, updatePessoaDto);
    return this.pessoaRepository.save(pessoa);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.pessoaRepository.delete(id);
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
