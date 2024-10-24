import React, { useState, useEffect, useRef } from "react";
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
  const recipeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const {
    data: ingredients,
    isLoading,
    error,
  } = useQuery<Ingredient[]>({
    queryKey: ["ingredients"],
    queryFn: fetchIngredients,
  });

  const searchRecipes = async (ingredient: string) => {
    const response = await axios.get(
      `https://themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
    );

    const detailedRecipes = await Promise.all(
      response.data.meals.map(async (meal: { idMeal: string }) => {
        const detailResponse = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
        );
        return parseRecipe(detailResponse.data.meals[0]);
      })
    );

    setRecipes(detailedRecipes);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setSelectedRecipeIndex((prevIndex) =>
          prevIndex !== null ? (prevIndex + 1) % recipes.length : 0
        );
      } else if (event.key === "ArrowLeft") {
        setSelectedRecipeIndex((prevIndex) =>
          prevIndex !== null
            ? (prevIndex - 1 + recipes.length) % recipes.length
            : 0
        );
      } else if (event.key === "Enter" && selectedRecipeIndex !== null) {
        handleOpenModal(selectedRecipeIndex);
      } else if (event.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRecipeIndex, recipes, isModalOpen]);

  useEffect(() => {
    if (
      selectedRecipeIndex !== null &&
      recipeRefs.current[selectedRecipeIndex]
    ) {
      recipeRefs.current[selectedRecipeIndex]?.focus();
    }
  }, [selectedRecipeIndex]);

  if (isLoading) return <p>Loading ingredients...</p>;
  if (error) return <p>Error loading ingredients</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
      <div className="container mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Recipe Generator
        </h1>
        <SearchForm
          ingredients={ingredients?.map((ing) => ing.strIngredient) || []}
          onSearch={searchRecipes}
        />
        <RecipeList recipes={recipes} onRecipeClick={handleOpenModal} />
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
    </div>
  );
};

export default App;
