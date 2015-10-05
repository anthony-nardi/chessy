
window.addEventListener('DOMContentLoaded', function () {

  var display = require('../core/fullScreenDisplay'),
      Chess   = require('../core/chess'),
      
      canvas  = display.canvas,
      ctx     = display.ctx,

      isInGameMenuShown  = false,
      gameStarted        = false,
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

      notifySound        = new Audio('audio/notify.wav'),
      pickUpSound        = new Audio('audio/pick_up.wav'),
      placeSound         = new Audio('audio/place.wav'),
      capturedSound      = new Audio('audio/captured.wav'),
      lostGameSound      = new Audio('audio/lost_game.wav'),
      winGameSound       = new Audio('audio/win_game.wav'),
      errorCooldownSound = new Audio('audio/error_cooldown.wav');

  errorCooldownSound.volume = 0.5;
  capturedSound.volume      = 0.5;

  function initChessBoard (color) {
    
    var squareColor,
        currentSquare;

    PLAYER_COLOR = color;
    gameStarted  = true;

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

    window.chessEngine = chessEngine;

    canvas.addEventListener(mouseMoveEvent, showMoves);

  }

  function playSound (sound) {
    if (!isMobile) {
      sound.pause();
      sound.currentTime = 0;
      sound.play();
    }
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
          arc         = (3 * Math.PI / 2) - (2 * Math.PI * (((PIECE_COOLDOWN_MS - (currentTime - startTime)) / PIECE_COOLDOWN_MS)));
        
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
        ctx.arc(col * squareWidth  + squareWidth / 2, row * squareHeight + squareHeight / 2, (isMobile ? 33/3 : 33), 3 * Math.PI / 2, arc, true);
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

  function showMovesWhileMoving (squareClicked) {
      
    if (squareClicked.piece.cooldown) {
      return;
    }

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
      if (moves[i] === 'O-O-O') {
        moves[i] = COLUMN_MAP[squareClicked.colIndex - 2] + ROW_MAP[squareClicked.rowIndex];
      }
      if (moves[i] === 'O-O') {
        moves[i] = COLUMN_MAP[squareClicked.colIndex + 2] + ROW_MAP[squareClicked.rowIndex]; 
      }
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
        squareWidth  = canvas.width / NUMBER_OF_COLS,
        squareHeight = canvas.height / NUMBER_OF_ROWS,
        rowClicked   = Math.floor(clickY / squareHeight),
        colClicked   = Math.floor(clickX / squareWidth),
        pieceClicked = getSquareFromClick(colClicked, rowClicked),
        moves,
        startingSquare,
        destinationSquares,
        currentMove;

    if (!pieceClicked || pieceClicked.piece && pieceClicked.piece.color !== PLAYER_COLOR || pieceClicked.piece.cooldown) {
      drawChessBoard(NOTATION_MAP);
      return;
    }
        
    moves              = getMoves(pieceClicked);
    startingSquare     = [colClicked, rowClicked];
    destinationSquares = [];



    for (var i = 0; i < moves.length; i++) {
      moves[i] = moves[i].replace('+', '');
      moves[i] = moves[i].replace('#', '');
      if (moves[i].indexOf('=') !== -1) {
        moves[i] = moves[i].split('=')[0];
      }
      if (moves[i] === 'O-O-O') {
        moves[i] = COLUMN_MAP[colClicked - 2] + ROW_MAP[rowClicked];
      }
      if (moves[i] === 'O-O') {
        moves[i] = COLUMN_MAP[colClicked + 2] + ROW_MAP[rowClicked]; 
      }
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

    if (chessEngine.turn() !== square.piece.color) {
      chessEngine.swap_color();
    }

    return chessEngine.moves({square: square.id});
  }

  function isCapture (toSquare) {
    return toSquare.piece.type && toSquare.piece.color !== PLAYER_COLOR;
  }

  function getValidMove (toSquare, piece, fromSquare) {
    
    var validMovesForPiece = chessEngine.moves({'square': fromSquare.id});

    var isCapture          = toSquare.piece.type && toSquare.piece.color !== chessEngine.turn() ? 'x' : '';
    var pawnUpgradeToQueen = '=Q';
    var rowId              = fromSquare.id.charAt(1);
    var colId              = fromSquare.id.charAt(0);

    if (validMovesForPiece.indexOf('O-O-O') !== -1 && toSquare.colIndex === fromSquare.colIndex - 2) {
      return 'O-O-O';
    }

    if (validMovesForPiece.indexOf('O-O') !== -1 && toSquare.colIndex === fromSquare.colIndex + 2) {
      return 'O-O';
    }
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

    if (validMovesForPiece.indexOf(piece.prefix + isCapture + toSquare.id + pawnUpgradeToQueen) !== -1) {
      return piece.prefix + isCapture + toSquare.id + pawnUpgradeToQueen;
    }   

    if (validMovesForPiece.indexOf(piece.prefix + isCapture + toSquare.id + pawnUpgradeToQueen + '+') !== -1) {
      return piece.prefix + isCapture + toSquare.id + pawnUpgradeToQueen + '+';
    }   
    
    if (validMovesForPiece.indexOf(piece.prefix + isCapture + toSquare.id + pawnUpgradeToQueen + '#') !== -1) {
      return piece.prefix + isCapture + toSquare.id + pawnUpgradeToQueen + '#';
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

    if (validMovesForPiece.indexOf(piece.prefix + rowId + isCapture + toSquare.id + pawnUpgradeToQueen) !== -1) {
      return piece.prefix + rowId + isCapture + toSquare.id + pawnUpgradeToQueen;
    }   
    
    if (validMovesForPiece.indexOf(piece.prefix + rowId + isCapture + toSquare.id + pawnUpgradeToQueen + '+') !== -1) {
      return piece.prefix + rowId + isCapture + toSquare.id + pawnUpgradeToQueen + '+';
    }   

    if (validMovesForPiece.indexOf(piece.prefix + rowId + isCapture + toSquare.id + pawnUpgradeToQueen + '#') !== -1) {
      return piece.prefix + rowId + isCapture + toSquare.id + pawnUpgradeToQueen + '#';
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

    if (validMovesForPiece.indexOf(piece.prefix + colId + isCapture + toSquare.id + pawnUpgradeToQueen) !== -1) {
      return piece.prefix + colId + isCapture + toSquare.id + pawnUpgradeToQueen;
    }   

    if (validMovesForPiece.indexOf(piece.prefix + colId + isCapture + toSquare.id + pawnUpgradeToQueen + '+') !== -1) {
      return piece.prefix + colId + isCapture + toSquare.id + pawnUpgradeToQueen + '+';
    }   

    if (validMovesForPiece.indexOf(piece.prefix + colId + isCapture + toSquare.id + pawnUpgradeToQueen + '#') !== -1) {
      return piece.prefix + colId + isCapture + toSquare.id + pawnUpgradeToQueen + '#';
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

  function castlingMove (targetSquare, movingPiece, fromSquare, validMove) {

    var oldRookSquare,
        newRookSquare;

    if (validMove === 'O-O-O') {
      oldRookSquare = NOTATION_MAP['a' + ROW_MAP[fromSquare.rowIndex]]; 
      newRookSquare = NOTATION_MAP['d' + ROW_MAP[fromSquare.rowIndex]];
    }
    
    if (validMove === 'O-O') {
      oldRookSquare = NOTATION_MAP['h' + ROW_MAP[fromSquare.rowIndex]];
      newRookSquare = NOTATION_MAP['f' + ROW_MAP[fromSquare.rowIndex]];
    }

    targetSquare.piece  = movingPiece;
    
    newRookSquare.piece = oldRookSquare.piece;

    oldRookSquare.piece = {
      'type'  : '',
      'color' : '',
      'prefix': ''
    };

    chessEngine.move(validMove);
    
    beginPieceCooldownVisual(targetSquare);
    beginPieceCooldownVisual(newRookSquare);

    window.emitMove({
      'move'        : validMove,
      'fromSquare'  : fromSquare.id,
      'targetSquare': targetSquare.id,
      'movingPiece' : movingPiece
    });

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

    if (validMove === 'O-O-O' || validMove === 'O-O') {
      castlingMove(targetSquare, movingPiece, fromSquare, validMove);
      return;
    }

    // Is queen upgrade.
    if (validMove.indexOf('=') !== -1) {
      var queenPiece = PLAYER_COLOR === 'w' ? WHITE_QUEEN : BLACK_QUEEN;
      targetSquare.piece.type   = queenPiece;
      targetSquare.piece.prefix = 'Q';
    } 

    chessEngine.move(validMove);
    
    window.emitMove({
      'move'        : validMove,
      'fromSquare'  : fromSquare.id,
      'targetSquare': targetSquare.id,
      'movingPiece' : movingPiece
    });
    
    beginPieceCooldownVisual(targetSquare);
    
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
          validMove    = getValidMove(targetSquare, movingPiece, square),
          gameOver;

      if (validMove) {
        console.log('Valid move!');
        if (isCapture(targetSquare)) {
          playSound(capturedSound);
        } else {
          playSound(placeSound);
        }
        makeMove(targetSquare, movingPiece, square, validMove);
      } else {
        console.log('Invalid move...');
        square.piece = movingPiece;
      }

      drawChessBoard(NOTATION_MAP);
      
      display.canvas.removeEventListener(mouseMoveEvent, movePiece);
      display.canvas.removeEventListener(mouseUpEvent, detachMouseMove);
      
      gameOver = getWinner();
        
      if (gameOver) {
        unattachEventListeners();
        if ((gameOver === 'Black' && PLAYER_COLOR === 'b') || (gameOver === 'White' && PLAYER_COLOR === 'w')) {
          playSound(winGameSound);
          alert('You won!');
        } else {
          playSound(lostGameSound);
          alert('You lost.');
        }
      }

    });

    movePiece(click);

  }
  
  function getWinner () {

    // Game allows kings to be captured, immediate loss.
    var kingSquares = [];

    if (chessEngine.game_over() || chessEngine.game_over()) {
      return chessEngine.moves().length === 0 && chessEngine.turn() === 'b' ? 'White': 'Black';
    }

    chessEngine.swap_color();
    
    if (chessEngine.game_over() || chessEngine.game_over()) {
      return window.chessEngine.moves().length === 0 && window.chessEngine.turn() === 'b' ? 'White': 'Black';
    }

    for (var square in NOTATION_MAP) {
      if (NOTATION_MAP.hasOwnProperty(square)) {
        if (NOTATION_MAP[square].piece && NOTATION_MAP[square].piece.prefix === 'K') {
          kingSquares.push(NOTATION_MAP[square]);
        }
      }
    }

    if (kingSquares.length < 2) {
      if (kingSquares[0].piece.type === BLACK_KING) {
        return 'Black';
      } else {
        return 'White';
      }
    }

  }

  window.addEventListener('resize', function () {
    drawChessBoard(NOTATION_MAP);
  });

  function startMove (e) {

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
      playSound(pickUpSound);
      enableMoving(pieceClicked, e);
    }

    if (pieceClicked && pieceClicked.piece && pieceClicked.piece.type && pieceClicked.piece.color === PLAYER_COLOR && pieceClicked.piece.cooldown) {
      playSound(errorCooldownSound);
    }

  }

  canvas.addEventListener(mouseDownEvent, startMove);
  window.addEventListener('keydown', toggleInGameMenuIfSpacebarPressed);
  document.getElementById('closeButton').addEventListener('click', toggleInGameMenu);

  function unattachEventListeners () {
    canvas.removeEventListener(mouseDownEvent, startMove);
    canvas.removeEventListener(mouseMoveEvent, showMoves);
    window.removeEventListener('keydown', toggleInGameMenuIfSpacebarPressed);
  }

  function toggleInGameMenuIfSpacebarPressed (e) {
    if (e.keyCode === 32 && gameStarted) {
      toggleInGameMenu();
    }
  }

  function toggleInGameMenu () {
    
    var inGameMenuElement = document.getElementById('inGameMenu'),
        dimmerElement     = document.getElementById('dimmer');

    isInGameMenuShown = !isInGameMenuShown;
    
    if (isInGameMenuShown) {
      inGameMenuElement.style.display = 'flex';
      dimmerElement.style.display     = 'block';
    } else {
      inGameMenuElement.style.display = 'none';
      dimmerElement.style.display     = 'none';
    }
  
  }

  // Socket stuff
  var socket = io('/'),
      myName,
      playerList;

  document.getElementById('offerDraw').addEventListener('click', offerDraw);

  function updatePlayerList (players) {
    
    var listElement = document.getElementById('player_list'),
        currentPlayerElement;
    
    listElement.innerHTML = '<h2>Challenge Player</h2>';
    
    playerList = players;
    
    for (var i = 0; i < players.length; i++) {
      if (myName !== players[i]) {
        currentPlayerElement = document.createElement('div');
        currentPlayerElement.setAttribute('class', 'list-group-item');
        currentPlayerElement.innerHTML = players[i];
        listElement.appendChild(currentPlayerElement);
      }
    }
  }

  function offerDraw () {
    socket.emit('drawRequest');
  }

  function drawAccepted () {
    unattachEventListeners();
    if (isInGameMenuShown) {
      toggleInGameMenu();
    }
    alert('Draw');
  }

  function drawRejected () {
    alert('Player rejected the draw.  Good luck.  You can request draw again.');
  }

  socket.on('players', function (players) {
    updatePlayerList(players);
  });
  
  socket.on('challengeRequested', function (player) {
    playSound(notifySound);
    if (confirm('New challenger ' + player)) {
      socket.emit('startgame', player);
    }
  });
  
  socket.on('newgame', function (color) {
  
    initChessBoard(color);
    
    document.getElementById('name_form').style.display   = 'none';
    document.getElementById('player_list').style.display = 'none';
    
    window.emitMove = function (move) {
      socket.emit('makeMove', move);
    };
    
    socket.on('makeMove', function (move) {

      var gameOver,
          oldRookSquare,
          newRookSquare;
      
      if (move.move === 'O-O-O'  || move.move === 'O-O') {

        if (move.move === 'O-O-O') {
          oldRookSquare = NOTATION_MAP['a' + move.targetSquare.charAt(1)]; 
          newRookSquare = NOTATION_MAP['d' + move.targetSquare.charAt(1)];
        }
        
        if (move.move === 'O-O') {
          oldRookSquare = NOTATION_MAP['h' + move.targetSquare.charAt(1)];
          newRookSquare = NOTATION_MAP['f' + move.targetSquare.charAt(1)];
        }
        
        newRookSquare.piece = oldRookSquare.piece;

        oldRookSquare.piece = {
          'type'  : '',
          'color' : '',
          'prefix': ''
        };

      }
      
      NOTATION_MAP[move.fromSquare].piece = {
        'type'  : '',
        'color' : '',
        'prefix': ''
      };

      NOTATION_MAP[move.targetSquare].piece = move.movingPiece;
      
      if (chessEngine.turn() === move.color) {
        chessEngine.move(move.move);
      } else {
        chessEngine.swap_color();
        chessEngine.move(move.move);
        chessEngine.swap_color();
      }

      drawChessBoard(NOTATION_MAP);

      gameOver = getWinner();

      if (gameOver) {
        unattachEventListeners();
        if ((gameOver === 'Black' && PLAYER_COLOR === 'b') || (gameOver === 'White' && PLAYER_COLOR === 'w')) {
          playSound(winGameSound);
          alert('You won!');
        } else {
          playSound(lostGameSound);
          alert('You lost.');
        }
      }

    });

    socket.on('drawRequest', function () {
      if (confirm('Player has requested a draw. Accept?')) {
        socket.emit('drawAccepted');
        drawAccepted();
      } else {
        socket.emit('drawRejected');
      }
    });

    socket.on('drawRejected', drawRejected);
    socket.on('drawAccepted', drawAccepted);
  });

  // Get players name from player list
  document.getElementById('player_list').addEventListener('click', function (e) {
    var playerClicked = e.srcElement.innerHTML;
    if (playerList.indexOf(playerClicked) !== -1) {
      socket.emit('challengePlayer', playerClicked);
    }
  });

  // Send server the players name
  document.getElementById('send_player_name').addEventListener('click', function () {
    myName = document.getElementById('player_name').value;
    socket.emit('setPlayerName', myName);
    document.getElementById('name_form').style.display   = 'none';
    document.getElementById('player_list').style.display = 'block';
  });

});