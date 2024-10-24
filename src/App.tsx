import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import RecipeList from "./components/RecipeList";
import SearchForm from "./components/SearchForm";
import RecipeModal from "./components/RecipeModal";
import axios from "axios";
import { Recipe, Ingredient } from "./types";

const fetchIngredients = async (): Promise<Ingredient[]> => {
  const response = await axios.get(
    "https://www.themealdb.com/api/json/v1/1/list.php?i=list"
  );
  return response.data.meals.map((meal: Ingredient) => ({
    idIngredient: meal.idIngredient,
    strIngredient: meal.strIngredient,
    strDescription: meal.strDescription,
    strType: meal.strType,
  }));
};

const parseRecipe = (apiRecipe: Record<string, string | null>): Recipe => {
  const ingredients: string[] = [];
  const measures: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = apiRecipe[`strIngredient${i}`];
    const measure = apiRecipe[`strMeasure${i}`];

    if (ingredient && ingredient.trim() !== "") {
      ingredients.push(ingredient.trim());
      measures.push(measure ? measure.trim() : "");
    }
  }

  return {
    idMeal: apiRecipe.idMeal || "",
    strMeal: apiRecipe.strMeal || "",
    strMealThumb: apiRecipe.strMealThumb || "",
    strInstructions: apiRecipe.strInstructions || "",
    ingredients,
    measures,
    strTags: apiRecipe.strTags || "",
    strCategory: apiRecipe.strCategory || "",
    strArea: apiRecipe.strArea || "",
    strYoutube: apiRecipe.strYoutube || "",
    strSource: apiRecipe.strSource || "",
  };
};

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: ingredients,
    isLoading,
    error,
  } = useQuery<Ingredient[]>({
    queryKey: ["ingredients"],
    queryFn: fetchIngredients,
  });

  const searchRecipes = async (
    selectedIngredients: string[],
    maxIngredients: number | null
  ) => {
    try {
      const allRecipes = await Promise.all(
        selectedIngredients.map(async (ingredient) => {
          const response = await axios.get(
            `https://themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
          );

          if (!response.data.meals) {
            return [];
          }

          return await Promise.all(
            response.data.meals.map(async (meal: { idMeal: string }) => {
              const detailResponse = await axios.get(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
              );
              return parseRecipe(detailResponse.data.meals[0]);
            })
          );
        })
      );

      const flattenedRecipes = allRecipes.flat();

      const uniqueRecipesMap = new Map();
      flattenedRecipes.forEach((recipe) => {
        uniqueRecipesMap.set(recipe.idMeal, recipe);
      });
      const uniqueRecipes = Array.from(uniqueRecipesMap.values());

      const filteredRecipes = uniqueRecipes.filter((recipe: Recipe) => {
        const recipeIngredients = recipe.ingredients.filter((ing) => ing);
        return selectedIngredients.every((ingredient) =>
          recipeIngredients.some((recipeIngredient: string) =>
            recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
          )
        );
      });

      const finalRecipes = filteredRecipes.filter(
        (recipe) =>
          maxIngredients === null || recipe.ingredients.length <= maxIngredients
      );

      setRecipes(finalRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("An error occurred while fetching recipes. Please try again.");
    }
  };

  const handleOpenModal = (index: number) => {
    setSelectedRecipeIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipeIndex(null);
  };

  const handleNextRecipe = () => {
    if (
      selectedRecipeIndex !== null &&
      selectedRecipeIndex < recipes.length - 1
    ) {
      setSelectedRecipeIndex(selectedRecipeIndex + 1);
    }
  };

  const handlePreviousRecipe = () => {
    if (selectedRecipeIndex !== null && selectedRecipeIndex > 0) {
      setSelectedRecipeIndex(selectedRecipeIndex - 1);
    }
  };

  if (isLoading) return <p>Loading ingredients...</p>;
  if (error) return <p>Error loading ingredients</p>;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen space-y-8">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>

      <h1 className="text-6xl font-extrabold text-gray-800 mt-12 mb-6 tracking-tight">
        Recipe Generator
      </h1>

      <div className="container mx-auto p-8 bg-white rounded-full w-11/12 max-w-2xl h-96 flex flex-col items-center justify-center hover:shadow-[0_10px_30px_-15px_rgba(255,0,255,0.7),0_10px_20px_5px_rgba(99,102,241,0.7)] transition-shadow duration-300">
        <SearchForm
          ingredients={ingredients?.map((ing) => ing.strIngredient) || []}
          onSearch={searchRecipes}
        />
      </div>

      {recipes.length > 0 && (
        <div className="container mx-auto p-8 bg-white rounded-lg shadow-lg w-full max-w-2xl h-auto">
          <RecipeList recipes={recipes} onRecipeClick={handleOpenModal} />
        </div>
      )}

      {selectedRecipeIndex !== null && (
        <RecipeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          recipe={recipes[selectedRecipeIndex]}
          onNext={handleNextRecipe}
          onPrevious={handlePreviousRecipe}
          hasPrevious={selectedRecipeIndex > 0}
          hasNext={selectedRecipeIndex < recipes.length - 1}
        />
      )}
    </div>
  );
};

export default App;
