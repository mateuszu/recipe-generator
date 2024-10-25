import React, { useState } from "react";

interface SearchFormProps {
  ingredients: string[];
  onSearch: (
    selectedIngredients: string[],
    maxIngredients: number | null
  ) => void;
  isLoading: boolean;
  isError: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  ingredients,
  onSearch,
  isLoading,
  isError,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    "",
  ]);
  const [maxIngredients, setMaxIngredients] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleIngredientChange = (index: number, value: string) => {
    const newSelectedIngredients = [...selectedIngredients];
    newSelectedIngredients[index] = value;
    setSelectedIngredients(newSelectedIngredients);
  };

  const addIngredient = () => {
    setSelectedIngredients([...selectedIngredients, ""]);
  };

  const removeIngredient = (index: number) => {
    const newSelectedIngredients = selectedIngredients.filter(
      (_, i) => i !== index
    );
    setSelectedIngredients(newSelectedIngredients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasSelectedIngredient = selectedIngredients.some(
      (ingredient) => ingredient.trim() !== ""
    );
    if (!hasSelectedIngredient) {
      setValidationError("Please select at least one ingredient.");
    } else {
      setValidationError(null);
      onSearch(
        selectedIngredients.filter((ingredient) => ingredient),
        maxIngredients
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full text-indigo-600"></div>
        <p className="text-center text-gray-500 mt-4">Loading ingredients...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-red-500 mt-4">Error loading ingredients</p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center mb-8 space-y-4 relative"
    >
      {validationError && (
        <p className="text-center text-red-500">{validationError}</p>
      )}

      {selectedIngredients.map((ingredient, index) => (
        <div
          key={index}
          className="relative flex items-center justify-center space-x-2"
        >
          <select
            value={ingredient}
            onChange={(e) => handleIngredientChange(index, e.target.value)}
            className="w-64 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select an ingredient</option>
            {ingredients.map((ing, i) => (
              <option key={i} value={ing}>
                {ing}
              </option>
            ))}
          </select>

          {index > 0 && (
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="absolute right-[-40px] px-3 py-1 bg-red-500 text-white rounded-lg h-full"
            >
              -
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addIngredient}
        className="px-3 py-1 bg-green-500 text-white rounded-lg"
      >
        +
      </button>

      <div className="flex items-center justify-center w-full">
        <select
          value={maxIngredients !== null ? maxIngredients : ""}
          onChange={(e) =>
            setMaxIngredients(e.target.value ? parseInt(e.target.value) : null)
          }
          className="w-64 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">No limit on ingredients</option>
          {Array.from({ length: 20 }, (_, index) => index + 1).map((num) => (
            <option key={num} value={num}>
              {num} ingredients
            </option>
          ))}
        </select>
      </div>

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
