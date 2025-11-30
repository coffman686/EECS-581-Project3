"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import RecipeDetails from "@/components/RecipeDetails";

const RecipeInfo = () => {
  const pathname = usePathname();
  const id = pathname.split('/').pop();

  // Handle static routes that might be caught by this dynamic route
  useEffect(() => {
    if (id === "saved") {
      window.location.href = "/recipes/saved";
    }
  }, [id]);

  // Don't render if this is actually the saved route
  if (id === "saved") {
    return null;
  }

  return (
    <div>
      <RecipeDetails recipeId={id!} />
    </div>

  );
}
export default RecipeInfo