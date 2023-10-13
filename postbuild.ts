import { copyFile, mkdir, readdir } from 'fs/promises';

async function main () {
    // Copy manifest and options to dist
    copyFile('./src/manifest.json', './dist/manifest.json');
    copyFile('./src/options.html', './dist/options.html');

    // Copy icons to dist
    try {
        await mkdir('./dist/icons');
    } catch (err) {} finally {
        try {
            const icons = await readdir('./src/icons');
            for (const icon of icons) {
                copyFile(`./src/icons/${icon}`, `./dist/icons/${icon}`);
            }
        } catch (e) {
            console.error('No icons found. Please add icons to ./src/icons');
        }
    }

    // Copy images to dist
    try {
        await mkdir('./dist/images');
    } catch (err) {} finally {
        try {
            const images = await readdir('./src/images');
            for (const image of images) {
                copyFile(`./src/images/${image}`, `./dist/images/${image}`);
            }
        } catch (e) {
            console.error('No images found. Please add images to ./src/images');
        }
    }
}

main();