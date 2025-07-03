import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { CreatePessoaDto } from './dto/create-pessoa.dto';

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
