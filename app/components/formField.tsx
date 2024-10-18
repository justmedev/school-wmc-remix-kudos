import { ChangeEventHandler, FormEventHandler, HTMLInputTypeAttribute, ReactNode, useState } from "react";

interface FormFieldProps {
  name?: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  errorHint?: string;

  className?: string;

  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onSubmit?: FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;

  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  children?: ReactNode;
  fieldType?: "input" | "textarea";
}

export default function FormField(props: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  const actualProps = {
    ...props,
    placeholder: props.placeholder ?? "",
    type: props.type ?? "text",
  }
  delete actualProps.children;
  delete actualProps.errorHint;
  delete actualProps.className;
  delete actualProps.fieldType;

  return (
    <div className={props.className}>
      <div hidden={!props.label} className="-mb-0.5 text-gray-300">{props.label}</div>
      <div id="outer-div" className={`flex items-center gap-1.5 bg-gray-700 rounded text-gray-400 outline-none w-full ${focused ? 'text-white bg-gradient-to-r from-blue-900 outline-indigo-500' : ''}`}>
        {
          (props.fieldType ?? "input") === "input" ?
            <input className="w-full outline-none bg-transparent rounded-sm py-2 pl-2"
                   onFocus={() => setFocused(true)}
                   onBlur={() => setFocused(false)}
                   {...actualProps}
            /> :
            <textarea className="w-full outline-none bg-transparent rounded-sm py-2 pl-2"
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      {...actualProps}
            />
        }

        {props.children}
      </div>
      <div className="text-sm text-red-500">{props.errorHint ?? ""}</div>
    </div>
  );
}

FormField.AppendInner = function FormFieldAppendInner(props: {
  children: ReactNode,
  onClick: () => void,
  type?: "button" | "reset" | "submit" | undefined
}) {
  return (
    <button className="p-2" type={props.type} onClick={props.onClick}>{props.children}</button>
  );
}
