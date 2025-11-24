// app/profile/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DietaryDialog } from '@/components/ingredients/Dietary';
import Link from "next/link";

const ProfilePage = () => {
  const [dietModal, setDietModal] = useState(false);
  const [diets, setDiets] = useState<string[]>([]);
  const [intolerances, setIntolerances] = useState<string[]>([]);

  function openDiet(e: React.SyntheticEvent) {
    e.preventDefault();
    setDietModal(true);
  }

  function closeDiet(e: React.SyntheticEvent) {
    e.preventDefault();
    setDietModal(false);
  }

  return (
    <div>
      <DietaryDialog
        isOpen={dietModal}
        closePopup={closeDiet}
        diets={diets}
        setDiets={setDiets}
        intolerances={intolerances}
        setIntolerances={setIntolerances}
      />
      <h2 style={{ textAlign: "center", margin: "2rem 0" }}>User Profile</h2>
      <form
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          border: "1px solid var(--foreground)",
          padding: "2rem",
          borderRadius: "8px",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="name"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Name:
          </label>
          <input
            type="text"
            id="name"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ display: "block", marginBottom: "0.5rem" }}>
            Favorite Cuisines:
          </p>
          <input
            type="text"
            placeholder="e.g., Italian, Mexican"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ display: "block", marginBottom: "0.5rem" }}>
            Dietary preferences
          </p>
          <input
            type="text"
            placeholder={diets.join(", ")}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
            readOnly={true}
          />
          <Button onClick={openDiet}>Edit</Button>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Allergies
          </label>
          <input
            type="text"
            placeholder={intolerances.join(", ")}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
            readOnly={true}
          />
          <Button onClick={openDiet}>Edit</Button>
        </div>
        <button
          type="submit"
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--foreground)",
            color: "var(--background)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <Link href="/dashboard">Save Settings</Link>
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
