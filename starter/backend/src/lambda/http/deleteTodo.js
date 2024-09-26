


import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { deleteTodo } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('deleteTodo')

export const handler = middy()
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
    .handler(async (event) => {
        logger.info('Processing event: ', event)
        const userId = getUserId(event)
        const todoId = event.pathParameters.todoId
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }

        try {
            await deleteTodo(userId, todoId);
            return {
                statusCode: 200,
                headers: headers,
            }
        } catch (error) {
            logger.error(`error: ${error.message}`)
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({
                    error
                })
            }
        }
    })
