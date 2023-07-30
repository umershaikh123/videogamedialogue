import React from "react";

import { AddIcon, HomeIcon, SupportIcon } from "../icons";

export const SidebarData = [
  {
    title: "Dashboard",
    icon: <HomeIcon width={24} height={24} />,
    link: "/",
  },
  {
    title: "Create Character",
    icon: <AddIcon width={24} height={24} />,
    link: "/new-character",
  },
  {
    title: "Create Audio Clip",
    icon: <AddIcon width={24} height={24} />,
    link: "/new-clip",
  },
  {
    title: "Support",
    icon: <SupportIcon width={24} height={24} />,
    link: "/support",
  },
];
