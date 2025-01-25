import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongoURI: `mongodb://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
  jwtSecret: process.env.JWT_SECRET,
};
