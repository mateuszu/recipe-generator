import React from "react";
import { Recipe } from "./App";
interface RecipeListProps {
  recipes: Recipe[];
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recipes.map((recipe: Recipe) => (
        <div key={recipe.idMeal} className="border p-4 rounded shadow">
          <img
            src={`${recipe.strMealThumb}/preview`}
            alt={recipe.strMeal}
            className="w-full h-48 object-cover mb-2"
          />
          <h2 className="text-xl font-bold">{recipe.strMeal}</h2>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
