import Link from "next/link";
import { ReactNode } from "react";
import styles from "./styles.module.css";

export default function DashboardButton(props: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link className={styles.wrapper} href={props.href}>
      <div className={styles.iconWrapper}>{props.icon}</div>
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
