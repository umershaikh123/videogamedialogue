import AuthHeader from "../../auth-header/index";
export interface InputBlockProps {
  label?: string;
  placeholder: string;
  type: string;
  value: string;
  autocomplete: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
