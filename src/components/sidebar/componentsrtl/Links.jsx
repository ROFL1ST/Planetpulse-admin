/* eslint-disable */
import {
  Book,
  Category,
  Chart,
  Document,
  Gallery,
  Home2,
  House,
  MenuBoard,
  MessageQuestion,
  People,
  Personalcard,
  Stellar,
} from "iconsax-react";
import React from "react";
import { Link, useLocation, useMatch, useResolvedPath } from "react-router-dom";
// chakra imports

export function SidebarLinks() {
  return (
    <>
      <Links
        route={"/dashboard"}
        icon={<Home2 size="27" variant="Bulk" />}
        name={"Dashboard"}
      />
     
      <Links
        route={"/lesson"}
        icon={<Book size="27" variant="Bulk" />}
        name={"Lessons"}
      />
      {/* <Links
        route={"/stagges"}
        icon={<Stellar size="27" variant="Bulk" />}
        name={"Stagges"}
      /> */}
      <Links
        route={"/quizzes"}
        icon={<MessageQuestion size="27" variant="Bulk" />}
        name={"Quizzes"}
      />
      <Links
        route={"/questions"}
        icon={<Document size="27" variant="Bulk" />}
        name={"Questions"}
      />
      {/* <Links
        route={"/logs"}
        icon={<Chart size="27" variant="Bulk" />}
        name={"Logs"}
      /> */}
      
      {/* <Links
        route={"/category"}
        icon={<Category size="27" variant="Bulk" />}
        name={"Category"}
      /> */}
       <Links
        route={"/users"}
        icon={<Personalcard size="27" variant="Bulk" />}
        name={"Users"}
      />
    </>
  );
}

export default SidebarLinks;

function  Links({ route, icon, name }) {
  const { pathname } = useLocation();
  let resolved = useResolvedPath(pathname);
  let match = useMatch({ path: resolved.pathname, end: true });
  return (
    <Link to={`/admin${route}`}>
      <div className="relative mb-3 flex hover:cursor-pointer">
        <li className="my-[3px] flex cursor-pointer items-center px-8">
          <span
            className={`${
              match.pathname.includes(`/admin${route}`)
                ? "font-bold text-brand-500 dark:text-white"
                : "font-medium text-gray-600"
            }`}
          >
            {icon}
          </span>
          <p
            className={`leading-1 flex ms-4 ${
              match.pathname.includes(`/admin${route}`)
                ? "font-bold text-navy-700 dark:text-white"
                : "font-medium text-gray-600"
            }`}
          >
            {name}
          </p>
        </li>
        {match.pathname.includes(`/admin${route}`) && (
          <div className="absolute top-px h-9 w-1 rounded-lg bg-brand-500 end-0 dark:bg-brand-400" />
        )}
      </div>
    </Link>
  );
}
