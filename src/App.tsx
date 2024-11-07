import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import RecipeList from "./components/RecipeList";
import SearchForm from "./components/SearchForm";
import RecipeModal from "./components/RecipeModal";
import axios from "axios";
import { Recipe, Ingredient } from "./types";
import { motion } from "framer-motion";

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
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const savedRecipes = localStorage.getItem("savedRecipes");

    return savedRecipes ? JSON.parse(savedRecipes) : [];
  });
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFetchingRecipes, setIsFetchingRecipes] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const {
    data: ingredients,
    isLoading,
    isError,
  } = useQuery<Ingredient[]>({
    queryKey: ["ingredients"],
    queryFn: fetchIngredients,
  });

  const searchRecipes = async (
    selectedIngredients: string[],
    maxIngredients: number | null
  ) => {
    setHasSearched(true);
    setIsFetchingRecipes(true);
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
          recipeIngredients.some((recipeIngredient) =>
            recipeIngredient.toLowerCase().includes(ingredient.toLowerCase())
          )
        );
      });

      const finalRecipes = filteredRecipes.filter(
        (recipe) =>
          maxIngredients === null || recipe.ingredients.length <= maxIngredients
      );

      setRecipes(finalRecipes);
      localStorage.setItem("savedRecipes", JSON.stringify(finalRecipes));
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("An error occurred while fetching recipes. Please try again.");
    } finally {
      setIsFetchingRecipes(false); // Stop fetching recipes
    }
  };

  useEffect(() => {
    if (recipes.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [recipes]);

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollToTop(true);
    } else {
      setShowScrollToTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen"
      ref={topRef}
    >
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>

      <div className="w-full flex flex-col items-center mt-4">
        <h1 className="mb-4 text-4xl font-thin uppercase text-gray-900 dark:text-white md:text-6xl lg:text-7xl text-center font-poppins">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
            Recipe Generator
          </span>
        </h1>
        <p className="text-xl font-thin text-gray-500 lg:text-2xl dark:text-gray-400 text-center w-3/4 font-poppins">
          Customize your search by specifying the maximum number of ingredients
          you want to include, ensuring you find recipes that fit your pantry
          while minimizing waste
        </p>
      </div>

      <div className="container mx-auto p-8 my-16 bg-white rounded-full w-11/12 max-w-2xl h-auto flex flex-col items-center justify-center hover:shadow-[0_10px_30px_-15px_rgba(255,0,255,0.7),0_10px_20px_5px_rgba(99,102,241,0.7)] transition-shadow duration-300">
        <SearchForm
          ingredients={ingredients?.map((ing) => ing.strIngredient) || []}
          onSearch={searchRecipes}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {isFetchingRecipes ? (
        <div className="flex justify-center items-center my-8">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-600"></div>
        </div>
      ) : hasSearched && recipes.length === 0 ? (
        <motion.div
          ref={resultsRef}
          className="container mx-auto p-8 bg-white rounded-lg shadow-lg w-full max-w-4xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center text-gray-500">
            No recipes found for the given criteria
          </p>
        </motion.div>
      ) : (
        recipes.length > 0 && (
          <motion.div
            ref={resultsRef}
            className="container mx-auto p-8 bg-white rounded-lg shadow-lg w-full max-w-4xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RecipeList recipes={recipes} onRecipeClick={handleOpenModal} />
          </motion.div>
        )
      )}

      {showScrollToTop && (
        <button
          onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
        >
          Scroll to Top
        </button>
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
