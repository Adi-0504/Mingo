/* Mingo — Core Game System
 * Version: 1.0.0
 * No backend
 * PWA-ready
 */

const Mingo = (() => {
    "use strict";

    const VERSION = "1.0.0";

    const GAMES = Object.freeze({
        watermelon: {
            id: "watermelon",
            name: {
                zh_TW: "大西瓜",
                zh_CN: "大西瓜",
                en: "Suika",
                ja: "スイカゲーム",
                ko: "수박 게임"
            }
        },

        mahjong: {
            id: "mahjong",
            name: {
                zh_TW: "麻將",
                zh_CN: "麻将",
                en: "Mahjong",
                ja: "麻雀",
                ko: "마작"
            }
        },

        gomoku: {
            id: "gomoku",
            name: {
                zh_TW: "五子棋",
                zh_CN: "五子棋",
                en: "Gomoku",
                ja: "五目並べ",
                ko: "오목"
            }
        },

        chess: {
            id: "chess",
            name: {
                zh_TW: "中國象棋",
                zh_CN: "中国象棋",
                en: "Chinese Chess",
                ja: "中国将棋",
                ko: "중국 장기"
            }
        },

        tetris: {
            id: "tetris",
            name: {
                zh_TW: "俄羅斯方塊",
                zh_CN: "俄罗斯方块",
                en: "Tetris",
                ja: "テトリス",
                ko: "테트리스"
            }
        },

        dinosaur: {
            id: "dinosaur",
            name: {
                zh_TW: "小恐龍",
                zh_CN: "小恐龍",
                en: "Dinosaur",
                ja: "恐竜",
                ko: "공룡"
            }
        }
    });

    const DIFFICULTIES = Object.freeze({
        easy: {
            id: "easy",
            name: {
                zh_TW: "簡單",
                zh_CN: "简单",
                en: "Easy",
                ja: "かんたん",
                ko: "쉬움"
            }
        },

        normal: {
            id: "normal",
            name: {
                zh_TW: "普通",
                zh_CN: "普通",
                en: "Normal",
                ja: "ふつう",
                ko: "보통"
            }
        },

        hard: {
            id: "hard",
            name: {
                zh_TW: "困難",
                zh_CN: "困难",
                en: "Hard",
                ja: "むずかしい",
                ko: "어려움"
            }
        }
    });

    const LANGUAGES = [
        "zh_TW",
        "zh_CN",
        "en",
        "ja",
        "ko"
    ];

    const DEFAULT_LANGUAGE = "zh_TW";
    const DEFAULT_DIFFICULTY = "normal";

    const STORAGE_KEY = "mingo.state.v1";

    let state = {
        language: DEFAULT_LANGUAGE,
        difficulty: DEFAULT_DIFFICULTY,
        currentGame: null,
        sound: true,
        music: true,
        vibration: true,
        scores: {},
        statistics: {}
    };

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);

            if (!raw) {
                return;
            }

            const saved = JSON.parse(raw);

            if (!saved || typeof saved !== "object") {
                return;
            }

            state = {
                ...state,
                ...saved
            };

            if (!LANGUAGES.includes(state.language)) {
                state.language = DEFAULT_LANGUAGE;
            }

            if (!DIFFICULTIES[state.difficulty]) {
                state.difficulty = DEFAULT_DIFFICULTY;
            }

        } catch (error) {
            console.warn("Mingo state could not be loaded.", error);
        }
    }

    function saveState() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );
        } catch (error) {
            console.warn("Mingo state could not be saved.", error);
        }
    }

    function getLanguage() {
        return state.language;
    }

    function setLanguage(language) {
        if (!LANGUAGES.includes(language)) {
            return false;
        }

        state.language = language;
        saveState();

        window.dispatchEvent(
            new CustomEvent("mingo:languagechange", {
                detail: {
                    language
                }
            })
        );

        return true;
    }

    function getDifficulty() {
        return state.difficulty;
    }

    function setDifficulty(difficulty) {
        if (!DIFFICULTIES[difficulty]) {
            return false;
        }

        state.difficulty = difficulty;
        saveState();

        window.dispatchEvent(
            new CustomEvent("mingo:difficultychange", {
                detail: {
                    difficulty
                }
            })
        );

        return true;
    }

    function getGame(gameId) {
        return GAMES[gameId] || null;
    }

    function getGames() {
        return Object.values(GAMES);
    }

    function getDifficulties() {
        return Object.values(DIFFICULTIES);
    }

    function setCurrentGame(gameId) {
        if (!GAMES[gameId]) {
            return false;
        }

        state.currentGame = gameId;
        saveState();

        window.dispatchEvent(
            new CustomEvent("mingo:gamechange", {
                detail: {
                    gameId
                }
            })
        );

        return true;
    }

    function clearCurrentGame() {
        state.currentGame = null;
        saveState();
    }

    function getCurrentGame() {
        return state.currentGame;
    }

    function setSound(enabled) {
        state.sound = Boolean(enabled);
        saveState();
    }

    function setMusic(enabled) {
        state.music = Boolean(enabled);
        saveState();
    }

    function setVibration(enabled) {
        state.vibration = Boolean(enabled);
        saveState();
    }

    function isSoundEnabled() {
        return state.sound;
    }

    function isMusicEnabled() {
        return state.music;
    }

    function isVibrationEnabled() {
        return state.vibration;
    }

    function vibrate(pattern = 10) {
        if (!state.vibration) {
            return;
        }

        if (
            typeof navigator !== "undefined" &&
            typeof navigator.vibrate === "function"
        ) {
            navigator.vibrate(pattern);
        }
    }

    function getScore(gameId) {
        return Number(state.scores[gameId] || 0);
    }

    function setScore(gameId, score) {
        if (!GAMES[gameId]) {
            return;
        }

        const numericScore = Math.max(
            0,
            Number(score) || 0
        );

        const oldScore = getScore(gameId);

        if (numericScore <= oldScore) {
            return;
        }

        state.scores[gameId] = numericScore;
        saveState();

        window.dispatchEvent(
            new CustomEvent("mingo:highscore", {
                detail: {
                    gameId,
                    score: numericScore,
                    previous: oldScore
                }
            })
        );
    }

    function addStatistic(gameId, result) {
        if (!GAMES[gameId]) {
            return;
        }

        if (!state.statistics[gameId]) {
            state.statistics[gameId] = {
                played: 0,
                wins: 0,
                losses: 0,
                draws: 0
            };
        }

        const stats = state.statistics[gameId];

        stats.played += 1;

        if (result === "win") {
            stats.wins += 1;
        }

        if (result === "loss") {
            stats.losses += 1;
        }

        if (result === "draw") {
            stats.draws += 1;
        }

        saveState();
    }

    function getStatistics(gameId) {
        if (!GAMES[gameId]) {
            return null;
        }

        return {
            played: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            ...(state.statistics[gameId] || {})
        };
    }

    function getState() {
        return structuredClone
            ? structuredClone(state)
            : JSON.parse(JSON.stringify(state));
    }

    function resetAllData() {
        state = {
            language: DEFAULT_LANGUAGE,
            difficulty: DEFAULT_DIFFICULTY,
            currentGame: null,
            sound: true,
            music: true,
            vibration: true,
            scores: {},
            statistics: {}
        };

        localStorage.removeItem(STORAGE_KEY);

        window.dispatchEvent(
            new CustomEvent("mingo:reset")
        );
    }

    function getGameName(gameId, language = state.language) {
        const game = getGame(gameId);

        if (!game) {
            return "";
        }

        return (
            game.name[language] ||
            game.name[DEFAULT_LANGUAGE] ||
            game.name.en
        );
    }

    function getDifficultyName(
        difficulty,
        language = state.language
    ) {
        const item = DIFFICULTIES[difficulty];

        if (!item) {
            return "";
        }

        return (
            item.name[language] ||
            item.name[DEFAULT_LANGUAGE] ||
            item.name.en
        );
    }

    function createGameSession(gameId, difficulty) {
        if (!GAMES[gameId]) {
            throw new Error(
                `Unknown game: ${gameId}`
            );
        }

        if (!DIFFICULTIES[difficulty]) {
            throw new Error(
                `Unknown difficulty: ${difficulty}`
            );
        }

        const session = {
            id: crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,

            gameId,

            difficulty,

            startedAt: Date.now(),

            endedAt: null,

            score: 0,

            status: "playing"
        };

        setCurrentGame(gameId);

        window.dispatchEvent(
            new CustomEvent("mingo:sessionstart", {
                detail: session
            })
        );

        return session;
    }

    function finishGameSession(session, result = null) {
        if (!session) {
            return;
        }

        session.status = "finished";
        session.endedAt = Date.now();

        if (result) {
            addStatistic(
                session.gameId,
                result
            );
        }

        setScore(
            session.gameId,
            session.score
        );

        window.dispatchEvent(
            new CustomEvent("mingo:sessionend", {
                detail: {
                    ...session,
                    result
                }
            })
        );

        clearCurrentGame();
    }

    loadState();

    return Object.freeze({
        VERSION,

        GAMES,
        DIFFICULTIES,
        LANGUAGES,

        getState,

        getLanguage,
        setLanguage,

        getDifficulty,
        setDifficulty,

        getGame,
        getGames,
        getGameName,

        getDifficulties,
        getDifficultyName,

        setCurrentGame,
        clearCurrentGame,
        getCurrentGame,

        setSound,
        setMusic,
        setVibration,

        isSoundEnabled,
        isMusicEnabled,
        isVibrationEnabled,

        vibrate,

        getScore,
        setScore,

        addStatistic,
        getStatistics,

        createGameSession,
        finishGameSession,

        resetAllData
    });
})();

window.Mingo = Mingo;
