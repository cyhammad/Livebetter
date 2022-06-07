import { forwardRef } from "react";
import Image from "next/image";
import Link from "next/link";

export const HEADER_HEIGHT = 48;

export const Header = forwardRef<HTMLElement>(function Header(_, ref) {
  return (
    <header
      ref={ref}
      className="container mx-auto flex justify-between items-center py-2 px-4 sm:px-6 sticky top-0 bg-white z-40"
    >
      <Link href="/">
        <a className="flex gap-3 items-center container mx-auto">
          <div className="flex-none">
            <Image
              src="/logo.png"
              width={40}
              height={40}
              layout="raw"
              alt="Live Better logo"
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
          </div>
          <h1 className="text-2xl font-bold">Live Better</h1>
        </a>
      </Link>
    </header>
  );
});
