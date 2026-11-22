import type { RequestHandler } from 'express'
import { HttpError } from './httpError.js'

const readMethods = new Set(['GET', 'HEAD', 'OPTIONS'])

function isHttpOrigin(value: string) {
  const url = URL.parse(value)
  return !!url && (url.protocol === 'http:' || url.protocol === 'https:')
    && url.origin === value && !url.hostname.includes('*')
}

export function developmentOrigins(port = '5173', additional = ''): ReadonlySet<string> {
  const origins = new Set(['localhost', '127.0.0.1'].map(host => new URL(`http://${host}:${port}`).origin))
  for (const origin of additional.split(',').map(value => value.trim()).filter(Boolean)) {
    if (!isHttpOrigin(origin)) {
      throw new Error('SPARTIN_DEV_ORIGINS must contain exact HTTP(S) origins without paths or wildcards.')
    }
    origins.add(origin)
  }
  return origins
}

export function requireSameOriginForWrites(allowedOrigins?: ReadonlySet<string>): RequestHandler {
  return (req, _res, next) => {
    if (readMethods.has(req.method)) return next()

    const source = req.get('origin')
    const site = req.get('sec-fetch-site')
    const target = `${req.protocol}://${req.get('host')}`
    if (site === 'cross-site' || site === 'same-site'
      || (source !== undefined && (source !== target || !isHttpOrigin(source)))
      || ((source !== undefined || site !== undefined) && allowedOrigins && !allowedOrigins.has(target))) {
      throw new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'Open SpartIN directly to perform this action.')
    }
    next()
  }
}
