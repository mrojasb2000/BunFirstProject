import {
  pipe,
  string,
  email,
  minLength,
  object,
  type InferInput,
} from "valibot";
import { hash, compare } from "bcrypt";

const emailSchema = pipe(string(), email());
const passwordSchema = pipe(string(), minLength(6));

export const authSchema = object({
  email: emailSchema,
  password: passwordSchema,
});

export enum Role {
  "ADMIN" = "admin",
  "USER" = "user",
}

export type User = InferInput<typeof authSchema> & {
  id: number;
  role: "admin" | "user";
  refreshToken?: string;
};

const users: Map<string, User> = new Map();

/**
 * Create a new user with the given email and password.
 * The password will be hashed before storing it.
 *
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<User>} - The created user.
 */
export const createUser = async (
  email: string,
  password: string,
): Promise<User> => {
  const hashedPassword = await hash(password, 10);
  var unix = Math.round(+new Date() / 1000);
  const newUser: User = {
    id: unix,
    email,
    password: hashedPassword,
    role: Role.USER,
  };
  users.set(email, newUser);
  return newUser;
};

/**
 * Find a user by email.
 *
 * @param {string} email - The email of the user.
 * @returns {User | undefined} - The user if found, otherwise undefined.
 */
export const findUserByEmail = (email: string): User | undefined => {
  return users.get(email);
};

/**
 * Verify the password of a user.
 *
 * @param {User} user - The user to verify.
 * @param {string} password - The password to verify.
 * @returns {Promise<boolean>} - True if the password is correct, otherwise false.
 */
export const verifyPassword = async (
  user: User,
  password: string,
): Promise<boolean> => {
  return compare(password, user.password);
};
