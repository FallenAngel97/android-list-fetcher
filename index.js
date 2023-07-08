const https = require('https');
const { XMLParser } = require('fast-xml-parser');

function getRawAndroidListXml() {
	return new Promise((resolve, reject) => {
		https.get('https://dl.google.com/android/repository/repository2-1.xml', (resp) => {
			let data = '';
			resp.on('data', (chunk) => {
				data += chunk;
			});
			resp.on('end', () => {
				resolve(data);
			});
		}).on("error", (err) => {
			reject(err);
		});
	});
}

function main() {
	getRawAndroidListXml()
		.then(res => {
			const parser = new XMLParser();
			const json = parser.parse(res);
			const packages = json['sdk:sdk-repository']
				.remotePackage
				.filter(pack => /Android SDK Platform [0-9]+$/.test(pack['display-name']))
				.map((pack) => pack['type-details']['api-level']);
			console.log(packages);
		})
		.catch(err => console.error(err));
}

main();
