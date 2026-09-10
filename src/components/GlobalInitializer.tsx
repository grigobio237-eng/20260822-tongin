'use client';
import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export default function GlobalInitializer() {
  const fetchSettings = useSettingsStore(state => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return null;
}
