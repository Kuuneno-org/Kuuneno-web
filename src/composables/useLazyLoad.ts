import { ref, onMounted, onBeforeUnmount, Ref } from 'vue';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  loadingClass?: string;
  errorClass?: string;
}

export function useLazyLoad(
  imageRef: Ref<HTMLImageElement | HTMLVideoElement | null>,
  options: LazyLoadOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    loadingClass = 'lazy-loading',
    errorClass = 'lazy-error',
  } = options;

  const isLoaded = ref(false);
  const hasError = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const element = imageRef.value;
    if (!element) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadAsset(element);
            observer?.unobserve(element);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
  });

  function loadAsset(element: HTMLImageElement | HTMLVideoElement): void {
    const src = element.getAttribute('data-src');
    if (!src) return;

    element.classList.add(loadingClass);
    if (element instanceof HTMLImageElement) {
      loadImage(element, src);
    } else if (element instanceof HTMLVideoElement) {
      loadVideo(element, src);
    }
  }

  function loadImage(img: HTMLImageElement, src: string): void {
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.classList.remove(loadingClass);
      img.classList.add('lazy-loaded');
      isLoaded.value = true;
    };
    tempImg.onerror = () => {
      img.classList.remove(loadingClass);
      img.classList.add(errorClass);
      hasError.value = true;
    };
    tempImg.src = src;
  }

  function loadVideo(video: HTMLVideoElement, src: string): void {
    video.src = src;
    video.classList.remove(loadingClass);
    video.classList.add('lazy-loaded');
    isLoaded.value = true;
  }

  function load(): void {
    const element = imageRef.value;
    if (element && observer) {
      observer.unobserve(element);
      loadAsset(element);
    }
  }

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });

  return { isLoaded, hasError, load };
}

export const vLazyLoad = {
  mounted(el: HTMLImageElement | HTMLVideoElement, binding: any) {
    const src = typeof binding.value === 'string' ? binding.value : binding.value?.src;
    if (!src) return;
    el.setAttribute('data-src', src);
    const options = typeof binding.value === 'object' ? binding.value : {};
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (el instanceof HTMLImageElement) {
              el.src = src;
            } else if (el instanceof HTMLVideoElement) {
              el.src = src;
            }
            el.classList.add('lazy-loaded');
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px',
      }
    );
    observer.observe(el);
  },
};
