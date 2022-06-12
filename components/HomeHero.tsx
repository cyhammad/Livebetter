import classNames from "classnames";
import Image from "next/image";
import Script from "next/script";
import { MapPin, NavigationArrow } from "phosphor-react";
import { useEffect, useRef, useState, memo } from "react";

import { HEADER_HEIGHT } from "components/Header";
import { useHomeContext } from "hooks/useHomeContext";
import { useCurrentPosition } from "hooks/useCurrentPosition";
import { useUserContext } from "hooks/useUserContext";
import { Location } from "types";

export const HomeHero = () => {
  const { setShouldQueryLocation, shouldQueryLocation } = useHomeContext();
  const {
    latitude,
    longitude,
    error: locationError,
  } = useCurrentPosition(shouldQueryLocation);
  const { location, setLocation } = useUserContext();
  const [isLoadingCurrentPosition, setIsLoadingCurrentPosition] =
    useState(false);
  const [address, setAddress] = useState("");
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const prevLatitudeRef = useRef<number>();
  const prevLongitudeRef = useRef<number>();

  useEffect(() => {
    const didPositionChange =
      latitude &&
      longitude &&
      latitude !== prevLatitudeRef.current &&
      longitude !== prevLongitudeRef.current;

    if (!didPositionChange) {
      setIsLoadingCurrentPosition(false);
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

          // setAddress(formatted_address);
          setLocation({ latitude, longitude, address: formatted_address });
          setIsLoadingCurrentPosition(false);
        }
      });
  }, [latitude, longitude, setLocation]);

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
              flex flex-col justify-evenly sm:gap-2 px-4 sm:p-10 sm:pb-12
              bg-white/80 backdrop-blur sm:rounded-lg sm:shadow-xl"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold sm:mb-8 text-center">
              Find and order
              <br />
              vegan food near you.
            </h2>
            <div className="flex flex-col w-full sm:max-w-none mx-auto sm:mt-0 gap-1 sm:gap-6 sm:items-center">
              <h3 className="text-xl sm:text-2xl font-semibold sm:font-medium ml-0.5">
                Where will we be bringing your food?
              </h3>
              <div className="grid w-full sm:max-w-md items-center">
                <MapPin
                  size={32}
                  color="currentColor"
                  fill="currentColor"
                  style={{ gridArea: "1 / 1" }}
                  weight="light"
                  className={classNames({
                    "text-black": true,
                    "h-6 w-6 sm:h-7 sm:w-7": true,
                  })}
                />

                <input
                  type="text"
                  className={classNames({
                    "w-full": true,
                    "text-sm sm:text-base": true,
                    "mt-0 px-0.5 pl-7": true,
                    "border-0 border-b border-b-black": true,
                    "focus:ring-0 focus:border-black": true,
                    "text-black bg-transparent": true,
                    "placeholder:text-gray-600": true,
                    peer: true,
                  })}
                  ref={addressInputRef}
                  style={{ gridArea: "1 / 1" }}
                  value={address}
                  onChange={(event) => {
                    setAddress(event.target.value);
                  }}
                  placeholder="Enter your address"
                />
                <button
                  className="justify-self-end"
                  style={{ gridArea: "1 / 1" }}
                  onClick={() => {
                    setIsLoadingCurrentPosition(true);
                    setShouldQueryLocation(!shouldQueryLocation);
                  }}
                >
                  <NavigationArrow
                    size={20}
                    color="currentColor"
                    fill="currentColor"
                    weight={shouldQueryLocation ? "fill" : "regular"}
                    className={classNames({
                      "text-black fill-sky-600": true,
                      "h-5 w-5 sm:h-6 sm:w-6 rotate-90 transition-transform":
                        true,
                      "animate-compass": isLoadingCurrentPosition,
                    })}
                  />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
