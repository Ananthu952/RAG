import api from './axios';
import { Document } from '../types';

export const fetchDocuments = async (): Promise<Document[]> => {
  const response = await api.get('/documents');
  return response.data;
};

export const uploadDocument = async (file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};