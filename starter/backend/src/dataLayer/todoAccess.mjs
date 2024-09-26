import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('Access')

export class TodoAccess {
    constructor(
        documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
        todosTable = process.env.TODOS_TABLE,
        bucketName = process.env.TODO_S3_BUCKET,
        todosIndex = process.env.TODOS_SECOND_INDEX
    ) {
        this.documentClient = documentClient
        this.todosTable = todosTable
        this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
        this.bucketName = bucketName
        this.todosIndex = todosIndex
    }

    async getAllTodos(userId) {
        logger.info('Getting all todos')

        var params = {
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };

        const result = await this.dynamoDbClient.query(params)

        ////get Attachment url
        //result.Items.map(i => {
        //    i.attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${i.todoId}`
        //})
        return result.Items
    }

    async createTodo(newTodo) {
        logger.info(`Creating a todo with id ${newTodo.todoId}`)
        await this.dynamoDbClient.put({
            TableName: this.todosTable,
            Item: newTodo
        })
        return newTodo
    }

    async updateTodo(userId, todoId, newData) {
        logger.info(`Start update with id: ${todoId}`)
        const update_params = {
            TableName: this.todosTable,
            Key: { userId, todoId },
            UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done ',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done',
            },
            ExpressionAttributeValues: {
                ':name': newData.name,
                ':dueDate': newData.dueDate,
                ':done': newData.done,
            }
        }
        await this.dynamoDbClient.update(update_params);
    }


    async saveImageUrl(userId, todoId) {
        logger.info(`Start save url with id: ${todoId}`)
        const url = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
        const update_params = {
            TableName: this.todosTable,
            Key: { userId, todoId },
            UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
            ExpressionAttributeNames: {
                '#attachmentUrl': 'attachmentUrl'
            },
            ExpressionAttributeValues: {
                ':attachmentUrl': url
            }
        }
        await this.dynamoDbClient.update(update_params);
    }

    async deleteTodo(userId, todoId) {
        logger.info(`Start delete with id: ${todoId}`)
        const delete_params = {
            TableName: this.todosTable,
            Key: { userId: userId, todoId: todoId },
        }
        await this.dynamoDbClient.delete(delete_params);
    }
}
