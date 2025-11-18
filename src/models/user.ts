import { Schema, model, Document } from 'mongoose';

export type Role = 'patient' | 'provider';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  consentGiven: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['patient', 'provider'], required: true },
    consentGiven: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IUser>('User', UserSchema);

