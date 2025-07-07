export const retry = async (request, retryCount) => {
	let curRetryCount = retryCount
	try {
		await request()
	} catch (e) {
		curRetryCount -= 1
		if (curRetryCount > 0) {
			await retry(request, curRetryCount)
		} else {
			throw Error
		}
	}
}
