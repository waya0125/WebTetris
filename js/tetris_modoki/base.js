/*
 * Copyright (c) 2023 wayamoti2015@waya0125 All Rights Reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// ブロックのでーた
function Block(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.status = 0;
}
var block = new Block(4, 0, Math.floor(Math.random() * (7)));
let fps = 1000 / 60;
let field_width = 12;
let field_height = 22;
let Cell = {
    None : 0,
    Wall : 1,
    I : 2,
    O : 3,
    S : 4,
    Z : 5,
    J : 6,
    L : 7,
    T : 8,
};
// カウンタ
var cnt = 0;

// 出力用メモリ
var vram = [
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1],
];

// ゲームを管理するためのフィールド
var field = [
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1],
];

// 各ブロックの状態の数 - 1
let block_status = [1, 0, 1, 1, 3, 3, 3]
// 各ブロックを格納する
let blocks = [
    [ // I
        [
            [Cell.I,Cell.I,Cell.I,Cell.I]
        ],
        [
            [Cell.I],
            [Cell.I],
            [Cell.I],
            [Cell.I]
        ]
    ],
    [ // O
        [
            [Cell.O,Cell.O],
            [Cell.O,Cell.O]
        ]
    ],
    [ // S
        [
            [Cell.S,Cell.None],
            [Cell.S,Cell.S],
            [Cell.None,Cell.S]
        ],
        [
            [Cell.None,Cell.S,Cell.S],
            [Cell.S,Cell.S,Cell.None]
        ]
    ],
    [ // Z
        [
            [Cell.None,Cell.Z],
            [Cell.Z,Cell.Z],
            [Cell.Z,Cell.None]
        ],
        [
            [Cell.Z,Cell.Z,Cell.None],
            [Cell.None,Cell.Z,Cell.Z]
        ]
    ],
    [ // J
        [
            [Cell.None,Cell.J],
            [Cell.None,Cell.J],
            [Cell.J,Cell.J]
        ],
        [
            [Cell.J,Cell.None,Cell.None],
            [Cell.J,Cell.J,Cell.J]
        ],
        [
            [Cell.J,Cell.J],
            [Cell.J,Cell.None],
            [Cell.J,Cell.None]
        ],
        [
            [Cell.J,Cell.J,Cell.J],
            [Cell.None,Cell.None,Cell.J]
        ]
    ],
    [ // L
        [
            [Cell.L,Cell.None],
            [Cell.L,Cell.None],
            [Cell.L,Cell.L]
        ],
        [
            [Cell.L,Cell.L,Cell.L],
            [Cell.L,Cell.None,Cell.None]
        ],
        [
            [Cell.L,Cell.L],
            [Cell.None,Cell.L],
            [Cell.None,Cell.L]
        ],
        [
            [Cell.None,Cell.None,Cell.L],
            [Cell.L,Cell.L,Cell.L]
        ]
    ],
    [ // T
        [
            [Cell.T,Cell.None],
            [Cell.T,Cell.T],
            [Cell.T,Cell.None]
        ],
        [
            [Cell.T,Cell.T,Cell.T],
            [Cell.None,Cell.T,Cell.None]
        ],
        [
            [Cell.None,Cell.T],
            [Cell.T,Cell.T],
            [Cell.None,Cell.T]
        ],
        [
            [Cell.None,Cell.T,Cell.None],
            [Cell.T,Cell.T,Cell.T]
        ]
    ]
];

// 配列コピー
// sa : コピー元配列
// da : コピー先配列
// sx : コピー元のx座標
// sy : コピー元のy座標
// dx : コピー先のx座標
// dy : コピー先のy座標
// width : コピーする幅
// height : コピーする高さ
// ignore : コピーしない値
let copy = function(sa, da, sx, sy, dx, dy, ignore) {
    let width = sa[0].length;
    let height = sa.length;

    for(var i = 0; i < height; i++) {
        for(var j = 0; j < width; j++) {
            if(sa[sy + i][sx + j] == ignore) continue;
            da[dy + i][dx + j] = sa[sy + i][sx + j];
        }
    }
};

// btypeでstatusなブロックが(x, y)な座標に設置できるか
let checkOkeru = function(btype, status, x, y) {
    console.log("status => " + status);
    var b = blocks[btype][status];
    let w = b[0].length;
    let h = b.length;

    for(var i = y; i < y + h; i++) {
        for(var j = x; j < x + w; j++) {
            if(b[i-y][j-x] == Cell.None) continue;
            if(field[i][j] != Cell.None) return false;
        }
    }
    return true;
};

// vramをdisplayへ出力(vram to html)
let disp = function() {
    let d = document.getElementById("display"); // 出力場所の要素を取得

    var s = ""; // displayへ書き込むhtmlを格納する変数

    for(var i = 0; i < field_height; i++) {
        for(var j = 0; j < field_width; j++) {
            s += "<div class='cell ";
            switch(vram[i][j]) {
                case Cell.Wall: s += "wall"; break;
                case Cell.I: s += "I"; break;
                case Cell.O: s += "O"; break;
                case Cell.S: s += "S"; break;
                case Cell.Z: s += "Z"; break;
                case Cell.J: s += "J"; break;
                case Cell.L: s += "L"; break;
                case Cell.T: s += "T"; break;
                case Cell.None: break;
            }
            s += "'></div>";
        }
    }

    d.innerHTML = s; // 要素に書き込み
};

// 描画関係
let graph = function() {
    copy(field, vram, 0, 0, 0, 0, -1, 0); // vramにfieldをコピー
    copy(blocks[block.type][block.status], vram, 0, 0, block.x, block.y, 0); // vramにブロックをコピー
    disp();
};

// 処理
let process = function() {
    if(checkOkeru(block.type, block.status, block.x, block.y + 1)) block.y++; // 置ける
    else next();  // 置けない
};

// y行目を消して上のブロックを下げる
let delline = function(y) {
    for(var i = y; i > 0; i--) {
        for(var j = 1; j < field_width - 1; j++) {
            field[i][j] = field[i-1][j];
        }
    }
};

// 置けなくなったら
let next = function() {
    // fieldに固定
    copy(blocks[block.type][block.status], field, 0, 0, block.x, block.y, 0);

    // 消せる行があるか調べる
    for(var i = 0; i < field_height - 1; i++){
        var cnt = 0;
        for(var j = 0; j < field_width; j++){
            cnt++;
            if(field[i][j] == Cell.None) break;
        }
        if(cnt == field_width) delline(i);
    }

    // 次のブロックを登録
    block.type = Math.floor(Math.random() * (7));
    block.x = 4;
    block.y = 0;
    block.status = 0;
};

// main loop
let loop = function() {
    console.log(cnt++);
    process();
    setTimeout(loop, 1000);
};

// ボタンクリックイベント
document.getElementById("left").addEventListener("click", function() {
    if(checkOkeru(block.type, block.status, block.x - 1, block.y)) block.x--;
});

document.getElementById("up").addEventListener("click", function() {
    while(checkOkeru(block.type, block.status, block.x, block.y + 1)){
        block.y++;
    }
    next();
});

document.getElementById("down").addEventListener("click", function() {
    process();
});

document.getElementById("right").addEventListener("click", function() {
    if(checkOkeru(block.type, block.status, block.x + 1, block.y)) block.x++;
});

document.getElementById("rotate").addEventListener("click", function() {block.status++;
    if(block.status > block_status[block.type]) block.status = 0;
    if(!checkOkeru(block.type, block.status, block.x, block.y)){
        block.status--;
        if(block.status < 0) block.status = block_status[block.type];
    }
});

var rotateKey = true;

document.addEventListener("keyup", function(e){
    switch(e.keyCode) {
        case 65: // 'a'
        case 83: // 's'
            rotateKey = true;
            break;

    }
});

// キーイベント
document.addEventListener("keydown", function(e) {
    console.log("keycode = " + e.keyCode);
    switch(e.keyCode) {
        case 37: // ←
            if(checkOkeru(block.type, block.status, block.x - 1, block.y)) block.x--; // 左に動かせるなら動かす
            break;
        case 38:  // ↑
            while(checkOkeru(block.type, block.status, block.x, block.y + 1)){  //  下まで動かす
                block.y++;
            }
            next();
            break;
        case 39: // →
            if(checkOkeru(block.type, block.status, block.x + 1, block.y)) block.x++; // 右に動かせるなら動かす
            break;
        case 40: // ↓
            process();  // 下に動かせるなら動かす
            break;
        case 65: // 'a'
            if(!rotateKey) break;
            rotateKey = false;
            // 左に回転できるなら回転する
            block.status--;
            if(block.status < 0) block.status = block_status[block.type];
            if(!checkOkeru(block.type, block.status, block.x, block.y)) {
                block.status++;
                if(block.status > block_status[block.type]) block.status = 0;
            }
            break;
        case 83: // 's'
            // 右に回転できるなら回転する
            if(!rotateKey) break;
            rotateKey = false;
            block.status++;
            if(block.status > block_status[block.type]) block.status = 0;
            if(!checkOkeru(block.type, block.status, block.x, block.y)){
                block.status--;
                if(block.status < 0) block.status = block_status[block.type];
            }
            break;
    }
    console.log("block_status => " + block.status);
});

setInterval(graph, fps);
loop(); // メインループを実行
