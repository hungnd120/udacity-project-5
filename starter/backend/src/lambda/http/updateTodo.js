


import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { update } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('updateTodo')

export const handler = middy()
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
    .handler(async (event) => {
        logger.info('Processing event: ', event)
        const todoId = event.pathParameters.todoId
        const newData = JSON.parse(event.body)
        const userId = getUserId(event)
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }

        try {
            await update(userId, todoId, newData)
            return {
                statusCode: 200,
                headers: headers,
            }
        } catch (error) {
            logger.error(`error: ${error}`)
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({
                    error
                })
            }
        }
    })
