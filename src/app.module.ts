import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import config from './config/keys';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // Load the .env file and make it available throughout the application
    ConfigModule.forRoot({
      isGlobal: true, // Make the config available globally
      envFilePath: '.env', // The path to the .env file (optional, defaults to .env)
    }),
    // Mongo setup
    MongooseModule.forRoot(config.mongoURI),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
