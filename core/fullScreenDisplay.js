'use strict';

module.exports = (function () {

  var canvas   = document.createElement('canvas'),
      ctx      = canvas.getContext('2d');

  function resize () {

    if (window.innerHeight < window.innerWidth) {
      canvas.width  = window.innerHeight;
      canvas.height = window.innerHeight;
    } else {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerWidth;
    }
    
    console.log('New board size: ' + canvas.width + ' x ' + canvas.height);
    
  }


  window.document.body.appendChild(canvas);
  window.document.body.style.margin     = '0 auto';
  window.document.body.style.overflow   = 'hidden';
  window.document.body.style.background = '#000';
  
  canvas.style.display                  = 'block';
  canvas.style.margin                   = '0 auto';
  
  canvas.setAttribute('oncontextmenu', 'return false');

  canvas.ctx = ctx;

  resize();

  window.addEventListener('resize', resize, false);

  return {
    'canvas' : canvas,
    'ctx'    : ctx,
    'resize' : resize
  };

}());
