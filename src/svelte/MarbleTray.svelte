<script>
  import { fly } from 'svelte/transition';
  import { basePath } from '../store.js';

  export let marbles = [];
  export let direction = 'left';
  export let result = false;
</script>

<div id="marble-tray" class:right="{direction==='right'}">
  {#each marbles as marble, i (i)}
  {#if result}
    <img src="{$basePath}images/marble{marble.color}.svg" alt="{marble.color} marble"
      in:fly|global="{{ x: -200, duration: 600 }}">
  {:else}
    <img src="{$basePath}images/marble{marble.color}.svg" alt="{marble.color} marble">
  {/if}
  {/each}
</div>

<style>
  #marble-tray {
    width: 90%;
    height: 1.44vh;
    display: flex;
    flex-direction: row;
    justify-content: left;
  }

  #marble-tray.right {
    margin-left: auto;
    flex-direction: row-reverse;
    justify-content: right;
  }

  #marble-tray img {
    width: 1.44vh;
    height: 1.44vh;
  }

  @media (max-aspect-ratio: 7/9) {
    #marble-tray {
      height: 1.92vw;
    }
    #marble-tray img{
      width: 1.92vw;
      height: 1.92vw;
    }
  }
</style>