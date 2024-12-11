import { Dish } from "../models/dishModel.js";

import { ClientError, ServerError } from "../utils/errorHandler.js";

export const createDishService = async (dishData) => {
    try {
        const hotelId = dishData.hotelId;
        if (!hotelId) {
            throw new ClientError("Hotel ID is required");
        }
        console.log('dish-data-1', dishData)
        if (!dishData.name || !dishData.price) {
            throw new ClientError("Dish name and price are required!");
        }
        console.log('dish-data-2', dishData, typeof dishData.price)
        const dish = await Dish.create({ ...dishData, hotelId });

        return dish;
    } catch (error) {
        console.log("error while creating dish", error);
        throw error;
    }
}

export const getDishByIdService = async (dishId) => {
    try {
        const dish = await Dish.findById(dishId);
        if (!dish) {
            throw new ClientError('Dish not found');
        }
        return dish;
    }
    catch (error) {
        if (error instanceof ClientError) {
            throw new error;
        } else {
            throw new ServerError('Failed to fetch dish');
        }
    }
}

export const getAllDishesService = async (hotelId) => {
    try {
        const dishes = await Dish.find({ hotelId });
        if (!dishes || dishes.length === 0) {
            throw new ClientError("No dishes available!", "Not found");
        }
        return dishes;
    } catch (error) {
        if (error instanceof ClientError) {
            throw new error;
        } else {
            throw new ServerError('Failed to fetch dishes');
        }
    }
}

export const updateDishService = async (dishId, dishData) => {
    try {
        const dish = await Dish.findByIdAndUpdate(dishId, dishData, { new: true, runValidators: true });
        if (!dish) {
            throw new ClientError('Dish not found');
        }
        return dish;
    }
    catch (error) {
        if (error instanceof ClientError) {
            throw new error;
        } else {
            throw new ServerError('Failed to update dish');
        }
    }

}

export const deleteDishService = async (dishId) => {
    try {
        const dish = await Dish.findByIdAndDelete(dishId);
        if (!dish) {
            throw new ClientError('Dish not found');
        }
    } catch (error) {
        if (error instanceof ClientError) {
            throw new ClientError(error.message);
        } else {
            throw new ServerError('Failed to delete dish');
        }
    }
}

export const getDishesByCategoryService = async (hotelId, categoryId) => {
    try {
        const dishes = await Dish.find({
            hotelId,
            categories: categoryId
        });

        if (!dishes || dishes.length === 0) {
            throw new ClientError("NotFoundError", "No dishes found");
        }

        return dishes;
    } catch (error) {
        throw new ServerError('Failed to fetch dishes');
    }
};


