import { writable, get } from 'svelte/store';
import { board } from './board.js';
import { urlEncode64 } from './constants.js';
import { customMix } from './store.js';

class Marble {
  constructor() {
    
  }
  get color() {
    return this.constructor.color;
  }
}

class BlueMarble extends Marble {
  static color = 'blue';
}

class RedMarble extends Marble {
  static color = 'red';
}

export const marbles = writable({numbers: {left: 8, right: 8}, edit: {}});
marbles.reset = function (left, right) {
  // Removes marbles from the board, and refills the left and right marble trays.
  // Updates the number of marbles, if set.
  board.update(($board) => {
    if ($board.marble) {
      $board.marble = false;
      $board.position = false;
    }
    return $board;
  });

  this.update($marbles => {
    const $customMix = get(customMix);

    if ($customMix)
    {
      let mix = $customMix.split("-");
      mix.left = mix[0];
      mix.right = mix[1];
      $marbles.numbers = {left: mix.left.length, right: mix.right.length};
      $marbles.left = mix.left.split('').map(color => color === 'r'? new RedMarble(): new BlueMarble());
      $marbles.right = mix.right.split('').map(color => color === 'r'? new RedMarble(): new BlueMarble());
    }
    else if (typeof left !== "undefined" && typeof right !== "undefined")
    {
      $marbles.numbers = {left, right};
      $marbles.left = [...Array($marbles.numbers.left)].map(i => new BlueMarble());
      $marbles.right = [...Array($marbles.numbers.right)].map(i => new RedMarble());
    }
        
    $marbles.results = [];
    return $marbles;
  });
}
marbles.encode = function () {
  // Returns an URL encoded string of the numbers of marbles for left and right
  let $marbles = get(this);
  return urlEncode64[$marbles.numbers.left] + urlEncode64[$marbles.numbers.right];
}
marbles.decode = function (code) {
  if (code) {
    let left = urlEncode64.indexOf(code[0]);
    let right = urlEncode64.indexOf(code[1]);
    if (left <= 20 && right <= 20) this.reset(left, right);
  } else this.reset(8, 8);
}

marbles.reset();

