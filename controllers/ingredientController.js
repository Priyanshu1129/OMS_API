import { getIngredientByIdService,  } from "../services/ingredientServices";
import { catchAsyncError } from "../middlewares/catchAsyncError";

export const getIngredientById = catchAsyncError(async (req, res) => {
    const ingredientId = req.params.ingredientId;
    
    // Call the service to get ingredient details
    const ingredient = await getIngredientByIdService(ingredientId);
    
    res.status(200).json({
        status : "success",
        message: 'Ingredient details fetched successfully',
        data: { ingredient },
    });
    });

export const createIngredient = catchAsyncError(async (req, res) => {
    const ingredientData = req.body;
    const ingredient = await createIngredientService(req.user.hotelId, ingredientData);
    res.status(201).json({
        status : "success",
        message: 'Ingredient created successfully',
        data: { ingredient },
    });
});

export const updateIngredient = catchAsyncError(async (req, res) => {
    const ingredientId = req.params.ingredientId;
    const ingredientData = req.body;
    const ingredient = await updateIngredientService(ingredientId, ingredientData);
    res.status(200).json({
        status : "success",
        message: 'Ingredient updated successfully',
        data: { ingredient },
    });
});


export const deleteIngredient = catchAsyncError(async (req, res) => {
    const ingredientId = req.params.id;
    await deleteIngredientService(ingredientId);
    res.status(200).json({
        status : "success",
        message: 'Ingredient deleted successfully',
    });
});

export const getAllIngredients = catchAsyncError(async (req, res) => {
    // Call the service to fetch all ingredients
    const ingredients = await getAllIngredientsService();
    res.status(200).json({
        status : "success",
        message: 'All ingredients fetched successfully',
        data: { ingredients },
    });
});

export const getIngredientsOfHotel = catchAsyncError(async (req, res) => {
    const ingredients = await getIngredientsOfHotelService(req.user.hotelId);
    res.status(200).json({
        status : "success",
        message: 'All ingredients of hotel fetched successfully',
        data: { ingredients },
    });
});





