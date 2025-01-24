import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dtos/signUp.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // inject User model inside auth service with constructor so we can use it
  constructor(@InjectModel(User.name) private userModule: Model<User>) {}

  async signUp(signUpData: SignUpDto) {
    const { email, password, username } = signUpData;

    // Check if email is in use
    const emailInUse = await this.userModule.findOne({ email });
    if (emailInUse) throw new BadRequestException('Email already in use');

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10); // second parameter saltOrRounds(The salt to be used in encryption -> another layer of security) is used for example if two users have the same password of '123', it will create two different password hashes (each password wil have unique hash) ----- 10 is the number of rounds in the algorithm to make it more secure

    // Create user document and save in mongodb
    const newUser = await this.userModule.create({
      username,
      email,
      password: hashedPassword, // hashed password to store it securely in our database
    });

    return newUser;
  }
}
