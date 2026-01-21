import { onBeforeUnmount, ref } from "vue";

export function useAudio(url: string, opts?: { loop?: boolean; volume?: number }) {
  const audio = ref<HTMLAudioElement | null>(null);

  const init = () => {
    if (audio.value) return;
    const a = new Audio(url);
    a.loop = opts?.loop ?? true;
    a.volume = opts?.volume ?? 0.25;
    a.preload = "auto";
    audio.value = a;
  };

  const play = async () => {
    init();
    if (!audio.value) return;
    await audio.value.play();
  };

  const stop = () => {
    if (!audio.value) return;
    audio.value.pause();
    audio.value.currentTime = 0;
  };

  onBeforeUnmount(() => stop());

  return { audio, init, play, stop };
}
