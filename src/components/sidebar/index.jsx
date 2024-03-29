/* eslint-disable */

import { HiX } from "react-icons/hi";
import { SidebarLinks } from "./componentsrtl/Links";
import logo from "../../assets/img/jonggol.png";

const Sidebar = ({ open, onClose }) => {
  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden"
        onClick={onClose}
      >
        <HiX />
      </span>

      <div className={`mx-[30px] mt-14 flex items-center space-x-3`}>
        
        <div className="font-poppins text-md font-bold uppercase text-navy-700 dark:text-white">
          Pulsar
        </div>
      </div>
      <div className="mt-[58px] mb-7 h-px bg-gray-300 dark:bg-white/30" />
      {/* Nav item */}

      <ul className="mb pt-1">
        <SidebarLinks />
      </ul>
    </div>
  );
};

export default Sidebar;
