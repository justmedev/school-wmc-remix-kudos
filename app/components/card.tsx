import { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;

  subtitle?: string;
  width?: number | string;
}

export default function Card({ title, subtitle, children, width }: CardProps) {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <div className="bg-gray-400 dark:bg-gray-800 p-4 rounded" style={{ width: `${width ? `${typeof width === "string" ? `${width}px` : width}` : "500px"}` }}>
        <div className={`text-lg font-bold ${!subtitle ? 'mb-2' : ''}`}>
          {title}
        </div>
        <div hidden={!subtitle} className="text-gray-400 text-sm -mt-2">
          {subtitle}
        </div>

        {children}
      </div>
    </div>
  );
}


Card.Content = function CardContent(props: { children: ReactNode }) {
  return <div className="bg-red-700 w-full">{props.children}</div>;
}
Card.Actions = function CardActions(props: { children: ReactNode }) {
  return (
    <div className="flex mt-3 gap-1.5">
      {props.children}
    </div>
  );
}
