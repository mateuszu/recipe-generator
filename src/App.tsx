import React from "react";
import { useQuery } from "@tanstack/react-query";
import RecipeList from "./components/RecipeList";
import SearchForm from "./components/SearchForm";
import axios from "axios";

export type Recipe = {
  strMeal: string;
  strMealThumb: string;
  idMeal: string;
};

type Meal = {
  idIngredient: string;
  strIngredient: string;
  strDescription: string;
  strType: string | null;
};

const fetchIngredients = async () => {
  const response = await axios.get(
    "https://www.themealdb.com/api/json/v1/1/list.php?i=list"
  );
  return response.data.meals.map((meal: Meal) => meal.strIngredient);
};

const App: React.FC = () => {
  const [recipes, setRecipes] = React.useState<Recipe[] | []>([]);

  const {
    data: ingredients,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ingredients"],
    queryFn: fetchIngredients,
  });

  const searchRecipes = async (ingredient: string) => {
    const response = await axios.get(
      `https://themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
    );
    setRecipes(response.data.meals);
  };

  if (isLoading) return <p>Loading ingredients...</p>;
  if (error) return <p>Error loading ingredients</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
      <div className="container mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Recipe Generator
        </h1>
        <SearchForm ingredients={ingredients} onSearch={searchRecipes} />
        <RecipeList recipes={recipes} />
      </div>
    </div>
  );
};

export default App;
