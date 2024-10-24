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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center mb-8 space-y-4"
    >
      <select
        value={selectedIngredient}
        onChange={(e) => setSelectedIngredient(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="">Select an ingredient</option>
        {ingredients.map((ingredient, index) => (
          <option key={index} value={ingredient}>
            {ingredient}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Search
      </button>
    </form>
  );
};

export default SearchForm;