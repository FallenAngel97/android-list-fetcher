const https = require('https');
const { XMLParser } = require('fast-xml-parser');
const fs = require('fs');
const { execSync, exec } = require('child_process');

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

const { REPOSITORIES } = process.env;

function cloneRepos(reposList, packages) {
	if (!reposList || !Array.isArray(reposList) || reposList.length == 0) return Promise.resolve();

	return new Promise((resolve, reject) => {
		try {
			reposList.map((repo, index) => {
				execSync(`git clone ${repo} repo${index}`).toString();
				const files = fs.readdirSync(`repo${index}/scripts`, { withFileTypes: true })
				if(files.length == 0) return;

				files.filter(f => f.isFile() && f.name != '.gitkeep').forEach((file) => {
					console.log(execSync(`./repo${index}/scripts/${file.name} "${JSON.stringify(packages)}"`).toString());
				});
			});
			resolve();
		} catch (ex) {
			reject(ex);
		}
		finally {
			execSync('rm -rf repo*');
		}
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
			return [...new Set(packages)];
		}).then((packages) => {
			console.log(packages);

			cloneRepos(REPOSITORIES?.split(' '), packages);
		})
		.catch(err => console.error(err));
}

main();
