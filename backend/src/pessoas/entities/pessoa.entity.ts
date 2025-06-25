import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('pessoas')
export class Pessoa {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    nome: string;
    @Column({unique: true})
    cpf: string;
    @Column({unique: true})
    emai: string;
    @Column({name: 'data_nascimento', type: 'date'})
    dataNascimento: Date;
}
