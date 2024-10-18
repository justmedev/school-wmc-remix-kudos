import { ChangeEventHandler, FormEventHandler, ReactNode } from "react";

interface DropdownProps {
  name?: string;
  label?: string;
  defaultValue?: string;
  value?: string;

  className?: string;

  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onSubmit?: FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;

  children?: ReactNode;
}

export default function Dropdown(props: DropdownProps) {
  return (
    <div className="flex flex-col object-fill">
      <div hidden={!props.label} className={`-mb-0.5 text-gray-300 ${props.label ? props.className ?? "" : ""}`}>{props.label}</div>
      <select className={`${!props.label ? props.className ?? "" : ""} bg-gray-700 rounded text-gray-400 outline-none p-2 focus:text-white focus:bg-gradient-to-r focus:from-blue-900 focus:outline-indigo-500`}
              defaultValue={props.defaultValue} value={props.value} name={props.name}>
        {props.children}
      </select>
    </div>
  );
}

Dropdown.AppendInner = function FormFieldAppendInner(props: {
  children: ReactNode,
  onClick: () => void,
  type?: "button" | "reset" | "submit" | undefined
}) {
  return (
    <button className="p-2" type={props.type} onClick={props.onClick}>{props.children}</button>
  );
}


