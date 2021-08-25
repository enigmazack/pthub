<template>
  <img alt="Vue logo" src="../assets/icon-128.png" />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
  <HelloElement msg="Hello Vue 3.0 + Element Plus + Vite" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import HelloElement from './components/HelloElement.vue'

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld,
    HelloElement
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
