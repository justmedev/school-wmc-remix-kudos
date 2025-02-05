import { json, TypedResponse } from '@remix-run/node';
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
import * as process from "node:process";
import { passwordIsValid } from "~/.server/db.auth";
import { Profile, User } from "@prisma/client";
import { prisma } from "~/.server/prisma";

config();

export interface AuthResponse {
  jwt: string;
}

export interface JwtPayload {
  username: string;
  email: string;
}

export interface ResponseError {
  error: string;
}

export async function login(email: string, password: string): Promise<TypedResponse<AuthResponse>> {
  if (!await passwordIsValid(email, password)) throw json({ error: 'Wrong email or password' }, {
    status: 401,
    statusText: 'Unauthorized'
  });

  const payload = {
    email: `${email}`,
  };

  if (typeof process.env.JWT_SECRET !== "string") throw json({ error: "dotenv err, JWT_SECRET not found" }, {
    status: 500,
    statusText: 'Internal Server Error'
  });

  return json({ jwt: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" }) });
}

export function isJWTValid(token: string): boolean {
  if (typeof process.env.JWT_SECRET !== "string") throw Error("dotenv err, JWT_SECRET not found");
  return (jwt.verify(token, process.env.JWT_SECRET) as JwtPayload | undefined)?.email !== undefined;
}

export type UserWithProfile = User & { profile: Profile };

export async function getUserByJWT(token: string, includeProfile = true): Promise<User | UserWithProfile | null> {
  return prisma.user.findFirst({
    where: { email: (jwt.decode(token) as JwtPayload).email },
    include: { profile: includeProfile }
  })
}
