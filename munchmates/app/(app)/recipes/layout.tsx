// File: layout.tsx
// Purpose: Provide layout for recipe pages with optional slideover
// Inputs: children (main content), slideover (intercepted route UI)
// Outputs: Combined page layout with background content + slideover
// Keeps main page rendered while displaying modal/slideover content

export default function RecipesLayout({
    children, // This is the main page content (e.g., recipes/page.tsx)
    slideover, // This is the content from the @slideover slot
  }: {
    children: React.ReactNode;
    slideover: React.ReactNode;
  }) {
    return (
      <div>
        {/* 
          This renders the main content. When you click a link, 
          Next.js keeps this content rendered in the background.
        */}
        <main>{children}</main>
  
        {/* 
          This renders the slideover/modal UI when the route is intercepted.
          If nothing is intercepted, the default @slideover/page.tsx renders null here.
        */}
        {slideover}
      </div>
    );
  }