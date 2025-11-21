import { useState } from "react";
import Autosuggest from "./Autosuggest";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dispatch, SetStateAction } from "react";
import { XIcon } from "lucide-react";

const data = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Elderberry",
  "Fig",
  "Grape",
  "Honeydew",
];

type IngredientListProps = {
  ingredients: string[];
  setIngredients: Dispatch<SetStateAction<string[]>>;
}

export default function IngredientList({ ingredients, setIngredients  }: IngredientListProps) {
  const [query, setQuery] = useState("");

  // TODO: replace, needed for testing
  const addIngredient = (item: string) => {
    if (item.trim() !== "" && !ingredients.includes(item)) {
      setIngredients((prevIngredients) => [...prevIngredients, item]);
    }
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      addIngredient(query);
      setQuery("");
    }
  };

  // TODO: replace, needed for testing
  const handleDeleteIngredient = (index: number) => {
    setIngredients((prevIngredients) =>
      prevIngredients.filter((_, i) => i !== index),
    );
  };

  const clearIngredients = () => {
    setIngredients([]);
  }
  return (
    <div className="flex-1 max-w-2xl">
      <ul>
        {ingredients.map((ingredient, index) => (
          <li key={ingredient}>
            <Badge
              className="justify-between"
            >
              {ingredient}
              <Button
              type="button"
              variant="ghost"
              className="size-6 p-0 rounded-full"
              onClick={() => handleDeleteIngredient(index)}
                >
                <XIcon className="inline justify-center"/>
              </Button>
            </Badge>
          </li>
        ))}
      </ul>

      <form className="relative" onSubmit={handleAddIngredient}>
        <Autosuggest
          data={[...data, ...ingredients]}
          query={query}
          setQuery={setQuery}
        />
        <Button type="submit">Add ingredient</Button>
        <Button
          type="button"
          onClick={() => clearIngredients()}
        >
        Clear List
      </Button>
      </form>
    </div>
  );
}
