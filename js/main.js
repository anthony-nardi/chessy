
window.addEventListener('DOMContentLoaded', function () {

  var display = require('../core/fullScreenDisplay'),
      Chess   = require('../core/chess'),
      
      isMobile           = 'ontouchstart' in document.documentElement,

      mouseUpEvent       = isMobile ? 'touchend'   : 'mouseup',
      mouseDownEvent     = isMobile ? 'touchstart' : 'mousedown',
      mouseMoveEvent     = isMobile ? 'touchmove'  : 'mousemove',

      PLAYER_COLOR       = 'w',
      PIECE_COOLDOWN_MS  = 10000,

      BLACK_SQUARE_COLOR = '#d18b47',
      WHITE_SQUARE_COLOR = '#ffce9e',
      NUMBER_OF_ROWS     = 8,
      NUMBER_OF_COLS     = 8,
      WHITE_PAWN         = '\u2659',
      WHITE_KNIGHT       = '\u2658',
      WHITE_BISHOP       = '\u2657',
      WHITE_ROOK         = '\u2656',
      WHITE_QUEEN        = '\u2655',
      WHITE_KING         = '\u2654',
      BLACK_PAWN         = '\u265f',
      BLACK_KNIGHT       = '\u265e',
      BLACK_BISHOP       = '\u265d',
      BLACK_ROOK         = '\u265c',
      BLACK_QUEEN        = '\u265b',
      BLACK_KING         = '\u265a',

      COLUMN_MAP         = {
        0: 'a',
        1: 'b',
        2: 'c',
        3: 'd',
        4: 'e',
        5: 'f',
        6: 'g',
        7: 'h'
      },

      ROW_MAP            = {
        0: 8,
        1: 7,
        2: 6,
        3: 5,
        4: 4,
        5: 3,
        6: 2,
        7: 1
      },

      NOTATION_MAP       = {},

      chessEngine,
      availableMoves     = {
        'b': [],
        'w': []
      },

      placeSound  = new Audio('audio/place.mp3');

  window.NOTATION_MAP = NOTATION_MAP;

  function playPlaceSound () {
    placeSound.play();
  }

  function beginPieceCooldownVisual (square) {
    
    var startTime    = Date.now(),
        ctx          = display.ctx,
        canvas       = display.canvas,
        row          = square.rowIndex,
        col          = square.colIndex,
        squareWidth  = canvas.width / NUMBER_OF_COLS,
        squareHeight = canvas.height / NUMBER_OF_ROWS,
        rowOffset    = isMobile ? 0.8 : 0.90,
        scale        = isMobile ? squareWidth / 12 : squareWidth / 10;

    square.piece.cooldown = true;
    
    function tick () {
      var currentTime = Date.now(),
          arc         = 2 * Math.PI * (((PIECE_COOLDOWN_MS - (currentTime - startTime)) / PIECE_COOLDOWN_MS));
        
      ctx.fillStyle = square.color;
      ctx.fillRect(col * squareWidth, row * squareHeight, squareWidth, squareHeight);
      ctx.save();
      ctx.fillStyle = '#000';
      ctx.scale(scale, scale);
      ctx.fillText(square.piece.type, (col * squareWidth / scale), ((row + rowOffset) * squareWidth / scale));
      ctx.restore();
      
      if (currentTime - startTime < PIECE_COOLDOWN_MS) {
        ctx.beginPath();
        ctx.strokeStyle = '#4CFF4C';
        ctx.lineWidth = isMobile ? 4 : 10;
        ctx.arc(col * squareWidth  + squareWidth / 2, row * squareHeight + squareHeight / 2, (isMobile ? 33/3 : 33), 0, arc, false);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = 'black';
        window.requestAnimationFrame(tick);
      } else {
        console.log('Piece is ready to be moved.');
        square.piece.cooldown = false;
      }
    }

    window.requestAnimationFrame(tick);
  }

  function getInitialChessPiece (square) {

    var piece;
    
    switch (square) {
      case 'a2':
      case 'b2':
      case 'c2':
      case 'd2':
      case 'e2':
      case 'f2': 
      case 'g2':
      case 'h2':
        piece = {
          'type' : WHITE_PAWN,
          'color': 'w',
          'prefix': ''
        };
        break;
      case 'a7':
      case 'b7':
      case 'c7':
      case 'd7':
      case 'e7':
      case 'f7':
      case 'g7':
      case 'h7':
        piece = {
          'type': BLACK_PAWN,
          'color': 'b',
          'prefix': ''
        };
        break;
      case 'a1':
      case 'h1':
        piece = {
          'type': WHITE_ROOK,
          'color': 'w',
          'prefix': 'R'
        };
        break;
      case 'a8':
      case 'h8':
        piece = {
          'type': BLACK_ROOK,
          'color': 'b',
          'prefix': 'R'
        };
        break;
      case 'b1':
      case 'g1':
        piece = {
          'type': WHITE_KNIGHT,
          'color': 'w',
          'prefix': 'N'
        };
        break;
      case 'b8':
      case 'g8':
        piece = {
          'type': BLACK_KNIGHT,
          'color': 'b',
          'prefix': 'N'
        };
        break;
      case 'c1':
      case 'f1': 
        piece = {
          'type': WHITE_BISHOP,
          'color': 'w',
          'prefix': 'B'
        };
        break;
      case 'c8':
      case 'f8': 
        piece = {
          'type': BLACK_BISHOP,
          'color': 'b',
          'prefix': 'B'
        };
        break;
      case 'd1':
        piece = {
          'type': WHITE_QUEEN,
          'color': 'w',
          'prefix': 'Q'
        };
        break;
      case 'd8': 
        piece = {
          'type': BLACK_QUEEN,
          'color': 'b',
          'prefix': 'Q'
        };
        break;
      case 'e1':
        piece = {
          'type': WHITE_KING,
          'color': 'w',
          'prefix': 'K'
        };
        break;
      case 'e8':
        piece = {
          'type': BLACK_KING,
          'color': 'b',
          'prefix': 'K'
        };
        break;
      default:
        piece = {
          'type': '',
          'color': ''
        };
        break;
    }
    return piece;
  }
  
  function updateAvailableMoves () {
    availableMoves[chessEngine.turn()] = chessEngine.moves();
    chessEngine.swap_color();
    availableMoves[chessEngine.turn()] = chessEngine.moves(); 
    chessEngine.swap_color();
  }

  function initChessBoard (color) {
    
    var squareColor,
        currentSquare;

    PLAYER_COLOR = color;

    for (var colIndex = 0; colIndex < NUMBER_OF_COLS; colIndex++) {
     
      for (var rowIndex = 0; rowIndex < NUMBER_OF_ROWS; rowIndex++) {
        if (rowIndex % 2 === 0 && colIndex % 2 === 0) {
          squareColor = WHITE_SQUARE_COLOR;
        } else if (rowIndex % 2 === 0 && colIndex % 2 !== 0) {
          squareColor = BLACK_SQUARE_COLOR;
        } else if (rowIndex % 2 !== 0 && colIndex % 2 === 0) {
          squareColor = BLACK_SQUARE_COLOR;
        } else {
          squareColor = WHITE_SQUARE_COLOR;
        }

        currentSquare = {
          id      : COLUMN_MAP[colIndex] + ROW_MAP[rowIndex],
          color   : squareColor,
          colIndex: colIndex,
          rowIndex: rowIndex
        };

        currentSquare.piece = getInitialChessPiece(currentSquare.id);

        NOTATION_MAP[currentSquare.id] = currentSquare;

      }


    }

    drawChessBoard(NOTATION_MAP);
    
    chessEngine = Chess.Chess();

    console.log(NOTATION_MAP);

    window.chessEngine = chessEngine;
  
    updateAvailableMoves();

    display.canvas.addEventListener(mouseMoveEvent, showMoves);

  }

  function showMovesWhileMoving (squareClicked) {
    var canvas             = display.canvas,
        ctx                = display.ctx,
        squareWidth        = canvas.width / NUMBER_OF_COLS,
        squareHeight       = canvas.height / NUMBER_OF_ROWS,
        moves              = chessEngine.moves({square: squareClicked.id}),
        startingSquare     = [squareClicked.colIndex, squareClicked.rowIndex],
        destinationSquares = [],
        currentMove;

    for (var i = 0; i < moves.length; i++) {
      moves[i] = moves[i].replace('+', '');
      moves[i] = moves[i].replace('#', '');
      if (moves[i].length > 2) {
        currentMove = moves[i].slice(-2);
      } else {
        currentMove = moves[i];
      }
      destinationSquares.push([NOTATION_MAP[currentMove].colIndex, NOTATION_MAP[currentMove].rowIndex]);
    }

    ctx.lineWidth = isMobile ? 2 : 10;
    ctx.beginPath();
    ctx.moveTo(startingSquare[0] * squareWidth + squareWidth / 2, startingSquare[1] * squareHeight + squareHeight / 2);
    
    for (var i = 0; i < destinationSquares.length; i++) {
      ctx.lineTo(destinationSquares[i][0] * squareWidth  + squareWidth / 2, destinationSquares[i][1] * squareHeight + squareHeight / 2);
      ctx.stroke();
      ctx.moveTo(startingSquare[0] * squareWidth + squareWidth / 2, startingSquare[1] * squareHeight + squareHeight / 2);
      ctx.closePath();
    }

    for (var i = 0; i < destinationSquares.length; i++) {
      ctx.beginPath();
      ctx.arc(destinationSquares[i][0] * squareWidth  + squareWidth / 2, destinationSquares[i][1] * squareHeight + squareHeight / 2, (isMobile ? 33/5 : 33), 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.closePath();
    }

  }

  function showMoves (e) {
  
    // If mousedown, dont show moves?  Nah, show moves for currently selected piece...
    if (e.which) {
      return;
    }

    var clickX       = e.offsetX || e.changedTouches[0].clientX,
        clickY       = e.offsetY || e.changedTouches[0].clientY,
        canvas       = display.canvas,
        ctx          = display.ctx,
        squareWidth  = canvas.width / NUMBER_OF_COLS,
        squareHeight = canvas.height / NUMBER_OF_ROWS,
        rowClicked   = Math.floor(clickY / squareHeight),
        colClicked   = Math.floor(clickX / squareWidth),
        pieceClicked = getSquareFromClick(colClicked, rowClicked),
        moves,
        startingSquare,
        destinationSquares,
        currentMove;

    if (!pieceClicked || pieceClicked.piece && pieceClicked.piece.color !== PLAYER_COLOR) {
      drawChessBoard(NOTATION_MAP);
      return;
    }
        
    moves              = getMoves(pieceClicked);
    startingSquare     = [colClicked, rowClicked];
    destinationSquares = [];



    for (var i = 0; i < moves.length; i++) {
      moves[i] = moves[i].replace('+', '');
      moves[i] = moves[i].replace('#', '');
      if (moves[i].length > 2) {
        currentMove = moves[i].slice(-2);
      } else {
        currentMove = moves[i];
      }
      destinationSquares.push([NOTATION_MAP[currentMove].colIndex, NOTATION_MAP[currentMove].rowIndex]);
    }

    drawChessBoard(NOTATION_MAP);

    ctx.lineWidth = isMobile ? 2 : 10;
    ctx.beginPath();
    ctx.moveTo(startingSquare[0] * squareWidth + squareWidth / 2, startingSquare[1] * squareHeight + squareHeight / 2);
    
    for (var i = 0; i < destinationSquares.length; i++) {
      ctx.lineTo(destinationSquares[i][0] * squareWidth  + squareWidth / 2, destinationSquares[i][1] * squareHeight + squareHeight / 2);
      ctx.stroke();
      ctx.moveTo(startingSquare[0] * squareWidth + squareWidth / 2, startingSquare[1] * squareHeight + squareHeight / 2);
      ctx.closePath();
    }

    for (var i = 0; i < destinationSquares.length; i++) {
      ctx.beginPath();
      ctx.arc(destinationSquares[i][0] * squareWidth  + squareWidth / 2, destinationSquares[i][1] * squareHeight + squareHeight / 2, 33, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.closePath();
    }

}

  function drawChessBoard (board) {

    var canvas       = display.canvas,
        ctx          = display.ctx,
        squareWidth  = canvas.width / NUMBER_OF_COLS,
        squareHeight = canvas.height / NUMBER_OF_ROWS,
        scale        = isMobile ? squareWidth / 12 : squareWidth / 10,
        rowOffset    = isMobile ? 0.8 : 0.90,
        currentSquare; 
    
    for (var square in board) {
      if (board.hasOwnProperty(square)) {
        currentSquare = board[square];
        ctx.fillStyle = currentSquare.color;
        ctx.fillRect(currentSquare.colIndex * squareWidth, currentSquare.rowIndex * squareHeight, squareWidth, squareHeight);
        ctx.save();
        ctx.fillStyle = '#000';

        ctx.scale(scale, scale);
        ctx.fillText(currentSquare.piece.type, (currentSquare.colIndex * squareWidth / scale), ((currentSquare.rowIndex + rowOffset) * squareWidth / scale));
        ctx.restore();
      }
    }
  
  }

  function getSquareFromClick (col, row) {
    return NOTATION_MAP[COLUMN_MAP[col] + ROW_MAP[row]];

  }

  function getMoves (square) {
    // console.log('move for turn ' + chessEngine.turn() +  ' for square: ', square);
    if (chessEngine.turn() !== square.piece.color) {
      chessEngine.swap_color();
    }
    // console.log(chessEngine.moves({square: square.id}));
    return chessEngine.moves({square: square.id});
  }

  function getValidMove (toSquare, piece, fromSquare) {
    
    console.log('is move ' + (piece.prefix + toSquare.id) + ' in ', availableMoves[piece.color]);
  
    var validMovesForPiece = chessEngine.moves({'square': fromSquare.id});

    var isCapture = toSquare.piece.type && toSquare.piece.color !== chessEngine.turn() ? 'x' : '';
    var rowId     = fromSquare.id.charAt(1);
    var colId     = fromSquare.id.charAt(0);

    //without row or col specifier
    if (validMovesForPiece.indexOf(piece.prefix + isCapture + toSquare.id) !== -1) {
      return piece.prefix + isCapture + toSquare.id;
    }

    if (validMovesForPiece.indexOf(piece.prefix + isCapture + toSquare.id + '+') !== -1) {
      return piece.prefix + isCapture + toSquare.id + '+';
    }

    if (validMovesForPiece.indexOf(piece.prefix + isCapture + toSquare.id + '#') !== -1) {
      return piece.prefix + isCapture + toSquare.id + '#';
    }

    // with row specifier
    if (validMovesForPiece.indexOf(piece.prefix + rowId + isCapture + toSquare.id) !== -1) {
      return piece.prefix + rowId + isCapture + toSquare.id;
    }

    if (validMovesForPiece.indexOf(piece.prefix + rowId + isCapture + toSquare.id + '+') !== -1) {
      return piece.prefix + rowId + isCapture + toSquare.id + '+';
    }

    if (validMovesForPiece.indexOf(piece.prefix + rowId + isCapture + toSquare.id + '#') !== -1) {
      return piece.prefix + rowId + isCapture + toSquare.id + '#';
    }


    // with col specifier
    if (validMovesForPiece.indexOf(piece.prefix + colId + isCapture + toSquare.id) !== -1) {
      return piece.prefix + colId + isCapture + toSquare.id;
    }

    if (validMovesForPiece.indexOf(piece.prefix + colId + isCapture + toSquare.id + '+') !== -1) {
      return piece.prefix + colId + isCapture + toSquare.id + '+';
    }

    if (validMovesForPiece.indexOf(piece.prefix + colId + isCapture + toSquare.id + '#') !== -1) {
      return piece.prefix + colId + isCapture + toSquare.id + '#';
    }

  }

  function isPawnMovingTwoSquares (targetSquare, movingPiece, fromSquare) {
    if (movingPiece.prefix === '') {
      return (Math.abs(+targetSquare.id.charAt(1) - +fromSquare.id.charAt(1)) === 2);
    }
  }

  function movePawnTwoSquares (targetSquare, movingPiece, fromSquare) {
    
    var fromRow = +fromSquare.id.charAt(1),
        toRow   = +targetSquare.id.charAt(1),
        column  = fromSquare.id.charAt(0),
        inBetweenRow,
        firstMove,
        secondMove = movingPiece.prefix + targetSquare.id;

    if (toRow > fromRow) {
      inBetweenRow = fromRow + 1;
    } else {
      inBetweenRow = fromRow - 1;
    }

    firstMove = movingPiece.prefix + column + inBetweenRow;

    if (chessEngine.turn() !== movingPiece.color) {
      chessEngine.swap_color();
    }

    chessEngine.move(firstMove);
    
    window.emitMove({
      'move'        : firstMove,
      'fromSquare'  : column + fromRow,
      'targetSquare': column + inBetweenRow,
      'movingPiece' : movingPiece
    });

    chessEngine.swap_color();

    chessEngine.move(secondMove);
    
    window.emitMove({
      'move'        : secondMove,
      'fromSquare'  : column + inBetweenRow,
      'targetSquare': column + toRow,
      'movingPiece' : movingPiece
    });

    console.log(chessEngine.ascii());

  }

  function makeMove (targetSquare, movingPiece, fromSquare, validMove) {

    targetSquare.piece = movingPiece;
    
    if (chessEngine.turn() !== movingPiece.color) {
      chessEngine.swap_color();
    }
    
    if (isPawnMovingTwoSquares(targetSquare, movingPiece, fromSquare)) {
      movePawnTwoSquares(targetSquare, movingPiece, fromSquare);
      beginPieceCooldownVisual(targetSquare);
      return;
    }

    chessEngine.move(validMove);

    window.emitMove({
      'move'        : validMove,
      'fromSquare'  : fromSquare.id,
      'targetSquare': targetSquare.id,
      'movingPiece' : movingPiece
    });
    
    beginPieceCooldownVisual(targetSquare);
   
    chessEngine.swap_color();
    
    playPlaceSound();    
  
  }

  function enableMoving (square, click) {

    var canvas       = display.canvas,
        ctx          = display.ctx,
        squareWidth  = canvas.width / NUMBER_OF_COLS,
        scale        = isMobile ? squareWidth / 12 : squareWidth / 10,
        pieceToDraw  = square.piece.type,
        movingPiece  = square.piece;
  
    if (chessEngine.turn() !== square.piece.color) {
      chessEngine.swap_color();
    }

    square.piece = {
      'type': '',
      'color': ''
    };
  
    drawChessBoard(NOTATION_MAP);
    
    function movePiece (e) {

      var x = e.offsetX || e.changedTouches[0].clientX,
          y = e.offsetY || e.changedTouches[0].clientY;

      drawChessBoard(NOTATION_MAP);

      ctx.save();
      ctx.fillStyle = '#000';
      ctx.scale(scale, scale);
      var textSize = isMobile ? ctx.measureText(pieceToDraw).width : ctx.measureText(pieceToDraw).width * 5;
      ctx.fillText(pieceToDraw, (x - textSize) / scale, (y + textSize) / scale);
      ctx.restore();  

      showMovesWhileMoving(square);
    }
    
    display.canvas.addEventListener(mouseMoveEvent, movePiece);
 
    display.canvas.addEventListener(mouseUpEvent, function detachMouseMove (e) {

      var clickX       = e.offsetX || e.changedTouches[0].clientX,
          clickY       = e.offsetY || e.changedTouches[0].clientY,
          canvas       = display.canvas,
          squareWidth  = canvas.width / NUMBER_OF_COLS,
          squareHeight = canvas.height / NUMBER_OF_ROWS,
          rowClicked   = Math.floor(clickY / squareHeight),
          colClicked   = Math.floor(clickX / squareWidth),
          targetSquare = getSquareFromClick(colClicked, rowClicked),
          validMove    = getValidMove(targetSquare, movingPiece, square);

      if (validMove) {
        console.log('Valid move!');
        makeMove(targetSquare, movingPiece, square, validMove);
        // playPlaceSound();
      } else {
        console.log('Invalid move...');
        square.piece = movingPiece;
      }
      drawChessBoard(NOTATION_MAP);
      updateAvailableMoves();
      
      display.canvas.removeEventListener(mouseMoveEvent, movePiece);
      display.canvas.removeEventListener(mouseUpEvent, detachMouseMove);
      
      if (chessEngine.game_over() || chessEngine.game_over()) {
        var colorWin = chessEngine.moves().length === 0 && chessEngine.turn() === 'b' ? 'White': 'Black';
        alert(colorWin + ' wins!');
        return;
      }

      chessEngine.swap_color();
      
      if (chessEngine.game_over() || chessEngine.game_over()) {
        var colorWin = chessEngine.moves().length === 0 && chessEngine.turn() === 'b' ? 'White': 'Black';
        alert(colorWin + ' wins!');
        return;
      }

    });

    movePiece(click);

  }

  window.initChessBoard = initChessBoard;

  window.updateBoard = function () {
    drawChessBoard(NOTATION_MAP);
  };

  window.addEventListener('resize', function () {
    drawChessBoard(NOTATION_MAP);
  });

  display.canvas.addEventListener(mouseDownEvent, function (e) {

    var clickX       = e.offsetX || e.changedTouches[0].clientX,
        clickY       = e.offsetY || e.changedTouches[0].clientY,
        canvas       = display.canvas,
        squareWidth  = canvas.width / NUMBER_OF_COLS,
        squareHeight = canvas.height / NUMBER_OF_ROWS,
        rowClicked   = Math.floor(clickY / squareHeight),
        colClicked   = Math.floor(clickX / squareWidth),
        pieceClicked;

    pieceClicked = getSquareFromClick(colClicked, rowClicked);

    if (pieceClicked && pieceClicked.piece && pieceClicked.piece.type && pieceClicked.piece.color === PLAYER_COLOR && !pieceClicked.piece.cooldown) {
      enableMoving(pieceClicked, e);
    }


  });
  
  console.log('DOMContentLoaded');



});