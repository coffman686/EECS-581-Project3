import { useState } from "react";
import Autosuggest from "./Autosuggest";

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

  return (
    <div>
      <ul>
        {ingredients.map((ingredient, index) => (
          <li key={ingredient}>
            {ingredient}
            <button
              type="button"
              style={{ marginLeft: "1em" }}
              onClick={() => handleDeleteIngredient(index)}
            >
              ⓧ
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddIngredient}>
        <Autosuggest
          data={[...data, ...ingredients]}
          query={query}
          setQuery={setQuery}
        />
        <button type="submit">Add ingredient</button>
      </form>
    </div>
  );
}
