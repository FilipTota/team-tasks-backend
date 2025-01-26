import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // to get access to our request headers:
    // const request: Request = context.switchToHttp().getRequest(); // usually we create Request class with user info, to specify request: Request<UserInfo> // to attach user object to request inside trycatch below (request.userId = payload.userId)
    const request = context.switchToHttp().getRequest(); // here we use request as type any
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      //   return false; // this will return Forbiden with 403 status code
      throw new UnauthorizedException('Invalid token');
    }

    // if token exists
    // we need to verify it first and then return
    try {
      const payload = this.jwtService.verify(token); // usually we would add second parameter { secret: ... } but we dont need to do that here because we already defined secret in app.module.ts inside jwt register

      // to attach user object to request
      request.userId = payload.userId;
      // now when we return true, we are gonna have the userId on request object

      // payload contains userId because whenever we verify token (first line of this trycatch) it actually returned the payload which have the data that we asigned on it when we generated this token --> in our file auth.service.ts we asigned userId with this line (const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h' })) inside generateUserTokens() function
      // and this is why we can get userId from payload

      // using try catch because payload above will throw an error in case our token has expired or in case we used wrong jwt secret...
    } catch (error) {
      Logger.error(error.message);
      throw new UnauthorizedException('Invalid token');
    }

    // if everything is fine we return true
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.headers.authorization?.split(' ')[1];
  }
}
