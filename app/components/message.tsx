import ProfilePicture from "~/components/profilePicture";
import { Profile } from "@prisma/client";
import { fullName } from "~/routes/protected.chat";

export type ColorOptions = 'red' | 'green' | 'blue' | 'amber' | 'black' | 'lgbtqp';

interface MessageProps {
  author: Profile;
  message: string;
  emoji: string;
  backgroundColor: ColorOptions;
  textColor: ColorOptions;
  onClick: () => void;
}

export default function Message({ author, message, emoji, backgroundColor, textColor, onClick }: MessageProps) {

  const colorMe = (type: string, color: ColorOptions) => {
    if (color === 'lgbtqp') return `${type}-rainbow`;
    if (color === 'black') return `${type}-black`;
    return `${type}-${color}-400`;
  }

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <div className={`${colorMe('bg', backgroundColor)} p-3 m-2 rounded flex justify-between items-center`} onClick={onClick}>
        <div className="flex gap-3 items-center">
          <ProfilePicture profile={author}/>
          <div className={colorMe('text', textColor)}>
            <div className="text-lg font-medium">{fullName(author)}</div>
            <div className="-mt-1">{message}</div>
          </div>
        </div>

        <div className="text-5xl">{emoji}</div>
      </div>
    </>
  )
}
