// DOM Elements
const resultEl = document.getElementById('result');
const lengthEl = document.getElementById('length');
const lengthValEl = document.getElementById('length-val');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');
const generateEl = document.getElementById('generate');
const clipboardEl = document.getElementById('clipboard');
const statusIndicator = document.querySelector('.status-indicator');

const randomFunc = {
    lower: getRandomLower,
    upper: getRandomUpper,
    number: getRandomNumber,
    symbol: getRandomSymbol
};

// The pool of characters to use for the decoding animation effect
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(){}[]=<>/,.';

// Update length display value when slider is moved
lengthEl.addEventListener('input', (e) => {
    lengthValEl.innerText = e.target.value;
});

// Copy password to clipboard with a visual indicator
clipboardEl.addEventListener('click', () => {
    const password = resultEl.innerText;
    
    // Prevent copying placeholders or error messages
    if (!password || password === 'AWAITING_INPUT...' || password === 'ERR: NO_PARAMETERS') {
        return;
    }
    
    // Write text to clipboard
    navigator.clipboard.writeText(password).then(() => {
        const icon = clipboardEl.querySelector('i');
        // Visual feedback
        icon.className = 'fas fa-check-double';
        clipboardEl.style.color = '#00ffcc';
        clipboardEl.style.borderColor = '#00ffcc';
        clipboardEl.style.boxShadow = '0 0 15px #00ffcc';
        
        setTimeout(() => {
            icon.className = 'far fa-copy';
            clipboardEl.style.color = '';
            clipboardEl.style.borderColor = '';
            clipboardEl.style.boxShadow = 'none';
        }, 2000);
    });
});

// Generate password event listener
generateEl.addEventListener('click', () => {
    const length = +lengthEl.value;
    const hasLower = lowercaseEl.checked;
    const hasUpper = uppercaseEl.checked;
    const hasNumber = numbersEl.checked;
    const hasSymbol = symbolsEl.checked;

    const finalPassword = generatePassword(hasLower, hasUpper, hasNumber, hasSymbol, length);
    
    if (finalPassword === 'ERR: NO_PARAMETERS') {
        resultEl.innerText = finalPassword;
        resultEl.style.color = '#ff0055';
        resultEl.style.textShadow = '0 0 8px #ff0055';
        return;
    }
    
    // Reset styling from potential error state
    resultEl.style.color = '#fff';
    resultEl.style.textShadow = '0 0 5px rgba(255,255,255,0.7)';
    
    // Play Decoding Animation
    playDecodingAnimation(finalPassword);
});

// Matrix/Hacker style text decoding animation
function playDecodingAnimation(targetText) {
    // Set status to generating (cyan)
    statusIndicator.style.backgroundColor = '#00ffcc';
    statusIndicator.style.boxShadow = '0 0 10px #00ffcc';
    
    let iterations = 0;
    const maxIterations = 25; // Controls the duration of the animation
    const charactersToAnimate = targetText.length;
    
    const interval = setInterval(() => {
        resultEl.innerText = targetText.split('').map((letter, index) => {
            // Reveal the actual character if it's "decoded"
            if (index < iterations / (maxIterations / charactersToAnimate)) {
                return targetText[index];
            }
            // Otherwise show a random character
            return characters[Math.floor(Math.random() * characters.length)];
        }).join('');

        if (iterations >= maxIterations) {
            clearInterval(interval);
            resultEl.innerText = targetText; // Ensure the final text is exactly right
            
            // Revert status to standby (red/pink)
            statusIndicator.style.backgroundColor = '#ff0055';
            statusIndicator.style.boxShadow = '0 0 10px #ff0055';
        }
        iterations++;
    }, 30); // Speed of the animation loop
}

// Generate password function logic
function generatePassword(lower, upper, number, symbol, length) {
    let generatedPassword = '';
    const typesCount = lower + upper + number + symbol;
    
    const typesArr = [{lower}, {upper}, {number}, {symbol}].filter(item => Object.values(item)[0]);

    if (typesCount === 0) {
        return 'ERR: NO_PARAMETERS';
    }

    // Ensure at least one character of each selected type is present
    typesArr.forEach(type => {
        const funcName = Object.keys(type)[0];
        generatedPassword += randomFunc[funcName]();
    });

    // Fill the remainder
    for (let i = generatedPassword.length; i < length; i++) {
        const randomType = typesArr[Math.floor(Math.random() * typesArr.length)];
        const funcName = Object.keys(randomType)[0];
        generatedPassword += randomFunc[funcName]();
    }

    // Shuffle the result for fairness
    const finalPassword = shuffleArray(generatedPassword.split('')).join('');

    return finalPassword;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Generator functions
function getRandomLower() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 97); // a-z
}

function getRandomUpper() {
    return String.fromCharCode(Math.floor(Math.random() * 26) + 65); // A-Z
}

function getRandomNumber() {
    return String.fromCharCode(Math.floor(Math.random() * 10) + 48); // 0-9
}

function getRandomSymbol() {
    const symbols = '!@#$%^&*(){}[]=<>/,.';
    return symbols[Math.floor(Math.random() * symbols.length)];
}

// Run once on load to initialize the visual state
document.addEventListener('DOMContentLoaded', () => {
    // We do a slight delay so the user sees the initial 'AWAITING_INPUT' first
    setTimeout(() => {
        generateEl.click();
    }, 500);
});
