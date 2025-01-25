import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dtos/signUp.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dtos/signIn.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  // inject User model inside auth service with constructor so we can use it
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpData: SignUpDto) {
    const { email, password, username } = signUpData;

    // Check if email is in use
    const emailInUse = await this.UserModel.findOne({ email });
    if (emailInUse) throw new BadRequestException('Email already in use');

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10); // second parameter saltOrRounds(The salt to be used in encryption -> another layer of security) is used for example if two users have the same password of '123', it will create two different password hashes (each password wil have unique hash) ----- 10 is the number of rounds in the algorithm to make it more secure

    // Create user document and save in mongodb
    const newUser = await this.UserModel.create({
      username,
      email,
      password: hashedPassword, // hashed password to store it securely in our database
    });

    return newUser;
  }

  async signIn(signInData: SignInDto) {
    const { email, password } = signInData;

    // Find if user exists by email
    const user = await this.UserModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Wrong credentials');

    // Compare entered password with existing password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Wrong credentials');

    // Generate JWT tokens
    return this.generateUserTokens(user._id);
  }

  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h' });
    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, userId);

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(token: string, userId) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.create({ token, userId, expiryDate });
  }
}
