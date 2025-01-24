import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // HTTP route handler
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // whitelist will take away the fields that sould not be assigned to @Body (with DTO for example)
      forbidNonWhitelisted: true, // if the filed is not allowed, it will throw an error
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
