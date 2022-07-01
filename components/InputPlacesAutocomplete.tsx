import classNames from "classnames";
import Script from "next/script";
import { MapPin, NavigationArrow } from "phosphor-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useCurrentPosition } from "hooks/useCurrentPosition";
import { useInputPlacesAutocompleteContext } from "hooks/useInputPlacesAutocompleteContext";
import { useUserContext } from "hooks/useUserContext";

interface InputPlacesAutocompleteProps {
  containerClassName?: string;
  inputClassName?: string;
}

export const InputPlacesAutocomplete = ({
  containerClassName,
  inputClassName,
}: InputPlacesAutocompleteProps) => {
  const {
    mapsApiStatus,
    setMapsApiStatus,
    setShouldQueryLocation,
    shouldQueryLocation,
  } = useInputPlacesAutocompleteContext();
  const {
    latitude: currentPositionLatitude,
    longitude: currentPositionLongitude,
    isLoading: isCurrentPositionLoading,
    error: currentPositionError,
  } = useCurrentPosition(shouldQueryLocation);
  const { location, setLocation } = useUserContext();
  const [address, setAddress] = useState("");
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const prevLatitudeRef = useRef<number>();
  const prevLongitudeRef = useRef<number>();
  const prevShouldQueryLocationRef = useRef<boolean>(shouldQueryLocation);

  const initPlacesAutocomplete = useCallback(() => {
    setMapsApiStatus("loading");

    if (addressInputRef.current) {
      const autoComplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          componentRestrictions: { country: ["us"] },
          fields: ["formatted_address", "geometry.location"],
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

      setMapsApiStatus("success");
    } else {
      setMapsApiStatus("failure");
    }
  }, [setLocation, setMapsApiStatus, setShouldQueryLocation]);

  useEffect(() => {
    if (mapsApiStatus !== "loading") {
      initPlacesAutocomplete();
    }
    // We don't want to run this function when mapsApiStatus changes. Only on
    // mount or when the init function changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initPlacesAutocomplete]);

  useEffect(() => {
    if (currentPositionError) {
      setShouldQueryLocation(false);

      return;
    }

    const didPositionChange =
      currentPositionLatitude &&
      currentPositionLongitude &&
      currentPositionLatitude !== prevLatitudeRef.current &&
      currentPositionLongitude !== prevLongitudeRef.current;

    if (!didPositionChange) {
      return;
    }

    prevLatitudeRef.current = currentPositionLatitude;
    prevLongitudeRef.current = currentPositionLongitude;

    const geocoder = new window.google.maps.Geocoder();

    geocoder
      .geocode({
        location: {
          lat: currentPositionLatitude,
          lng: currentPositionLongitude,
        },
      })
      .then(({ results }) => {
        const result = results[0];

        if (result) {
          const { formatted_address } = result;

          setLocation({
            latitude: currentPositionLatitude,
            longitude: currentPositionLongitude,
            address: formatted_address,
          });
        }
      });
  }, [
    currentPositionLatitude,
    currentPositionLongitude,
    currentPositionError,
    setLocation,
    setShouldQueryLocation,
  ]);

  useEffect(() => {
    setAddress(location?.address ?? "");
  }, [location]);

  useEffect(() => {
    prevShouldQueryLocationRef.current = shouldQueryLocation;
  }, [shouldQueryLocation]);

  return (
    <>
      <Script
        onError={() => {
          setMapsApiStatus("failure");
        }}
        onLoad={() => {
          initPlacesAutocomplete();
        }}
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDns9eCy_4Zge-qYP3Ycnp7qtLw_QsPNIE&libraries=places"
      />
      <div
        className={classNames(containerClassName, "grid w-full items-center")}
      >
        <MapPin
          size={32}
          color="currentColor"
          fill="currentColor"
          style={{ gridArea: "1 / 1" }}
          weight="duotone"
          className={classNames({
            "text-gray-600 fill-gray-600":
              (!location && mapsApiStatus !== "failure") ||
              location?.address !== address,
            "text-emerald-600 fill-emerald-600":
              mapsApiStatus !== "failure" && !!location,
            "text-amber-600 fill-amber-600": mapsApiStatus === "failure",
            "h-5 w-5 sm:h-7 sm:w-7": true,
            "animate-pulse": mapsApiStatus === "loading",
          })}
        />

        <input
          type="text"
          className={classNames(
            inputClassName,
            `
              w-full
              text-sm sm:text-base
              mt-0 px-6 sm:px-8
              border-0 border-b border-b-black
              focus:ring-0 focus:border-black
              text-black bg-transparent
              placeholder:text-gray-600
              peer
            `
          )}
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
    </>
  );
};
