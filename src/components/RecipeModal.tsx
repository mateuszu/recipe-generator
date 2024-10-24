import React from "react";
import { Recipe } from "../types";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  onNext: () => void;
  onPrevious: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  recipe,
  onNext,
  onPrevious,
  hasPrevious,
  hasNext,
}) => {
  if (!isOpen) return null;

  const handleClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div className="bg-white rounded-lg shadow-lg w-11/12 sm:w-3/4 lg:w-1/2 max-h-[90%] flex flex-col relative overflow-hidden">
        <div className="w-full">
          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            className="w-full h-64 object-cover rounded-t-lg"
          />
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {recipe.strMeal}
          </h2>

          <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
          <ul className="mb-4">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">
                {recipe.measures[index]} {ingredient}
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold mb-2">Instructions</h3>
          <p className="text-gray-700">{recipe.strInstructions}</p>
        </div>

        <div className="p-4 flex justify-between gap-2 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Close
          </button>
          <div className="flex gap-2">
            {hasPrevious && (
              <button
                onClick={onPrevious}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Previous
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
