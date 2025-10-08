<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    preserveAspectRatio="none"
    class="chart"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(125,95,255,0.45)" />
        <stop offset="100%" stop-color="rgba(125,95,255,0)" />
      </linearGradient>
    </defs>
    <path :d="areaPath" :fill="gradientUrl" />
    <path :d="linePath" stroke="rgba(166, 128, 255, 0.95)" fill="none" stroke-width="2" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  points: Array<{ timestamp: string; value: number }>;
  width?: number;
  height?: number;
}>();

const width = props.width ?? 300;
const height = props.height ?? 120;
const gradientId = `spark-${Math.random().toString(36).slice(2, 8)}`;
const gradientUrl = computed(() => `url(#${gradientId})`);

const normalized = computed(() => {
  if (!props.points.length) return [];
  const values = props.points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return props.points.map((p, idx) => {
    const x = (idx / (props.points.length - 1 || 1)) * width;
    const y = height - ((p.value - min) / range) * (height - 10) - 5;
    return { x, y };
  });
});

const linePath = computed(() => {
  if (!normalized.value.length) return '';
  return normalized.value
    .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
});

const areaPath = computed(() => {
  if (!normalized.value.length) return '';
  const start = `M ${normalized.value[0].x} ${height}`;
  const lines = normalized.value
    .map((point) => `L ${point.x} ${point.y}`)
    .join(' ');
  const end = `L ${normalized.value.at(-1)?.x ?? 0} ${height} Z`;
  return `${start} ${lines} ${end}`;
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
