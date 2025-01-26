import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dtos/signUp.dto';
import { SignInDto } from './dtos/signIn.dto';
import { RefreshTokenDto } from './dtos/refreshTokens.dto';
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
    const tokens = await this.generateUserTokens(user._id);
    return {
      ...tokens,
      userId: user._id,
    };
  }

  async refreshTokens(refreshTokenData: RefreshTokenDto) {
    const { refreshToken } = refreshTokenData;
    // find token that hasn't expired yet
    const token = await this.RefreshTokenModel.findOne({
      token: refreshToken,
      expiryDate: { $gte: new Date() }, // $gte -> greater than... new Date() -> todays date
    });

    if (!token) {
      // if token doesn't exist or it has expired, the frontend sould direct user to login page to login again to generate new jwt and refresh token
      throw new UnauthorizedException('Refresh Token is invalid');
    }

    return this.generateUserTokens(token.userId); // we are storing userId in our refreshToken database, so we can access it by token.userId
  }

  async generateUserTokens(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h' }); // expiresIn: string or number (if we pass number it will read it by default like seconds, with string, we can specify for example "1h")
    const refreshToken = uuidv4();
    await this.storeRefreshToken(refreshToken, userId);

    return { accessToken, refreshToken };
  }

  async storeRefreshToken(token: string, userId) {
    // Calculate expiry date 3 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);

    await this.RefreshTokenModel.updateOne(
      { userId }, // --> find a document with the matching userId
      { $set: { expiryDate, token } }, // --> set the expiryDate and token
      { upsert: true }, // --> if no document is found, insert a new one with the userId, expiryDate, and token
    );
    // update it because we will get a new token after we generate a new one
  }
}
