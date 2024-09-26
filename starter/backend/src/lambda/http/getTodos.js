import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../utils.mjs'
import { getAll } from '../../businessLogic/todos.mjs'

export const handler = middy()
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
    .handler(async (event) => {
        console.log('Processing event: ', event)
        const userId = getUserId(event)
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }

        try {
            const todos = await getAll(userId);
            return {
                statusCode: 200,
                headers: headers,
                body: JSON.stringify({
                    todos
                })
            }
        } catch (error) {
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({
                    error
                })
            }
        }
    })
