const elements = {
    gridContainer: document.querySelector(".grid-container"),
    grid: document.querySelector(".grid"),
    minesNumber1: document.querySelector(".game_info_mines_number_1"),
    minesNumber2: document.querySelector(".game_info_mines_number_2"),
    minesNumber3: document.querySelector(".game_info_mines_number_3"),
    timeNumber1: document.querySelector(".game_info_time_number_1"),
    timeNumber2: document.querySelector(".game_info_time_number_2"),
    timeNumber3: document.querySelector(".game_info_time_number_3"),
    optionsDifficulty: document.querySelectorAll(".option_difficulty"),
    gameReset: document.querySelector("#game_reset"),
    gameStart: document.querySelector("#game_start"),
    gameTopIcon: document.querySelector(".game_top_icon"),
    cells: () => {
        return document.querySelectorAll(".cell");
    }
}

const actions = {
    gridpointerdown: false,
    topiconpointerdown: false
}

const buttonsClickedOnGrid = {
    button0: false,
    button1: false,
    button2: false,
}

const gameInfos = {
    level: "beginner",
    grid: {
        x: 9,
        y: 9,
        minesNb: 10
    },
    setGridDetails: function() {
        switch (this.level) {
            case "beginner":
                this.grid.x = 9;
                this.grid.y = 9;
                this.grid.minesNb = 10;
                break;
            case "intermediate":
                this.grid.x = 16;
                this.grid.y = 16;
                this.grid.minesNb = 40;
                break;
            case "expert":
                this.grid.x = 30;
                this.grid.y = 16;
                this.grid.minesNb = 99;
                break;
        }
    },
    setLevel: function(level) {
        if (!["beginner", "intermediate", "expert"].includes(level))
            throw new Error("Incorrect level given:", level);
        this.level = level;
    },
    time: {
        current: 0,
        starting: 0,
        get: function() {
            // console.log("this:", this);            
            return this.current - this.starting;
        }
    },
    status: {
        start: false,
        pause: false,
        end: false
    },
    play: {
        finish: ""
    }
}

const minesPositions = [];
const flagsPositions = [];
const gridHintsAndMines = [];
const iconsList = ["click", "confident", "heavysleep", "lose", "expert", "sleep", "start", "win", "flag", "mine"];

const getIconUrl = (icon) => {
    if (!iconsList.includes(icon))
        throw new Error("Incorrect icon given:", icon);
    return `assets/img/icons/${icon}.png`;
}

const getElement = (element) => {
    if (elements[element] === undefined)
        throw new Error("Incorrect element given:", element);
    if (element === "cells") {
        return elements[element]();
    } else {
        return elements[element];
    }
}

const getStatus = (status) => {
    if (gameInfos.status[status] === undefined)
        throw new Error("Incorrect status given:", status);
    return gameInfos.status[status];
}

const setStatus = (status, boolean) => {
    if (gameInfos.status[status] === undefined)
        throw new Error("Incorrect status given:", status);
    gameInfos.status[status] = boolean;
}

const getPlay = (item) => {
    if (gameInfos.play[item] === undefined)
        throw new Error("Incorrect item given:", item);
    return gameInfos.play[item];
}

const setPlay = (item, value) => {
    if (gameInfos.play[item] === undefined)
        throw new Error("Incorrect item given:", item);
    gameInfos.play[item] = value;
}

const changeGridDimensions = () => {
    console.log("changeGridDimensions");    
    getElement("gridContainer").style.setProperty("--xcellsnb", gameInfos.grid.x);
    getElement("gridContainer").style.setProperty("--ycellsnb", gameInfos.grid.y);
}

const clearGrid = () => {
    console.log("clearGrid");
    while (getElement("grid").firstChild) {
        getElement("grid").lastChild.remove();
    }
}

const generateCells = () => {
    console.log("generateCells");    
    const x = gameInfos.grid.x;
    const y = gameInfos.grid.y;

    clearGrid();

    for (let h = 0; h < y; h++) {
        for (let w = 0; w < x; w++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.setAttribute("data-x", w);
            cell.setAttribute("data-y", h);
            getElement("grid").append(cell);
        }
    }

}

const timeToDisplay = (duration) => {
    // console.log("convertMsToHrMnMs duration:", duration);
    let seconds = Math.floor((duration / 1000));
    if (seconds < 10) {
        return "0" + "0" + seconds;
    } else if (seconds >= 10 && seconds < 100) {
        return "0" + seconds;
    } else {
        return seconds;
    }
}

const displayTimeInfo = () => {
    const TIME_TO_DISPLAY = timeToDisplay(gameInfos.time.get()).toString();
    // console.log("TIME_TO_DISPLAY:", TIME_TO_DISPLAY);    
    const TIME_TO_DISPLAY_NUMBERS_ARRAY = TIME_TO_DISPLAY.split("");
    // console.log("TIME_TO_DISPLAY_NUMBERS_ARRAY:", TIME_TO_DISPLAY_NUMBERS_ARRAY);
    TIME_TO_DISPLAY_NUMBERS_ARRAY.forEach((n, index) => {
        // console.log("n:", n);
        getElement(`timeNumber${index + 1}`).textContent = n;
    });
}

const displayMinesInfo = () => {
    const MINES_TO_DISPLAY_NUMBERS_ARRAY = gameInfos.grid.minesNb.toString().split("");
    const originalLength = MINES_TO_DISPLAY_NUMBERS_ARRAY.length;
    if (originalLength < 3) {
        for (let i = 1; i <= 3 - originalLength; i++) {
            MINES_TO_DISPLAY_NUMBERS_ARRAY.unshift("");
        }
    }
    MINES_TO_DISPLAY_NUMBERS_ARRAY.forEach((n, index) => {
        getElement(`minesNumber${index + 1}`).textContent = n;
    });
}

const setMinesPositions = () => {
    console.log("setMinesPositions");    
    minesPositions.push([Math.floor(Math.random() * gameInfos.grid.x), Math.floor(Math.random() * gameInfos.grid.y)]);
    while (minesPositions.length < gameInfos.grid.minesNb) {
        const x = Math.floor(Math.random() * gameInfos.grid.x);
        const y = Math.floor(Math.random() * gameInfos.grid.y);
        let isAlreadyPresent = false;
        minesPositions.forEach(p => {
            if (p[0] === x && p[1] === y) isAlreadyPresent = true;
        });
        if (!isAlreadyPresent) minesPositions.push([Math.floor(Math.random() * gameInfos.grid.x), Math.floor(Math.random() * gameInfos.grid.y)]);
    }
    // console.log("minesPositions:", minesPositions);    
}

const generateGridHintsAndMines = () => {
    console.log("generateGridHintsAndMines");
    for (let y = 0; y < gameInfos.grid.y; y++) {
        gridHintsAndMines.push([]);
        for (let x = 0; x < gameInfos.grid.x; x++) {
            gridHintsAndMines[y].push(0);
        }
    }
    // console.log("gridHintsAndMines init:", gridHintsAndMines);    
    minesPositions.forEach(p => {
        // console.log("[p[1]][p[0]]:", p[1], p[0]);        
        gridHintsAndMines[p[1]][p[0]] = "m";
    });
    
    for (let y = 0; y < gridHintsAndMines.length; y++) {
        for (let x = 0; x < gridHintsAndMines[y].length; x++) {
            if (gridHintsAndMines[y][x] === "m") {
                console.log("M!");
                if (y - 1 >= 0) {
                    if (x - 1 >= 0 && gridHintsAndMines[y - 1][x - 1] !== "m") gridHintsAndMines[y - 1][x - 1]++;
                    if (gridHintsAndMines[y - 1][x] !== "m") gridHintsAndMines[y - 1][x]++;
                    if (x + 1 < gameInfos.grid.x && gridHintsAndMines[y - 1][x + 1] !== "m") gridHintsAndMines[y - 1][x + 1]++;
                }
                if (x - 1 >= 0 && gridHintsAndMines[y][x - 1] !== "m") gridHintsAndMines[y][x - 1]++;
                if (x + 1 < gameInfos.grid.x && gridHintsAndMines[y][x + 1] !== "m") gridHintsAndMines[y][x + 1]++;
                if (y + 1 < gameInfos.grid.y) {
                    if (x - 1 >= 0 && gridHintsAndMines[y + 1][x - 1] !== "m") gridHintsAndMines[y + 1][x - 1]++;
                    if (gridHintsAndMines[y + 1][x] !== "m") gridHintsAndMines[y + 1][x]++;
                    if (x + 1 < gameInfos.grid.x && gridHintsAndMines[y + 1][x + 1] !== "m") gridHintsAndMines[y + 1][x + 1]++;
                }
            }
        }
    }

    console.log("gridHintsAndMines:", gridHintsAndMines);
}

const checkHintsAndMines = (cell) => {
    console.log("checkHintsAndMines cell:", cell);
    if (gridHintsAndMines[cell.dataset.y][cell.dataset.x] !== 0) {
        const value = gridHintsAndMines[cell.dataset.y][cell.dataset.x];
        console.log("value:", value);
        if (value !== "m") {
            cell.setAttribute("data-number", value);
        } else {
            cell.setAttribute("data-number", "");
            cell.classList.add("mined");
            endGame("lose");
        }
    }
}

const countingTime = () => {
    console.log("countingTime");
    if (gameInfos.time.starting === 0) gameInfos.time.starting = Date.now();
    let loop;
    const timeLoop = () => {
        gameInfos.time.current = Date.now();
        // console.log("gameInfos.time.get():", gameInfos.time.get());        
        if (gameInfos.time.get() >= 999000) {
            endGame("lose");
        }
        if (getStatus("pause") || getStatus("end")) {
            cancelAnimationFrame(loop);
        } else {
            requestAnimationFrame(timeLoop);
        }
        displayTimeInfo();
    }
    loop = requestAnimationFrame(timeLoop);
}

const addFlag = (position) => {
    console.log("addFlag position:", position);
    const x = position.x;
    const y = position.y;
    let isAlreadyPresent = false;
    flagsPositions.forEach(p => {
        if (p[0] === x && p[1] === y) isAlreadyPresent = true;
    });
    if (!isAlreadyPresent) {
        flagsPositions.push([x, y]);
        gameInfos.grid.minesNb--;
        displayMinesInfo();
    }
}

const removeFlag = (position) => {
    console.log("removeFlag position:", position);
    const x = position.x;
    const y = position.y;    
    const index = flagsPositions.findIndex(p =>
        p[0] === x && p[1] === y
    );
    console.log("index:", index);    
    if (index !== -1) { 
        flagsPositions.splice(index, 1);
        gameInfos.grid.minesNb++;
        displayMinesInfo();
    }
}

const initialize = () => {
    minesPositions.length = 0;
    gridHintsAndMines.length = 0;
    actions.gridpointerdown = false;
    actions.topiconpointerdown = false;
    gameInfos.time.current = 0;
    gameInfos.time.starting = 0;
    generateCells();
    setMinesPositions();
    generateGridHintsAndMines();
    displayMinesInfo();
    displayTimeInfo();
}

const reset = () => {
    for (let i = 1; i <= 3; i++) {
        getElement(`timeNumber${i}`).textContent = "";
        getElement(`minesNumber${i}`).textContent = "";
    }
}

const resetGame = () => {
    console.log("resetGame");
    const willReset = confirm("Do you to reset the game?");
    if (!willReset) return;
    document.querySelector(".selected").classList.remove("selected");
    endGame();
    setTimeout(() => { reset(); }, 100);
}

const startGame = () => {
    console.log("startGame");
    initialize();
    setStatus("start", true);
    setStatus("end", false);
    setPlay("finish", "");
    getElement("gridContainer").classList.add("started");
    countingTime();
    getElement("gameTopIcon").src = `./${getIconUrl("start")}`;
}

const endGame = (finish) => {
    console.log("endGame");
    setStatus("end", true);
    setStatus("start", false);
    if (finish) setPlay("finish", finish);
    getElement("gridContainer").classList.remove("started");
    if (finish) getElement("gameTopIcon").src = `./${getIconUrl(finish)}`;
}

const gameSettings = (type, value) => {
    if (type === "level") {
        gameInfos.setLevel(value);
        gameInfos.setGridDetails();
    }
}

const firstInit = () => {
    console.log("firstInit");
    const level = "beginner";
    document.querySelector(`.option_difficulty_${level}`).classList.add("selected");
    gameSettings("level", level);
    changeGridDimensions();
    generateCells();
}

const pointerdownOnGrid = (event) => {
    console.log("pointerdownOnGrid event.target:", event.target.dataset.x, event.target.dataset.y);
    actions.gridpointerdown = true;
    if (getStatus("start")) {
        if (event.button >= 0 && event.button <= 2) buttonsClickedOnGrid[`button${event.button}`] = true;
        if (event.button === 0) {
            getElement("gameTopIcon").src = `./${getIconUrl("click")}`;
            getElement("cells").forEach(c => {
                if (c === event.target && getStatus("start")) {
                    if (!(c.classList.contains("clicked") || c.classList.contains("opened"))) c.classList.add("clicked");
                } else {
                    if (c.classList.contains("clicked")) c.classList.remove("clicked");
                }
            });
        } else if (event.button === 2) {
            getElement("gameTopIcon").src = `./${getIconUrl("confident")}`;
            getElement("cells").forEach(c => {
                if (c === event.target && getStatus("start")) {
                    if (!(c.classList.contains("clicked") || c.classList.contains("opened") || c.classList.contains("flagged"))) {
                        c.classList.add("flagged");
                        addFlag({ x: c.dataset.x, y: c.dataset.y });
                    } else {
                        if (c.classList.contains("flagged")) {
                            c.classList.remove("flagged");
                            removeFlag({ x: c.dataset.x, y: c.dataset.y });
                        }
                    }
                } else {
                    if (c.classList.contains("clicked")) c.classList.remove("clicked");
                }
            });
        } else {
            actions.gridpointerdown = false;
        }
    }
}

const pointermove = (event) => {
    // console.log("pointermove event.target:", event.target);
    getElement("cells").forEach(c => {
        if (c === event.target) {
            if (!(c.classList.contains("clicked") ||
                c.classList.contains("opened") ||
                c.classList.contains("flagged")) &&
                getStatus("start") &&
                actions.gridpointerdown &&
                buttonsClickedOnGrid.button0
            )
                c.classList.add("clicked");
        } else {
            if (c.classList.contains("clicked")) c.classList.remove("clicked");
        }
    });
    getElement("optionsDifficulty").forEach(o => {
        if (o !== event.target) {
            if (o.classList.contains("clicked")) o.classList.remove("clicked");
        }
    });
    if (event.target === getElement("gameStart") || event.target === getElement("gameTopIcon")) {
        if (!getElement("gameStart").classList.contains("clicked") && actions.topiconpointerdown) getElement("gameStart").classList.add("clicked");
    } else {
        if (getElement("gameStart").classList.contains("clicked")) getElement("gameStart").classList.remove("clicked");
    }
    if (event.target !== getElement("gameReset")) {
        if (getElement("gameReset").classList.contains("clicked")) getElement("gameReset").classList.remove("clicked");
    }
}

const pointerdownOnStart = (event) => {
    console.log("pointerdownOnStart event.target:", event.target);
    if (event.button !== 0) return;
    actions.topiconpointerdown = true;
    if (!getElement("gameStart").classList.contains("clicked")) getElement("gameStart").classList.add("clicked");
}

const pointerdownOnReset = (event) => {
    console.log("pointerdownOnReset event.target:", event.target);
    if (event.button !== 0) return;
    if (!event.currentTarget.classList.contains("clicked")) event.currentTarget.classList.add("clicked");
}

const pointerdownOnOption = (event) => {
    console.log("pointerdownOnOption event.target:", event.target);
    if (event.button !== 0) return;
    if (!event.target.classList.contains("clicked") && !event.target.classList.contains("selected") && !getStatus("start")) event.target.classList.add("clicked");
}

const pointerup = (event) => {
    console.log("pointerup event.target:", event.target);   
    getElement("cells").forEach(c => {
        if (c.classList.contains("clicked")) c.classList.remove("clicked");
        if (c === event.target &&
            getStatus("start") &&
            !c.classList.contains("flagged") &&
            actions.gridpointerdown &&
            buttonsClickedOnGrid.button0
        ) {
            if (!c.classList.contains("opened")) {
                c.classList.add("opened");
                checkHintsAndMines(c);
            }
        }
    });
    getElement("optionsDifficulty").forEach(o => {
        if (o === event.target && event.button === 0) {
            if (o.classList.contains("clicked") && !getStatus("start")) {
                if (document.querySelector(".selected"))
                    document.querySelector(".selected").classList.remove("selected")
                o.classList.add("selected");
                const type = o.dataset.type;
                const level = o.dataset[type];
                gameSettings(type, level);
                changeGridDimensions();
                generateCells();
            }
        }
        if (o.classList.contains("clicked")) o.classList.remove("clicked");
    });
    if (!getStatus("end")) getElement("gameTopIcon").src = `./${getIconUrl("start")}`;
    if (getElement("gameStart").classList.contains("clicked")) getElement("gameStart").classList.remove("clicked");
    if ((event.target === getElement("gameStart") || event.target === getElement("gameTopIcon")) && actions.topiconpointerdown) {
        console.log("start!!!");        
        startGame();
    }
    if ((event.target === getElement("gameReset") && event.target.classList.contains("clicked")) && event.button === 0) {
        console.log("reset!!!");
        resetGame();
    }
    if (getElement("gameReset").classList.contains("clicked")) getElement("gameReset").classList.remove("clicked");
    actions.gridpointerdown = false;
    actions.topiconpointerdown = false;
    buttonsClickedOnGrid.button0 = false;
    buttonsClickedOnGrid.button1 = false;
    buttonsClickedOnGrid.button2 = false;
}

firstInit();

getElement("grid").addEventListener("pointerdown", pointerdownOnGrid);
getElement("gameStart").addEventListener("pointerdown", pointerdownOnStart);
getElement("gameReset").addEventListener("pointerdown", pointerdownOnReset);
getElement("optionsDifficulty").forEach(o => o.addEventListener("pointerdown", pointerdownOnOption));
document.body.addEventListener("pointermove", pointermove);
document.body.addEventListener("pointerup", pointerup);
document.addEventListener('contextmenu', event => event.preventDefault());
