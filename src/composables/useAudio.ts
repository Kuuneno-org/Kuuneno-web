import { onBeforeUnmount, ref } from "vue";

export function useAudio(url: string, opts?: { loop?: boolean; volume?: number }) {
  const audio = ref<HTMLAudioElement | null>(null);
  const isPlaying = ref(false);

  const init = () => {
    if (audio.value) return;
    const a = new Audio(url);
    a.loop = opts?.loop ?? true;
    a.volume = opts?.volume ?? 0.25;
    a.preload = "auto";

    a.addEventListener("play", () => { isPlaying.value = true; });
    a.addEventListener("pause", () => { isPlaying.value = false; });
    a.addEventListener("ended", () => { isPlaying.value = false; });

    audio.value = a;
  };

  const play = async () => {
    init();
    if (!audio.value) return;
    try {
      await audio.value.play();
    } catch (err) {
      console.warn("Audio play failed:", err);
      throw err;
    }
  };

  const pause = () => {
    if (!audio.value) return;
    audio.value.pause();
  };

  const stop = () => {
    if (!audio.value) return;
    audio.value.pause();
    audio.value.currentTime = 0;
  };

  onBeforeUnmount(() => {
    stop();
    if (audio.value) {
      audio.value = null;
    }
  });

  return { audio, init, play, stop, pause, isPlaying };
}
