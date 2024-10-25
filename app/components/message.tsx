import { getShort } from "~/routes/protected.chat";

export type ColorOptions = 'red' | 'green' | 'blue' | 'amber' | 'black' | 'lgbtqp';

interface MessageProps {
  author: string;
  message: string;
  emoji: string;
  backgroundColor: ColorOptions;
  textColor: ColorOptions;
}

export default function Message({ author, message, emoji, backgroundColor, textColor }: MessageProps) {

  const colorMe = (type: string, color: ColorOptions) => {
    if (color === 'lgbtqp') return `${type}-rainbow`;
    if (color === 'black') return `${type}-black`;
    return `${type}-${color}-400`;
  }

  return (<div className={`${colorMe('bg', backgroundColor)} p-3 m-2 rounded flex justify-between items-center`}>
    <div className="flex gap-3 items-center">
      <div className="bg-blue-400 rounded-full py-4 px-5 font-mono">
        {getShort(author)}
      </div>
      <div className={colorMe('text', textColor)}>
        <div className="text-lg font-medium">{author}</div>
        <div className="-mt-1">{message}</div>
      </div>
    </div>

    <div className="text-5xl">{emoji}</div>
  </div>)
}
