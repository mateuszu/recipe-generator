export interface Recipe {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strTags?: string;
  strCategory?: string;
  strArea?: string;
  strYoutube?: string;
  strSource?: string;
  ingredients: string[];
  measures: string[];
}

export interface Ingredient {
  idIngredient: string;
  strIngredient: string;
  strDescription?: string;
  strType?: string | null;
}
