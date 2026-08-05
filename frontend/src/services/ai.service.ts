import { apiClient } from './apiClient';
import {
  PredictionRequest,
  PredictionResponse,
  RecoveryRequest,
  RecoveryResponse,
  ChatRequest,
  ChatResponse,
} from '@/types/domain';

export const requestPrediction = async (payload: PredictionRequest): Promise<PredictionResponse> => {
  const { data } = await apiClient.post<PredictionResponse>('/predict', payload);
  return data;
};

export const requestRecovery = async (payload: RecoveryRequest): Promise<RecoveryResponse> => {
  const { data } = await apiClient.post<RecoveryResponse>('/recover', payload);
  return data;
};

export const sendChatMessage = async (payload: ChatRequest): Promise<ChatResponse> => {
  const { data } = await apiClient.post<ChatResponse>('/chat', payload);
  return data;
};
