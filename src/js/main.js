/* global Rx */
//import Snap from 'imports-loader?this=>window,fix=>module.exports=0!snapsvg/dist/snap.svg.js';
Rx.Observable
  .interval(200)
  .take(9)
  .map(x => x + '!!!')
  .bufferCount(3)
  .subscribe(console.log);
