import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class RefreshToken {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true, index: { expires: '0s' } }) // index: { expires: '0s' } -> Mongo will automatically delete token once it expires (once expiryData has passed) and '0s' means: expire at the exact moment the expiresAt timestamp is reached. In other words, the document will be deleted immediately when the expiresAt time passes.
  expiryDate: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
