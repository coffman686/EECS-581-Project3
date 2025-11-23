"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import RecipeDetails from "@/components/RecipeDetails";

const RecipeInfo = () => {
  const pathname = usePathname();
  const id = pathname.split('/').pop();

  return (
    <div>
      <RecipeDetails recipeId={id!} />
    </div>

  );
}
export default RecipeInfo