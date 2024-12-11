import { Ingredient } from "../models/dishModel.js";
import { ClientError,ServerError } from "../utils/errorHandler.js";

export const createIngredientService = async (hotelId, ingredientData) => {
    try {
        
        if(!hotelId){
            throw new ClientError("Hotel ID is required");
        }

        if(!ingredientData.name){
            throw new ClientError("Ingredient name is required");
        }
        const ingredient = await Ingredient.create({ ...ingredientData, hotelId });

        return ingredient;
    } catch (error) {
        if(error instanceof ClientError){
            throw new ClientError(error.message);
        }
        else {
            throw new ServerError("Ingredient creation failed");
        }
    }
}

export const createMultipleIngredientsService = async (hotelId, ingredientsData) => {
    try {
        if (!hotelId) {
            throw new ClientError('Hotel ID is required');
        }

        const ingredients = ingredientsData.map(ingredientData => ({ ...ingredientData, hotelId }));
        const createdIngredients = await Ingredient.insertMany(ingredients);

        return createdIngredients;
    } catch (error) {
        if (error instanceof ClientError) {
            throw new ClientError(error.message);
        }
        else {
            throw new ServerError('Ingredients creation failed');
        }
    }
}

export const getIngredientByIdService = async (ingredientId) => {
    try {
        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) {
            throw new ClientError('Ingredient not found');
        }
        return ingredient;
    } catch (error) {
        if (error instanceof ClientError) {
            throw new ClientError(error.message);
        } else {
            throw new ServerError('Failed to fetch ingredient');
        }
    }
}

export const updateIngredientService = async (ingredientId, ingredientData) => {
    try {
        const ingredient = await Ingredient.findByIdAndUpdate(ingredientId, ingredientData, { new: true, runValidators: true });
        if (!ingredient) {
            throw new ClientError('Ingredient not found');
        }
        return ingredient;
    }
    catch (error) {
        if (error instanceof ClientError) {
            throw new ClientError(error.message);
        } else {
            throw new ServerError('Failed to update ingredient');
        }
    }

}   

export const deleteIngredientService = async (ingredientId) => {
    try {
        const ingredient = await Ingredient.findByIdAndDelete(ingredientId);
        if (!ingredient) {
            throw new ClientError('Ingredient not found');
        }
        return ingredient;
    } catch (error) {
        if (error instanceof ClientError) {
            throw new ClientError(error.message);
        } else {
            throw new ServerError('Failed to delete ingredient');
        }
    }
}

export const getAllIngredientsService = async () => {
    try {
        const ingredients = await Ingredient.find();
        return ingredients;
    } catch (error) {
        throw new ServerError('Failed to fetch ingredients');
    }
}

export const getIngredientsByHotelService = async (hotelId) => {
    try {
        const ingredients = await Ingredient.find({ hotelId });
        return ingredients;
    } catch (error) {
        throw new ServerError('Failed to fetch ingredients');
    }
}   

export const getIngredientsByDishService = async (dishId) => {
    try {
        const ingredients = await Ingredient.find({ dishId });
        return ingredients;
    } catch (error) {
        throw new ServerError('Failed to fetch ingredients');
    }
}

export const addIngredientsToDishService = async (dishId, ingredients) => {
    try {
        const dish = await Dish.findById(dishId);
        if (!dish) {
            throw new ClientError('Dish not found');
        }
        dish.ingredients.push(...ingredients);
        await dish.save();
        return dish;
    } catch (error) {
        if (error instanceof ClientError) {
            throw new ClientError(error.message);
        } else {
            throw new ServerError('Failed to add ingredients to dish');
        }
    }
}

export const removeIngredientsFromDishService = async (dishId, ingredients) => {

    try {
        const dish = await Dish.findById(dishId);
        if (!dish) {
            throw new ClientError('Dish not found');
        }
        dish.ingredients = dish.ingredients.filter(ingredient => !ingredients.includes(ingredient));
        await dish.save();
        return dish;
    } catch (error) {
        if (error instanceof ClientError) {
            throw new ClientError(error.message);
        } else {
            throw new ServerError('Failed to remove ingredients from dish');
        }
    }
}

export const syncIngredientsFromSourceToDestinationService = async (sourceHotelId,destinationHotelId) => {
    try {
        const sourceIngredients = await Ingredient.find({ hotelId: sourceHotelId });
        if (sourceIngredients.length === 0) {
            throw new ClientError('No ingredients found in source hotel');
        }
        const destinationIngredients = sourceIngredients.map(ingredient => ({ ...ingredient._doc, hotelId: destinationHotelId }));
        const importedIngredients = await Ingredient.insertMany(destinationIngredients);
        return importedIngredients;
    } catch (error) {
        if (error instanceof ClientError) {
            throw new ClientError(error.message);
        } else {
            throw new ServerError('Failed to import ingredients');
        }
    }
}


