import Link from "next/link";
import { ReactNode } from "react";
import styles from "./styles.module.css";
import { StaticImageData } from "next/image";
import Image from "next/image";
import PlaceholderImage from "@/images/placeholder.png";

export default function CharacterItem(props: {
  title: string;
  description?: string;
  icon?: StaticImageData;
  href: string;
  image_url?: string;
}) {
  return (
    <Link className={styles.wrapper} href={props.href}>
      {props.image_url ? (
        <Image
          alt="Character picture"
          className={styles.iconWrapper}
          src={props.image_url}
          width={40}
          height={40}
        />
      ) : (
        <Image
          alt="Character picture"
          className={styles.iconWrapper}
          src={props.icon ? props.icon : PlaceholderImage}
          width={40}
          height={40}
        />
      )}
      <div className={styles.textWrapper}>
        <h3
          className="text-regular"
          style={{ fontWeight: 600, color: "#344054" }}
        >
          {props.title}
        </h3>
        {props.description && (
          <p className="text-small" style={{ color: "#475467" }}>
            {props.description}
          </p>
        )}
      </div>
    </Link>
  );
}
