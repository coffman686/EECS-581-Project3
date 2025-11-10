import { useState } from "react";
import Autosuggest from "./Autosuggest";
import { Button } from "../ui/button";

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

export default function IngredientList({ initialIngredients = [] }: { initialIngredients?: string[] }) {
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
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
            {ingredient}
            <Button
              type="button"
              style={{ marginLeft: "1em" }}
              onClick={() => handleDeleteIngredient(index)}
            >
              ⓧ
            </Button>
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
