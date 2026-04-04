import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

// 1. Interface for User Document
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  verified: boolean;
  provider: "local" | "google" | "github";
  googleId?: string | null;
  githubId?: string | null;
  picture: string | null;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 2. Schema
const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === "local";
      },
      minlength: 8,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    githubId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    picture: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// 3. Pre-save Hook
userSchema.pre("save", async function () {
  const user = this as IUser;

  if (!user.password || !user.isModified("password")) return;

  user.password = await bcrypt.hash(user.password, 10);
});

// 4. Instance Method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

// 5. Model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
