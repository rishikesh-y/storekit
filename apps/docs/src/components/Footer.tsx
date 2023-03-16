import React from "react";
import Link from "next/link";
import Image from "next/image";

import BitpackLogo from "../../public/meroku.png";
import { signOut } from "next-auth/react";

const Footer: React.FunctionComponent = () => {
  return (
    <nav className="top-0 flex w-full flex-row items-center justify-center bg-[#ECEEF4] py-2 px-4">
      <span className="text-md flex flex-row items-center space-x-4 font-medium">
        Made with 💙 by Meroku and Polygon
      </span>
    </nav>
  );
};

export default Footer;
