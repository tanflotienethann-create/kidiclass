"use client";

import {
  GoogleMap,
  Marker,
  StandaloneSearchBox,
  useJsApiLoader,
} from "@react-google-maps/api";
import { MapPinCheck } from "lucide-react";
import { useRef, useState } from "react";

type AddressMapProps = {
  latitude: number | null;
  longitude: number | null;
  mapAddress: string;
  onLocationChange: (data: {
    latitude: number;
    longitude: number;
    mapAddress: string;
  }) => void;
};

const libraries: "places"[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "380px",
};

const defaultCenter = {
  lat: 5.3599517,
  lng: -4.0082563,
};

export default function AddressMap({
  latitude,
  longitude,
  mapAddress,
  onLocationChange,
}: AddressMapProps) {
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const [search, setSearch] = useState(mapAddress || "");
  const [message, setMessage] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || "",
    libraries,
  });

  const currentCenter =
    latitude && longitude
      ? {
          lat: latitude,
          lng: longitude,
        }
      : defaultCenter;

  function getAddressFromPlace(place: google.maps.places.PlaceResult) {
    if (place.formatted_address) {
      return place.formatted_address;
    }

    if (place.name) {
      return place.name;
    }

    return "Adresse sélectionnée sur Google Maps";
  }

  function handlePlacesChanged() {
    setMessage("");

    const places = searchBoxRef.current?.getPlaces();

    if (!places || places.length === 0) {
      setMessage("Adresse introuvable. Essayez avec un quartier ou une commune.");
      return;
    }

    const place = places[0];

    if (!place.geometry || !place.geometry.location) {
      setMessage("Impossible de récupérer la position de cette adresse.");
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = getAddressFromPlace(place);

    setSearch(address);

    onLocationChange({
      latitude: lat,
      longitude: lng,
      mapAddress: address,
    });
  }

  function reverseGeocode(lat: number, lng: number) {
    if (!window.google || !window.google.maps) {
      onLocationChange({
        latitude: lat,
        longitude: lng,
        mapAddress: "Position sélectionnée sur Google Maps",
      });

      setSearch("Position sélectionnée sur Google Maps");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      {
        location: {
          lat,
          lng,
        },
      },
      (results, status) => {
        const address =
          status === "OK" && results && results.length > 0
            ? results[0].formatted_address
            : "Position sélectionnée sur Google Maps";

        setSearch(address);

        onLocationChange({
          latitude: lat,
          longitude: lng,
          mapAddress: address,
        });
      }
    );
  }

  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMessage("");
    reverseGeocode(lat, lng);
  }

  async function useCurrentLocation() {
    setMessage("");
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      setMessage("La géolocalisation n’est pas disponible sur cet appareil.");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        reverseGeocode(lat, lng);
        setLoadingLocation(false);
      },
      () => {
        setMessage(
          "Impossible d’accéder à votre position. Vous pouvez rechercher une adresse ou cliquer sur la carte."
        );
        setLoadingLocation(false);
      }
    );
  }

  if (!apiKey) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm font-bold leading-6 text-red-600">
        Clé Google Maps manquante. Ajoute{" "}
        <span className="font-black">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span>{" "}
        dans ton fichier <span className="font-black">.env.local</span>.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm font-bold leading-6 text-red-600">
        Impossible de charger Google Maps. Vérifie que la clé API est bonne et
        que les API <span className="font-black">Maps JavaScript API</span>,{" "}
        <span className="font-black">Places API</span> et{" "}
        <span className="font-black">Geocoding API</span> sont bien activées.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="rounded-[2rem] border border-gray-100 bg-white p-5 text-sm font-bold text-gray-500">
        Chargement de Google Maps...
      </div>
    );
  }

  return (
    <div className="relative z-0 rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-2 text-xl font-black text-gray-950">
        Localisation Google Maps
      </h3>

      <p className="mb-4 text-sm leading-6 text-gray-600">
        Recherchez une adresse, un quartier, une rue ou un repère. Vous pouvez
        aussi utiliser votre position actuelle ou cliquer directement sur la
        carte.
      </p>

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <StandaloneSearchBox
          onLoad={(ref) => {
            searchBoxRef.current = ref;
          }}
          onPlacesChanged={handlePlacesChanged}
        >
          <input
            type="text"
            placeholder="Ex : Cocody Faya, Riviera 3, pharmacie, rue, école..."
            className="w-full rounded-[1.4rem] border-2 border-[#bfedf0] bg-white p-4 font-bold text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-[#1db7bd] focus:ring-4 focus:ring-[#1db7bd]/15"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setMessage("");
            }}
          />
        </StandaloneSearchBox>

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={loadingLocation}
          className="rounded-[1.4rem] border-2 border-[#1db7bd] px-6 py-4 font-black text-[#1db7bd] hover:bg-[#1db7bd] hover:text-white disabled:opacity-50"
        >
          {loadingLocation ? "Localisation..." : "Ma position"}
        </button>
      </div>

      {message && (
        <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-500">
          {message}
        </p>
      )}

      <div className="relative z-0 overflow-hidden rounded-[1.5rem] border border-gray-100">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentCenter}
          zoom={latitude && longitude ? 16 : 12}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {latitude && longitude && (
            <Marker
              position={{
                lat: latitude,
                lng: longitude,
              }}
            />
          )}
        </GoogleMap>
      </div>

      {latitude && longitude ? (
        <div className="mt-4 rounded-2xl bg-[#e9fbfc] p-4 text-sm leading-6 text-gray-700">
          <p className="flex items-center gap-2 font-black text-[#1db7bd]">
            <MapPinCheck size={20} strokeWidth={2.5} />
            Position sélectionnée
          </p>

          <p className="mt-1">
            <strong>Coordonnées :</strong> {latitude}, {longitude}
          </p>

          {mapAddress && (
            <p className="mt-1">
              <strong>Adresse :</strong> {mapAddress}
            </p>
          )}

          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full bg-[#f36f45] px-5 py-3 font-black text-white hover:bg-[#e85e33]"
          >
            Ouvrir dans Google Maps
          </a>
        </div>
      ) : (
        <p className="mt-4 text-sm font-bold text-gray-500">
          Aucune position sélectionnée pour le moment.
        </p>
      )}
    </div>
  );
}