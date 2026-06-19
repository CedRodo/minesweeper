function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function checkIfObjectIsEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function convertMsToHrMnMs(duration, short = false) {
    // console.log("convertMsToHrMnMs duration:", duration);
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60);
    minutes = (minutes < 10) ? "0" + minutes : "" + minutes;
    seconds = (seconds < 10) ? "0" + seconds : "" + seconds;
    // console.log("minutes, seconds:", minutes, seconds);
    if (short === true) {
        if (minutes.charAt(0) === "0") minutes = minutes.substring(1)
        return minutes + ":" + seconds;
    }
}