import { prisma } from "~/.server/prisma";
import argon2 from "argon2";
import { Prisma, Profile, User } from "@prisma/client";
import { z } from "zod";

export async function passwordIsValid(username: string, plaintextPassword: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      email: username,
    }
  });
  if (!user) return false;

  return await argon2.verify(user.password, plaintextPassword);
}

export type UserCreationData =
  Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
  & Omit<User, 'password' | 'profileId' | 'createdAt' | 'updatedAt' | 'id'>;

/**
 * Create a user with a password
 * @param data the user's data, excluding password
 * @param plaintextPassword the password of the user in plaintext format
 * @returns the newly created [User] object on success, or, on fail, [null].
 */
export async function createUserWithPassword(data: UserCreationData, plaintextPassword: string): Promise<User | null> {
  const hashedPassword = await argon2.hash(plaintextPassword);
  let user: User | null = null;
  try {
    user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            birtday: data.birtday,
          }
        }
      }
    });
  } catch (e) {
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        console.log(`There is a unique constraint violation, a new user cannot be created with email "${data.email}"!`)
        return null;
      }
    }
    throw e
  }

  return user;
}

export const userCreateSchema = z.object({
  email: z.string().email().min(3),
  password: z.string().min(3),
  firstName: z.string(),
  lastName: z.string(),
  birtday: z.date()
});
