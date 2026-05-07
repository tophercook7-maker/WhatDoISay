import { useCallback, useState } from 'react';

import { generateAiRescue, modifyAiReply, useMockAi } from '../services/aiReplyService';
import {
  generateRescue as mockGenerateRescue,
  modifyReply as mockModifyReply,
} from '../services/replyService';
import {
  GeneratedReply,
  ModificationType,
  ReplyRequest,
  RescueResult,
  Strategy,
  StrategyId,
} from '../types';

interface ReplyWorkflowOptions {
  canUseTextReply: () => boolean;
  incrementTextReply: () => Promise<unknown>;
  onLimitReached: () => void;
  refreshRemoteState: () => Promise<void>;
  saveReply: (reply: GeneratedReply) => Promise<void>;
}

export function useReplyWorkflow({
  canUseTextReply,
  incrementTextReply,
  onLimitReached,
  refreshRemoteState,
  saveReply,
}: ReplyWorkflowOptions) {
  const [currentRescue, setCurrentRescue] = useState<RescueResult | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<StrategyId | null>(null);
  const [currentReply, setCurrentReply] = useState<GeneratedReply | null>(null);
  const [lastRequest, setLastRequest] = useState<ReplyRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRescue = useCallback(
    async (request: ReplyRequest) => {
      setError('');

      if (!request.userInput.trim() && !request.pastedMessage?.trim()) {
        setError('Add a little context first.');
        return null;
      }

      if (useMockAi && !canUseTextReply()) {
        onLimitReached();
        return null;
      }

      setLoading(true);
      setLastRequest(request);
      setSelectedStrategyId(null);
      setCurrentReply(null);

      try {
        const result = useMockAi
          ? { rescue: await mockGenerateRescue(request), source: 'mock' as const }
          : await generateAiRescue(request);

        const rescueResult: RescueResult = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          rescue: result.rescue,
          request,
          createdAt: new Date().toISOString(),
        };

        setCurrentRescue(rescueResult);

        if (useMockAi) {
          await incrementTextReply();
        } else {
          await refreshRemoteState();
        }

        return rescueResult;
      } catch (rescueError) {
        const message = getWorkflowErrorMessage(rescueError);
        if (message.includes('free replies')) {
          onLimitReached();
        }
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [canUseTextReply, incrementTextReply, onLimitReached, refreshRemoteState],
  );

  const selectStrategy = useCallback(
    async (id: StrategyId) => {
      if (!currentRescue) return;
      const strategy = currentRescue.rescue.strategies.find((s) => s.id === id);
      if (!strategy) return;

      const reply: GeneratedReply = {
        id: `${currentRescue.id}-${id}`,
        text: strategy.text,
        request: currentRescue.request,
        actionType: 'generate',
        createdAt: new Date().toISOString(),
      };

      setSelectedStrategyId(id);
      setCurrentReply(reply);

      // Mock-mode persistence: real mode already saved the canonical row server-side.
      if (useMockAi) {
        await saveReply(reply);
      }
    },
    [currentRescue, saveReply],
  );

  const modifyReply = useCallback(
    async (modification: ModificationType) => {
      if (!currentReply || !currentRescue || !selectedStrategyId) return;

      if (useMockAi && !canUseTextReply()) {
        onLimitReached();
        return;
      }

      setError('');
      setLoading(true);

      try {
        const result = useMockAi
          ? { reply: await mockModifyReply(currentReply.text, modification), source: 'mock' as const }
          : await modifyAiReply({
              actionType: modification,
              originalRequest: currentReply.request,
              previousReply: currentReply.text,
            });

        const updatedText = result.reply;
        const updatedReply: GeneratedReply = {
          id: `${currentReply.id}-${modification}-${Date.now()}`,
          text: updatedText,
          request: currentReply.request,
          actionType: modification,
          createdAt: new Date().toISOString(),
        };

        // Reflect the change inside the rescue card too, so the UI stays consistent.
        setCurrentRescue({
          ...currentRescue,
          rescue: {
            ...currentRescue.rescue,
            strategies: currentRescue.rescue.strategies.map((s): Strategy =>
              s.id === selectedStrategyId ? { ...s, text: updatedText } : s,
            ),
          },
        });

        setCurrentReply(updatedReply);

        if (useMockAi) {
          await incrementTextReply();
          await saveReply(updatedReply);
        } else {
          await refreshRemoteState();
        }
      } catch (modifyError) {
        const message = getWorkflowErrorMessage(modifyError);
        if (message.includes('free replies')) {
          onLimitReached();
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [
      canUseTextReply,
      currentRescue,
      currentReply,
      incrementTextReply,
      onLimitReached,
      refreshRemoteState,
      saveReply,
      selectedStrategyId,
    ],
  );

  const tryAgain = useCallback(async () => {
    if (lastRequest) {
      await generateRescue(lastRequest);
    }
  }, [generateRescue, lastRequest]);

  return {
    currentRescue,
    currentReply,
    error,
    generateRescue,
    loading,
    modifyReply,
    selectedStrategyId,
    selectStrategy,
    tryAgain,
  };
}

function getWorkflowErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unable to get a reply right now.';
}
