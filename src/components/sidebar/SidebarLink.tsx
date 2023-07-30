import React from "react";
import Link from "next/link";
import styles from "./styles.module.css";

export default function SidebarLink(props: {
  href: string;
  title: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      className={props.active ? styles.activeLink : styles.link}
      href={props.href}
    >
      {props.icon}
      {props.title}
    </Link>
  );
}
