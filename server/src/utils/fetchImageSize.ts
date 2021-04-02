import axios from 'axios';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import stream from 'stream';
import { UserAgent } from '../constants';

export const fetchImageSize = async (iconUrl: string) => {
  const axiosInstance = axios.create({ headers: { 'User-Agent': UserAgent }, timeout: 20000 });
  axiosInstance.defaults.timeout = 20000;
  try {
    const res: [number, number] | null = await new Promise((resolve, reject) => {
      let buffer = Buffer.from([]);
      let size: ISizeCalculationResult | undefined;
      const resp = axiosInstance.get(iconUrl, { responseType: 'stream' });
      resp.then(({ data }) => {
        const dataStream = data as stream.Readable;
        dataStream.on('data', (chunk: Buffer) => {
          buffer = Buffer.concat([buffer, chunk]);
          try {
            size = imageSize(buffer);
            if (size) {
              dataStream.destroy();
            }
          } catch (error) {
            reject(error);
            dataStream.destroy();
          }
        });
        dataStream.on('error', (err) => reject(err));
        dataStream.on('end', () => {
          if (!size || !size.width || !size.height) reject(new Error("Couldn't fetch sizes"));
          resolve([size!.width!, size!.height!]);
        });
      });
    });
    return res;
  } catch (error) {
    console.log(error);
  }
  return null;
};
