import config from 'config';
import { CSV } from 'mat-utils';
import Downloader from './downloader';

(async () => {
	try {
		CSV
			.setSeparator(config.get('csvSeparator'));
		await Downloader.init();
		await Downloader.start();
		await Downloader.exit();
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
})();
