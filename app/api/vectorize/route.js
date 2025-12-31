import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(request) {
  const { image } = await request.json();

  if (!image) {
    return NextResponse.json({ error: 'Image data is required.' }, { status: 400 });
  }

  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const tempFileName = `${uuidv4()}.png`;
  const tempFilePath = path.join('/tmp', tempFileName);

  try {
    await writeFile(tempFilePath, buffer);

    const pythonScriptPath = path.resolve(process.cwd(), 'scripts/vectorize.py');

    const command = `python ${pythonScriptPath} ${tempFilePath}`;

    const svgContent = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject('Failed to vectorize image.');
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        resolve(stdout);
      });
    });

    await unlink(tempFilePath);

    return NextResponse.json({ svg: svgContent });
  } catch (error) {
    console.error(error);
    // Clean up the file if it exists
    try {
      await unlink(tempFilePath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
