import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = `${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`

export async function handler(event) {
    try {
        logger.info('start verify');
        const jwtToken = await verifyToken(event.authorizationToken)

        logger.info('end verify');
        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        logger.error('User not authorized', { error: e.message })

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}

async function verifyToken(authHeader) {
    const token = getToken(authHeader)
    const jwt = jsonwebtoken.decode(token, { complete: true })
    //get key
    const apiGetKeys = await Axios.get(jwksUrl);
    const keys = apiGetKeys.data;
    const singing_keys = keys.keys.filter(k => k.kid === jwt.header.kid);

    if (!singing_keys.length)
        throw new Error("No keys found");

    const cer = `-----BEGIN CERTIFICATE-----\n${singing_keys[0]?.x5c[0]}\n-----END CERTIFICATE-----`;

    return jsonwebtoken.verify(token, cer, { algorithms: ['RS256'] });
}

function getToken(authHeader) {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return token
}
