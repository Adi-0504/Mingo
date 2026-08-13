(() => {
    "use strict";

    if (!window.Mingo) {
        throw new Error("Mingo Core must be loaded before games.js");
    }

    class MingoGame {
        constructor(options = {}) {
            this.id = options.id || "unknown";
            this.canvas = options.canvas || null;
            this.difficulty =
                options.difficulty ||
                Mingo.getDifficulty();

            this.running = false;
            this.paused = false;
            this.gameOver = false;

            this.score = 0;
            this.level = 1;

            this.width = 0;
            this.height = 0;

            this.dpr = Math.min(
                window.devicePixelRatio || 1,
                2
            );

            this.lastTime = 0;
            this.elapsed = 0;

            this.animationFrame = null;

            this.pointer = {
                x: 0,
                y: 0,
                down: false,
                pressed: false
            };

            this.keys = new Set();

            this.boundLoop =
                this.loop.bind(this);

            this.boundResize =
                this.resize.bind(this);

            this.boundPointerDown =
                this.handlePointerDown.bind(this);

            this.boundPointerMove =
                this.handlePointerMove.bind(this);

            this.boundPointerUp =
                this.handlePointerUp.bind(this);

            this.boundKeyDown =
                this.handleKeyDown.bind(this);

            this.boundKeyUp =
                this.handleKeyUp.bind(this);

            this.setupCanvas();
            this.bindEvents();
        }

        setupCanvas() {
            if (!this.canvas) {
                throw new Error(
                    `Canvas missing for game: ${this.id}`
                );
            }

            this.canvas.style.touchAction =
                "none";

            this.canvas.style.display =
                "block";

            this.ctx =
                this.canvas.getContext("2d", {
                    alpha: false,
                    desynchronized: true
                });

            if (!this.ctx) {
                throw new Error(
                    "Canvas 2D context is unavailable."
                );
            }

            this.resize();
        }

        bindEvents() {
            window.addEventListener(
                "resize",
                this.boundResize,
                {
                    passive: true
                }
            );

            this.canvas.addEventListener(
                "pointerdown",
                this.boundPointerDown
            );

            this.canvas.addEventListener(
                "pointermove",
                this.boundPointerMove
            );

            window.addEventListener(
                "pointerup",
                this.boundPointerUp
            );

            window.addEventListener(
                "keydown",
                this.boundKeyDown
            );

            window.addEventListener(
                "keyup",
                this.boundKeyUp
            );
        }

        unbindEvents() {
            window.removeEventListener(
                "resize",
                this.boundResize
            );

            this.canvas.removeEventListener(
                "pointerdown",
                this.boundPointerDown
            );

            this.canvas.removeEventListener(
                "pointermove",
                this.boundPointerMove
            );

            window.removeEventListener(
                "pointerup",
                this.boundPointerUp
            );

            window.removeEventListener(
                "keydown",
                this.boundKeyDown
            );

            window.removeEventListener(
                "keyup",
                this.boundKeyUp
            );
        }

        resize() {
            if (!this.canvas) {
                return;
            }

            const rect =
                this.canvas.getBoundingClientRect();

            this.width =
                Math.max(1, rect.width);

            this.height =
                Math.max(1, rect.height);

            this.dpr =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

            this.canvas.width =
                Math.round(
                    this.width * this.dpr
                );

            this.canvas.height =
                Math.round(
                    this.height * this.dpr
                );

            this.ctx.setTransform(
                this.dpr,
                0,
                0,
                this.dpr,
                0,
                0
            );

            this.onResize(
                this.width,
                this.height
            );

            this.render();
        }

        onResize() {
            // Override in individual games.
        }

        start() {
            if (this.running) {
                return;
            }

            this.running = true;
            this.paused = false;
            this.gameOver = false;

            this.lastTime =
                performance.now();

            this.elapsed = 0;

            this.onStart();

            this.animationFrame =
                requestAnimationFrame(
                    this.boundLoop
                );
        }

        onStart() {
            // Override in individual games.
        }

        stop() {
            this.running = false;

            if (this.animationFrame !== null) {
                cancelAnimationFrame(
                    this.animationFrame
                );

                this.animationFrame = null;
            }

            this.onStop();
        }

        onStop() {
            // Override in individual games.
        }

        pause() {
            if (!this.running) {
                return;
            }

            if (this.gameOver) {
                return;
            }

            this.paused = true;

            this.onPause();

            this.render();
        }

        resume() {
            if (!this.running) {
                return;
            }

            if (this.gameOver) {
                return;
            }

            this.paused = false;

            this.lastTime =
                performance.now();

            this.onResume();

            this.animationFrame =
                requestAnimationFrame(
                    this.boundLoop
                );
        }

        onPause() {
            // Override in individual games.
        }

        onResume() {
            // Override in individual games.
        }

        restart() {
            this.stop();

            this.score = 0;
            this.level = 1;
            this.elapsed = 0;

            this.running = false;
            this.paused = false;
            this.gameOver = false;

            this.onReset();

            this.start();
        }

        onReset() {
            // Override in individual games.
        }

        loop(timestamp) {
            if (!this.running) {
                return;
            }

            if (this.paused) {
                return;
            }

            const rawDelta =
                timestamp -
                this.lastTime;

            this.lastTime =
                timestamp;

            const delta =
                Math.min(
                    rawDelta / 1000,
                    0.05
                );

            this.elapsed += delta;

            this.update(delta);

            this.render();

            this.pointer.pressed = false;

            this.animationFrame =
                requestAnimationFrame(
                    this.boundLoop
                );
        }

        update() {
            // Override in individual games.
        }

        render() {
            this.clear();

            this.draw();

            if (this.paused) {
                this.drawPauseOverlay();
            }

            if (this.gameOver) {
                this.drawGameOverOverlay();
            }
        }

        draw() {
            // Override in individual games.
        }

        clear() {
            this.ctx.save();

            this.ctx.fillStyle =
                "#F8F5EF";

            this.ctx.fillRect(
                0,
                0,
                this.width,
                this.height
            );

            this.ctx.restore();
        }

        drawPauseOverlay() {
            this.ctx.save();

            this.ctx.fillStyle =
                "rgba(25, 42, 46, 0.45)";

            this.ctx.fillRect(
                0,
                0,
                this.width,
                this.height
            );

            this.ctx.textAlign =
                "center";

            this.ctx.textBaseline =
                "middle";

            this.ctx.fillStyle =
                "#FFFFFF";

            this.ctx.font =
                "600 30px system-ui, sans-serif";

            this.ctx.fillText(
                this.getText(
                    "paused",
                    "已暫停"
                ),
                this.width / 2,
                this.height / 2
            );

            this.ctx.restore();
        }

        drawGameOverOverlay() {
            this.ctx.save();

            this.ctx.fillStyle =
                "rgba(25, 42, 46, 0.48)";

            this.ctx.fillRect(
                0,
                0,
                this.width,
                this.height
            );

            const centerX =
                this.width / 2;

            const centerY =
                this.height / 2;

            this.ctx.fillStyle =
                "#FFFFFF";

            this.ctx.textAlign =
                "center";

            this.ctx.textBaseline =
                "middle";

            this.ctx.font =
                "700 34px system-ui, sans-serif";

            this.ctx.fillText(
                this.getText(
                    "gameOver",
                    "遊戲結束"
                ),
                centerX,
                centerY - 35
            );

            this.ctx.font =
                "600 20px system-ui, sans-serif";

            this.ctx.fillText(
                `${this.getText(
                    "score",
                    "分數"
                )} ${this.score}`,
                centerX,
                centerY + 12
            );

            this.ctx.font =
                "500 15px system-ui, sans-serif";

            this.ctx.fillText(
                this.getText(
                    "restartHint",
                    "按重新開始繼續"
                ),
                centerX,
                centerY + 48
            );

            this.ctx.restore();
        }

        endGame(result = null) {
            if (this.gameOver) {
                return;
            }

            this.gameOver = true;
            this.running = false;

            if (
                typeof this.onGameOver ===
                "function"
            ) {
                this.onGameOver(result);
            }

            const sessionScore =
                Number(this.score) || 0;

            Mingo.setScore(
                this.id,
                sessionScore
            );

            this.onScoreChanged(
                sessionScore
            );

            this.render();
        }

        onGameOver() {
            // Override in individual games.
        }

        setScore(value) {
            const next =
                Math.max(
                    0,
                    Number(value) || 0
                );

            this.score = next;

            this.onScoreChanged(
                this.score
            );
        }

        addScore(value) {
            this.setScore(
                this.score +
                (Number(value) || 0)
            );
        }

        onScoreChanged() {
            // Override in individual games.
        }

        setLevel(value) {
            this.level =
                Math.max(
                    1,
                    Math.floor(
                        Number(value) || 1
                    )
                );

            this.onLevelChanged(
                this.level
            );
        }

        onLevelChanged() {
            // Override in individual games.
        }

        getSpeedMultiplier() {
            switch (this.difficulty) {
                case "easy":
                    return 0.8;

                case "hard":
                    return 1.35;

                case "normal":
                default:
                    return 1;
            }
        }

        getDifficultyValue(
            easy,
            normal,
            hard
        ) {
            switch (this.difficulty) {
                case "easy":
                    return easy;

                case "hard":
                    return hard;

                case "normal":
                default:
                    return normal;
            }
        }

        handlePointerDown(event) {
            if (
                this.gameOver ||
                this.paused
            ) {
                return;
            }

            const point =
                this.getPointerPosition(
                    event
                );

            this.pointer.x =
                point.x;

            this.pointer.y =
                point.y;

            this.pointer.down = true;
            this.pointer.pressed = true;

            this.onPointerDown(
                point.x,
                point.y,
                event
            );
        }

        handlePointerMove(event) {
            const point =
                this.getPointerPosition(
                    event
                );

            this.pointer.x =
                point.x;

            this.pointer.y =
                point.y;

            this.onPointerMove(
                point.x,
                point.y,
                event
            );
        }

        handlePointerUp(event) {
            const point =
                this.getPointerPosition(
                    event
                );

            this.pointer.x =
                point.x;

            this.pointer.y =
                point.y;

            this.pointer.down = false;

            this.onPointerUp(
                point.x,
                point.y,
                event
            );
        }

        getPointerPosition(event) {
            const rect =
                this.canvas.getBoundingClientRect();

            return {
                x:
                    event.clientX -
                    rect.left,

                y:
                    event.clientY -
                    rect.top
            };
        }

        onPointerDown() {
            // Override.
        }

        onPointerMove() {
            // Override.
        }

        onPointerUp() {
            // Override.
        }

        handleKeyDown(event) {
            const key =
                event.key.toLowerCase();

            this.keys.add(key);

            if (
                key === " " ||
                key === "arrowup" ||
                key === "arrowdown" ||
                key === "arrowleft" ||
                key === "arrowright"
            ) {
                event.preventDefault();
            }

            if (
                key === "escape" &&
                this.running &&
                !this.gameOver
            ) {
                if (this.paused) {
                    this.resume();
                } else {
                    this.pause();
                }

                return;
            }

            if (
                this.gameOver &&
                key === "r"
            ) {
                this.restart();

                return;
            }

            this.onKeyDown(
                key,
                event
            );
        }

        handleKeyUp(event) {
            const key =
                event.key.toLowerCase();

            this.keys.delete(key);

            this.onKeyUp(
                key,
                event
            );
        }

        onKeyDown() {
            // Override.
        }

        onKeyUp() {
            // Override.
        }

        isKeyDown(key) {
            return this.keys.has(
                key.toLowerCase()
            );
        }

        getText(key, fallback = "") {
            const dictionary = {
                paused: {
                    zh_TW: "已暫停",
                    zh_CN: "已暂停",
                    en: "Paused",
                    ja: "一時停止",
                    ko: "일시정지"
                },

                gameOver: {
                    zh_TW: "遊戲結束",
                    zh_CN: "游戏结束",
                    en: "Game Over",
                    ja: "ゲームオーバー",
                    ko: "게임 오버"
                },

                score: {
                    zh_TW: "分數",
                    zh_CN: "分数",
                    en: "Score",
                    ja: "スコア",
                    ko: "점수"
                },

                restartHint: {
                    zh_TW: "按重新開始繼續",
                    zh_CN: "按重新开始继续",
                    en: "Restart to play again",
                    ja: "再スタートで遊べます",
                    ko: "다시 시작하면 플레이할 수 있습니다"
                }
            };

            const item =
                dictionary[key];

            if (!item) {
                return fallback;
            }

            return (
                item[
                    Mingo.getLanguage()
                ] ||
                item.zh_TW ||
                fallback
            );
        }

        destroy() {
            this.stop();
            this.unbindEvents();

            this.canvas = null;
            this.ctx = null;
        }
    }

    class MingoGameManager {
        constructor() {
            this.current = null;
            this.container = null;
        }

        mount(container) {
            this.container = container;
        }

        createCanvas(className = "") {
            if (!this.container) {
                throw new Error(
                    "Game manager is not mounted."
                );
            }

            const canvas =
                document.createElement("canvas");

            canvas.className =
                className;

            canvas.setAttribute(
                "aria-label",
                "Mingo game canvas"
            );

            this.container.innerHTML = "";

            this.container.appendChild(
                canvas
            );

            return canvas;
        }

        setGame(game) {
            this.destroy();

            this.current = game;

            if (game) {
                game.start();
            }
        }

        pause() {
            if (this.current) {
                this.current.pause();
            }
        }

        resume() {
            if (this.current) {
                this.current.resume();
            }
        }

        restart() {
            if (this.current) {
                this.current.restart();
            }
        }

        destroy() {
            if (!this.current) {
                return;
            }

            this.current.destroy();
            this.current = null;
        }

        getCurrentGame() {
            return this.current;
        }
    }

    window.MingoGame =
        MingoGame;

    window.MingoGameManager =
        MingoGameManager;

})();
