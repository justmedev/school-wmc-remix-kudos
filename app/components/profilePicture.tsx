import { fullName } from "~/routes/protected.chat";
import { Profile } from "@prisma/client";
import { CSSProperties } from "react";

interface ProfilePictureProps {
  profile: Profile;
  onClick?: () => void;
  emoji?: string;
  size?: "default" | "lg";
  base64Image?: string;
}

export default function ProfilePicture({ profile, onClick, emoji, size, base64Image }: ProfilePictureProps) {
  const classes = `bg-blue-400 rounded-full py-${size == 'lg' ? '6' : '4'} px-${size == 'lg' ? '7' : '5'} font-mono relative select-none`;
  const style: CSSProperties = {
    "backgroundImage": `url("${base64Image ? base64Image : `/up-profile-pics/${profile.id}.jpg`}")`,
    "backgroundSize": "cover",
  }
  const short = getShort(fullName(profile));
  const emojiTsx = <div className="text-3xl absolute -bottom-2 -right-2 rounded-full">{emoji}</div>

  if (onClick) return (
    <button onClick={() => onClick()} className={classes} style={style}>
      {short}
      {emoji ? emojiTsx : null}
    </button>)
  return (
    <div className={classes} style={style}>
      {short}
      {emoji ? emojiTsx : null}
    </div>)
}

export function getShort(s: string): string {
  const splitted = s.split(" ");
  return splitted.length > 1 ? splitted[0][0] + splitted[1][0] : splitted[0][0] + (splitted[0][1] ?? "?");
}
