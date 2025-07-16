import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PessoasModule } from './pessoas/pessoas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pessoa } from './pessoas/entities/pessoa.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // 🔍 LOG das variáveis de ambiente
        console.log('🔍 POSTGRES_HOST:', configService.get<string>('POSTGRES_HOST'));
        console.log('🔍 POSTGRES_PORT:', configService.get<number>('POSTGRES_PORT'));
        console.log('🔍 POSTGRES_USER:', configService.get<string>('POSTGRES_USER'));
        console.log('🔍 POSTGRES_PASSWORD:', configService.get<string>('POSTGRES_PASSWORD'));
        console.log('🔍 POSTGRES_DB:', configService.get<string>('POSTGRES_DB'));

        return {
          type: 'postgres',
          host: configService.get<string>('POSTGRES_HOST'),
          port: configService.get<number>('POSTGRES_PORT'),
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DB'),
          entities: [Pessoa],
          synchronize: true,
        };
      },
    }),

    PessoasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
