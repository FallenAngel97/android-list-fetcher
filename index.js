const https = require('https');
const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');
const { execSync } = require('child_process');

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
			return packages;
		}).then((packages) => {
			console.log(packages);
			fs.promises.readdir('scripts').then((files => {
				if(files.length == 0) return;

				files.filter(f => f != '.gitkeep').forEach((file) => {
					execSync(`scripts/${file} ${JSON.stringify(packages)}`).toString();
				});
			}))
		})
		.catch(err => console.error(err));
}

main();
