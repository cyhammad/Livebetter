import Image from "next/image";
import Link from "next/link";
import { forwardRef } from "react";

export const HEADER_HEIGHT = 48;

export const Header = forwardRef<HTMLElement>(function Header(_, ref) {
  return (
    <header
      ref={ref}
      className="w-full sticky top-0 bg-white sm:bg-white/80 sm:backdrop-blur z-40"
    >
      <div className="container mx-auto flex justify-between items-center py-2 px-4 sm:px-6">
        <Link href="/">
          <a className="flex gap-3 items-center container mx-auto">
            <div className="flex-none">
              <Image
                alt="Live Better logo"
                className="h-8 w-8 sm:h-10 sm:w-10"
                height={40}
                layout="raw"
                priority={true}
                src="/logo.png"
                width={40}
              />
            </div>
            <h1 className="text-2xl font-bold">Live Better</h1>
          </a>
        </Link>
      </div>
    </header>
  );
});
