import { useCallback, useState } from 'react';

import { generateAiReply, modifyAiReply, useMockAi } from '../services/aiReplyService';
import { generateReply as mockGenerateReply, modifyReply as mockModifyReply } from '../services/replyService';
import { GeneratedReply, ModificationType, ReplyRequest } from '../types';

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
  const [currentReply, setCurrentReply] = useState<GeneratedReply | null>(null);
  const [lastRequest, setLastRequest] = useState<ReplyRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReply = useCallback(
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

      try {
        const result = useMockAi ? { reply: await mockGenerateReply(request), source: 'mock' as const } : await generateAiReply(request);
        const text = result.reply;
        const reply = toGeneratedReply(text, request, 'generate');
        if (useMockAi) {
          await incrementTextReply();
        }
        setCurrentReply(reply);
        if (useMockAi) {
          await saveReply(reply);
        } else {
          await refreshRemoteState();
        }
        return reply;
      } catch (replyError) {
        const message = getWorkflowErrorMessage(replyError);
        if (message.includes('free replies')) {
          onLimitReached();
        }
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [canUseTextReply, incrementTextReply, onLimitReached, refreshRemoteState, saveReply],
  );

  const modifyReply = useCallback(
    async (modification: ModificationType) => {
      if (!currentReply) {
        return;
      }

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
        const text = result.reply;
        const reply = toGeneratedReply(text, currentReply.request, modification);
        if (useMockAi) {
          await incrementTextReply();
        }
        setCurrentReply(reply);
        if (useMockAi) {
          await saveReply(reply);
        } else {
          await refreshRemoteState();
        }
      } catch (replyError) {
        const message = getWorkflowErrorMessage(replyError);
        if (message.includes('free replies')) {
          onLimitReached();
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [canUseTextReply, currentReply, incrementTextReply, onLimitReached, refreshRemoteState, saveReply],
  );

  const tryAgain = useCallback(async () => {
    if (lastRequest) {
      if (useMockAi) {
        await generateReply(lastRequest);
        return;
      }

      if (!currentReply) {
        await generateReply(lastRequest);
        return;
      }

      setError('');
      setLoading(true);

      try {
        const result = await modifyAiReply({
          actionType: 'try-again',
          originalRequest: lastRequest,
          previousReply: currentReply.text,
        });
        const reply = toGeneratedReply(result.reply, lastRequest, 'generate');
        setCurrentReply(reply);
        await refreshRemoteState();
      } catch (replyError) {
        const message = getWorkflowErrorMessage(replyError);
        if (message.includes('free replies')) {
          onLimitReached();
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    }
  }, [currentReply, generateReply, lastRequest, onLimitReached, refreshRemoteState]);

  return {
    currentReply,
    error,
    generateReply,
    loading,
    modifyReply,
    tryAgain,
  };
}

function getWorkflowErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to get a reply right now.';
}

function toGeneratedReply(
  text: string,
  request: ReplyRequest,
  actionType: GeneratedReply['actionType'],
): GeneratedReply {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    request,
    actionType,
    createdAt: new Date().toISOString(),
  };
}
