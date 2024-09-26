import { v4 as uuidv4 } from 'uuid'
import { TodoAccess } from '../dataLayer/todoAccess.mjs'
import { createLogger } from '../utils/logger.mjs';
import { S3AttachmentUtils } from '../fileStorage/attachment-utils.mjs'
const logger = createLogger('businessTodo')
const todoAccess = new TodoAccess();
const attachment = new S3AttachmentUtils()

export const getAll = async (userId) => {
    return await todoAccess.getAllTodos(userId);
}

export const create = async (newTodoData, userId) => {
    logger.info('input', newTodoData)
    const todoId = uuidv4();
    const createAt = new Date().toISOString();
    const newTodo = {
        userId: userId,
        todoId: todoId,
        createAt: createAt,
        done: false,
        ...newTodoData
    }
    return await todoAccess.createTodo(newTodo)
}

export const update = async (userId, todoId, newData) => {
    return await todoAccess.updateTodo(userId, todoId, newData)
}

export const generateUploadUrl = async (userId, todoId) => {
    var url = await attachment.getUploadUrl(todoId)
    await todoAccess.saveImageUrl(userId, todoId)
    return url
}

export const deleteTodo = async (userId, todoId) => {
    await attachment.deleteImage(todoId);
    return await todoAccess.deleteTodo(userId, todoId)
}