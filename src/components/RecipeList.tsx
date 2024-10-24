import React from "react";
import { Recipe } from "../types";

interface RecipeListProps {
  recipes: Recipe[];
  onRecipeClick: (index: number) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onRecipeClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {recipes.map((recipe, index) => (
        <div
          key={recipe.idMeal}
          className="bg-white rounded-lg shadow-lg p-4 transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer"
          onClick={() => onRecipeClick(index)}
        >
          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            className="w-full h-48 object-cover rounded-t-lg mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800">{recipe.strMeal}</h2>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
