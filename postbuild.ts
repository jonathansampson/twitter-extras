import { copyFile, mkdir, readdir } from 'fs/promises';

async function main () {
    // Copy manifest and options to dist
    copyFile('./src/manifest.json', './dist/manifest.json');
    copyFile('./src/options.html', './dist/options.html');

    // Copy icons to dist
    try {
        await mkdir('./dist/icons');
    } catch (err) {} finally {
        const icons = await readdir('./src/icons');
        for (const icon of icons) {
            copyFile(`./src/icons/${icon}`, `./dist/icons/${icon}`);
        }
    }

    // Copy images to dist
    try {
        await mkdir('./dist/images');
    } catch (err) {} finally {
        const images = await readdir('./src/images');
        for (const image of images) {
            copyFile(`./src/images/${image}`, `./dist/images/${image}`);
        }
    }
}

main();