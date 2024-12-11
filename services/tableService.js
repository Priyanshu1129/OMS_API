import Table from '../models/tableModel.js';
import { ClientError, ServerError } from '../utils/errorHandler.js';
import { ROLES } from '../utils/constant.js';

export const getTableByIdService = async (tableId) => {
    try {

        const table = await Table.findById(tableId).populate('hotelId', 'name');
        if (!table) {
        throw new ClientError('Table not found', 404);
        }
        
        //not needed as already handled by middleware
        // if (user.role === ROLES.TABLE_OWNER && table.ownerId.toString() !== user.id) {
        // throw new ClientError('Access denied. You can only view your own table.', 403);
        // }
        table.populate('hotelId', 'name');
        return table;
    } catch (error) {
        if(error instanceof ClientError) throw error;
        else throw new ServerError('Error while fetching table details');
    }
    }

export const getTablesService = async (user) => {
    try {
        // const tables = user.role === ROLES.TABLE_OWNER ? await Table.find({ ownerId: user.id }) : await Table.find();
        console.log(user);
        const tables = await Table.find({ hotelId: user.hotelId }).populate('hotelId', 'name');
        

        return tables;
    } catch (error) {
        if(error instanceof ClientError) { throw new error; }
        else throw new ServerError('Error while fetching tables');
    }
}

export const createTableService = async (user, tableData) => {
    try {
        const table = new Table({ ...tableData, hotelId: user.hotelId });
        await table.save();
        return table;
    } catch (error) {
        throw new ServerError('Error while creating table');
    }
}

export const updateTableService = async (user, tableId, tableData) => {
    try {
        const table = await getTableByIdService(user, tableId);
        Object.assign(table, tableData);
        await table.save();
        return table;
    } catch (error) {
        if(error instanceof ClientError) { throw error; }
        else throw new ServerError('Error while updating table');
    }
}

export const deleteTableService = async (user, tableId) => {
    try {
        const table = await getTableByIdService(user, tableId);
        await table.remove();
    } catch (error) {
        if(error instanceof ClientError) { throw error; }
        else
        throw new ServerError('Error while deleting table');
    }
}

export const occupyTableService = async (user, tableId) => {
    try {
        const table = await getTableByIdService(user, tableId);
        if (table.status === 'occupied') {
        throw new ClientError('Table is already occupied', 400);
        }
        table.status = 'occupied';
        await table.save();
    } catch (error) {
        if(error instanceof ClientError) { throw error; }
        else
        throw new ServerError('Error while occupying table');
    }
}

export const freeTableService = async (user, tableId) => {
    try {
        const table = await getTableByIdService(user, tableId);
        if (table.status === 'free') {
        throw new ClientError('Table is already free', 400);
        }
        table.status = 'free';
        await table.save();
    } catch (error) {
        if(error instanceof ClientError) { throw error; }
        else
        throw new ServerError('Error while freeing table');
    }
}

// export const getAllTablesOfHotelService = async (user) => {
//     try {
//         const tables = await Table.find({ hotelId: user.hotelId });
//         return tables;
//     } catch (error) {
//         throw new ServerError('Error while fetching tables');
//     }
// }
