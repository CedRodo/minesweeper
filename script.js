const elements = {
    minesweeperContainer: document.querySelector(".minesweeper-container"),
    optionsContainer: document.querySelector(".options-container"),
    gridContainer: document.querySelector(".grid-container"),
    grid: document.querySelector(".grid"),
    minesNumber1: document.querySelector(".game_info_mines_number_1"),
    minesNumber2: document.querySelector(".game_info_mines_number_2"),
    minesNumber3: document.querySelector(".game_info_mines_number_3"),
    timeNumber1: document.querySelector(".game_info_time_number_1"),
    timeNumber2: document.querySelector(".game_info_time_number_2"),
    timeNumber3: document.querySelector(".game_info_time_number_3"),
    optionsDifficulty: document.querySelectorAll(".option_difficulty"),
    optionCustomGridHeight: document.querySelector("#option_custom_grid_height"),
    optionCustomGridWidth: document.querySelector("#option_custom_grid_width"),
    optionCustomGridMines: document.querySelector("#option_custom_grid_mines"),
    gamePreferences: document.querySelector("#game_preferences"),
    gameReset: document.querySelector("#game_reset"),
    gameStart: document.querySelector("#game_start"),
    gameTopIcon: document.querySelector(".game_top_icon"),
    cells: () => {
        return document.querySelectorAll(".cell");
    }
}

const actions = {
    gridpointerdown: false,
    topiconpointerdown: false,
    touchdown: false,
    longtouch: true,
    touchtarget: null,
    touchdowntimestart: 0,
    touchdowntimeend: 0
}

const buttonsClickedOnGrid = {
    button0: false,
    button1: false,
    button2: false,
}

const gamePreferences = {
    coloredTheme: "gray",
    customGrid: {
        x: 9,
        y: 9,
        minesNb: 10
    }
}

const gameInfos = {
    level: "beginner",
    grid: {
        x: 9,
        y: 9,
        minesNb: 10,
        flagsPlaced: 0,
        flagsAutoRevealed: 0,
        cellsOpened: 0,
        firstClickPosition: { x: null, y: null }
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
            case "custom":
                this.grid.x = gamePreferences.customGrid.x;
                this.grid.y = gamePreferences.customGrid.y;
                this.grid.minesNb = gamePreferences.customGrid.minesNb;
                break;
        }
    },
    setLevel: function(level) {
        if (!["beginner", "intermediate", "expert", "custom"].includes(level))
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
    },
    lastTimeClick: 0
}

const minesPositions = [];
const flagsPositions = [];
const openedCellsPositions = [];
const gridHintsAndMines = [];
let touchTimeout;
const coloredThemesList = [
    "gray", "blue", "orange", "beige", "aquamarine", "lightgray", "darkgray", "burlywood", "cyan", "pink", "lightpink", "deeppink", "gainsboro",
    "gold", "khaki", "lavender", "lightblue", "lightskyblue", "lightgreen", "linen", "magenta", "mediumaquamarine", "royalblue", "skyblue", "steelblue",
    "thistle", "tomato", "turquoise", "violet", "wheat", "whitesmoke"
];
const iconsList = [
    "click", "confident", "deepsleep", "expert", "flag", "heavysleep", "illogic", "lose", "mine",    "sleep", "start","win", "waiting", "worryish", "worried", "worrier", "worriest"
];

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

const getCell = (position) => { 
    // console.log("getCell position:", position);
    const x = parseInt(position.x);
    const y = parseInt(position.y);
    const cell = Array.from(getElement("cells")).find(c => {
        // console.log("c:", c);        
        // console.log("c.dataset.x:", c.dataset.x);        
        // console.log("c.dataset.y:", c.dataset.y);        
        if (parseInt(c.dataset.x) === x && parseInt(c.dataset.y) === y)
            return c
    });
    // console.log("cell:", cell);    
    return cell;
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

///////////////////// OPTIONS /////////////////////

const generateColorThemes = () => {
    console.log("generateColorThemes");
    coloredThemesList.forEach(t =>  {
        const coloredThemeCell = document.createElement("div");
        coloredThemeCell.classList.add("color_theme_cell", `color_theme_cell_${t}`);
        coloredThemeCell.setAttribute("data-color", t);
        coloredThemeCell.addEventListener("pointerup", () => {
            document.querySelectorAll(".color_theme_cell").forEach(c => c.classList.remove("color_theme_selected"));
            coloredThemeCell.classList.add("color_theme_selected");
            gameSettings("color", coloredThemeCell.dataset.color);
        });
        document.querySelector(".option_colored_themes_selection-container").append(coloredThemeCell);
    });
}

const changeCustomGridHeightValue = (event) => {
    console.log("changeCustomGridHeightValue event.currentTarget.value:", event.currentTarget.value);
    gamePreferences.customGrid.y = parseInt(event.currentTarget.value);
    const inputMinesNbMaxValue = (gamePreferences.customGrid.x * gamePreferences.customGrid.y) - 1;
    getElement("optionCustomGridMines").setAttribute("max", inputMinesNbMaxValue);
    if (parseInt(getElement("optionCustomGridMines").getAttribute("value")) > inputMinesNbMaxValue) {
        getElement("optionCustomGridMines").setAttribute("value", inputMinesNbMaxValue);
    }
    getElement("optionsDifficulty").forEach(o => {        
            if (!o.classList.contains("option_difficulty_custom")) {
                if (o.classList.contains("selected")) o.classList.remove("selected");
            } else {
                o.classList.add("selected");
            }
    });
    gameSettings("level", "custom");
    changeGridDimensions();
    initialize();
}

const changeCustomGridWidthValue = (event) => {
    console.log("changeCustomGridWidthValue event.currentTarget.value:", event.currentTarget.value);
    gamePreferences.customGrid.x = parseInt(event.currentTarget.value);
    const inputMinesNbMaxValue = (gamePreferences.customGrid.x * gamePreferences.customGrid.y) - 1;
    getElement("optionCustomGridMines").setAttribute("max", inputMinesNbMaxValue);
    if (parseInt(getElement("optionCustomGridMines").getAttribute("value")) > inputMinesNbMaxValue) {
        getElement("optionCustomGridMines").setAttribute("value", inputMinesNbMaxValue);
    }
    getElement("optionsDifficulty").forEach(o => {
        if (!o.classList.contains("option_difficulty_custom")) {
            if (o.classList.contains("selected")) o.classList.remove("selected");
        } else {
            o.classList.add("selected");
        }
    });
    gameSettings("level", "custom");
    changeGridDimensions();
    initialize();
}

const changeCustomGridMinesValue = (event) => {
    // console.log("changeCustomGridMinesValue event.currentTarget.value:", event.currentTarget.value);
    event.currentTarget.setAttribute("value", event.currentTarget.value);
    gamePreferences.customGrid.minesNb = parseInt(event.currentTarget.value);
    getElement("optionsDifficulty").forEach(o => {
        if (!o.classList.contains("option_difficulty_custom")) {
            if (o.classList.contains("selected")) o.classList.remove("selected");
        } else {
            o.classList.add("selected");
        }
    });
    gameSettings("level", "custom");
    changeGridDimensions();
    initialize();
}

const changeGridColoredTheme = () => {
    console.log("changeGridColoredTheme");
    getElement("gridContainer").dataset.color = gamePreferences.coloredTheme;
}


////////////////////// GAME //////////////////////

const changeGridDimensions = () => {
    console.log("changeGridDimensions");    
    getElement("gridContainer").style.setProperty("--xcellsnb", gameInfos.grid.x);
    getElement("gridContainer").style.setProperty("--ycellsnb", gameInfos.grid.y);
    if (gameInfos.grid.x > 16) {
        getElement("minesweeperContainer").classList.add("scroll");
    } else {
        if (getElement("minesweeperContainer").classList.contains("scroll"))
            getElement("minesweeperContainer").classList.remove("scroll");
    }
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
    const nb = gameInfos.grid.minesNb - (gameInfos.grid.flagsPlaced + gameInfos.grid.flagsAutoRevealed);
    const MINES_TO_DISPLAY_NUMBERS_ARRAY = nb.toString().split("");
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
    const fCPx = parseInt(gameInfos.grid.firstClickPosition.x);
    const fCPy = parseInt(gameInfos.grid.firstClickPosition.y);
    if (fCPx === null ||
        fCPy === null) {
        throw new Error("MIssing firstClickPosition full position");
    }
    // minesPositions.push([Math.floor(Math.random() * gameInfos.grid.x), Math.floor(Math.random() * gameInfos.grid.y)]);
    while (minesPositions.length < gameInfos.grid.minesNb) {
        const x = Math.floor(Math.random() * gameInfos.grid.x);
        const y = Math.floor(Math.random() * gameInfos.grid.y);
        const isAlreadyPresent = minesPositions.find(p => p[0] === x && p[1] === y);
        console.log("isAlreadyPresent/x -> fCPx/y -> fCPy:", isAlreadyPresent, "/", x,"->",fCPx,"/", y,"->",fCPy);
        console.log("isAlreadyPresent === undefined && !((x === fCPx) && (y === fCPy)):", isAlreadyPresent === undefined && !((x === fCPx) && (y === fCPy)));        
        if (isAlreadyPresent === undefined && !((x === fCPx) && (y === fCPy)))
            minesPositions.push([x, y]);
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

const checkIfWin = () => {
    console.log("checkIfWin");
    let isWin = false;
    console.log("checkIfWin getAllOpenedNotMinedCells():", getAllOpenedNotMinedCells());
    // console.log("(gameInfos.grid.x * gameInfos.grid.y) - (gameInfos.grid.minesNb):", (gameInfos.grid.x * gameInfos.grid.y) - (gameInfos.grid.minesNb));    
    const hasCorrectNumberOfOpenedCells = getAllOpenedNotMinedCells() === (gameInfos.grid.x * gameInfos.grid.y) - (gameInfos.grid.minesNb);
    let hasFlagPlacedCorrectly = true;
    if (flagsPositions.length > 0) flagsPositions.forEach(fp => {
        const isPresent = minesPositions.find(mp => mp[0] === fp[0] && mp[1] === fp[1]);
        // console.log("isPresent:", isPresent);        
        if (isPresent === undefined) hasFlagPlacedCorrectly = false;
    });
    console.log("hasCorrectNumberOfOpenedCells:", hasCorrectNumberOfOpenedCells);    
    console.log("hasFlagPlacedCorrectly:", hasFlagPlacedCorrectly);    
    return hasCorrectNumberOfOpenedCells && hasFlagPlacedCorrectly;
}

const countingTime = () => {
    console.log("countingTime");
    if (gameInfos.time.starting === 0) {
        gameInfos.time.starting = Date.now();
        gameInfos.lastTimeClick = gameInfos.time.starting;
    }
    let loop;
    const timeLoop = () => {
        if (getStatus("pause") || getStatus("end")) {
            cancelAnimationFrame(loop);
        } else {
            gameInfos.time.current = Date.now();
            if (getElement("gameTopIcon").src !== `./${getIconUrl("start")}`) {
                getElement("gameTopIcon").src = `./${getIconUrl("start")}`;
            }
            if (gameInfos.time.current - gameInfos.lastTimeClick >= 50000) {
                if (![`./${getIconUrl("illogic")}`, `./${getIconUrl("sleep")}`].includes(getElement("gameTopIcon").src)) getElement("gameTopIcon").src = `./${getIconUrl("sleep")}`;
            }
            if (gameInfos.time.current - gameInfos.lastTimeClick >= 100000) {
                if (![`./${getIconUrl("illogic")}`, `./${getIconUrl("deepsleep")}`].includes(getElement("gameTopIcon").src)) getElement("gameTopIcon").src = `./${getIconUrl("deepsleep")}`;
            }
            if (gameInfos.time.current - gameInfos.lastTimeClick >= 150000) {
                if (![`./${getIconUrl("illogic")}`, `./${getIconUrl("heavysleep")}`].includes(getElement("gameTopIcon").src)) getElement("gameTopIcon").src = `./${getIconUrl("heavysleep")}`;
            }
            if (gameInfos.time.current - gameInfos.time.starting >= 600000) {
                if (![`./${getIconUrl("illogic")}`, `./${getIconUrl("worryish")}`].includes(getElement("gameTopIcon").src)) getElement("gameTopIcon").src = `./${getIconUrl("worryish")}`;
            }
            if (gameInfos.time.current - gameInfos.time.starting >= 700000) {
                if (![`./${getIconUrl("illogic")}`, `./${getIconUrl("worried")}`].includes(getElement("gameTopIcon").src)) getElement("gameTopIcon").src = `./${getIconUrl("worried")}`;
            }
            if (gameInfos.time.current - gameInfos.time.starting >= 800000) {
                if (![`./${getIconUrl("illogic")}`, `./${getIconUrl("worrier")}`].includes(getElement("gameTopIcon").src)) getElement("gameTopIcon").src = `./${getIconUrl("worrier")}`;
            }
            if (gameInfos.time.current - gameInfos.time.starting >= 900000) {
                if (![`./${getIconUrl("illogic")}`, `./${getIconUrl("worriest")}`].includes(getElement("gameTopIcon").src)) getElement("gameTopIcon").src = `./${getIconUrl("worriest")}`;
            }
            if (gameInfos.grid.flagsPlaced > gameInfos.grid.minesNb) {
                if (getElement("gameTopIcon").src !== `./${getIconUrl("illogic")}`) getElement("gameTopIcon").src = `./${getIconUrl("illogic")}`;
            }
            // console.log("gameInfos.time.get():", gameInfos.time.get());        
            if (gameInfos.time.get() >= 999000) {
                endGame("lose");
            }
            requestAnimationFrame(timeLoop);
        }
        displayTimeInfo();
    }
    loop = requestAnimationFrame(timeLoop);
}

const addOpenedCell = (position) => {
    console.log("addOpenedCell position:", position);
    console.log("classList opened:", getCell(position).classList.contains("opened"));
    const x = parseInt(position.x);
    const y = parseInt(position.y);
    const isAlreadyPresent = checkIfCellAlreadyOpened(position);
    if (!isAlreadyPresent) openedCellsPositions.push([x, y]);
}

const checkIfCellAlreadyOpened = (position) => {
    // console.log("checkIfCellAlreadyOpened position:", position);
    const x = parseInt(position.x);
    const y = parseInt(position.y);
    let isAlreadyPresent = false;
    openedCellsPositions.forEach(p => {
        if (p[0] === x && p[1] === y) isAlreadyPresent = true;
    });
    return isAlreadyPresent;
}

const getAllOpenedNotMinedCells = () => {
    console.log("getAllOpenedNotMinedCells");
    const nb = Array.from(document.querySelectorAll(".cell.opened:not(.mined)")).length;
    console.log("nb:", nb);
    return nb;
}

const addFlag = (position) => {
    // console.log("addFlag position:", position);
    const x = parseInt(position.x);
    const y = parseInt(position.y);
    let isAlreadyPresent = false;
    flagsPositions.forEach(p => {
        if (p[0] === x && p[1] === y) isAlreadyPresent = true;
    });
    if (!isAlreadyPresent) {
        flagsPositions.push([x, y]);
        gameInfos.grid.flagsPlaced++;
        displayMinesInfo();
    }
}

const removeFlag = (position) => {
    // console.log("removeFlag position:", position);
    const x = parseInt(position.x);
    const y = parseInt(position.y);
    const index = flagsPositions.findIndex(p =>
        p[0] === x && p[1] === y
    );
    // console.log("index:", index);    
    if (index !== -1) { 
        flagsPositions.splice(index, 1);
        gameInfos.grid.flagsPlaced--;
        displayMinesInfo();
    }
}

const checkCell = (position) => {
    // console.log("checkCell position:", position);
    const x = parseInt(position.x);
    const y = parseInt(position.y);
    const isFlagIndex = flagsPositions.findIndex(p =>
        p[0] === x && p[1] === y
    );
    const isMineIndex = minesPositions.findIndex(p =>
        p[0] === x && p[1] === y
    );
    const isOpenIndex = openedCellsPositions.findIndex(p =>
        p[0] === x && p[1] === y
    );
    const isHint = gridHintsAndMines[y][x] > 0;
    const statuses = {
        isFlag: isFlagIndex !== -1,
        isMine: isMineIndex !== -1,
        isOpen: isOpenIndex !== -1,
        isHint: isHint,
    }
    // console.log("statuses:", statuses);
    return statuses;
}

const revealCell = (cell, first = false) => {
    // console.log("revealCell cell:", cell);
    // console.log("NOT FLAGGED!!!!");    
    const position = { x: cell.dataset.x, y: cell.dataset.y };
    const statuses = checkCell(position);
    if (statuses.isFlag) return;
    if (statuses.isMine & first) {
        cell.setAttribute("data-number", "");
        cell.classList.add("opened");
        cell.classList.add("mined", "owned");
        endGame("lose");
        return;
    }
    if (statuses.isHint) {
        const value = gridHintsAndMines[position.y][position.x];
        cell.setAttribute("data-number", value);
        cell.classList.add("opened");
        addOpenedCell({ x: cell.dataset.x, y: cell.dataset.y });
        if (checkIfWin()) {
            endGame("win");
            return;
        }
        return;
    }
    if (!cell.classList.contains("opened")) {
    // if (!checkIfCellAlreadyOpened({ x: position.x, y: position.y })) {
        cell.classList.add("opened");
        addOpenedCell({ x: cell.dataset.x, y: cell.dataset.y });
        const x = parseInt(position.x);
        const y = parseInt(position.y);
        if (checkIfWin()) {
            endGame("win");
            return;
        }
        if (y - 1 >= 0) {
            if (x - 1 >= 0 && !checkCell({ x: x - 1, y: y - 1 }).isFlag && !checkCell({ x: x - 1, y: y - 1 }).isOpen) revealCell(getCell({ x: x - 1, y: y - 1 }));
            if (!checkCell({ x: x, y: y - 1 }).isFlag && !checkCell({ x: x, y: y - 1 }).isOpen) revealCell(getCell({ x: x, y: y - 1 }));
            if (x + 1 < gameInfos.grid.x && !checkCell({ x: x + 1, y: y - 1 }).isFlag && !checkCell({ x: x + 1, y: y - 1 }).isOpen) revealCell(getCell({ x: x + 1, y: y - 1 }));
        }
        if (x - 1 >= 0 && !checkCell({ x: x - 1, y: y }).isFlag && !checkCell({ x: x - 1, y: y }).isOpen) revealCell(getCell({ x: x - 1, y: y }));
        if (x + 1 < gameInfos.grid.x && !checkCell({ x: x + 1, y: y }).isFlag && !checkCell({ x: x + 1, y: y }).isOpen) revealCell(getCell({ x: x + 1, y: y }));
        if (y + 1 < gameInfos.grid.y) {
            if (x - 1 >= 0 && !checkCell({ x: x - 1, y: y + 1 }).isFlag && !checkCell({ x: x - 1, y: y + 1 }).isOpen) revealCell(getCell({ x: x - 1, y: y + 1 }));
            if (!checkCell({ x: x, y: y + 1 }).isFlag && !checkCell({ x: x, y: y + 1 }).isOpen) revealCell(getCell({ x: x, y: y + 1 }));
            if (x + 1 < gameInfos.grid.x && !checkCell({ x: x + 1, y: y + 1 }).isFlag && !checkCell({ x: x + 1, y: y + 1 }).isOpen) revealCell(getCell({ x: x + 1, y: y + 1 }));
        }
    }
}

const revealAllMines = () => {
    console.log("revealAllMines");
    minesPositions.forEach(p => {
        const cell = getCell({ x: p[0], y: p[1] });
        // console.log("cell:", cell);
        if (!cell.classList.contains("mined"))
            cell.classList.add("opened", "mined");
    });
}

const revealAllFlags = () => {
    console.log("revealAllFlags");
    minesPositions.forEach(p => {
        const cell = getCell({ x: p[0], y: p[1] });
        // console.log("cell:", cell);
        if (!cell.classList.contains("flagged")) {
            cell.classList.add("flagged");
            gameInfos.grid.flagsAutoRevealed++;
        }
    });
    displayMinesInfo();
}

const checkForMisplacedFlags = () => {
    console.log("checkForMisplacedFlags");
    if (flagsPositions.length > 0) flagsPositions.forEach(fp => {
        const isPresent = minesPositions.find(mp => mp[0] === fp[0] && mp[1] === fp[1]);
        // console.log("isPresent:", isPresent);        
        if (isPresent === undefined) {
            getCell({ x: fp[0], y: fp[1] }).classList.add("misplaced");
        }
    });
}

const touchdownCountdown = (cell) => {
    console.log("touchdownCountdown cell:", cell);
    actions.touchdown = true;
    actions.touchtarget = cell;
    touchTimeout = setTimeout(() => {
        clearTimeout(touchTimeout);
        if (actions.touchtarget === cell) {
            if (!cell.classList.contains("flagged")) {
                if (!cell.classList.contains("opened")) {
                    cell.classList.add("flagged");
                    addFlag({ x: cell.dataset.x, y: cell.dataset.y });
                }
            } else {
                cell.classList.remove("flagged");
                removeFlag({ x: cell.dataset.x, y: cell.dataset.y });
            }
        }
        actions.touchdown = false;
        actions.touchtarget = null;
        actions.longtouch = true;
    }, 1000);
}

const touchdownRelease = () => {
    console.log("touchdownRelease");
    actions.touchdown = false;
    actions.longtouch = false;
    actions.touchtarget = null;
    clearTimeout(touchTimeout);
}

const initialize = (full = true) => {
    minesPositions.length = 0;
    flagsPositions.length = 0;
    openedCellsPositions.length = 0;
    gridHintsAndMines.length = 0;
    actions.gridpointerdown = false;
    actions.touchdown = false;
    actions.longtouch = false;
    actions.touchtarget = null;
    actions.topiconpointerdown = false;
    gameInfos.grid.cellsOpened = 0;
    gameInfos.grid.flagsPlaced = 0;
    gameInfos.grid.flagsAutoRevealed = 0;
    gameInfos.grid.firstClickPosition.x = null;
    gameInfos.grid.firstClickPosition.y = null;
    gameInfos.time.current = 0;
    gameInfos.time.starting = 0;
    gameInfos.lastTimeClick = 0;
    getElement("gameTopIcon").src = `./${getIconUrl("waiting")}`;
    generateCells();
    if (!full) return;
    displayMinesInfo();
    displayTimeInfo();
}

const firstClick = () => {
    console.log("firstClick");
    setMinesPositions();
    generateGridHintsAndMines();
}

const clearGameInfos = () => {
    for (let i = 1; i <= 3; i++) {
        getElement(`timeNumber${i}`).textContent = "";
        getElement(`minesNumber${i}`).textContent = "";
    }
}

const resetGame = () => {
    console.log("resetGame");
    // const willReset = confirm("Do you to reset the game?");
    // if (!willReset) return;
    document.querySelector(".selected").classList.remove("selected");
    endGame();
    initialize(false);
    document.querySelector(`.option_difficulty_${gameInfos.level}`).classList.add("selected");
    setTimeout(() => {
        clearGameInfos();
        getElement("gameTopIcon").src = `./${getIconUrl("waiting")}`;
    }, 10);
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
    console.log("endGame finish:", finish);
    setStatus("end", true);
    setStatus("start", false);
    getElement("gridContainer").classList.remove("started");
    if (finish) {
        setPlay("finish", finish);
        getElement("gameTopIcon").src = `./${getIconUrl(finish)}`;
        if (finish === "lose") {
            revealAllMines();
            checkForMisplacedFlags();
        }
        if (finish === "win") revealAllFlags();
    }
}

const gameSettings = (type, value) => {
    if (type === "level") {
        gameInfos.setLevel(value);
        gameInfos.setGridDetails();
    }
    if (type === "custom") {
        gameInfos.setLevel(value);
        gameInfos.setGridDetails();
    }
    if (type === "color") {
        gamePreferences.coloredTheme = value;
        changeGridColoredTheme();

    }
}

const firstInit = () => {
    console.log("firstInit");
    const level = "beginner";
    document.querySelector(`.option_difficulty_${level}`).classList.add("selected");
    generateColorThemes();
    gameSettings("level", level);
    changeGridDimensions();
    generateCells();
}

const pointerdownOnGrid = (event) => {
    // console.log("pointerdownOnGrid event.target:", event.target.dataset.x, event.target.dataset.y);
    actions.gridpointerdown = true;
    if (getStatus("start")) {
        if (event.button >= 0 && event.button <= 2) buttonsClickedOnGrid[`button${event.button}`] = true;
        if (event.button === 0) {
            getElement("gameTopIcon").src = `./${getIconUrl("click")}`;
            getElement("cells").forEach(c => {
                if (c === event.target && getStatus("start")) {
                    console.log("event.pointerType:", event.pointerType);
                    if (event.pointerType === "touch") {
                        touchdownCountdown(c);
                        return;
                    }
                    // if (event.pointerType === "touch") actions.touchdowntimestart = Date.now();
                    if (!(c.classList.contains("clicked") || c.classList.contains("flagged") || c.classList.contains("opened"))) c.classList.add("clicked");
                } else {
                    if (c.classList.contains("clicked")) c.classList.remove("clicked");
                }
            });
            gameInfos.lastTimeClick = gameInfos.time.current;
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
            gameInfos.lastTimeClick = gameInfos.time.current;
        } else {
            actions.gridpointerdown = false;
        }
    }
}

const pointermove = (event) => {
    // console.log("pointermove event.target:", event.target);
    if (event.pointerType !== "touch") {
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
    }
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
    // console.log("pointerdownOnStart event.target:", event.target);
    if (event.button !== 0) return;
    actions.topiconpointerdown = true;
    if (!getElement("gameStart").classList.contains("clicked")) getElement("gameStart").classList.add("clicked");
}

const pointerdownOnPreferences = (event) => {
    // console.log("pointerdownOnPreferences event.target:", event.target);
    if (event.button !== 0) return;
    if (!event.currentTarget.classList.contains("clicked")) event.currentTarget.classList.add("clicked");
}

const pointerdownOnReset = (event) => {
    // console.log("pointerdownOnReset event.target:", event.target);
    if (event.button !== 0) return;
    if (!event.currentTarget.classList.contains("clicked")) event.currentTarget.classList.add("clicked");
}

const pointerdownOnOption = (event) => {
    // console.log("pointerdownOnOption event.target:", event.target);
    if (event.button !== 0) return;
    if (!event.target.classList.contains("clicked") && !event.target.classList.contains("selected") && !getStatus("start")) event.target.classList.add("clicked");
}

const pointerup = (event) => {
    // console.log("pointerup event.target:", event.target); 
    getElement("cells").forEach(c => {
        if (c.classList.contains("clicked")) c.classList.remove("clicked");
        if (c === event.target &&
            !c.classList.contains("flagged") &&
            getStatus("start") &&
            actions.gridpointerdown &&
            !actions.longtouch &&
            buttonsClickedOnGrid.button0
        ) {
            if (gameInfos.grid.firstClickPosition.x === null ||
                gameInfos.grid.firstClickPosition.y === null) {
                gameInfos.grid.firstClickPosition.x = c.dataset.x;
                gameInfos.grid.firstClickPosition.y = c.dataset.y;
                firstClick();
            }
            revealCell(c, true);
        }
    });
    if (event.pointerType === "touch") touchdownRelease();
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
                initialize();
                // clearGameInfos();
            }
        }
        if (o.classList.contains("clicked")) o.classList.remove("clicked");
    });
    if (!getStatus("end")) {               
        getElement("gameTopIcon").src = `./${getIconUrl("start")}`;
    }
    if (getElement("gameStart").classList.contains("clicked")) getElement("gameStart").classList.remove("clicked");
    if ((event.target === getElement("gameStart") || event.target === getElement("gameTopIcon")) && actions.topiconpointerdown) {
        console.log("start!!!");        
        startGame();
    }
    if (!(event.target === getElement("optionsContainer") || event.target.closest(".options-container")) && getElement("optionsContainer").classList.contains("open")) {
        getElement("optionsContainer").classList.remove("open");
    }
    if ((event.target === getElement("gamePreferences") && event.target.classList.contains("clicked")) && event.button === 0) {
        console.log("preferences!!!");
        getElement("optionsContainer").classList.add("open");
    }
    if (getElement("gamePreferences").classList.contains("clicked")) getElement("gamePreferences").classList.remove("clicked");
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
getElement("gamePreferences").addEventListener("pointerdown", pointerdownOnPreferences);
getElement("optionsDifficulty").forEach(o => o.addEventListener("pointerdown", pointerdownOnOption));
document.body.addEventListener("pointermove", pointermove);
document.body.addEventListener("pointerup", pointerup);
document.addEventListener('contextmenu', event => event.preventDefault());

getElement("optionCustomGridHeight").addEventListener("input", changeCustomGridHeightValue);
getElement("optionCustomGridWidth").addEventListener("input", changeCustomGridWidthValue);
getElement("optionCustomGridMines").addEventListener("input", changeCustomGridMinesValue);
