import { PutObjectCommand, S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const bucketName = process.env.TODO_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export class S3AttachmentUtils {
    constructor() {
        this.s3Client = new S3Client()
        this.bucketName = bucketName
        this.urlExpiration = urlExpiration
    }

    async getUploadUrl(todoId) {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: todoId
        })
        const url = await getSignedUrl(this.s3Client, command, {
            expiresIn: urlExpiration
        })
        return url
    }

    async deleteImage(key) {
        try {
            const get_command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key
            })
            await getSignedUrl('getObject', get_command);
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            })
            await this.s3Client.send(command)
        } catch (error) {
            if (error.name === 'NotFound') { 
                return
            } else {
                return
            }
        }
    }
}




