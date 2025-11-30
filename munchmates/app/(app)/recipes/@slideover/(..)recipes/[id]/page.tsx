'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import RecipeDetails from '@/components/RecipeDetails';
import { usePathname } from "next/navigation";
import { XIcon } from 'lucide-react';

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
    // This is your overlay/slideover structure
    <div className="fixed inset-0 bg-opacity-50 z-40" onClick={handleClose}>
      <div 
        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background shadow-xl z-50 overflow-y-auto border-l" 
        // Stop clicks inside the slideover from closing the modal via the overlay handler
        onClick={(e) => e.stopPropagation()}
      >
        <Button onClick={handleClose} className="p-4">
          <XIcon className=""/>
        </Button>
        {/* Pass the recipe ID to your detailed component */}
        <RecipeDetails recipeId={id!} />
      </div>
    </div>
  );
}
