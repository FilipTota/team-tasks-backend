import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dtos/signUp.dto';

@Injectable()
export class AuthService {
  async signUp(signUpData: SignUpDto) {}
}
