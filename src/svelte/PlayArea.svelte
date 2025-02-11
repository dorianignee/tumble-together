<script>
  import GameBoard from './GameBoard.svelte';
  import PartsTray from  './PartsTray.svelte';
  import Hand from './Hand.svelte';

  import { holding } from '../store.js';
  import { board } from '../board.js';
  import { marbles } from '../marbles.js';
  import { parts } from '../parts.js';
  import { socket } from '../socket.js';

  let mousePosition = {};
  let lastGrab = {x: false, y: false, timeout: false};
  let boardElement;


  function getBoardPosition(pageX, pageY) {
    // Returns x,y coordinates based on the position on the board element that the user has selected.
    let boardRect = boardElement.getBoundingClientRect();
    let x = Math.floor((pageX - (boardRect.left + window.scrollX)) / (boardRect.width / $board[0].length));
    let y = Math.floor((pageY - (boardRect.top + window.scrollY)) / (boardRect.height / $board.length));
    if (pageX > (boardRect.left + window.scrollX) && pageX < (boardRect.right + window.scrollX) &&
        pageY > (boardRect.top + window.scrollY) && pageY < (boardRect.bottom + window.scrollY) &&
        $board.isValid(x, y)) return [x, y];
    else return false;
  }

  function setMousePosition(e) {
    mousePosition.left = e.pageX;
    mousePosition.top = e.pageY;
  }

  function touchMove(e, force=false) {
    if (e.touches.length === 1 && ($holding || force)) {
      setMousePosition(e.touches[0]);
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function drop(e, force=false) {
    // Places the currently held part on the board, otherwise returns it to the parts tray.
    if ($holding && ((e.type === 'mouseup' && e.button === 0) ||
        (e.type === 'touchend' && e.changedTouches.length === 1 && e.touches.length === 0) || force)) {
      let boardPosition;
      if (e.type === 'touchend') boardPosition = getBoardPosition(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
      else boardPosition = getBoardPosition(e.pageX, e.pageY);
      if (!$board.marble && boardPosition && (!$holding.requiresSlot || $board.hasSlot(...boardPosition)) &&
          !$board[boardPosition[1]][boardPosition[0]]) {
        $board[boardPosition[1]][boardPosition[0]] = $holding;
        if (lastGrab.x === boardPosition[0] && lastGrab.y === boardPosition[1]) {
          $board.flip(...boardPosition);
          console.log(`Flipped ${$holding.name}`);
        }
        console.log(`Placed ${$holding.name}`);
        let flipableNeighbors = Array.from($board.flipableNeighbors(...boardPosition));
        if (flipableNeighbors.length > 1) flipableNeighbors.forEach(part => part.facing = flipableNeighbors[1].facing);
        
        // flip every gear in a non-slot position, so they animate correctly
        for (let row = 0; row < 11; ++row) {
          for (let col = 0; col < 11; ++col) {
            if (!$board.hasSlot(col, row) && $board[col][row]) {
              $board[col][row].facing = $board[col][row].facing + 1 % 2;
            }
          }
        }
      }else{
        $parts.find(part => part.name === $holding.name).count++;
        $parts = $parts;
        console.log(`Dropped ${$holding.name}`);
      }
      if (lastGrab.timeout) window.clearTimeout(lastGrab.timeout)
      $holding = false;
      $board = $board;
      socket.sendBoard();
      e.preventDefault();
      e.stopPropagation();
    }
  }

</script>

<div id="play-area" class:grabbed={$holding}
    on:mousemove={setMousePosition}
    on:mouseup={drop}
    on:mouseleave="{e => drop(e, true)}"
    on:touchmove={touchMove}
    on:touchend={drop}>
  <GameBoard bind:boardElement bind:lastGrab on:touch="{e => touchMove(e.detail)}"/>
  <PartsTray on:touch="{e => touchMove(e.detail, true)}"/>
</div>
<Hand {mousePosition}/>

<style>
  #play-area {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 92%;
    margin: auto;
  }
  @media (max-aspect-ratio: 7/9) {
    #play-area {
      flex-direction: column;
    }
  }
  .grabbed {
    cursor: grabbing;
  }
</style>