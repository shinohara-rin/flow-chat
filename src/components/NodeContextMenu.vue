<script setup lang="ts">
import type { MessageRole } from '~/types/messages'

defineProps<{
  x: number
  y: number
  role?: MessageRole
}>()

defineEmits<{
  (e: 'fork'): void
  (e: 'forkWith'): void
  (e: 'focusIn'): void
  (e: 'delete'): void
  (e: 'copy'): void
}>()
</script>

<template>
  <div
    data-testid="node-context-menu"
    class="context-menu fixed z-100 rounded py-2 shadow-lg"
    bg="white dark:gray-800"
    border="~ gray-200 dark:gray-700"
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <div data-testid="node-menu-copy" @click="$emit('copy')">
      Copy
    </div>
    <div v-if="role === 'user'" data-testid="node-menu-fork" @click="$emit('fork')">
      Fork
    </div>
    <div v-if="role === 'user'" data-testid="node-menu-fork-with" @click="$emit('forkWith')">
      Fork With...
    </div>
    <div data-testid="node-menu-focus-in" @click="$emit('focusIn')">
      Focus In
    </div>
    <div data-testid="node-menu-delete" text-red-500 @click="$emit('delete')">
      Delete Node
    </div>
  </div>
</template>

<style scoped>
.context-menu > div {
  @apply cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700;
}
</style>
