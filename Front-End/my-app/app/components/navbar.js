import React, { useState } from "react";

const NavBar = () => {
  let Links = [
    { name: "Beranda", link: "#beranda" },
    { name: "Rekomendasi", link: "#rekomendasi" },
    { name: "Detail", link: "#detail" },
    { name: "Kontrol", link: "#kontrol" },
  ];
  let [open, setOpen] = useState(false);

  const handleButtonClick = () => {
    setOpen(!open);
    console.log(open);
  };

  const genericHamburgerLine = `h-1 w-6 my-1 rounded-full bg-black transition ease transform duration-300`;

  return (
    <div className="shadow-md w-screen fixed top-0 z-10 bg-white">
      <div className="md:flex items-center justify-between py-3 md:px-10 px-6">
        <div className="font-bold text-2xl cursor-pointer flex items-center">
          <span>
            <img src="assets/logo.svg" alt="logo" className="h-18" />
          </span>
        </div>

        <button
          className="absolute right-4 top-3 flex flex-col h-12 w-12 justify-center items-center md:hidden"
          onClick={handleButtonClick}
        >
          <div
            className={`${genericHamburgerLine} ${
              open
                ? "rotate-45 translate-y-3 opacity-50 group-hover:opacity-100"
                : "opacity-50 group-hover:opacity-100"
            }`}
          />
          <div
            className={`${genericHamburgerLine} ${
              open ? "opacity-0" : "opacity-50 group-hover:opacity-100"
            }`}
          />
          <div
            className={`${genericHamburgerLine} ${
              open
                ? "-rotate-45 -translate-y-3 opacity-50 group-hover:opacity-100"
                : "opacity-50 group-hover:opacity-100"
            }`}
          />
        </button>
        <ul
          className={`md:flex md:items-center md:pb-0 pb-12 absolute md:static bg-white md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all duration-500 ease-in ${
            open ? "top-15 " : "top-[-490px]"
          }`}
        >
          {Links.map((link) => (
            <li key={link.name} className="md:ml-8 text-lg md:my-0 my-7">
              <a
                href={link.link}
                className="text-gray-800 hover:text-gray-400 duration-500"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
