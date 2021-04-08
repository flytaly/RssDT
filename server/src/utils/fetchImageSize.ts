import axios, { AxiosError } from 'axios';
import imageSize from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import stream from 'stream';
import { UserAgent } from '../constants.js';

export const fetchImageSize = async (iconUrl: string) => {
  const axiosInstance = axios.create({ headers: { 'User-Agent': UserAgent }, timeout: 10000 });
  axiosInstance.defaults.timeout = 10000;
  try {
    return await new Promise<ISizeCalculationResult | undefined>((resolve, reject) => {
      let buffer = Buffer.from([]);
      let size: ISizeCalculationResult | undefined;
      const resp = axiosInstance.get(iconUrl, { responseType: 'stream' });
      resp
        .then(({ data }) => {
          const dataStream = data as stream.Readable;
          dataStream.on('data', (chunk: Buffer) => {
            buffer = Buffer.concat([buffer, chunk]);
            try {
              size = imageSize(buffer);
              if (size) {
                resolve(size);
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
            resolve(size);
          });
        })
        .catch((e) => reject(e));
    });
  } catch (error) {
    const e = error as AxiosError;
    console.log(`Error fetching icon ${iconUrl}. ${e.message}`);
  }
  return null;
};
