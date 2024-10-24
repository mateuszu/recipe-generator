import React from "react";
import { motion } from "framer-motion";
import { Recipe } from "../types";

interface RecipeListProps {
  recipes: Recipe[];
  onRecipeClick: (index: number) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onRecipeClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {recipes.map((recipe, index) => (
        <motion.div
          key={recipe.idMeal}
          className="cursor-pointer p-4 bg-white rounded-lg shadow-lg"
          onClick={() => onRecipeClick(index)}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <h3 className="mt-4 text-xl font-semibold">{recipe.strMeal}</h3>
        </motion.div>
      ))}
    </div>
  );
};

export default RecipeList;
