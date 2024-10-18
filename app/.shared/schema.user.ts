import { z } from "zod";

export const userCreateSchema = z.object({
  email: z.string().email().min(3),
  password: z.string().min(3),
  firstName: z.string(),
  lastName: z.string(),
  birtday: z.date()
});
