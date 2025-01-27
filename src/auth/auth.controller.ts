import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signUp.dto';
import { SignInDto } from './dtos/signIn.dto';
import { RefreshTokenDto } from './dtos/refreshTokens.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST Signup
  @Post('signup') //--> /auth/signup
  async signUp(@Body() signUpData: SignUpDto) {
    const newUser = await this.authService.signUp(signUpData);

    // get token to automatically signIn new user
    const token = await this.authService.generateUserTokens(newUser._id);
    return { newUser, token };
  }

  // POST Signin
  @Post('signin') // --> /auth/signin
  async singIn(@Body() signInData: SignInDto) {
    return this.authService.signIn(signInData);
  }

  // POST Refresh Token
  @Post('refreshToken')
  async refreshTokens(@Body() refreshTokenData: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenData);
  }
}
