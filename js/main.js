/*
 * Copyright (c) 2023 wayamoti2015@waya0125 All Rights Reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* 色々と参考にした資料のメモ
 * テトリスのスコア加算に関する資料 - https://ch-random.net/post/96/
 * windows.onloadを使ってはならない - https://took.jp/window-onload/
 *                                  - https://www.tam-tam.co.jp/tipsnote/javascript/post601.html
 * javascriptを取り扱う際のPath事情 - https://web-designer.cman.jp/other/path/
 * javascript側からHTMLを書き換える - https://web-camp.io/magazine/archives/78967
 * CSS Displayに関して              - https://developer.mozilla.org/ja/docs/Web/CSS/display
 * CSS SVGの取り扱い方法            - https://www.freecodecamp.org/japanese/news/use-svg-images-in-css-html/
 * innerHTMLの取り扱い              - https://developer.mozilla.org/ja/docs/Web/API/Element/innerHTML
 *
 * サイトにないメモ
 * Tetrisの描画をする際、Flexを使ったほうが楽だ！と言われたためこれを実践。
 * Flexを用いることで座標をLocal指定できるようになったため若干の位置修正だけで済むようになった。
 * ただし、Scoreにてパーセンテージを使って相対座標を取ろうとしたところ、1ブロック分=100%となった。
 * 原因はinline-blockを使っていたためで、これを削除したところ正常に動作した。
 * また、Flexを使うときはposition: absolute;を使うこと。
 *
 * また、テトリスの描画をする際、canvasを使うことも考えたが、
 * 今回はcanvasを使わずに実装した。
 *
 * 音声ファイルにはMpeg3とOgg Vorbisdeで検討した結果、圧縮をした音源でもキレイな音が出るOgg Vorbisdeを採用した。
 * また、音声ファイルには実際に収録したデータとインターネットにあるデータを使用している。
 * もし問題があれば即座に削除しますので、ご連絡ください。 - wayamoti2015@waya0125.com
 */

function Block(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.status = 0;
}

const block = new Block(4, 0, Math.floor(Math.random() * (7)));
let fps = 1000 / 60;   // 60fps
let fieldWidth = 12;   // フィールドの幅
let fieldHeight = 18;  // フィールドの高さ
let currentBlock = 1;  // 現在のブロック
let nextBlock = Math.floor(Math.random() * (7)); // 次のブロック
let rotateKey = true;  // 回転キーの連打防止
let level = 1;         // レベル
let score = 0;         // スコア
let lines = 0;         // 消したライン数
let combo = 0;         // コンボ数 (未実装)
let playingState = true; // 再生を止めるか否か (true: 一時停止, false: 再生)
let gameOver = false;  // ゲームオーバーか否か

// ブロックの種類
let cell = {
    none : 0,
    wall1 : 1,
    wall2 : 2,
    wall3 : 3,
    GameOver : 4,
    I : 10,
    O : 11,
    S : 12,
    Z : 13,
    J : 14,
    L : 15,
    T : 16,
};
// カウンタ
let cnt = 0;

/** 描画用メモリ<br>
 * 20*18のフィールド
 */
const viewRAM = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1]
];

// ゲームを管理するためのフィールド
const fieldRAM = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1]
];

/** 各ブロックの状態の数<br>
 * ステータス-1で使用すること
 */
let blockStatus = [1, 0, 1, 1, 3, 3, 3]

/** 各ブロックのデータ<br>
 * I, O, S, Z, J, L, T<br>
 * それぞれのブロックの状態の数はblock_statusに格納<br>
 * 回転可能な描画データを格納する<br>
 * 最大4つの状態を格納
 */
let blocks = [
    // Tetrimino I
    [
        [
            [cell.I, cell.I, cell.I, cell.I] // ■ ■ ■ ■
        ],
        [
            [cell.I], // ■
            [cell.I], // ■
            [cell.I], // ■
            [cell.I]  // ■
        ]
    ],

    // Tetrimino O
    [
        [
            [cell.O, cell.O], // ■ ■
            [cell.O, cell.O]  // ■ ■
        ]
    ],

    // Tetrimino S
    [
        [
            [cell.S, cell.none], // ■
            [cell.S, cell.S],    // ■ ■
            [cell.none, cell.S]     //   ■
        ],
        [
            [cell.none, cell.S, cell.S],   //   ■ ■
            [cell.S, cell.S, cell.none] // ■ ■
        ]
    ],

    // Tetrimino Z
    [
        [
            [cell.none, cell.Z],    //   ■
            [cell.Z, cell.Z],    // ■ ■
            [cell.Z, cell.none]  // ■
        ],
        [
            [cell.Z, cell.Z, cell.none], // ■ ■
            [cell.none, cell.Z, cell.Z]     //   ■ ■
        ]
    ],

    // Tetrimino J
    [
        [
            [cell.none, cell.J], //   ■
            [cell.none, cell.J], //   ■
            [cell.J, cell.J]  // ■ ■
        ],
        [
            [cell.J, cell.none, cell.none], // ■
            [cell.J, cell.J, cell.J]     // ■ ■ ■
        ],
        [
            [cell.J, cell.J],    // ■ ■
            [cell.J, cell.none], // ■
            [cell.J, cell.none]  // ■
        ],
        [
            [cell.J, cell.J, cell.J], //     ■
            [cell.none, cell.none, cell.J]  // ■ ■ ■
        ]
    ],

    // Tetrimino L
    [
        [
            [cell.L, cell.none], // ■
            [cell.L, cell.none], // ■
            [cell.L, cell.L]     // ■ ■
        ],
        [
            [cell.L, cell.L, cell.L],      // ■ ■ ■
            [cell.L, cell.none, cell.none] // ■
        ],
        [
            [cell.L, cell.L],    // ■ ■
            [cell.none, cell.L], //   ■
            [cell.none, cell.L]  //   ■
        ],
        [
            [cell.none, cell.none, cell.L],  //     ■
            [cell.L, cell.L, cell.L]         // ■ ■ ■
        ]
    ],

    // Tetrimino T
    [
        [
            [cell.T, cell.none], // ■
            [cell.T, cell.T],    // ■ ■
            [cell.T, cell.none]  // ■
        ],
        [
            [cell.T, cell.T, cell.T],      // ■ ■ ■
            [cell.none, cell.T, cell.none] //   ■
        ],
        [
            [cell.none, cell.T], //   ■
            [cell.T, cell.T],    // ■ ■
            [cell.none, cell.T]  //   ■
        ],
        [
            [cell.none, cell.T, cell.none], //   ■
            [cell.T, cell.T, cell.T]        // ■ ■ ■
        ]
    ]
];

/**
 * 配列コピー<br>
 * sa:     コピー元配列<br>
 * da:     コピー先配列<br>
 * sx:     コピー元のx座標<br>
 * sy:     コピー元のy座標<br>
 * dx:     コピー先のx座標<br>
 * dy:     コピー先のy座標<br>
 * width:  コピーする幅<br>
 * height: コピーする高さ<br>
 * ignore: コピーしない値
 */
function copy(sa, da, sx, sy, dx, dy, ignore) {
    let width = sa[0].length;
    let height = sa.length;

    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
            if(sa[sy + i][sx + j] === ignore) continue;
            da[dy + i][dx + j] = sa[sy + i][sx + j];
        }
    }
}

/** ブロックを設置できるか判定<br>
 * blockType: ブロックの種類<br>
 * status:    ブロックの状態<br>
 * x:         ブロックのx座標<br>
 * y:         ブロックのy座標<br>
 * return:    設置できるかどうか
 */
function setBlockCheck(blockType, status, x, y) {
    // 一時停止中なら動かさない
    if(playingState) return false;

    // ブロックデータ格納用
    const block = blocks[blockType][status];

    // ブロックの大きさを取得
    let w = block[0].length;
    let h = block.length;

    // ブロックがフィールドからはみ出していないか確認
    for(let i = y; i < y + h; i++) {
        for(let j = x; j < x + w; j++) {
            if(block[i-y][j-x] === cell.none) continue;
            if(fieldRAM[i][j] !== cell.none) return false;
        }
    }
    return true;
}

// viewRAMを描画 (viewRAM → html)
function draw() {
    // 出力場所の要素を取得
    let d = document.getElementById("tetriminoDraw");

    // tetriminoDrawへ書き込むhtmlを格納する変数
    let s = "";

    /* viewRAMをhtmlに変換
     * 1. viewRAMを走査
     * 2. cellの値によってclassを変更
     * 3. htmlに書き込む
     *
     * 出力時のhtmlの構造
     * <div class="caseの結果"></div>
     */
    for(let i = 0; i < fieldHeight; i++) {
        for(let j = 0; j < fieldWidth; j++) {
            s += "<div class='cell ";
            switch(viewRAM[i][j]) {
                case cell.wall1: s += "wall1"; break;
                case cell.wall2: s += "wall2"; break;
                case cell.wall3: s += "wall3"; break;
                case cell.I: s += "I"; break;
                case cell.O: s += "O"; break;
                case cell.S: s += "S"; break;
                case cell.Z: s += "Z"; break;
                case cell.J: s += "J"; break;
                case cell.L: s += "L"; break;
                case cell.T: s += "T"; break;
                case cell.none: break;
            }
            s += "'></div>";
        }
    }

    // 要素に書き込み
    d.innerHTML = s;
}

// フレームの最後 viewRAM に fieldRAM をコピー
function graph() {
    copy(fieldRAM, viewRAM, 0, 0, 0, 0, -1, 0); // viewRAM に fieldRAM をコピー
    copy(blocks[block.type][block.status], viewRAM, 0, 0, block.x, block.y, 0); // viewRAM にブロックをコピー
    draw();
}

// 下に動かせるか判定
function blockMove() {
    // 下に動かせるか？ このとき y 座標を +1 して判定
    if(setBlockCheck(block.type, block.status, block.x, block.y + 1)) {
        block.y++; // 動かせるなら動かす
    }
    else {
        blockGenerate(); // 動かせないなら次のブロックへ
    }
}

// 行列が埋まったら埋まった行を消して消えた分ブロックを下げる
function deleteLine(y) {
    // 消す音の再生
    soundDelete.currentTime = 0;
    soundDelete.play().then(r => r).catch(e => e); // エラーを無視

    for(let i = y; i > 0; i--) {
        for(let j = 1; j < fieldWidth - 1; j++) {
            fieldRAM[i][j] = fieldRAM[i-1][j];
        }
    }
}

// 動かせなくなったら次のブロックを登録
function blockGenerate() {
    // 現在のブロックを格納する変数
    currentBlock = nextBlock;

    // 次のブロックを格納する変数
    nextBlock = Math.floor(Math.random() * (7));

    // 設置音の再生
    soundSet.currentTime = 0;
    soundSet.play().then(r => r).catch(e => e); // エラーを無視

    // fieldに固定
    copy(blocks[block.type][block.status], fieldRAM, 0, 0, block.x, block.y, 0);

    // 消せる行があるか調べる
    for(let i = 0; i < fieldHeight; i++){
        let cnt = 0;
        for(let j = 0; j < fieldWidth; j++){
            cnt++;
            if(fieldRAM[i][j] === cell.none) break;
        }
        if(cnt === fieldWidth) {
            deleteLine(i);
            lines++;
            score += 40 * level;
        }
    }

    // ゲームオーバー判定
    for(let i = 1; i < fieldWidth - 1; i++) {
        if(fieldRAM[0][i] !== cell.none) {
            // 一度実行したら実行しない
            if(gameOver) return;

            // ゲームオーバー画面を表示
            gameOverViewer();
        }
    }

    // 次のブロックを登録
    block.type = currentBlock;
    block.x = 4;
    block.y = 0;
    block.status = 0;

    // 次のブロックを表示
    nextBlockViewer();
}

function nextBlockViewer() {
    // 出力場所の要素を取得
    let d = document.getElementById("nextBlockViewer");

    // nextBlockViewerへ書き込むhtmlを格納する変数
    let s = "";

    // 次出るブロックを描画
    s = "<img src='";
    switch(nextBlock) {
        case 0: s += "img/png/tetris_BoxI.png"; break;
        case 1: s += "img/png/tetris_BoxO.png"; break;
        case 2: s += "img/png/tetris_BoxS.png"; break;
        case 3: s += "img/png/tetris_BoxZ.png"; break;
        case 4: s += "img/png/tetris_BoxJ.png"; break;
        case 5: s += "img/png/tetris_BoxL.png"; break;
        case 6: s += "img/png/tetris_BoxT.png"; break;
    }
    s += "' id='nextBlockViewerImg' class='tetriminoNext ";
    switch(nextBlock) {
        case 0: s += "previewI"; break;
        case 1: s += "previewO"; break;
        case 2: s += "previewS"; break;
        case 3: s += "previewZ"; break;
        case 4: s += "previewJ"; break;
        case 5: s += "previewL"; break;
        case 6: s += "previewT"; break;
    }
    s += "'>";

    // 要素に書き込み
    d.innerHTML = s;
}

function tick() {
    let base = 1000;
    if(level === 1) return base;
    base -= level * 30;
}

/**
 * メインループ
 * 1秒経過するごとに実行
 * 1000ms = 1s
 */
function loop() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(gameOver) return;
    if(!playingState) {
        // ブロックを動かす
        blockMove();

        document.getElementById("score").textContent = score;
        document.getElementById("level").textContent = level;
        document.getElementById("lines").textContent = lines;
        //document.getElementById("combo").textContent = combo; // 未実装

        if(level < 10) if(score / 2000 > level) level++;
    }

    // 1秒経過するごとに実行
    setTimeout(loop, 1000 - ((level - 1) * 30));
}

// ゲームオーバー時の処理
function gameOverViewer() {
    // BGMを止める
    soundGameOver.currentTime = 0;
    soundBGM.pause();

    // ゲームオーバー音の再生
    soundGameOver.currentTime = 0;
    soundGameOver.play().then(r => r).catch(e => e); // エラーを無視

    soundGameOver.addEventListener('ended', (event) => {
        // ハイスコア音の再生
        soundHighScoreStart.currentTime = 0;
        soundHighScoreStart.play().then(r => r).catch(e => e); // エラーを無視

        soundHighScoreStart.addEventListener('ended', (event) => {
            // ハイスコアループ音の再生
            soundHighScoreLoop.currentTime = 0;
            soundHighScoreLoop.play().then(r => r).catch(e => e); // エラーを無視
        });
    });

    // ゲームオーバー
    gameOver = true;

    // ゲームオーバー画面を表示
    document.getElementById("playingState").textContent = "ゲームオーバー";
    alert("ゲームオーバー\nスコア: " + score + "\nレベル: " + level + "\nライン: " + lines);

    // ゲームオーバーになったらシェアボタンを表示 - https://style.potepan.com/articles/21691.html#onclick-2
    document.getElementById("shareTwitter").innerHTML = "<a class='twitter-share-button' href='' " +
        "onclick='shareToTwitter()' target='_blank' rel='nofollow noopener noreferrer'>" +
        "<img src='../img/webp/twitter_tweet.webp' width='80' height='20'></a>";
    document.getElementById("shareMisskey").innerHTML = "<a href='' onclick='shareToFediverse()' " +
        "target='_blank' rel='nofollow noopener noreferrer'><img src='../img/webp/misskey_note.webp' width='80' height='20'></a>";
}

// メモ: 改行には%0Aを使用する。スペースには%20を使用する。
const uri1 = "テトリスもどきで%20";
const uri2 = "%20ライン消して%20";
const uri3 = "%20点獲得しました！";
/* TwitterShare - https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/overview
                - https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent
                - https://hirashimatakumi.com/blog/1384.html
 */
function shareToTwitter() {
    // テキストの生成
    const text = uri1 + lines + uri2 + score + uri3 + "%0A&hashtags=テトリスもどき,WebTetris&related=waya0125";
    // 書き出し形式 https://twitter.com/intent/tweet?text=メッセージ&hashtags=ハッシュタグ&related=関連アカウント
    window.open(
        "https://twitter.com/intent/tweet?text=" + text,
        '',
        'width=800, height=600');
}
// MisskeyShare - https://misskeyshare.link/introduce.html
function shareToFediverse() {
    // テキストの生成
    const text = uri1 + lines + uri2 + score + uri3;
    // 書き出し形式 https://misskeyshare.link/share.html?text=メッセージ&url=URL
    window.open(
        "https://misskeyshare.link/share.html?text=" + text + "&url=" + 'https://waya0125.github.io/WebTetris/',
        '',
        'width=500, height=600');
}

/* 音声ファイルの読み込み
 * 音声操作に関する資料 - https://www.webdesignleaves.com/pr/jquery/javascript-audio.html
 *                      - https://blog.katsubemakito.net/html5/audio1
 *
 * 自動再生時ブラウザがブロックするため、ボタンを押したときに実行する
 * https://developer.mozilla.org/ja/docs/Web/Media/Autoplay_guide
 *
 * 開発環境ではなく実環境で用いる場合、"../../~"とすると404エラーが発生するため必要ない。
 *
 * サウンドを連続再生したときに音が重ならず単独で再生されてしまうので
 * これを回避するため再生前にcurrentTimeを0にする
 * https://blog.myntinc.com/2019/05/javascriptaudioplay.html
 *
 * BGM by https://www.youtube.com/playlist?list=PLKkxnBwFOJGIu3XSOHYW4r9dFyaoC9zNW
 * SE by https://www.youtube.com/watch?v=NhNQ4KQvUCw
 */
// MainBGM
let soundBGM = new Audio();
soundBGM.src = 'audio/tetris_TypeA.ogg';
soundBGM.loop = true;
soundBGM.volume = 0.1;
// 回転音
let soundRotate = new Audio();
soundRotate.src = 'audio/tetris_Rotate.ogg';
soundRotate.volume = 0.3;
// ゲームオーバー
let soundGameOver = new Audio();
soundGameOver.src = 'audio/tetris_GameOver.ogg';
soundGameOver.volume = 0.3;
// 通常削除音
let soundDelete = new Audio();
soundDelete.src = 'audio/tetris_Delete.ogg';
soundDelete.volume = 0.3;
// 4本削除音
let soundDelete4Line = new Audio();
soundDelete4Line.src = 'audio/tetris_Delete4Line.ogg';
soundDelete4Line.volume = 0.3;
// 設置音
let soundSet = new Audio();
soundSet.src = 'audio/tetris_Set.ogg';
soundSet.volume = 0.3;
// 一時停止音
let soundPause = new Audio();
soundPause.src = 'audio/tetris_Pause.ogg';
soundPause.volume = 0.1;
// ハイスコア（未実装だけどゲームオーバー後に流しておく）
let soundHighScoreStart = new Audio();
soundHighScoreStart.src = 'audio/tetris_HighScore_Start.ogg';
soundHighScoreStart.volume = 0.3;
let soundHighScoreLoop = new Audio();
soundHighScoreLoop.src = 'audio/tetris_HighScore_Loop.ogg';
soundHighScoreLoop.loop = true;
soundHighScoreLoop.volume = 0.3;

/* ボタンクリックイベント
 * ボタンを押したときに実行
 */

/* 一時停止ボタン
 * 一時停止する
 * playingStateがtrueなら一時停止する
 * playingStateがfalseなら再生する
 * playingStateの初期値はfalse
 * Powered by http://javascript123.seesaa.net/article/108875442.html
 */
document.getElementById("playing").addEventListener("click", function() {
    // trueとfalseの切り替え (否定演算子を使用)
    playingState = !playingState;

    if(playingState && !gameOver) {
        soundPause.currentTime = 0;
        soundPause.play().then(r => r).catch(e => e); // エラーを無視
        soundBGM.pause();
    }
    else if (!playingState && !gameOver) {
        soundBGM.play().then(r => r).catch(e => e); // エラーを無視
    }
    else if (gameOver) {
        location.reload();
    }

    // ボタンのテキストを切り替え
    document.getElementById("playingState").textContent = playingState ? "一時停止" : "再生";
});
// 右回転ボタン 1回転ごとにstatusを引いていく
document.getElementById("rotate").addEventListener("click", function() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(playingState || gameOver) return;

    block.status++;
    soundRotate.currentTime = 0;
    soundRotate.play().then(r => r).catch(e => e); // エラーを無視

    if(block.status > blockStatus[block.type]) block.status = 0;
    if(!setBlockCheck(block.type, block.status, block.x, block.y)){
        block.status--;
        if(block.status < 0) block.status = blockStatus[block.type];
    }
});
// 左移動ボタン 左に動かせるなら動かす
document.getElementById("left").addEventListener("click", function() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(playingState || gameOver) return;

    if(setBlockCheck(block.type, block.status, block.x - 1, block.y)) block.x--;
});
// 上移動ボタン 一気に下に設置
document.getElementById("up").addEventListener("click", function() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(playingState || gameOver) return;

    while(setBlockCheck(block.type, block.status, block.x, block.y + 1)){
        block.y++;
    }
    blockGenerate();
    score += 5 * level;
});
// 右移動ボタン 右に動かせるなら動かす
document.getElementById("right").addEventListener("click", function() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(playingState || gameOver) return;

    if(setBlockCheck(block.type, block.status, block.x + 1, block.y)) block.x++;
});
// 下移動ボタン 下に動かせるなら動かす
document.getElementById("down").addEventListener("click", function() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(playingState || gameOver) return;

    blockMove();
});

/* キーボードイベント
 * キーを押したときに実行
 * 旧式のキーコードでは非推奨になっていたためこれをcodeで置き換えた
 * https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/code
 *
 * 今回はキーを押したときに実行するのでkeydownを使用
 * https://developer.mozilla.org/ja/docs/Web/API/Document/keydown_event
 */
window.addEventListener(
    "keydown",
    (event) => {
        if (event.defaultPrevented) return; // イベントがすでに処理されている場合は何もしない

        // キーに応じて処理を分ける
        switch (event.code) {
            // 一時停止
            case "Escape":
                // ゲームオーバーならリロード
                if(gameOver) location.reload();

                // 一時停止中・開始前・ゲームオーバーなら動かさない
                if(!playingState) {
                    playingState = true;
                    soundPause.currentTime = 0;
                    soundPause.play().then(r => r).catch(e => e); // エラーを無視
                    soundBGM.pause();
                }
                else {
                    playingState = false;
                    soundBGM.play().then(r => r).catch(e => e); // エラーを無視
                }

                // ボタンのテキストを切り替え
                document.getElementById("playingState").textContent = playingState ? "一時停止" : "再生";

                break;
            // ハードドロップ
            case "Space":
            case "KeyW":
                // 一時停止中・開始前・ゲームオーバーなら動かさない
                if(playingState || gameOver) return;

                // 下に動かせるなら設置可能な最下層まで動かす
                while(setBlockCheck(block.type, block.status, block.x, block.y + 1)) block.y++;
                blockGenerate();    // 次のブロックへ
                score += 5 * level; // スコアを加算
                break;
            // ソフトドロップ
            case "KeyS":
            case "ArrowDown":
                // 一時停止中・開始前・ゲームオーバーなら動かさない
                if(playingState || gameOver) return;

                // 下に1マス動かす
                blockMove();
                break;
            // 左移動
            case "KeyA":
            case "ArrowLeft":
                // 左に動かせるなら動かす
                if(setBlockCheck(block.type, block.status, block.x - 1, block.y)) block.x--;
                break;
            // 右移動
            case "KeyD":
            case "ArrowRight":
                // 右に動かせるなら動かす
                if(setBlockCheck(block.type, block.status, block.x + 1, block.y)) block.x++;
                break;
            // 左回転
            case "KeyQ":
            case "KeyZ":
                // 一時停止中・開始前・ゲームオーバーなら動かさない
                if(playingState || gameOver) return;

                // 左に回転させる
                rotateKey = !rotateKey;

                // 回転音の再生
                soundRotate.currentTime = 0;
                soundRotate.play().then(r => r).catch(e => e); // エラーを無視

                // 左に回転できるなら回転する
                block.status--; // statusを引いていく

                // statusが-1になったらstatusを戻す
                if(block.status < 0) block.status = blockStatus[block.type];

                // 回転できないなら
                if(!setBlockCheck(block.type, block.status, block.x, block.y)) {
                    // statusを戻す
                    block.status++;

                    // statusが最大値を超えたらstatusを0に戻す
                    if(block.status > blockStatus[block.type]) block.status = 0;
                }
                break;
            // 右回転
            case "KeyE":
            case "ArrowUp":
                // 一時停止中・開始前・ゲームオーバーなら動かさない
                if(playingState || gameOver) return;

                // 右に回転させる
                rotateKey = !rotateKey;

                // 回転音の再生
                soundRotate.currentTime = 0;
                soundRotate.play().then(r => r).catch(e => e); // エラーを無視

                // 右に回転できるなら回転する
                block.status++; // statusを足していく

                // statusが最大値を超えたらstatusを0に戻す
                if(block.status > blockStatus[block.type]) block.status = 0;

                // 回転できないなら
                if(!setBlockCheck(block.type, block.status, block.x, block.y)){
                    // statusを戻す
                    block.status--;

                    // statusが-1になったらstatusを戻す
                    if(block.status < 0) block.status = blockStatus[block.type];
                }
        }
    },
    true, // キャプチャー
);

setInterval(graph, fps); // フレームの最後に実行
loop();                  // メインループを実行
