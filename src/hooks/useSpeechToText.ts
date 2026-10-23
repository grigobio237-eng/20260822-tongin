'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: (initialText?: string) => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

/**
 * 중복 단어 및 중복 어절 제거 함수
 * 모바일 안드로이드 Web Speech API의 단어 반복/누적 에코 현상을 완벽하게 필터링합니다.
 */
function cleanDuplicatePhrases(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return trimmed;

  // 1. 바로 인접한 단일 단어 중복 제거 (예: "김치냉장고 김치냉장고" -> "김치냉장고")
  const dedupedWords: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (i === 0 || words[i] !== words[i - 1]) {
      dedupedWords.push(words[i]);
    }
  }

  // 2. 바로 인접한 다중 어절 중복 제거 (예: "김치냉장고 코드 김치냉장고 코드" -> "김치냉장고 코드")
  let tokens = dedupedWords;
  for (let len = 6; len >= 2; len--) {
    if (tokens.length < len * 2) continue;
    const newTokens: string[] = [];
    let i = 0;
    while (i < tokens.length) {
      if (i + len * 2 <= tokens.length) {
        const p1 = tokens.slice(i, i + len).join(' ');
        const p2 = tokens.slice(i + len, i + len * 2).join(' ');
        if (p1 === p2) {
          newTokens.push(...tokens.slice(i, i + len));
          i += len * 2;
          continue;
        }
      }
      newTokens.push(tokens[i]);
      i++;
    }
    tokens = newTokens;
  }

  return tokens.join(' ');
}

export function useSpeechToText(onResult?: (text: string) => void): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const baseTextRef = useRef('');
  const sessionTranscriptRef = useRef('');
  const onResultRef = useRef(onResult);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    const recognition = new SpeechRecognition();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 2);

    // 모바일 환경에서는 continuous: true 시 resultIndex가 0에 고정되거나 이전 문장이 계속 누적되어 단어가 반복되는 안드로이드 크로미움 버그가 발생합니다.
    // 따라서 모바일에서는 continuous: false로 깔끔하게 단일 발화를 받고, 녹음 중일 때는 onend에서 자동 재연결하여 끊김 없이 수신합니다.
    recognition.continuous = !isMobile;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';

    recognition.onresult = (event: any) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) {
          finalChunk += piece;
        } else {
          interimChunk += piece;
        }
      }

      if (finalChunk) {
        const trimmed = finalChunk.trim();
        if (trimmed) {
          if (!sessionTranscriptRef.current) {
            sessionTranscriptRef.current = trimmed;
          } else {
            const prev = sessionTranscriptRef.current.trim();
            // 안드로이드 크롬의 경우 이전 발화 전체를 포함한 누적 결과를 finalChunk로 보내는 경우가 많으므로
            // 이전 문구로 시작하면 덮어쓰고, 그렇지 않을 때만 공백과 함께 이어붙입니다.
            if (trimmed.startsWith(prev)) {
              sessionTranscriptRef.current = trimmed;
            } else if (!prev.endsWith(trimmed)) {
              sessionTranscriptRef.current = `${prev} ${trimmed}`;
            }
          }
        }
      }

      const currentSpoken = interimChunk
        ? (sessionTranscriptRef.current ? `${sessionTranscriptRef.current} ${interimChunk.trim()}` : interimChunk.trim())
        : sessionTranscriptRef.current;

      const cleanedSpoken = cleanDuplicatePhrases(currentSpoken);
      setTranscript(cleanedSpoken);

      if (onResultRef.current && cleanedSpoken) {
        const combined = baseTextRef.current
          ? `${baseTextRef.current} ${cleanedSpoken}`
          : cleanedSpoken;
        onResultRef.current(combined);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        if (sessionTranscriptRef.current) {
          const finalSpoken = cleanDuplicatePhrases(sessionTranscriptRef.current);
          if (finalSpoken) {
            baseTextRef.current = baseTextRef.current
              ? `${baseTextRef.current} ${finalSpoken}`
              : finalSpoken;
          }
          sessionTranscriptRef.current = '';
        }

        // 사용자가 아직 녹음 중지 버튼을 누르지 않았다면 모바일/안드로이드에서도 계속 듣도록 자동 재시작
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.warn('Auto restart failed:', err);
              isListeningRef.current = false;
              setIsListening(false);
            }
          }
        }, 150);
        return;
      }

      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startListening = useCallback((initialText?: string) => {
    setError(null);
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    baseTextRef.current = (initialText || '').trim();
    sessionTranscriptRef.current = '';
    isListeningRef.current = true;
    setIsListening(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Failed to start recognition:', err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Failed to stop recognition:', err);
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    sessionTranscriptRef.current = '';
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
