import { prisma } from "~/.server/prisma";

export function getAllProfiles() {
  return prisma.profile.findMany();
}
