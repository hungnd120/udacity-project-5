


import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { generateUploadUrl } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('uploadImage')

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
        const userId = getUserId(event)
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }

        try {
            const url = await generateUploadUrl(userId, todoId)
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({
                    url
                })
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
