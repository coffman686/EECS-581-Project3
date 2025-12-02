'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RecipeDetails from '@/components/RecipeDetails';
import { usePathname } from "next/navigation";

export default function InterceptedRecipePage() {
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  // Handle static routes that might be caught by this dynamic route
  useEffect(() => {
    if (id === "saved") {
      window.location.href = "/recipes/saved";
    }
  }, [id]);

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  // Don't render if this is actually the saved route
  if (!isOpen || id === "saved") return null;

  return (
    // Overlay/slideover structure
    <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose}>
      <div 
        className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-background shadow-xl z-50 overflow-hidden border-l" 
        onClick={(e) => e.stopPropagation()}
      >
        <RecipeDetails recipeId={id!} onClose={handleClose} />
      </div>
    </div>
  );
}
