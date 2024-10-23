import React, { useState } from "react";

interface SearchFormProps {
  ingredients: string[];
  onSearch: (ingredient: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ ingredients, onSearch }) => {
  const [selectedIngredient, setSelectedIngredient] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(selectedIngredient);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <select
        value={selectedIngredient}
        onChange={(e) => setSelectedIngredient(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Select an ingredient</option>
        {ingredients.map((ingredient, index) => (
          <option key={index} value={ingredient}>
            {ingredient}
          </option>
        ))}
      </select>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">
        Search
      </button>
    </form>
  );
};

export default SearchForm;
