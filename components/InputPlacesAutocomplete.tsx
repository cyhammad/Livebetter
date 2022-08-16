import { captureException } from "@sentry/nextjs";
import classNames from "classnames";
import Script from "next/script";
import { MapPin, NavigationArrow } from "phosphor-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Popper } from "components/Popper";
import { useCurrentPosition } from "hooks/useCurrentPosition";
import { useInputPlacesAutocompleteContext } from "hooks/useInputPlacesAutocompleteContext";
import { usePrevious } from "hooks/usePrevious";
import { useUserContext } from "hooks/useUserContext";

interface InputPlacesAutocompleteProps {
  containerClassName?: string;
  inputClassName?: string;
  isCentered?: boolean;
}

export const InputPlacesAutocomplete = ({
  containerClassName,
  inputClassName,
  isCentered = true,
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
  const prevLatitude = usePrevious(currentPositionLatitude);
  const prevLongitude = usePrevious(currentPositionLongitude);
  const isPlacesAutocompleteInitializingRef = useRef(false);
  const didPlaceChange = useRef(false);

  const initPlacesAutocomplete = useCallback(() => {
    if (
      (addressInputRef.current &&
        addressInputRef.current.classList.contains("pac-target-input")) ||
      isPlacesAutocompleteInitializingRef.current
    ) {
      return;
    }

    isPlacesAutocompleteInitializingRef.current = true;

    document.querySelectorAll(".pac-container").forEach((element) => {
      element.remove();
    });

    setMapsApiStatus("loading");

    if (addressInputRef.current) {
      const autoComplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          componentRestrictions: { country: "us" },
          fields: ["formatted_address", "geometry.location"],
          types: [
            "intersection",
            "point_of_interest",
            "premise",
            "street_address",
            "street_number",
          ],
          bounds: {
            east: -74.956322,
            north: 40.137276,
            west: -75.278833,
            south: 39.868364,
          },
          strictBounds: true,
        }
      );

      autoComplete.addListener("place_changed", () => {
        didPlaceChange.current = true;
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

  /**
   * Handles reverse geocoding the address if the user's current location
   * changes after clicking
   */
  useEffect(() => {
    if (currentPositionError) {
      setShouldQueryLocation(false);

      return;
    }

    const didPositionChange =
      currentPositionLatitude &&
      currentPositionLongitude &&
      currentPositionLatitude !== prevLatitude &&
      currentPositionLongitude !== prevLongitude;

    if (!didPositionChange) {
      return;
    }

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
      })
      .catch((err) => {
        captureException(err, {
          extra: {
            message: "Failed to reverse geocode coordinates",
            latitude: currentPositionLatitude,
            longitude: currentPositionLongitude,
          },
        });
      });
  }, [
    currentPositionLatitude,
    currentPositionLongitude,
    currentPositionError,
    setLocation,
    setShouldQueryLocation,
    prevLatitude,
    prevLongitude,
  ]);

  useEffect(() => {
    setAddress(location?.address ?? "");
  }, [location, setAddress]);

  /**
   * Handles the case where the user changes the address input, but did not
   * select a place in the Places Autocomplete dropdown. Since a blur will also
   * happen if the user _did_ select a place, we wait 500ms to allow the
   * place_changed event to occur before running this function. If a
   * place_changed event does occur, we do not run this function.
   */
  const handleBlur = () => {
    setTimeout(async () => {
      if (
        address &&
        location?.address !== address &&
        mapsApiStatus !== "loading" &&
        !didPlaceChange.current
      ) {
        didPlaceChange.current = false;

        const sessionToken =
          new window.google.maps.places.AutocompleteSessionToken();
        const autocompleteService =
          new window.google.maps.places.AutocompleteService();
        const placesService = new window.google.maps.places.PlacesService(
          addressInputRef.current as HTMLDivElement
        );

        try {
          const result = await autocompleteService.getPlacePredictions({
            input: address,
            componentRestrictions: { country: "us" },
            sessionToken,
          });

          const prediction = result.predictions[0];

          if (prediction) {
            const { place_id } = prediction;

            placesService.getDetails(
              {
                placeId: place_id,
                sessionToken,
                fields: ["formatted_address", "geometry.location"],
              },
              (placeResult) => {
                if (placeResult) {
                  const { formatted_address, geometry } = placeResult;

                  if (geometry?.location && formatted_address) {
                    setLocation({
                      latitude: geometry.location.lat(),
                      longitude: geometry.location.lng(),
                      address: formatted_address,
                    });
                  }
                }
              }
            );
          }
        } catch (error) {
          captureException(error, {
            extra: {
              message:
                "Failed to populate address after autocomplete prediction.",
              input: address,
            },
          });
        }
      }

      didPlaceChange.current = false;
    }, 500);
  };

  return (
    <>
      <Script
        id="google-maps-script"
        onError={() => {
          setMapsApiStatus("failure");
        }}
        onLoad={() => {
          initPlacesAutocomplete();
        }}
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDns9eCy_4Zge-qYP3Ycnp7qtLw_QsPNIE&libraries=places"
      />
      <div
        className={classNames({
          "flex flex-col gap-1 w-full": true,
          "items-center": isCentered,
          "items-start": !isCentered,
        })}
      >
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
              "text-gray-600":
                (!location && mapsApiStatus !== "failure") ||
                location?.address !== address,
              "text-emerald-600": mapsApiStatus !== "failure" && !!location,
              "text-amber-600": mapsApiStatus === "failure",
              "h-5 w-5 sm:h-7 sm:w-7": true,
              "animate-pulse": mapsApiStatus === "loading",
            })}
          />
          <input
            type="text"
            className={classNames(
              inputClassName,
              { "opacity-50": mapsApiStatus !== "success" },
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
            onBlur={handleBlur}
            placeholder="Enter your address"
            disabled={mapsApiStatus !== "success"}
          />
          <button
            disabled={mapsApiStatus !== "success"}
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
                "opacity-50": mapsApiStatus !== "success",
              })}
            />
          </button>
        </div>
        {mapsApiStatus === "failure" ? (
          <p className="text-xs text-amber-900">
            Failed to connect to Google Maps.{" "}
            <Popper buttonLabel="Learn more." placement="auto-end">
              <span className="text-black">
                If you already set your address, you can safely ignore this
                error.
                <br />
                If you still need to set your address, please reload the page
                and this error should go away.
              </span>
            </Popper>
          </p>
        ) : null}
      </div>
    </>
  );
};
