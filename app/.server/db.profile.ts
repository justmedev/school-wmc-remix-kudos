import { prisma } from "~/.server/prisma";
import { Profile } from "@prisma/client";

export async function getProfileById(id: number): Promise<Profile | null> {
  return prisma.profile.findFirst({
    where: {
      id,
    }
  });
}


export function getAllProfiles() {
  return prisma.profile.findMany();
}
