import path from 'path';
import { browserLauncher, loadStylesIntoCache } from '@oshuster/pdf-generator';

export const initPdfService = async () => {
  await browserLauncher();
  await loadStylesIntoCache(path.resolve(__dirname, '../../styles/documents'));
  await loadStylesIntoCache(
    path.resolve(__dirname, '../../styles/all-pdf-styles')
  );

  console.log(
    'STYLE_PATH: ',
    path.resolve(__dirname, '../../styles/all-pdf-styles')
  );
  console.log(
    'STYLE_PATH: ',
    path.resolve(__dirname, '../../styles/all-pdf-styles')
  );
};
