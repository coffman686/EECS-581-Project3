'use client';

import { Dispatch, SetStateAction, useEffect } from "react";
import { Button } from "../ui/button";

const allDiets = [
  "Gluten Free",
  "Ketogenic",
  "Vegetarian",
  "Lacto-Vegetarian",
  "Ovo-Vegetarian",
  "Vegan",
  "Pescetarian",
  "Paleo",
  "Primal",
  "Low FODMAP",
  "Whole30",
];

const allIntolerances = [
  "Dairy",
  "Egg",
  "Gluten",
  "Grain",
  "Peanut",
  "Seafood",
  "Sesame",
  "Shellfish",
  "Soy",
  "Sulfite",
  "Tree Nut",
  "Wheat",
];


type DietaryDialogProps = {
  isOpen: boolean;
  closePopup: (e: React.SyntheticEvent) => void;
  diets: string[];
  setDiets: Dispatch<SetStateAction<string[]>>;
  intolerances: string[];
  setIntolerances: Dispatch<SetStateAction<string[]>>;
}

function DietaryDialog({
  isOpen,
  closePopup,
  diets,
  setDiets,
  intolerances,
  setIntolerances,
}: DietaryDialogProps) {

  useEffect(() => {
    const localDiets = localStorage.getItem("diets");
    if (localDiets) {
      setDiets(JSON.parse(localDiets));
    }

    const localIntolerances = localStorage.getItem("intolerances");
    if (localIntolerances) {
      setIntolerances(JSON.parse(localIntolerances));
    }
  }, [setDiets, setIntolerances]);

  useEffect(() => {
    localStorage.setItem("diets", JSON.stringify(diets));
    localStorage.setItem("intolerances", JSON.stringify(intolerances));
  }, [diets, intolerances]);

  function toggleItem(item: string, setItems: Dispatch<SetStateAction<string[]>>) {
    setItems((prevItems: string[]) => {
      if (prevItems.includes(item)) {
        return prevItems.filter((sel) => sel !== item);
      } else {
        return [...prevItems, item];
      }
    });
  }

  function itemClasses(items: string[], item: string) {
    const color = () => {
      if (items.includes(item)) {
        return "fg-primary bg-primary";
      } else {
        return "fg-muted bg-muted";
      }
    };
    return `w-fit rounded-md p-1 m-1 hover:brightness-90 ${color()}`;
  }

  if (!isOpen) {
    return;
  }

  return (
    <div className="dietaryprefs">
      <div className="fixed inset-1 flex justify-center items-center z-50">
        <div className="bg-popover p-6 rounded-lg shadow-lg w-1/2 content-center">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-solid mb-4 md:mb-0 ">
              <h2 className="mb-2">Diets</h2>
              <ul className="flex flex-wrap">
                {allDiets.map((diet, _) => (
                  <li
                    key={diet}
                    onClick={() => toggleItem(diet, setDiets)}
                    className={`w-fit rounded-md p-1 m-1 hover:brightness-90 ${itemClasses(diets, diet)}`}
                  >
                    {diet}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-2">Intolerances</h2>
              <ul className="flex flex-wrap">
                {allIntolerances.map((intl, _) => (
                  <li
                    key={intl}
                    onClick={() => toggleItem(intl, setIntolerances)}
                    className={`w-fit rounded-md p-1 m-1 hover:brightness-90 ${itemClasses(intolerances, intl)}`}
                  >
                    {intl}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-center">
            <Button onClick={closePopup}>Save and close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDiets() {
  const localDiets = localStorage.getItem("diets");
  if (localDiets) {
    return JSON.parse(localDiets).join(",");
  }
}

function getIntolerances() {
  const localIntolerances = localStorage.getItem("intolerances");
  if (localIntolerances) {
    return JSON.parse(localIntolerances).join(",");
  }
}

export { DietaryDialog, getDiets, getIntolerances }
