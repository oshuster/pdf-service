import { uploadStylesService } from '../services/pdfServices/uploadStylesService.js';

export const uploadStylesController = async (req, res) => {
  try {
    const result = await uploadStylesService(req.file);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
