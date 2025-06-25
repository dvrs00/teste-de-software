import { Injectable } from '@nestjs/common';
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
    const novaPessoa = this.pessoaRepository.create(createPessoaDto);
    return this.pessoaRepository.save(novaPessoa);
  }
}
