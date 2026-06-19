const elements = {
    gridContainer: document.querySelector(".grid-container"),
    grid: document.querySelector(".grid"),
    minesNumber1: document.querySelector(".game_info_mines_number_1"),
    minesNumber2: document.querySelector(".game_info_mines_number_2"),
    minesNumber3: document.querySelector(".game_info_mines_number_3"),
    timeNumber1: document.querySelector(".game_info_time_number_1"),
    timeNumber2: document.querySelector(".game_info_time_number_2"),
    timeNumber3: document.querySelector(".game_info_time_number_3"),
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
    }
}

const minesPositions = [];
const gridHintsAndMines = [];
const iconsList = ["click", "heavysleep", "lose", "expert", "sleep", "start", "win", "flag", "mine"];

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

const changeGridDimensions = () => {
    console.log("changeGridDimensions");    
    getElement("gridContainer").style.setProperty("--xcellsnb", gameInfos.grid.x);
    getElement("gridContainer").style.setProperty("--ycellsnb", gameInfos.grid.y);
}

const generateCells = () => {
    console.log("generateCells");    
    const x = gameInfos.grid.x;
    const y = gameInfos.grid.y;

    while (getElement("grid").firstChild) {
        getElement("grid").lastChild.remove();
    }

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
    console.log("TIME_TO_DISPLAY:", TIME_TO_DISPLAY);    
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
            endGame();
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
            endGame();
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

const startGame = () => {
    console.log("startGame");
    initialize();
    countingTime();
    setStatus("start", true);
    setStatus("end", false);
    getElement("gameTopIcon").src = `./${getIconUrl("start")}`;
}

const endGame = () => {
    console.log("endGame");
    setStatus("end", true);
    setStatus("start", false);
    getElement("gameTopIcon").src = `./${getIconUrl("lose")}`;
}

const gameSettings = (type, value) => {
    if (type === "level") {
        gameInfos.setLevel(value);
        gameInfos.setGridDetails();
    }
}

const pointerdownOnGrid = (event) => {
    console.log("pointerdownOnGrid event.target:", event.target.dataset.x, event.target.dataset.y);
    actions.gridpointerdown = true;
    if (getStatus("start")) {
        getElement("gameTopIcon").src = `./${getIconUrl("click")}`;
        getElement("cells").forEach(c => {
            if (c === event.target && getStatus("start")) {
                if (!(c.classList.contains("clicked") || c.classList.contains("opened"))) c.classList.add("clicked");
            } else {
                if (c.classList.contains("clicked")) c.classList.remove("clicked");
            }
        });
    }
}

const pointermove = (event) => {
    // console.log("pointermove event.target:", event.target);
    getElement("cells").forEach(c => {
        if (c === event.target) {
            if (!(c.classList.contains("clicked") || c.classList.contains("opened")) && getStatus("start") && actions.gridpointerdown)
                c.classList.add("clicked");
        } else {
            if (c.classList.contains("clicked")) c.classList.remove("clicked");
        }
    });
    if (event.target === getElement("gameStart") || event.target === getElement("gameTopIcon")) {
        if (!getElement("gameStart").classList.contains("clicked") && actions.topiconpointerdown) getElement("gameStart").classList.add("clicked");
    } else {
        if (getElement("gameStart").classList.contains("clicked")) getElement("gameStart").classList.remove("clicked");
    }
}

const pointerdownOnStart = (event) => {
    console.log("pointerdownOnStart event.target:", event.target);
    actions.topiconpointerdown = true;
    if (!getElement("gameStart").classList.contains("clicked")) getElement("gameStart").classList.add("clicked");
}

const pointerup = (event) => {
    console.log("pointerup event.target:", event.target);    
    getElement("cells").forEach(c => {
        if (c.classList.contains("clicked")) c.classList.remove("clicked");
        if (c === event.target && getStatus("start") && actions.gridpointerdown) {
            if (!c.classList.contains("opened")) {
                c.classList.add("opened");
                checkHintsAndMines(c);
            }
        }
    });
    if (!getStatus("end")) getElement("gameTopIcon").src = `./${getIconUrl("start")}`;
    if (getElement("gameStart").classList.contains("clicked")) getElement("gameStart").classList.remove("clicked");
    if ((event.target === getElement("gameStart") || event.target === getElement("gameTopIcon")) && actions.topiconpointerdown) {
        console.log("start!!!");        
        getElement("gameStart").classList.add("started");
        startGame();
    }
    actions.gridpointerdown = false;
    actions.topiconpointerdown = false;
}


gameSettings("level", "intermediate");
changeGridDimensions();
generateCells();

getElement("grid").addEventListener("pointerdown", pointerdownOnGrid);
getElement("gameStart").addEventListener("pointerdown", pointerdownOnStart);
document.body.addEventListener("pointermove", pointermove);
document.body.addEventListener("pointerup", pointerup);