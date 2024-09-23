import { prisma } from "~/.server/prisma";
import argon2 from "argon2";
import { Prisma, User } from "@prisma/client";

export async function passwordIsValid(username: string, plaintextPassword: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      email: username,
    }
  });
  if (!user) return false;

  return await argon2.verify(user.password, plaintextPassword);
}

/**
 * Create a user with a password
 * @param data the user's data, excluding password
 * @param plaintextPassword the password of the user in plaintext format
 * @returns the newly created [User] object on success, or, on fail, [null].
 */
export async function createUserWithPassword(data: Omit<User, 'password' | 'createdAt' | 'updatedAt' | 'id'>, plaintextPassword: string): Promise<User | null> {
  const hashedPassword = await argon2.hash(plaintextPassword);
  const user: User | null = null;
  try {
    await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      }
    })
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
