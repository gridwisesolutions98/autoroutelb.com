// app/cars/[id]/FavoriteButton.tsx
"use client";

import React from "react";

export default function FavoriteButton({ carId }: { carId: string }) {
  return (
    <button className="px-4 py-2 bg-rose-600 text-white rounded-lg">
      Favorite
    </button>
  );
}