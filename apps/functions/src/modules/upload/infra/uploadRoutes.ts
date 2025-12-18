// Upload endpoints for storing documents
import express from 'express';
import { getDatabasePool } from '../../../shared/infra/database';
import { logger } from '../../../shared/utils/logger';
import { handleError } from '../../../shared/utils/errorHandler';
import { v4 as uuidv4 } from 'uuid';

const uploadRouter = express.Router();
const pool = getDatabasePool();

// Increase body limit for file uploads (base64 encoded)
// Note: This router should be mounted after bodyParser with higher limit

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
}

interface DatabaseFileRow {
  id: string;
  name: string;
  type: string;
  data?: Buffer;
  size?: number;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: Date | string;
}

interface FileMetadataRow {
  id: string;
  name: string;
  type: string;
  size: number;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at: Date | string;
}

// Upload file (base64 encoded in body)
uploadRouter.post('/', async (req, res) => {
  try {
    const { name, type, data, entityType, entityId } = req.body;

    if (!name || !data) {
      return res.status(400).json({ error: 'name and data are required' });
    }

    // Extract base64 data (remove data URL prefix if present)
    const base64Data = data.includes(',') ? data.split(',')[1] : data;
    const buffer = Buffer.from(base64Data, 'base64');
    const size = buffer.length;

    // Generate unique ID
    const id = uuidv4();
    const createdAt = new Date();

    // Store in database
    await pool.execute(
      `INSERT INTO uploaded_files (id, name, type, size, data, entity_type, entity_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, type || 'application/octet-stream', size, buffer, entityType || null, entityId || null, createdAt]
    );

    // Return file metadata (without data)
    const file: UploadedFile = {
      id,
      name,
      type: type || 'application/octet-stream',
      size,
      url: `/api/upload/${id}`,
      createdAt: createdAt.toISOString(),
    };

    res.status(201).json({ success: true, data: file });
  } catch (error: unknown) {
    const errorMessage = handleError(error, { 
      operation: 'file_upload',
      fileName: name 
    });
    res.status(500).json({ error: errorMessage });
  }
});

// Get file by ID (returns file data)
uploadRouter.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute<DatabaseFileRow[]>(
      'SELECT id, name, type, data FROM uploaded_files WHERE id = ?',
      [req.params.id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = rows[0];
    if (!file.data) {
      logger.warn('File data is missing', { fileId: file.id });
      return res.status(404).json({ error: 'File data not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', file.type);
    res.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
    res.send(file.data);
  } catch (error: unknown) {
    const errorMessage = handleError(error, { 
      operation: 'get_file',
      fileId: req.params.id 
    });
    res.status(500).json({ error: errorMessage });
  }
});

// Get file metadata (without data)
uploadRouter.get('/:id/metadata', async (req, res) => {
  try {
    const [rows] = await pool.execute<FileMetadataRow[]>(
      'SELECT id, name, type, size, entity_type, entity_id, created_at FROM uploaded_files WHERE id = ?',
      [req.params.id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = rows[0];
    res.json({
      success: true,
      data: {
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: `/api/upload/${file.id}`,
        entityType: file.entity_type ?? null,
        entityId: file.entity_id ?? null,
        createdAt: file.created_at,
      }
    });
  } catch (error: unknown) {
    const errorMessage = handleError(error, { 
      operation: 'get_file_metadata',
      fileId: req.params.id 
    });
    res.status(500).json({ error: errorMessage });
  }
});

// Delete file
uploadRouter.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute<{ affectedRows: number }>(
      'DELETE FROM uploaded_files WHERE id = ?', 
      [req.params.id]
    );
    
    if (Array.isArray(result) && result[0]?.affectedRows === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    logger.info('File deleted', { fileId: req.params.id });
    res.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = handleError(error, { 
      operation: 'delete_file',
      fileId: req.params.id 
    });
    res.status(500).json({ error: errorMessage });
  }
});

// List files for entity
uploadRouter.get('/entity/:entityType/:entityId', async (req, res) => {
  try {
    const [rows] = await pool.execute<FileMetadataRow[]>(
      'SELECT id, name, type, size, created_at FROM uploaded_files WHERE entity_type = ? AND entity_id = ?',
      [req.params.entityType, req.params.entityId]
    );

    if (!Array.isArray(rows)) {
      return res.status(500).json({ error: 'Invalid database response' });
    }

    const files = rows.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: `/api/upload/${file.id}`,
      createdAt: file.created_at,
    }));

    res.json({ success: true, data: files, count: files.length });
  } catch (error: unknown) {
    const errorMessage = handleError(error, { 
      operation: 'list_files_for_entity',
      entityType: req.params.entityType,
      entityId: req.params.entityId 
    });
    res.status(500).json({ error: errorMessage });
  }
});

export { uploadRouter };
