(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/*
 * Copyright (c) 2015, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/

/* minified license below  */

/* @license
 * Copyright (c) 2015, Jeff Hlywa (jhlywa@gmail.com)
 * Released under the BSD license
 * https://github.com/jhlywa/chess.js/blob/master/LICENSE
 */

var Chess = function(fen) {

  /* jshint indent: false */

  var BLACK = 'b';
  var WHITE = 'w';

  var EMPTY = -1;

  var PAWN = 'p';
  var KNIGHT = 'n';
  var BISHOP = 'b';
  var ROOK = 'r';
  var QUEEN = 'q';
  var KING = 'k';

  var SYMBOLS = 'pnbrqkPNBRQK';

  var DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  var POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];

  var PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15]
  };

  var PIECE_OFFSETS = {
    n: [-18, -33, -31, -14,  18, 33, 31,  14],
    b: [-17, -15,  17,  15],
    r: [-16,   1,  16,  -1],
    q: [-17, -16, -15,   1,  17, 16, 15,  -1],
    k: [-17, -16, -15,   1,  17, 16, 15,  -1]
  };

  var ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
  ];

  var RAYS = [
     17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
      0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
      0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
      0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
      0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
      1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
      0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
      0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
      0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
      0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
    -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
  ];

  var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

  var FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b',
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q'
  };

  var BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64
  };

  var RANK_1 = 7;
  var RANK_2 = 6;
  var RANK_3 = 5;
  var RANK_4 = 4;
  var RANK_5 = 3;
  var RANK_6 = 2;
  var RANK_7 = 1;
  var RANK_8 = 0;

  var SQUARES = {
    a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
    a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
    a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
    a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
    a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
    a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
    a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
  };

  var ROOKS = {
    w: [{square: SQUARES.a1, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h1, flag: BITS.KSIDE_CASTLE}],
    b: [{square: SQUARES.a8, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h8, flag: BITS.KSIDE_CASTLE}]
  };

  var board = new Array(128);
  var kings = {w: EMPTY, b: EMPTY};
  var turn = WHITE;
  var castling = {w: 0, b: 0};
  var ep_square = EMPTY;
  var half_moves = 0;
  var move_number = 1;
  var history = [];
  var header = {};

  /* if the user passes in a fen string, load it, else default to
   * starting position
   */
  if (typeof fen === 'undefined') {
    load(DEFAULT_POSITION);
  } else {
    load(fen);
  }

  function clear() {
    board = new Array(128);
    kings = {w: EMPTY, b: EMPTY};
    turn = WHITE;
    castling = {w: 0, b: 0};
    ep_square = EMPTY;
    half_moves = 0;
    move_number = 1;
    history = [];
    header = {};
    update_setup(generate_fen());
  }

  function reset() {
    load(DEFAULT_POSITION);
  }

  function load(fen) {
    var tokens = fen.split(/\s+/);
    var position = tokens[0];
    var square = 0;

    if (!validate_fen(fen).valid) {
      return false;
    }

    clear();

    for (var i = 0; i < position.length; i++) {
      var piece = position.charAt(i);

      if (piece === '/') {
        square += 8;
      } else if (is_digit(piece)) {
        square += parseInt(piece, 10);
      } else {
        var color = (piece < 'a') ? WHITE : BLACK;
        put({type: piece.toLowerCase(), color: color}, algebraic(square));
        square++;
      }
    }

    turn = tokens[1];

    if (tokens[2].indexOf('K') > -1) {
      castling.w |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('Q') > -1) {
      castling.w |= BITS.QSIDE_CASTLE;
    }
    if (tokens[2].indexOf('k') > -1) {
      castling.b |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('q') > -1) {
      castling.b |= BITS.QSIDE_CASTLE;
    }

    ep_square = (tokens[3] === '-') ? EMPTY : SQUARES[tokens[3]];
    half_moves = parseInt(tokens[4], 10);
    move_number = parseInt(tokens[5], 10);

    update_setup(generate_fen());

    return true;
  }

  function validate_fen(fen) {
    var errors = {
       0: 'No errors.',
       1: 'FEN string must contain six space-delimited fields.',
       2: '6th field (move number) must be a positive integer.',
       3: '5th field (half move counter) must be a non-negative integer.',
       4: '4th field (en-passant square) is invalid.',
       5: '3rd field (castling availability) is invalid.',
       6: '2nd field (side to move) is invalid.',
       7: '1st field (piece positions) does not contain 8 \'/\'-delimited rows.',
       8: '1st field (piece positions) is invalid [consecutive numbers].',
       9: '1st field (piece positions) is invalid [invalid piece].',
      10: '1st field (piece positions) is invalid [row too large].',
    };

    /* 1st criterion: 6 space-seperated fields? */
    var tokens = fen.split(/\s+/);
    if (tokens.length !== 6) {
      return {valid: false, error_number: 1, error: errors[1]};
    }

    /* 2nd criterion: move number field is a integer value > 0? */
    if (isNaN(tokens[5]) || (parseInt(tokens[5], 10) <= 0)) {
      return {valid: false, error_number: 2, error: errors[2]};
    }

    /* 3rd criterion: half move counter is an integer >= 0? */
    if (isNaN(tokens[4]) || (parseInt(tokens[4], 10) < 0)) {
      return {valid: false, error_number: 3, error: errors[3]};
    }

    /* 4th criterion: 4th field is a valid e.p.-string? */
    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
      return {valid: false, error_number: 4, error: errors[4]};
    }

    /* 5th criterion: 3th field is a valid castle-string? */
    if( !/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
      return {valid: false, error_number: 5, error: errors[5]};
    }

    /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
    if (!/^(w|b)$/.test(tokens[1])) {
      return {valid: false, error_number: 6, error: errors[6]};
    }

    /* 7th criterion: 1st field contains 8 rows? */
    var rows = tokens[0].split('/');
    if (rows.length !== 8) {
      return {valid: false, error_number: 7, error: errors[7]};
    }

    /* 8th criterion: every row is valid? */
    for (var i = 0; i < rows.length; i++) {
      /* check for right sum of fields AND not two numbers in succession */
      var sum_fields = 0;
      var previous_was_number = false;

      for (var k = 0; k < rows[i].length; k++) {
        if (!isNaN(rows[i][k])) {
          if (previous_was_number) {
            return {valid: false, error_number: 8, error: errors[8]};
          }
          sum_fields += parseInt(rows[i][k], 10);
          previous_was_number = true;
        } else {
          if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
            return {valid: false, error_number: 9, error: errors[9]};
          }
          sum_fields += 1;
          previous_was_number = false;
        }
      }
      if (sum_fields !== 8) {
        return {valid: false, error_number: 10, error: errors[10]};
      }
    }

    /* everything's okay! */
    return {valid: true, error_number: 0, error: errors[0]};
  }

  function generate_fen() {
    var empty = 0;
    var fen = '';

    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (board[i] == null) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        var color = board[i].color;
        var piece = board[i].type;

        fen += (color === WHITE) ?
                 piece.toUpperCase() : piece.toLowerCase();
      }

      if ((i + 1) & 0x88) {
        if (empty > 0) {
          fen += empty;
        }

        if (i !== SQUARES.h1) {
          fen += '/';
        }

        empty = 0;
        i += 8;
      }
    }

    var cflags = '';
    if (castling[WHITE] & BITS.KSIDE_CASTLE) { cflags += 'K'; }
    if (castling[WHITE] & BITS.QSIDE_CASTLE) { cflags += 'Q'; }
    if (castling[BLACK] & BITS.KSIDE_CASTLE) { cflags += 'k'; }
    if (castling[BLACK] & BITS.QSIDE_CASTLE) { cflags += 'q'; }

    /* do we have an empty castling flag? */
    cflags = cflags || '-';
    var epflags = (ep_square === EMPTY) ? '-' : algebraic(ep_square);

    return [fen, turn, cflags, epflags, half_moves, move_number].join(' ');
  }

  function set_header(args) {
    for (var i = 0; i < args.length; i += 2) {
      if (typeof args[i] === 'string' &&
          typeof args[i + 1] === 'string') {
        header[args[i]] = args[i + 1];
      }
    }
    return header;
  }

  /* called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object.  if the FEN is
   * equal to the default position, the SetUp and FEN are deleted
   * the setup is only updated if history.length is zero, ie moves haven't been
   * made.
   */
  function update_setup(fen) {
    if (history.length > 0) return;

    if (fen !== DEFAULT_POSITION) {
      header['SetUp'] = '1';
      header['FEN'] = fen;
    } else {
      delete header['SetUp'];
      delete header['FEN'];
    }
  }

  function get(square) {
    var piece = board[SQUARES[square]];
    return (piece) ? {type: piece.type, color: piece.color} : null;
  }

  function put(piece, square) {
    /* check for valid piece object */
    if (!('type' in piece && 'color' in piece)) {
      return false;
    }

    /* check for piece */
    if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
      return false;
    }

    /* check for valid square */
    if (!(square in SQUARES)) {
      return false;
    }

    var sq = SQUARES[square];

    /* don't let the user place more than one king */
    if (piece.type == KING &&
        !(kings[piece.color] == EMPTY || kings[piece.color] == sq)) {
      return false;
    }

    board[sq] = {type: piece.type, color: piece.color};
    if (piece.type === KING) {
      kings[piece.color] = sq;
    }

    update_setup(generate_fen());

    return true;
  }

  function remove(square) {
    var piece = get(square);
    board[SQUARES[square]] = null;
    if (piece && piece.type === KING) {
      kings[piece.color] = EMPTY;
    }

    update_setup(generate_fen());

    return piece;
  }

  function build_move(board, from, to, flags, promotion) {
    var move = {
      color: turn,
      from: from,
      to: to,
      flags: flags,
      piece: board[from].type
    };

    if (promotion) {
      move.flags |= BITS.PROMOTION;
      move.promotion = promotion;
    }

    if (board[to]) {
      move.captured = board[to].type;
    } else if (flags & BITS.EP_CAPTURE) {
        move.captured = PAWN;
    }
    return move;
  }

  function generate_moves(options) {
    function add_move(board, moves, from, to, flags) {
      /* if pawn promotion */
      if (board[from].type === PAWN &&
         (rank(to) === RANK_8 || rank(to) === RANK_1)) {
          var pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
          for (var i = 0, len = pieces.length; i < len; i++) {
            moves.push(build_move(board, from, to, flags, pieces[i]));
          }
      } else {
       moves.push(build_move(board, from, to, flags));
      }
    }

    var moves = [];
    var us = turn;
    var them = swap_color(us);
    var second_rank = {b: RANK_7, w: RANK_2};

    var first_sq = SQUARES.a8;
    var last_sq = SQUARES.h1;
    var single_square = false;

    /* do we want legal moves? */
    var legal = (typeof options !== 'undefined' && 'legal' in options) ?
                options.legal : true;

    /* are we generating moves for a single square? */
    if (typeof options !== 'undefined' && 'square' in options) {
      if (options.square in SQUARES) {
        first_sq = last_sq = SQUARES[options.square];
        single_square = true;
      } else {
        /* invalid square */
        return [];
      }
    }

    for (var i = first_sq; i <= last_sq; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) { i += 7; continue; }

      var piece = board[i];
      if (piece == null || piece.color !== us) {
        continue;
      }

      if (piece.type === PAWN) {
        /* single square, non-capturing */
        var square = i + PAWN_OFFSETS[us][0];
        if (board[square] == null) {
            add_move(board, moves, i, square, BITS.NORMAL);

          /* double square */
          var square = i + PAWN_OFFSETS[us][1];
          if (second_rank[us] === rank(i) && board[square] == null) {
            add_move(board, moves, i, square, BITS.BIG_PAWN);
          }
        }

        /* pawn captures */
        for (j = 2; j < 4; j++) {
          var square = i + PAWN_OFFSETS[us][j];
          if (square & 0x88) continue;

          if (board[square] != null &&
              board[square].color === them) {
              add_move(board, moves, i, square, BITS.CAPTURE);
          } else if (square === ep_square) {
              add_move(board, moves, i, ep_square, BITS.EP_CAPTURE);
          }
        }
      } else {
        for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
          var offset = PIECE_OFFSETS[piece.type][j];
          var square = i;

          while (true) {
            square += offset;
            if (square & 0x88) break;

            if (board[square] == null) {
              add_move(board, moves, i, square, BITS.NORMAL);
            } else {
              if (board[square].color === us) break;
              add_move(board, moves, i, square, BITS.CAPTURE);
              break;
            }

            /* break, if knight or king */
            if (piece.type === 'n' || piece.type === 'k') break;
          }
        }
      }
    }

    /* check for castling if: a) we're generating all moves, or b) we're doing
     * single square move generation on the king's square
     */
    if ((!single_square) || last_sq === kings[us]) {
      /* king-side castling */
      if (castling[us] & BITS.KSIDE_CASTLE) {
        var castling_from = kings[us];
        var castling_to = castling_from + 2;

        if (board[castling_from + 1] == null &&
            board[castling_to]       == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from + 1) &&
            !attacked(them, castling_to)) {
          add_move(board, moves, kings[us] , castling_to,
                   BITS.KSIDE_CASTLE);
        }
      }

      /* queen-side castling */
      if (castling[us] & BITS.QSIDE_CASTLE) {
        var castling_from = kings[us];
        var castling_to = castling_from - 2;

        if (board[castling_from - 1] == null &&
            board[castling_from - 2] == null &&
            board[castling_from - 3] == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from - 1) &&
            !attacked(them, castling_to)) {
          add_move(board, moves, kings[us], castling_to,
                   BITS.QSIDE_CASTLE);
        }
      }
    }

    /* return all pseudo-legal moves (this includes moves that allow the king
     * to be captured)
     */
    if (!legal) {
      return moves;
    }

    /* filter out illegal moves */
    var legal_moves = [];
    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i]);
      if (!king_attacked(us)) {
        legal_moves.push(moves[i]);
      }
      undo_move();
    }

    return legal_moves;
  }

  /* convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   */
  function move_to_san(move) {
    var output = '';

    if (move.flags & BITS.KSIDE_CASTLE) {
      output = 'O-O';
    } else if (move.flags & BITS.QSIDE_CASTLE) {
      output = 'O-O-O';
    } else {
      var disambiguator = get_disambiguator(move);

      if (move.piece !== PAWN) {
        output += move.piece.toUpperCase() + disambiguator;
      }

      if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        if (move.piece === PAWN) {
          output += algebraic(move.from)[0];
        }
        output += 'x';
      }

      output += algebraic(move.to);

      if (move.flags & BITS.PROMOTION) {
        output += '=' + move.promotion.toUpperCase();
      }
    }

    make_move(move);
    if (in_check()) {
      if (in_checkmate()) {
        output += '#';
      } else {
        output += '+';
      }
    }
    undo_move();

    return output;
  }

  function attacked(color, square) {
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) { i += 7; continue; }

      /* if empty square or wrong color */
      if (board[i] == null || board[i].color !== color) continue;

      var piece = board[i];
      var difference = i - square;
      var index = difference + 119;

      if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
        if (piece.type === PAWN) {
          if (difference > 0) {
            if (piece.color === WHITE) return true;
          } else {
            if (piece.color === BLACK) return true;
          }
          continue;
        }

        /* if the piece is a knight or a king */
        if (piece.type === 'n' || piece.type === 'k') return true;

        var offset = RAYS[index];
        var j = i + offset;

        var blocked = false;
        while (j !== square) {
          if (board[j] != null) { blocked = true; break; }
          j += offset;
        }

        if (!blocked) return true;
      }
    }

    return false;
  }

  function king_attacked(color) {
    return attacked(swap_color(color), kings[color]);
  }

  function in_check() {
    return king_attacked(turn);
  }

  function in_checkmate() {
    return in_check() && generate_moves().length === 0;
  }

  function in_stalemate() {
    return !in_check() && generate_moves().length === 0;
  }

  function insufficient_material() {
    var pieces = {};
    var bishops = [];
    var num_pieces = 0;
    var sq_color = 0;

    for (var i = SQUARES.a8; i<= SQUARES.h1; i++) {
      sq_color = (sq_color + 1) % 2;
      if (i & 0x88) { i += 7; continue; }

      var piece = board[i];
      if (piece) {
        pieces[piece.type] = (piece.type in pieces) ?
                              pieces[piece.type] + 1 : 1;
        if (piece.type === BISHOP) {
          bishops.push(sq_color);
        }
        num_pieces++;
      }
    }

    /* k vs. k */
    if (num_pieces === 2) { return true; }

    /* k vs. kn .... or .... k vs. kb */
    else if (num_pieces === 3 && (pieces[BISHOP] === 1 ||
                                 pieces[KNIGHT] === 1)) { return true; }

    /* kb vs. kb where any number of bishops are all on the same color */
    else if (num_pieces === pieces[BISHOP] + 2) {
      var sum = 0;
      var len = bishops.length;
      for (var i = 0; i < len; i++) {
        sum += bishops[i];
      }
      if (sum === 0 || sum === len) { return true; }
    }

    return false;
  }

  function in_threefold_repetition() {
    /* TODO: while this function is fine for casual use, a better
     * implementation would use a Zobrist key (instead of FEN). the
     * Zobrist key would be maintained in the make_move/undo_move functions,
     * avoiding the costly that we do below.
     */
    var moves = [];
    var positions = {};
    var repetition = false;

    while (true) {
      var move = undo_move();
      if (!move) break;
      moves.push(move);
    }

    while (true) {
      /* remove the last two fields in the FEN string, they're not needed
       * when checking for draw by rep */
      var fen = generate_fen().split(' ').slice(0,4).join(' ');

      /* has the position occurred three or move times */
      positions[fen] = (fen in positions) ? positions[fen] + 1 : 1;
      if (positions[fen] >= 3) {
        repetition = true;
      }

      if (!moves.length) {
        break;
      }
      make_move(moves.pop());
    }

    return repetition;
  }

  function push(move) {
    history.push({
      move: move,
      kings: {b: kings.b, w: kings.w},
      turn: turn,
      castling: {b: castling.b, w: castling.w},
      ep_square: ep_square,
      half_moves: half_moves,
      move_number: move_number
    });
  }

  function make_move(move) {
    var us = turn;
    var them = swap_color(us);
    push(move);

    board[move.to] = board[move.from];
    board[move.from] = null;

    /* if ep capture, remove the captured pawn */
    if (move.flags & BITS.EP_CAPTURE) {
      if (turn === BLACK) {
        board[move.to - 16] = null;
      } else {
        board[move.to + 16] = null;
      }
    }

    /* if pawn promotion, replace with new piece */
    if (move.flags & BITS.PROMOTION) {
      board[move.to] = {type: move.promotion, color: us};
    }

    /* if we moved the king */
    if (board[move.to].type === KING) {
      kings[board[move.to].color] = move.to;

      /* if we castled, move the rook next to the king */
      if (move.flags & BITS.KSIDE_CASTLE) {
        var castling_to = move.to - 1;
        var castling_from = move.to + 1;
        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        var castling_to = move.to + 1;
        var castling_from = move.to - 2;
        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      }

      /* turn off castling */
      castling[us] = '';
    }

    /* turn off castling if we move a rook */
    if (castling[us]) {
      for (var i = 0, len = ROOKS[us].length; i < len; i++) {
        if (move.from === ROOKS[us][i].square &&
            castling[us] & ROOKS[us][i].flag) {
          castling[us] ^= ROOKS[us][i].flag;
          break;
        }
      }
    }

    /* turn off castling if we capture a rook */
    if (castling[them]) {
      for (var i = 0, len = ROOKS[them].length; i < len; i++) {
        if (move.to === ROOKS[them][i].square &&
            castling[them] & ROOKS[them][i].flag) {
          castling[them] ^= ROOKS[them][i].flag;
          break;
        }
      }
    }

    /* if big pawn move, update the en passant square */
    if (move.flags & BITS.BIG_PAWN) {
      if (turn === 'b') {
        ep_square = move.to - 16;
      } else {
        ep_square = move.to + 16;
      }
    } else {
      ep_square = EMPTY;
    }

    /* reset the 50 move counter if a pawn is moved or a piece is captured */
    if (move.piece === PAWN) {
      half_moves = 0;
    } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      half_moves = 0;
    } else {
      half_moves++;
    }

    if (turn === BLACK) {
      move_number++;
    }
    turn = swap_color(turn);
  }



  function undo_move() {
    var old = history.pop();
    if (old == null) { return null; }

    var move = old.move;
    kings = old.kings;
    turn = old.turn;
    castling = old.castling;
    ep_square = old.ep_square;
    half_moves = old.half_moves;
    move_number = old.move_number;

    var us = turn;
    var them = swap_color(turn);

    board[move.from] = board[move.to];
    board[move.from].type = move.piece;  // to undo any promotions
    board[move.to] = null;

    if (move.flags & BITS.CAPTURE) {
      board[move.to] = {type: move.captured, color: them};
    } else if (move.flags & BITS.EP_CAPTURE) {
      var index;
      if (us === BLACK) {
        index = move.to - 16;
      } else {
        index = move.to + 16;
      }
      board[index] = {type: PAWN, color: them};
    }


    if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
      var castling_to, castling_from;
      if (move.flags & BITS.KSIDE_CASTLE) {
        castling_to = move.to + 1;
        castling_from = move.to - 1;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        castling_to = move.to - 2;
        castling_from = move.to + 1;
      }

      board[castling_to] = board[castling_from];
      board[castling_from] = null;
    }

    return move;
  }

  /* this function is used to uniquely identify ambiguous moves */
  function get_disambiguator(move) {
    var moves = generate_moves();

    var from = move.from;
    var to = move.to;
    var piece = move.piece;

    var ambiguities = 0;
    var same_rank = 0;
    var same_file = 0;

    for (var i = 0, len = moves.length; i < len; i++) {
      var ambig_from = moves[i].from;
      var ambig_to = moves[i].to;
      var ambig_piece = moves[i].piece;

      /* if a move of the same piece type ends on the same to square, we'll
       * need to add a disambiguator to the algebraic notation
       */
      if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
        ambiguities++;

        if (rank(from) === rank(ambig_from)) {
          same_rank++;
        }

        if (file(from) === file(ambig_from)) {
          same_file++;
        }
      }
    }

    if (ambiguities > 0) {
      /* if there exists a similar moving piece on the same rank and file as
       * the move in question, use the square as the disambiguator
       */
      if (same_rank > 0 && same_file > 0) {
        return algebraic(from);
      }
      /* if the moving piece rests on the same file, use the rank symbol as the
       * disambiguator
       */
      else if (same_file > 0) {
        return algebraic(from).charAt(1);
      }
      /* else use the file symbol */
      else {
        return algebraic(from).charAt(0);
      }
    }

    return '';
  }

  function ascii() {
    var s = '   +------------------------+\n';
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* display the rank */
      if (file(i) === 0) {
        s += ' ' + '87654321'[rank(i)] + ' |';
      }

      /* empty piece */
      if (board[i] == null) {
        s += ' . ';
      } else {
        var piece = board[i].type;
        var color = board[i].color;
        var symbol = (color === WHITE) ?
                     piece.toUpperCase() : piece.toLowerCase();
        s += ' ' + symbol + ' ';
      }

      if ((i + 1) & 0x88) {
        s += '|\n';
        i += 8;
      }
    }
    s += '   +------------------------+\n';
    s += '     a  b  c  d  e  f  g  h\n';

    return s;
  }

  /*****************************************************************************
   * UTILITY FUNCTIONS
   ****************************************************************************/
  function rank(i) {
    return i >> 4;
  }

  function file(i) {
    return i & 15;
  }

  function algebraic(i){
    var f = file(i), r = rank(i);
    return 'abcdefgh'.substring(f,f+1) + '87654321'.substring(r,r+1);
  }

  function swap_color(c) {
    return c === WHITE ? BLACK : WHITE;
  }

  function is_digit(c) {
    return '0123456789'.indexOf(c) !== -1;
  }

  /* pretty = external move object */
  function make_pretty(ugly_move) {
    var move = clone(ugly_move);
    move.san = move_to_san(move);
    move.to = algebraic(move.to);
    move.from = algebraic(move.from);

    var flags = '';

    for (var flag in BITS) {
      if (BITS[flag] & move.flags) {
        flags += FLAGS[flag];
      }
    }
    move.flags = flags;

    return move;
  }

  function clone(obj) {
    var dupe = (obj instanceof Array) ? [] : {};

    for (var property in obj) {
      if (typeof property === 'object') {
        dupe[property] = clone(obj[property]);
      } else {
        dupe[property] = obj[property];
      }
    }

    return dupe;
  }

  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  /*****************************************************************************
   * DEBUGGING UTILITIES
   ****************************************************************************/
  function perft(depth) {
    var moves = generate_moves({legal: false});
    var nodes = 0;
    var color = turn;

    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i]);
      if (!king_attacked(color)) {
        if (depth - 1 > 0) {
          var child_nodes = perft(depth - 1);
          nodes += child_nodes;
        } else {
          nodes++;
        }
      }
      undo_move();
    }

    return nodes;
  }

  return {
    /***************************************************************************
     * PUBLIC CONSTANTS (is there a better way to do this?)
     **************************************************************************/
    WHITE: WHITE,
    BLACK: BLACK,
    PAWN: PAWN,
    KNIGHT: KNIGHT,
    BISHOP: BISHOP,
    ROOK: ROOK,
    QUEEN: QUEEN,
    KING: KING,
    SQUARES: (function() {
                /* from the ECMA-262 spec (section 12.6.4):
                 * "The mechanics of enumerating the properties ... is
                 * implementation dependent"
                 * so: for (var sq in SQUARES) { keys.push(sq); } might not be
                 * ordered correctly
                 */
                var keys = [];
                for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
                  if (i & 0x88) { i += 7; continue; }
                  keys.push(algebraic(i));
                }
                return keys;
              })(),
    FLAGS: FLAGS,

    /***************************************************************************
     * PUBLIC API
     **************************************************************************/
    load: function(fen) {
      return load(fen);
    },

    reset: function() {
      return reset();
    },

    swap_color: function () {
      turn = swap_color(turn);
    },

    moves: function(options) {
      /* The internal representation of a chess move is in 0x88 format, and
       * not meant to be human-readable.  The code below converts the 0x88
       * square coordinates to algebraic coordinates.  It also prunes an
       * unnecessary move keys resulting from a verbose call.
       */

      var ugly_moves = generate_moves(options);
      var moves = [];

      for (var i = 0, len = ugly_moves.length; i < len; i++) {

        /* does the user want a full move object (most likely not), or just
         * SAN
         */
        if (typeof options !== 'undefined' && 'verbose' in options &&
            options.verbose) {
          moves.push(make_pretty(ugly_moves[i]));
        } else {
          moves.push(move_to_san(ugly_moves[i]));
        }
      }

      return moves;
    },

    in_check: function() {
      return in_check();
    },

    in_checkmate: function() {
      return in_checkmate();
    },

    in_stalemate: function() {
      return in_stalemate();
    },

    in_draw: function() {
      return half_moves >= 100 ||
             in_stalemate() ||
             insufficient_material() ||
             in_threefold_repetition();
    },

    insufficient_material: function() {
      return insufficient_material();
    },

    in_threefold_repetition: function() {
      return in_threefold_repetition();
    },

    game_over: function() {
      return half_moves >= 100 ||
             in_checkmate() ||
             in_stalemate() ||
             insufficient_material() ||
             in_threefold_repetition();
    },

    validate_fen: function(fen) {
      return validate_fen(fen);
    },

    fen: function() {
      return generate_fen();
    },

    pgn: function(options) {
      /* using the specification from http://www.chessclub.com/help/PGN-spec
       * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
       */
      var newline = (typeof options === 'object' &&
                     typeof options.newline_char === 'string') ?
                     options.newline_char : '\n';
      var max_width = (typeof options === 'object' &&
                       typeof options.max_width === 'number') ?
                       options.max_width : 0;
      var result = [];
      var header_exists = false;

      /* add the PGN header headerrmation */
      for (var i in header) {
        /* TODO: order of enumerated properties in header object is not
         * guaranteed, see ECMA-262 spec (section 12.6.4)
         */
        result.push('[' + i + ' \"' + header[i] + '\"]' + newline);
        header_exists = true;
      }

      if (header_exists && history.length) {
        result.push(newline);
      }

      /* pop all of history onto reversed_history */
      var reversed_history = [];
      while (history.length > 0) {
        reversed_history.push(undo_move());
      }

      var moves = [];
      var move_string = '';
      var pgn_move_number = 1;

      /* build the list of moves.  a move_string looks like: "3. e3 e6" */
      while (reversed_history.length > 0) {
        var move = reversed_history.pop();

        /* if the position started with black to move, start PGN with 1. ... */
        if (pgn_move_number === 1 && move.color === 'b') {
          move_string = '1. ...';
          pgn_move_number++;
        } else if (move.color === 'w') {
          /* store the previous generated move_string if we have one */
          if (move_string.length) {
            moves.push(move_string);
          }
          move_string = pgn_move_number + '.';
          pgn_move_number++;
        }

        move_string = move_string + ' ' + move_to_san(move);
        make_move(move);
      }

      /* are there any other leftover moves? */
      if (move_string.length) {
        moves.push(move_string);
      }

      /* is there a result? */
      if (typeof header.Result !== 'undefined') {
        moves.push(header.Result);
      }

      /* history should be back to what is was before we started generating PGN,
       * so join together moves
       */
      if (max_width === 0) {
        return result.join('') + moves.join(' ');
      }

      /* wrap the PGN output at max_width */
      var current_width = 0;
      for (var i = 0; i < moves.length; i++) {
        /* if the current move will push past max_width */
        if (current_width + moves[i].length > max_width && i !== 0) {

          /* don't end the line with whitespace */
          if (result[result.length - 1] === ' ') {
            result.pop();
          }

          result.push(newline);
          current_width = 0;
        } else if (i !== 0) {
          result.push(' ');
          current_width++;
        }
        result.push(moves[i]);
        current_width += moves[i].length;
      }

      return result.join('');
    },

    load_pgn: function(pgn, options) {
      function mask(str) {
        return str.replace(/\\/g, '\\');
      }

      /* convert a move from Standard Algebraic Notation (SAN) to 0x88
       * coordinates
      */
      function move_from_san(move) {
        /* strip off any move decorations: e.g Nf3+?! */
        var moveReplaced = move.replace(/[+#?!=]/,'');
        var moves = generate_moves();
        for (var i = 0, len = moves.length; i < len; i++) {
          if (moveReplaced ==
              move_to_san(moves[i]).replace(/[+#?!=]/,'')) {
            return moves[i];
          }
        }
        return null;
      }

      function get_move_obj(move) {
        return move_from_san(trim(move));
      }

      function has_keys(object) {
        var has_keys = false;
        for (var key in object) {
          has_keys = true;
        }
        return has_keys;
      }

      function parse_pgn_header(header, options) {
        var newline_char = (typeof options === 'object' &&
                            typeof options.newline_char === 'string') ?
                            options.newline_char : '\r?\n';
        var header_obj = {};
        var headers = header.split(new RegExp(mask(newline_char)));
        var key = '';
        var value = '';

        for (var i = 0; i < headers.length; i++) {
          key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1');
          value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\]$/, '$1');
          if (trim(key).length > 0) {
            header_obj[key] = value;
          }
        }

        return header_obj;
      }

      var newline_char = (typeof options === 'object' &&
                          typeof options.newline_char === 'string') ?
                          options.newline_char : '\r?\n';
        var regex = new RegExp('^(\\[(.|' + mask(newline_char) + ')*\\])' +
                               '(' + mask(newline_char) + ')*' +
                               '1.(' + mask(newline_char) + '|.)*$', 'g');

      /* get header part of the PGN file */
      var header_string = pgn.replace(regex, '$1');

      /* no info part given, begins with moves */
      if (header_string[0] !== '[') {
        header_string = '';
      }

     reset();

      /* parse PGN header */
      var headers = parse_pgn_header(header_string, options);
      for (var key in headers) {
        set_header([key, headers[key]]);
      }

      /* load the starting position indicated by [Setup '1'] and
      * [FEN position] */
      if (headers['SetUp'] === '1') {
          if (!(('FEN' in headers) && load(headers['FEN']))) {
            return false;
          }
      }

      /* delete header to get the moves */
      var ms = pgn.replace(header_string, '').replace(new RegExp(mask(newline_char), 'g'), ' ');

      /* delete comments */
      ms = ms.replace(/(\{[^}]+\})+?/g, '');

      /* delete move numbers */
      ms = ms.replace(/\d+\./g, '');

      /* delete ... indicating black to move */
      ms = ms.replace(/\.\.\./g, '');

      /* trim and get array of moves */
      var moves = trim(ms).split(new RegExp(/\s+/));

      /* delete empty entries */
      moves = moves.join(',').replace(/,,+/g, ',').split(',');
      var move = '';

      for (var half_move = 0; half_move < moves.length - 1; half_move++) {
        move = get_move_obj(moves[half_move]);

        /* move not possible! (don't clear the board to examine to show the
         * latest valid position)
         */
        if (move == null) {
          return false;
        } else {
          make_move(move);
        }
      }

      /* examine last move */
      move = moves[moves.length - 1];
      if (POSSIBLE_RESULTS.indexOf(move) > -1) {
        if (has_keys(header) && typeof header.Result === 'undefined') {
          set_header(['Result', move]);
        }
      }
      else {
        move = get_move_obj(move);
        if (move == null) {
          return false;
        } else {
          make_move(move);
        }
      }
      return true;
    },

    header: function() {
      return set_header(arguments);
    },

    ascii: function() {
      return ascii();
    },

    turn: function() {
      return turn;
    },

    move: function(move) {
      /* The move function can be called with in the following parameters:
       *
       * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
       *
       * .move({ from: 'h7', <- where the 'move' is a move object (additional
       *         to :'h8',      fields are ignored)
       *         promotion: 'q',
       *      })
       */
      var move_obj = null;
      var moves = generate_moves();

      if (typeof move === 'string') {
        /* convert the move string to a move object */
        /* strip off any move decorations: e.g Nf3+?! */
        var moveReplaced = move.replace(/[+#?!=]/,'');
        for (var i = 0, len = moves.length; i < len; i++) {
          if (moveReplaced === move_to_san(moves[i]).replace(/[+#?!=]/,'')) {
            move_obj = moves[i];
            break;
          }
        }
      } else if (typeof move === 'object') {
        /* convert the pretty move object to an ugly move object */
        for (var i = 0, len = moves.length; i < len; i++) {
          if (move.from === algebraic(moves[i].from) &&
              move.to === algebraic(moves[i].to) &&
              (!('promotion' in moves[i]) ||
              move.promotion === moves[i].promotion)) {
            move_obj = moves[i];
            break;
          }
        }
      }

      /* failed to find move */
      if (!move_obj) {
        return null;
      }

      /* need to make a copy of move because we can't generate SAN after the
       * move is made
       */
      var pretty_move = make_pretty(move_obj);

      make_move(move_obj);

      return pretty_move;
    },

    undo: function() {
      var move = undo_move();
      return (move) ? make_pretty(move) : null;
    },

    clear: function() {
      return clear();
    },

    put: function(piece, square) {
      return put(piece, square);
    },

    get: function(square) {
      return get(square);
    },

    remove: function(square) {
      return remove(square);
    },

    perft: function(depth) {
      return perft(depth);
    },

    square_color: function(square) {
      if (square in SQUARES) {
        var sq_0x88 = SQUARES[square];
        return ((rank(sq_0x88) + file(sq_0x88)) % 2 === 0) ? 'light' : 'dark';
      }

      return null;
    },

    history: function(options) {
      var reversed_history = [];
      var move_history = [];
      var verbose = (typeof options !== 'undefined' && 'verbose' in options &&
                     options.verbose);

      while (history.length > 0) {
        reversed_history.push(undo_move());
      }

      while (reversed_history.length > 0) {
        var move = reversed_history.pop();
        if (verbose) {
          move_history.push(make_pretty(move));
        } else {
          move_history.push(move_to_san(move));
        }
        make_move(move);
      }

      return move_history;
    }

  };
};

/* export Chess object if using node or any other CommonJS compatible
 * environment */
if (typeof exports !== 'undefined') exports.Chess = Chess;
/* export Chess object for any RequireJS compatible environment */
if (typeof define !== 'undefined') define( function () { return Chess;  });

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){

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
      };

  window.NOTATION_MAP = NOTATION_MAP;


  var pickUpSound        = new Audio('audio/pick_up.wav');
  var placeSound         = new Audio('audio/place.wav');
  var capturedSound      = new Audio('audio/captured.wav');
  var lostGameSound      = new Audio('audio/lost_game.wav');
  var errorCooldownSound = new Audio('audio/error_cooldown.wav');

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

  function isCapture (toSquare) {
    return toSquare.piece.type && toSquare.piece.color !== PLAYER_COLOR;
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
      playSound(pickUpSound);
      enableMoving(pieceClicked, e);
    }

    if (pieceClicked && pieceClicked.piece && pieceClicked.piece.type && pieceClicked.piece.color === PLAYER_COLOR && pieceClicked.piece.cooldown) {
      playSound(errorCooldownSound);
    }


  });
  
  console.log('DOMContentLoaded');



});
},{"../core/chess":1,"../core/fullScreenDisplay":2}]},{},[3]);
