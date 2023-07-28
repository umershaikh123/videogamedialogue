import { StaticImageData } from "next/image";

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  isGoogle?: boolean;
  image?: StaticImageData;
  isMedium?: boolean;
  type?: "button" | "submit" | "reset";
}
