import { getTableByIdService,getTablesService, createTableService , deleteTableService, updateTableService } from '../services/tableService.js';
import { ClientError, ServerError } from '../utils/errorHandler.js'; // Import the custom error classes
import { catchAsyncError} from '../middlewares/catchAsyncError.js';

export const getTableById = catchAsyncError(async (req, res) => {
    const tableId = req.params.id;
    const table = await getTableByIdService(tableId);
    res.status(200).json({
        success: true,
        message: 'Table fetched successfully',
        data: { table },
    });
});

export const getTables = catchAsyncError(async (req, res) => {
    const tables = await getTablesService(req.user);
    res.status(200).json({
        success: true,
        message: 'Tables fetched successfully',
        data: { tables },
    });
});

export const createTable = catchAsyncError(async (req, res) => {
    const tableData = req.body;
    const table = await createTableService(req.user, tableData);
    res.status(201).json({
        success: true,
        message: 'Table created successfully',
        data: { table },
    });
});

export const updateTable = catchAsyncError(async (req, res) => {
    const tableId = req.params.id;
    const tableData = req.body;
    const table = await updateTableService(req.user, tableId, tableData);
    res.status(200).json({
        success: true,
        message: 'Table updated successfully',
        data: { table },
    });
});

export const deleteTable = catchAsyncError(async (req, res) => {
    const tableId = req.params.id;
    await deleteTableService(req.user, tableId);
    res.status(200).json({
        success: true,
        message: 'Table deleted successfully',
    });
});

export const occupyTable = catchAsyncError(async (req, res) => {
    const tableId = req.params.id;
    await occupyTableService(req.user, tableId);
    res.status(200).json({
        success: true,
        message: 'Table occupied successfully',
    });
});

export const freeTable = catchAsyncError(async (req, res) => {
    const tableId = req.params.id;
    await freeTableService(req.user, tableId);
    res.status(200).json({
        success: true,
        message: 'Table freed successfully',
    });
});

// export const getAllTablesOfHotel = catchAsyncError(async (req, res) => {
//     const tables = await getAllTablesOfHotelService(req.user);
//     res.status(200).json({
//         success: true,
//         message: 'Tables fetched successfully',
//         data: { tables },
//     });
// });

