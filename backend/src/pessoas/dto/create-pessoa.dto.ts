import { IsNotEmpty, IsString, IsEmail, IsDate, Matches, Length } from "class-validator";
import { IsCpf } from "../../validators/is-cpf.validator";
import { Type } from "class-transformer";

export class CreatePessoaDto {
    @IsString()
    @IsNotEmpty({message: 'O nome é obrigatório.'})
    nome: string;
    @IsString()
    @IsNotEmpty({message: 'O CPF é obrigatório.'})
    @IsCpf()
    cpf: string;
    @IsEmail()
    @IsNotEmpty({message: 'O e-mail é obrigatório.'})
    email: string;
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty({message: 'A data de nascimento é obrigatória.'})
    dataNascimento: Date;
}
