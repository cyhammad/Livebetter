import classNames from "classnames";
import Image from "next/future/image";
import Link from "next/link";
import { ArrowRight } from "phosphor-react";

import { HEADER_HEIGHT } from "components/Header";
import { InputPlacesAutocomplete } from "components/InputPlacesAutocomplete";
import { useUserContext } from "hooks/useUserContext";

export const HomeHero = () => {
  const { location } = useUserContext();

  return (
    <>
      <div className="grid">
        <div
          className="w-full h-96 sm:h-[512px] overflow-hidden flex-none flex"
          style={{ marginTop: -HEADER_HEIGHT, gridArea: "1/1" }}
        >
          <Image
            className="w-full object-cover"
            height={155}
            width={320}
            src={
              "https://firebasestorage.googleapis.com/v0/b/new-practice-6441a.appspot.com/o/test_storage%2F2a46f31a-9e19-464d-a10f-4a0a5a41ada4.png?alt=media&token=058067e0-5321-4896-975d-726bbb54f1b7"
            }
            alt=""
            priority={true}
          />
        </div>
        <div
          className="container mx-auto flex items-center px-0 sm:px-6"
          style={{ gridArea: "1/1" }}
        >
          <section
            className="
              w-full h-full sm:w-[680px] sm:h-auto max-w-full mx-auto
              flex flex-col justify-evenly sm:gap-8 px-4 sm:p-10 sm:pb-12
              bg-white/80 backdrop-blur sm:rounded-lg sm:shadow-xl"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center">
              Find and order
              <br />
              vegan food in Philly.
            </h2>
            <div className="flex flex-col w-full sm:max-w-none mx-auto sm:mt-0 gap-1 sm:gap-6 sm:items-center">
              <InputPlacesAutocomplete containerClassName="sm:max-w-md" />
            </div>
            <div className="flex justify-center">
              <Link href={"/restaurants"}>
                <a
                  className={classNames(
                    "flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 text-white font-semibold transition-opacity",
                    { "opacity-50": !location, "opacity-100": !!location }
                  )}
                >
                  View all restaurants
                  <ArrowRight
                    size={20}
                    color="currentColor"
                    className="text-white"
                  />
                </a>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
