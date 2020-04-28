import {urlEncode64} from './constants.js';
import components from './components.js';

export default class Board extends Array {
  constructor(boardArray) {
    super(...boardArray);
    this.complete = () => false;
  }
  startRun(marble, start='left') {
    if (this.marble) return false;
    this.marble = marble;
    this.position = {x: start === 'left' ? 3 : 7, y: 0};
    this.direction = start === 'left' ? 1 : -1;

    let result;

    while (this.marble && this.tick()) {
      if (this.position.y === 11)
        result = {marble: this.marble, side: this.direction > 0 ? 'right' : 'left'};
      else if (this.position.y === 10 && this.position.x != 5) 
        result = {marble: this.marble, side: this.position.x > 5 ? 'right' : 'left'};
      if (result) {
        this.marble = false;
        return result;
      }
    }
    return false;
  }
  tick() {
    if (this.marble) {
      let result = false;
      let part = this[this.position.y][this.position.x]
      if (part) {
        if (part.stopsMarble) return false;
        if (part.flipsOnMarble) {
          if (part.flipsNeighbors) {
            let partsToFlip = new Set();
            partsToFlip.add(part);
            const adjacent = (x, y) => {
              let adjacentPositions = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(pos => [pos[0] + x, pos[1] + y]);
              let adjacentFlippingPositions = adjacentPositions.filter(pos => {
                let partAtPos = this.at(...pos);
                console.log(partAtPos);
                 return (partAtPos && partAtPos.flipsNeighbors &&
                         !partsToFlip.has(partAtPos));
              });
              console.log(adjacentFlippingPositions);
              adjacentFlippingPositions.forEach(pos => partsToFlip.add(this.at(...pos)));
              adjacentFlippingPositions.forEach(pos => adjacent(...pos));
            }
            adjacent(this.position.x, this.position.y);
            partsToFlip.forEach(part => part.flip());
            console.log(partsToFlip);
          }else part.flip();
        }
        result = part.handleMarble(this.direction);
        if (result) this.position = {x: this.position.x + result, y: this.position.y + 1};
        if (this.position.x < 0 && this.position.x > this[0].length) result = false;
      }
      if (result === false) {
        this.marble = false;
        throw `Marble has escaped at ${this.position.x}, ${this.position.y}!`;
      }
      this.direction = result;
      return true;
    }
  }
  at(x, y) {
    if ((this.position.x > 0 && this.position.x < this[0].length) &&
        (this.position.y > 0 && this.position.y < this.length))
      return this[y][x];
    else return false;
  }
  isValid(x, y) {
    // Returns true for positions on the 11x11 grid that can be used.
    if (y === 0 && (x < 2 || x > 8 || x === 5)) return false;
    else if (y === 1 && (x === 0 || x === 10)) return false;
    else if (y === 10 && x != 5) return false;
    else return true;
  }
  hasSlot(x, y) {
    return Boolean((x + y) % 2) ;
  }
  encode() {
    let encodedBoard = ''

    this.forEach(row => {
      for (let position=0; position < row.length; position++) {
        if (!row[position]) {
          let restOfRow = row.slice(position + 1)
          let numberOfBlanks = restOfRow.findIndex(component => component);
          if (numberOfBlanks < 0) numberOfBlanks = restOfRow.length;
          encodedBoard += urlEncode64[numberOfBlanks];
          position += numberOfBlanks;
        } else {
          encodedBoard += urlEncode64[row[position].constructor.code[row[position].facing]];
        }
      }
    });
    return encodedBoard;
  }
  static create(boardCode=null) {
    let board = [...Array(11)];
    if (boardCode) {
      if (!/^[a-zA-Z0-9-_]*$/.test(boardCode)) throw 'Code is not base64 url encoded!'
      else if (boardCode.length < 11) throw 'Code is too short!'
      else{
        let position = 0;
        const componentsList = Object.values(components)
        board = board.map(() => {
          let row = [];
          while (row.length < 11 && position < boardCode.length) {
            let code = urlEncode64.indexOf(boardCode[position]);
            if (code < 11) row.push(...Array(code + 1));
            else {
              let componentClass = componentsList.find(component => component.code.includes(code));
              if (componentClass) row.push(new componentClass(componentClass.code.indexOf(code)));
              else throw 'Invalid code!'
            }
            position++;
          }
          return row;
        });
      }
    } else board = board.map(() => Array(11));
    return new Board(board);
  }
}


