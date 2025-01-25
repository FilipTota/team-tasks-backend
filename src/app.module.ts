import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './auth/config/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // Load the .env file and make it available throughout the application
    ConfigModule.forRoot({
      isGlobal: true, // Make the config available globally
    }),
    // Mongo setup
    MongooseModule.forRoot(config.mongoURI),
    // JWT
    JwtModule.register({ global: true, secret: config.jwtSecret }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
