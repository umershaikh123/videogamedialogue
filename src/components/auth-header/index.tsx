import styles from "./styles.module.css";
import { AuthHeaderProps } from "./types";
import Image from "next/image";
import { LogoIcon } from "../icons";

export default function AuthHeader({
  title,
  description,
  logo,
}: AuthHeaderProps) {
  return (
    <div className={styles.loginHeader}>
      <LogoIcon width={48} height={48} />
      <div className={styles.loginHeaderText}>
        <h1 className={styles.loginTitle}>{title}</h1>
        <p className={styles.loginDescription}>{description} </p>
      </div>
    </div>
  );
}
