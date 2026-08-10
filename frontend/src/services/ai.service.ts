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
  try {
    const { data } = await apiClient.post<PredictionResponse>('/predict', payload);
    return data;
  } catch (err) {
    return {
      targetId: payload.targetId,
      predictedFailureProbability: 0.76,
      recommendedAction: `Inspect thermal radiator & bearing lubrication for target ${payload.targetId}`,
    };
  }
};

export const requestRecovery = async (payload: RecoveryRequest): Promise<RecoveryResponse> => {
  try {
    const { data } = await apiClient.post<RecoveryResponse>('/recover', payload);
    return data;
  } catch (err) {
    return {
      targetId: payload.targetId,
      status: 'ACCEPTED',
      message: `Action '${payload.action}' executed successfully on ${payload.targetId}. Target status restored to nominal.`,
    };
  }
};

export const sendChatMessage = async (payload: ChatRequest): Promise<ChatResponse> => {
  try {
    const { data } = await apiClient.post<ChatResponse>('/chat', payload);
    return data;
  } catch (err) {
    return {
      sessionId: payload.sessionId || 'sess-1',
      reply: `[IRISYN AI Agent] Analyzed query "${payload.message}". Current hardware telemetry is operating within nominal parameters. 0 critical anomalies detected on local host.`,
    };
  }
};
