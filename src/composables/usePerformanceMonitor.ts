import { ref, onMounted, onBeforeUnmount } from 'vue';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memory?: { used: number; limit: number };
  apiLatencies: number[];
  avgApiLatency: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 60,
    frameTime: 16,
    apiLatencies: [],
    avgApiLatency: 0,
  };
  private frameCount = 0;
  private lastTime = performance.now();
  private fpsInterval: ReturnType<typeof setInterval> | null = null;
  private maxLatencyHistory = 50;

  startFPSMonitoring(): void {
    let lastFrameTime = performance.now();
    const measureFrame = () => {
      const now = performance.now();
      this.metrics.frameTime = now - lastFrameTime;
      lastFrameTime = now;
      this.frameCount++;
      if (this.frameCount % 30 === 0) {
        const elapsed = performance.now() - this.lastTime;
        this.metrics.fps = Math.round((this.frameCount / elapsed) * 1000);
        this.frameCount = 0;
        this.lastTime = performance.now();
      }
      requestAnimationFrame(measureFrame);
    };
    requestAnimationFrame(measureFrame);
  }

  startMemoryMonitoring(): void {
    if (!performance.memory) return;
    this.fpsInterval = setInterval(() => {
      const memStats = performance.memory;
      this.metrics.memory = {
        used: Math.round(memStats.usedJSHeapSize / 1048576),
        limit: Math.round(memStats.jsHeapSizeLimit / 1048576),
      };
    }, 1000);
  }

  recordApiLatency(latencyMs: number): void {
    this.metrics.apiLatencies.push(latencyMs);
    if (this.metrics.apiLatencies.length > this.maxLatencyHistory) {
      this.metrics.apiLatencies.shift();
    }
    this.metrics.avgApiLatency =
      this.metrics.apiLatencies.reduce((a, b) => a + b, 0) /
      this.metrics.apiLatencies.length;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  cleanup(): void {
    if (this.fpsInterval) {
      clearInterval(this.fpsInterval);
      this.fpsInterval = null;
    }
  }
}

const globalMonitor = new PerformanceMonitor();

export function usePerformanceMonitor() {
  const metrics = ref<PerformanceMetrics>(globalMonitor.getMetrics());

  const recordApiLatency = (latencyMs: number) => {
    globalMonitor.recordApiLatency(latencyMs);
    metrics.value = globalMonitor.getMetrics();
  };

  const getMetrics = () => globalMonitor.getMetrics();

  onMounted(() => {
    globalMonitor.startFPSMonitoring();
    globalMonitor.startMemoryMonitoring();
    const updateInterval = setInterval(() => {
      metrics.value = globalMonitor.getMetrics();
    }, 100);

    onBeforeUnmount(() => {
      clearInterval(updateInterval);
      globalMonitor.cleanup();
    });
  });

  return { metrics, recordApiLatency, getMetrics };
}

export async function monitoredFetch(
  url: string,
  options?: RequestInit,
  onLatency?: (latencyMs: number) => void
): Promise<Response> {
  const start = performance.now();
  try {
    const response = await fetch(url, options);
    const latency = performance.now() - start;
    onLatency?.(latency);
    return response;
  } catch (error) {
    const latency = performance.now() - start;
    onLatency?.(latency);
    throw error;
  }
}
