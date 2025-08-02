"use client";

import { FC } from "react";
import { Menu, X } from "lucide-react";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const HamburgerMenu: FC<Props> = ({ open, setOpen }) => {
  return (
    <button
      aria-label="メニュー"
      onClick={() => setOpen((switchOpen) => !switchOpen)}
      className="p-2"
    >
      {open ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
};

export default HamburgerMenu;
