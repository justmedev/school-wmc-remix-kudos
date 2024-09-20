import { json, TypedResponse } from '@remix-run/node';
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
import * as process from "node:process";

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

export function login(username: string, password: string): TypedResponse<AuthResponse> {
  if (password !== "password") throw json({ error: 'Wrong password' }, { status: 401, statusText: 'Unauthorized' });

  const payload = {
    username,
    email: `${username}@gmail.com`,
  };

  if (typeof process.env.JWT_SECRET !== "string") throw json({ error: "dotenv err, JWT_SECRET not found" }, {
    status: 500,
    statusText: 'Internal Server Error'
  });

  return json({ jwt: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" }) });
}

export function isJWTValid(token: string): TypedResponse<{ valid: boolean }> {
  if (typeof process.env.JWT_SECRET !== "string") throw json({ error: "dotenv err, JWT_SECRET not found" }, {
    status: 500,
    statusText: 'Internal Server Error'
  });
  const verified = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload | undefined;
  return json({ valid: verified?.username !== undefined });
}
