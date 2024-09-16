import { ChangeEventHandler, FormEventHandler, HTMLInputTypeAttribute, ReactNode, useState } from "react";

interface FormFieldProps {
  name?: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  errorHint?: string;

  className?: string;

  onChange?: ChangeEventHandler<HTMLInputElement>;
  onSubmit?: FormEventHandler<HTMLInputElement>;

  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  children?: ReactNode;
}

export default function FormField(props: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={props.className}>
      <div hidden={!props.label} className="-mb-0.5 text-gray-300">{props.label}</div>
      <div id="outer-div" className={`flex items-center gap-1.5 bg-gray-700 rounded text-gray-400 outline-none w-full ${focused ? 'text-white bg-gradient-to-r from-blue-900 outline-indigo-500' : ''}`}>
        <input type={props.type ?? "text"}
               className="w-full outline-none bg-transparent rounded-sm py-2 pl-2"
               placeholder={props.placeholder ?? ""}
               onChange={props.onChange}
               onSubmit={props.onSubmit}
               onFocus={() => setFocused(true)}
               onBlur={() => setFocused(false)}
               defaultValue={props.defaultValue}
               value={props.value}
               name={props.name}
        />
        {props.children}
      </div>
      <div className="text-sm text-red-500">{props.errorHint ?? ""}</div>
    </div>
  );
}

FormField.AppendInner = function FormFieldAppendInner(props: { children: ReactNode, onClick: () => void }) {
  return (
      <button className="p-2" onClick={props.onClick}>{props.children}</button>
  );
}
