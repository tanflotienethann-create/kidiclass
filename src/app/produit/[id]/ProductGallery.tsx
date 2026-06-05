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
      <div className="flex min-h-[520px] items-center justify-center rounded-[2rem] bg-gray-100 text-gray-500">
        Aucune image disponible
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="overflow-hidden rounded-[2.5rem] bg-gray-50 p-4 shadow-sm">
        <div className="flex min-h-[620px] items-center justify-center rounded-[2rem] bg-white p-4">
          <img
            src={images[0]}
            alt={productName}
            className="max-h-[620px] w-auto max-w-full rounded-[2rem] object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[100px_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedImage(image)}
            className={`h-24 w-24 shrink-0 overflow-hidden rounded-2xl border bg-white p-1 transition ${
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

      <div className="order-1 overflow-hidden rounded-[2.5rem] bg-gray-50 p-4 shadow-sm lg:order-2">
        <div className="flex min-h-[620px] items-center justify-center rounded-[2rem] bg-white p-4">
          <img
            src={selectedImage}
            alt={productName}
            className="max-h-[620px] w-auto max-w-full rounded-[2rem] object-contain"
          />
        </div>
      </div>
    </div>
  );
}