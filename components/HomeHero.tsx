import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, MapPin, NavigationArrow } from "phosphor-react";
import { useEffect, useRef, useState } from "react";

import { HEADER_HEIGHT } from "components/Header";
import { useCurrentPosition } from "hooks/useCurrentPosition";
import { useHomeContext } from "hooks/useHomeContext";
import { useUserContext } from "hooks/useUserContext";

export const HomeHero = () => {
  const { setShouldQueryLocation, shouldQueryLocation } = useHomeContext();
  const {
    latitude,
    longitude,
    isLoading: isCurrentPositionLoading,
    error: currentPositionError,
  } = useCurrentPosition(shouldQueryLocation);
  const { location, setLocation } = useUserContext();
  const [address, setAddress] = useState("");
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const prevLatitudeRef = useRef<number>();
  const prevLongitudeRef = useRef<number>();

  useEffect(() => {
    if (currentPositionError) {
      setShouldQueryLocation(false);

      return;
    }

    const didPositionChange =
      latitude &&
      longitude &&
      latitude !== prevLatitudeRef.current &&
      longitude !== prevLongitudeRef.current;

    if (!didPositionChange) {
      return;
    }

    prevLatitudeRef.current = latitude;
    prevLongitudeRef.current = longitude;

    const geocoder = new window.google.maps.Geocoder();

    geocoder
      .geocode({ location: { lat: latitude, lng: longitude } })
      .then(({ results }) => {
        const result = results[0];

        if (result) {
          const { formatted_address } = result;

          setLocation({ latitude, longitude, address: formatted_address });
        }
      });
  }, [
    latitude,
    longitude,
    currentPositionError,
    setLocation,
    setShouldQueryLocation,
  ]);

  useEffect(() => {
    setAddress(location?.address ?? "");
  }, [location]);

  return (
    <>
      <Script
        onError={() => {
          // TODO: Report to Sentry
        }}
        onLoad={() => {
          if (addressInputRef.current) {
            const autoComplete = new window.google.maps.places.Autocomplete(
              addressInputRef.current,
              {
                componentRestrictions: { country: ["us"] },
              }
            );

            autoComplete.addListener("place_changed", () => {
              const { formatted_address, geometry } = autoComplete.getPlace();

              if (!formatted_address || !geometry?.location) {
                return;
              }

              setLocation({
                address: formatted_address,
                latitude: geometry.location.lat(),
                longitude: geometry.location.lng(),
              });
              setShouldQueryLocation(false);
            });
          }
        }}
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDns9eCy_4Zge-qYP3Ycnp7qtLw_QsPNIE&libraries=places"
      />
      <div className="grid">
        <div
          className="w-full h-96 sm:h-[512px] overflow-hidden flex-none flex"
          style={{ marginTop: -HEADER_HEIGHT, gridArea: "1/1" }}
        >
          <Image
            className="w-full object-cover"
            layout="raw"
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
              vegan food near you.
            </h2>
            <div className="flex flex-col w-full sm:max-w-none mx-auto sm:mt-0 gap-1 sm:gap-6 sm:items-center">
              <div className="grid w-full sm:max-w-md items-center">
                <MapPin
                  size={32}
                  color="currentColor"
                  fill="currentColor"
                  style={{ gridArea: "1 / 1" }}
                  weight={location ? "duotone" : "light"}
                  className={classNames({
                    "text-black": !location,
                    "text-emerald-600 fill-emerald-600": !!location,
                    "h-6 w-6 sm:h-7 sm:w-7": true,
                  })}
                />

                <input
                  type="text"
                  className="
                    w-full
                    text-sm sm:text-base
                    mt-0 px-0.5 pl-7 sm:pl-8
                    border-0 border-b border-b-black
                    focus:ring-0 focus:border-black
                    text-black bg-transparent
                    placeholder:text-gray-600
                    peer
                  "
                  ref={addressInputRef}
                  style={{ gridArea: "1 / 1" }}
                  value={address}
                  onChange={(event) => {
                    setAddress(event.target.value);
                  }}
                  placeholder="Enter your address"
                />
                <button
                  className="justify-self-end rotate-90"
                  style={{ gridArea: "1 / 1" }}
                  onClick={() => {
                    setShouldQueryLocation(!shouldQueryLocation);
                  }}
                >
                  <NavigationArrow
                    size={20}
                    color="currentColor"
                    fill="currentColor"
                    weight={shouldQueryLocation ? "fill" : "regular"}
                    className={classNames({
                      "text-black fill-sky-600 origin-center": true,
                      "h-5 w-5 sm:h-6 sm:w-6": true,
                      "animate-compass": isCurrentPositionLoading,
                    })}
                  />
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href={"/restaurants"}>
                <a
                  className={classNames(
                    "flex items-center gap-2 px-5 py-3 rounded-full bg-green-900 text-white font-semibold transition-opacity",
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
