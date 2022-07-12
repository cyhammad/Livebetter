import classNames from "classnames";
import Image from "next/future/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { MapPin } from "phosphor-react";
import { forwardRef } from "react";

import { useUserContext } from "hooks/useUserContext";
import { legacyRestaurantNameToUrlParam } from "lib/restaurantNameToUrlParam";

export const HEADER_HEIGHT = 48;
export const WARNING_HEIGHT = 44;

export const Header = forwardRef<HTMLElement>(function Header(_, ref) {
  const { location } = useUserContext();
  const router = useRouter();

  const address = location?.address.split(",")[0];

  const legacyPath =
    typeof router.query.restaurantName === "string"
      ? router.pathname.replace(
          "[restaurantName]",
          legacyRestaurantNameToUrlParam(router.query.restaurantName)
        )
      : router.asPath;

  return (
    <header
      ref={ref}
      className="w-full sticky top-0 bg-white sm:bg-white/80 sm:backdrop-blur z-30"
    >
      <div className="container mx-auto flex justify-between items-center py-2 px-4 sm:px-6">
        <Link href="/">
          <a className="flex gap-3 items-center">
            <div className="flex-none">
              <Image
                alt="Live Better logo"
                className="h-8 w-8 sm:h-10 sm:w-10"
                height={40}
                priority={true}
                src="/logo.png"
                width={40}
              />
            </div>
            <h1 className="text-2xl font-bold">Live Better</h1>
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
      <div className="flex flex-col justify-center h-11 flex-shrink flex-grow-0 bg-amber-600 text-white px-3 py-1">
        <p className="text-sm font-bold text-center">
          New Website Coming Soon! 🎉
        </p>
        {typeof router.query.restaurantName === "string" ? (
          <p className="text-xs text-center">
            To order from{" "}
            <span className="capitalize">
              {router.query.restaurantName.toLocaleLowerCase()}
            </span>
            , please{" "}
            <a
              className="underline"
              href={`https://livebetterphl.web.app${legacyPath}`}
              target="_blank"
              rel="noreferrer"
            >
              click here
            </a>
            .
          </p>
        ) : null}
      </div>
    </header>
  );
});
