import { BaseRepository } from "./base.repository";
import { User, UserSchema } from "../schemas/user.schema";

class UserRepository extends BaseRepository<User> {
  constructor() {
    super("users");
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.findOne({ email: email.toLowerCase() });
    if (user) {
      return UserSchema.parse(user);
    }
    return null;
  }

  async createNewUser(userData: Omit<User, "createdAt" | "updatedAt">): Promise<string> {
    const validated = UserSchema.parse({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return this.insertOne(validated);
  }
}

export const userRepository = new UserRepository();
