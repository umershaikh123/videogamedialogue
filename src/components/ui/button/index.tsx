import styles from "./styles.module.css";
import { ButtonProps } from "./types";
import Image from "next/image";
import google from "../../../assets/images/Social-icon.svg";

export default function Button({
  label,
  onClick,
  isGoogle,
  image,
  isMedium,
  type,
}: ButtonProps) {
  return (
    <>
      {isGoogle ? (
        <button className={styles.googleButton} onClick={onClick} type="button">
          <Image src={google} alt="Google logo" className={styles.googleIcon} />
          {label}
        </button>
      ) : (
        <button
          className={`${styles.button} ${isMedium ? styles.medium : ""}`}
          onClick={onClick}
          type={type}
        >
          {image && <Image src={image} alt="Icon" className={styles.image} />}
          {label}
        </button>
      )}
    </>
  );
}
