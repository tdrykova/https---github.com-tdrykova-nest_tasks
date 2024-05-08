import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../ormconfig';
import { AuthModule } from './auth/auth.module';
import { DefaultAdminModule } from 'nestjs-admin';

@Module({
  imports: [
    // TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forRoot(typeOrmConfig),
    DefaultAdminModule,
    TasksModule,
    AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
