import classNames from "classnames";
import Image from "next/future/image";
import Link from "next/link";
import { MapPin } from "phosphor-react";
import { forwardRef } from "react";

import { useUserContext } from "hooks/useUserContext";

export const HEADER_HEIGHT = 48;

interface HeaderProps {
  isNonVeganMenuVisible?: boolean;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  { isNonVeganMenuVisible = false },
  ref
) {
  const { location } = useUserContext();

  const address = location?.address.split(",")[0];

  return (
    <header
      ref={ref}
      className="w-full sticky top-0 bg-white sm:bg-white/80 sm:backdrop-blur z-40"
    >
      <div className="container mx-auto flex justify-between items-center py-2 px-4 sm:px-6">
        <Link href="/">
          <a className="flex gap-2 items-center">
            <div className="flex-none">
              <Image
                alt="Live Better logo"
                className="h-8 w-8 sm:h-11 sm:w-11"
                height={44}
                priority={true}
                src="/logo.svg"
                width={44}
              />
            </div>
            <span className="flex flex-col">
              <h1 className="text-2xl font-bold">Live Better</h1>
              {isNonVeganMenuVisible ? null : (
                <p className="text-xs sm:text-sm mb-1 -mt-1.5">
                  Everything is{" "}
                  <span className="font-medium text-emerald-900">Vegan</span>
                </p>
              )}
            </span>
          </a>
        </Link>

        {address ? (
          <span className="flex gap-1 items-center text-sm">
            <MapPin
              size={16}
              color="currentColor"
              fill="currentColor"
              weight={location ? "duotone" : "light"}
              className={classNames({
                // "text-black": !location,
                "text-emerald-600 fill-emerald-600": true,
                // "h-6 w-6 sm:h-7 sm:w-7": true,
              })}
            />
            {address}
          </span>
        ) : null}
      </div>
    </header>
  );
});
