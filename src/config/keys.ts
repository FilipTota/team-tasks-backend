import * as dotenv from 'dotenv';
dotenv.config();

export default {
  mongoURI: `mongodb://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
};
