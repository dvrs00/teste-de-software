import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Logger } from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@Controller('pessoas')
export class PessoasController {
  
  private readonly logger = new Logger(PessoasController.name);

  constructor(private readonly pessoasService: PessoasService) {}
  
  @Post()
  create(@Body() createPessoaDto: CreatePessoaDto) {
    this.logger.log('Recebida requisição POST para criar pessoa.');
    this.logger.debug(`Payload recebido: ${JSON.stringify(createPessoaDto)}`);
    this.logger.debug(`Tipo da dataNascimento recebida: ${typeof createPessoaDto.dataNascimento} | É uma instância de Date? ${createPessoaDto.dataNascimento instanceof Date}`);
    return this.pessoasService.create(createPessoaDto);
  }
 
  @Get()
  findAll() {
    this.logger.log('Recebida requisição GET para listar todas as pessoas.');
    return this.pessoasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`Recebida requisição GET para encontrar pessoa com id: ${id}`);
    return this.pessoasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePessoaDto: UpdatePessoaDto) {
    this.logger.log(`Recebida requisição PATCH para atualizar pessoa com id: ${id}`);
    this.logger.debug(`Payload de atualização: ${JSON.stringify(updatePessoaDto)}`);
    return this.pessoasService.update(id, updatePessoaDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    this.logger.log(`Recebida requisição DELETE para remover pessoa com id: ${id}`);
    return this.pessoasService.remove(id);
  }
}