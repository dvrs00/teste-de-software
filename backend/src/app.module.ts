import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PessoasModule } from './pessoas/pessoas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pessoa } from './pessoas/entities/pessoa.entity';

@Module({
  imports: [
    // 1. Carrega o módulo de configuração. isGlobal: true o torna disponível em toda a aplicação.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Configura o TypeOrm de forma assíncrona
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],      // Importa o ConfigModule para este escopo
      inject: [ConfigService],      // Injeta o ConfigService para poder usá-lo
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // Usa o configService para ler as variáveis de ambiente definidas no docker-compose
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [Pessoa], // Continue listando suas entidades aqui
        synchronize: true, // Lembre-se: true apenas para desenvolvimento!
      }),
    }),
    
    PessoasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
