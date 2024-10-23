import React from "react";
import { useQuery } from "@tanstack/react-query";
import RecipeList from "./RecipeList";
import SearchForm from "./SearchForm";
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Recipe Generator</h1>
      <SearchForm ingredients={ingredients} onSearch={searchRecipes} />
      <RecipeList recipes={recipes} />
    </div>
  );
};

export default App;
