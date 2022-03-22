module.exports = {
	tokensFilePath: process.env.TOKENS_FILE_PATH,
	searchInputFilePath: process.env.SEARCH_INPUT_FILE_PATH,
	outDir: process.env.OUT_DIR,
	csvSeparator: process.env.CSV_SEPARATOR || ';',
	redis: process.env.REDIS_HOST ? {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT || 6379,
	} : null,
	workerConcurrency: process.env.WORKER_CONCURRENCY
		? parseInt(process.env.WORKER_CONCURRENCY, 10)
		: 5,
	clear: process.env.CLEAR
		? !!parseInt(process.env.CLEAR, 10)
		: false,
	adsArchiveLimit: process.env.ADS_ARCHIVE_LIMIT
		? parseInt(process.env.ADS_ARCHIVE_LIMIT, 10)
		: 100,
};
