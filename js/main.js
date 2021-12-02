import { CELL_VALUE, GAME_STATUS, TURN } from './constants.js';
import {
    getCellElementAtIdx,
    getCellElementList,
    getCellListElement,
    getCurrentTurnElement,
    getGameStatusElement,
    getReplayButtonElement,
} from './selectors.js';
import { checkGameStatus } from './utils.js';
/**
 * Global variables
 */
let currentTurn = TURN.CROSS;
let gameStatus = GAME_STATUS.PLAYING;
// let isGameEnded = false;
let cellValues = new Array(9).fill('');

function updateGameStatus(newGameStatus) {
    gameStatus = newGameStatus;
    const gameStatusElement = getGameStatusElement();
    if (!gameStatusElement) return;
    gameStatusElement.textContent = newGameStatus;
}

function showReplayButton() {
    const replayButtonElement = getReplayButtonElement();
    if (replayButtonElement) replayButtonElement.classList.add('show');
}

function hideReplayButton() {
    const replayButtonElement = getReplayButtonElement();
    if (replayButtonElement) replayButtonElement.classList.remove('show');
}

function highlightWinCells(winPositions) {
    if (!Array.isArray(winPositions) || winPositions.length !== 3) {
        throw new Error('Invalid winPositions');
    }
    for (const position of winPositions) {
        const cell = getCellElementAtIdx(position);
        if (cell) cell.classList.add('win');
    }
}

function toggleTurn() {
    // toggle turn
    currentTurn = currentTurn === TURN.CROSS ? TURN.CIRCLE : TURN.CROSS;
    // update turn dom
    const currentTurnElement = getCurrentTurnElement();
    if (!currentTurnElement) return;
    currentTurnElement.classList.remove(TURN.CROSS, TURN.CIRCLE);
    currentTurnElement.classList.add(currentTurn);
}

function handleCellClick(cell, index) {
    const isClicked = cell.classList.contains(TURN.CROSS) || cell.classList.contains(TURN.CIRCLE);
    const isEndGame = gameStatus !== GAME_STATUS.PLAYING;
    // only allow to click if game is playing or that cell is not clicked yet
    if (isClicked || isEndGame) return;
    // set selected cell
    cell.classList.add(currentTurn);
    // update cellValue
    cellValues[index] = currentTurn === TURN.CROSS ? CELL_VALUE.CROSS : CELL_VALUE.CIRCLE;
    // toggle turn
    toggleTurn();
    // check game status
    const game = checkGameStatus(cellValues);
    switch (game.status) {
        case GAME_STATUS.ENDED:
            {
                // update game status
                updateGameStatus(game.status);
                // show replay button
                showReplayButton();
                break;
            }
        case GAME_STATUS.X_WIN:
        case GAME_STATUS.O_WIN:
            {
                // update game status
                updateGameStatus(game.status);
                // show replay button
                showReplayButton();
                // highlights win cells
                highlightWinCells(game.winPositions);
                break;
            }
        default:
            // playing
            break;
    }
}

function initCellElementList() {
    // get all cell element
    const liList = getCellElementList();
    if (liList) {
        liList.forEach((cell, index) => {
            cell.dataset.idx = index;
        });
    }
    // attach event click for ul element
    const ulElement = getCellListElement();
    if (ulElement) {
        ulElement.addEventListener('click', (event) => {
            if (event.target.tagName !== 'LI') return;
            const index = +event.target.dataset.idx;

            handleCellClick(event.target, index);
        });
    }
}

function resetGame() {
    // reset global vars
    currentTurn = TURN.CROSS;
    gameStatus = GAME_STATUS.PLAYING;
    cellValues = cellValues.map(() => '');
    // reset game status
    updateGameStatus(GAME_STATUS.PLAYING);
    // reset current turn
    const currentTurnElement = getCurrentTurnElement();
    if (!currentTurnElement) return;
    currentTurnElement.classList.remove(TURN.CROSS, TURN.CIRCLE);
    currentTurnElement.classList.add(currentTurn);
    // reset game board
    const cellElementList = getCellElementList();
    for (const cellElement of cellElementList) {
        cellElement.className = '';
    }
    // hide replay button
    hideReplayButton();
}

function initReplayButton() {
    const replayButtonElement = getReplayButtonElement();
    if (replayButtonElement) {
        replayButtonElement.addEventListener('click', resetGame);
    }
}
/**
 * TODOs
 *
 * 1. Bind click event for all cells
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */
(() => {
    // bind click event for all li element
    initCellElementList();
    // bind click event for replay button

    initReplayButton();
})();