import styles from "./styles.module.css";
import { ButtonProps } from "./types";
import Image from "next/image";
import { GoogleIcon } from "@/components/icons";

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
          <GoogleIcon />
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
