import _ from 'lodash';
//import ROT from 'rot-js';

//require('exports-loader?ROT!../node_modules/rot-js/dist/rot.js')

//require('exports-loader?ROT,parse=helpers.parse!../node_modules/rot-js/dist/rot.js')



//require('exports-loader?[ROT]!../node_modules/rot-js/dist/rot.js')
import * as ROT from 'rot-js'


function component() {
  console.log('inside')
  let element = document.createElement('div');

  // Lodash, currently included via a script, is required for this line to work
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());

let Game = {
  init: function(){
    this.display = new ROT.Display()
    document.body.appendChild(this.display.getContainer())
    this.generateMap()
  },
  generateMap: function(){
    let digger = new ROT.Map.Digger()
    
    let digCallback = function(x, y, value){
      if(value){return}
      let key = x+","+y
      this.map[key] = "."
    }
    
    digger.create(digCallback.bind(this))
    this.drawWholeMap()
  },
  drawWholeMap: function(){
    for(let key in this.map){
      let parts = key.split(",")
      let x = parseInt(parts[0])
      let y = parseInt(parts[1])
      this.display.draw(x, y, this.map[key])
    }
  }
}

Game.init()

