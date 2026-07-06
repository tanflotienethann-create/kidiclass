"use client";

import { useState } from "react";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selectedImage, setSelectedImage] = useState(images?.[0] || "");

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-100 text-sm font-bold text-gray-500 sm:rounded-[2rem]">
        Aucune image disponible
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="overflow-hidden rounded-2xl bg-gray-50 p-3 shadow-sm sm:rounded-[2.5rem] sm:p-4">
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-white p-3 sm:rounded-[2rem] sm:p-4">
          <img
            src={images[0]}
            alt={productName}
            className="h-full max-h-full w-full rounded-2xl object-contain sm:rounded-[2rem]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-[88px_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedImage(image)}
            className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white p-1 transition sm:h-24 sm:w-24 lg:h-[88px] lg:w-[88px] ${
              selectedImage === image
                ? "border-[#f36f45] ring-2 ring-[#f36f45]/20"
                : "border-gray-200 hover:border-[#1db7bd]"
            }`}
          >
            <img
              src={image}
              alt={`${productName} - image ${index + 1}`}
              className="h-full w-full rounded-xl object-cover object-top"
            />
          </button>
        ))}
      </div>

      <div className="order-1 overflow-hidden rounded-2xl bg-gray-50 p-3 shadow-sm sm:rounded-[2.5rem] sm:p-4 lg:order-2">
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-white p-3 sm:rounded-[2rem] sm:p-4">
          <img
            src={selectedImage}
            alt={productName}
            className="h-full max-h-full w-full rounded-2xl object-contain sm:rounded-[2rem]"
          />
        </div>
      </div>
    </div>
  );
}
