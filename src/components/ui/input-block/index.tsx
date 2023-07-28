import styles from "./styles.module.css";
import { InputBlockProps } from "./types";

export default function InputBlock({
  label,
  placeholder,
  type,
  value,
  onChange,
  autocomplete,
}: InputBlockProps) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={label}>
        {label}
      </label>
      <input
        className={styles.input}
        id={label}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autocomplete}
      />
    </div>
  );
}
