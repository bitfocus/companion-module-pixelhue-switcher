import jwt from 'jsonwebtoken'

export const generateToken = (sn: string, secret: string): string => {
	return jwt.sign(
		{
			SN: sn,
		},
		secret,
		{
			algorithm: 'HS256',
			noTimestamp: true,
		},
	)
}

export function realMerge<T extends object>(to: T, from: Partial<T>): T {
	for (const key in from) {
		if (typeof to[key] !== 'object' || to[key] === null) {
			to[key] = from[key] as T[Extract<keyof T, string>]
		} else if (typeof from[key] === 'object' && from[key] !== null) {
			to[key] = realMerge(to[key] as object, from[key] as object) as T[Extract<keyof T, string>]
		}
	}
	return to
}
