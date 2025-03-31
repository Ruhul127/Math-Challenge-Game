// Game state variables
let target;
let numbers;
let equationParts = [];
let timeLeft = 120; // 2 minutes in seconds
let timerInterval;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get the target and numbers from the template
    target = parseInt(document.querySelector('.target-number').textContent);
    numbers = JSON.parse(document.getElementById('numbersGrid').dataset.numbers || 
        Array.from(document.querySelectorAll('.number-card')).map(card => parseInt(card.textContent)));

    // Initialize drag and drop
    initDragAndDrop();

    // Start the timer
    startTimer();

    // Add event listeners for operation buttons - only once
    const operationButtons = document.querySelectorAll('.controls .btn');
    operationButtons.forEach(button => {
        const op = button.textContent.trim();
        if (['+', '-', '×', '÷', '(', ')'].includes(op)) {
            // Clone the button to remove any existing event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add the click event listener to the new button
            newButton.addEventListener('click', function() {
                // Convert multiplication and division symbols to proper operators
                let operation = op;
                if (operation === '×') operation = '*';
                if (operation === '÷') operation = '/';
                
                // Prevent adding the same operation consecutively
                if (equationParts.length > 0 && 
                    ['+', '-', '*', '/', '(', ')'].includes(equationParts[equationParts.length - 1]) &&
                    ['+', '-', '*', '/', '(', ')'].includes(operation)) {
                    return;
                }
                
                equationParts.push(operation);
                updateEquationBuilder();
            });
        }
    });

    // Add event listener for clear button
    document.querySelector('.btn-danger').addEventListener('click', clearEquation);
    
    // Add event listener for check solution button
    document.querySelector('.btn-primary').addEventListener('click', checkSolution);
    
    // Add event listener for new numbers button
    document.querySelector('.btn-warning').addEventListener('click', newNumbers);
});

// Timer functions
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress bar
    const progressPercentage = (timeLeft / 120) * 100;
    document.getElementById('progressBar').style.width = `${progressPercentage}%`;
    
    // Change color when time is running low
    if (timeLeft <= 30) {
        document.getElementById('timer').style.color = 'var(--danger)';
        document.getElementById('progressBar').style.backgroundColor = 'var(--danger)';
    } else if (timeLeft <= 60) {
        document.getElementById('timer').style.color = 'var(--warning)';
        document.getElementById('progressBar').style.backgroundColor = 'var(--warning)';
    }
}

function timeUp() {
    alert("Time's up! The solution will now be shown.");
    showSolution();
}

// Solution functions
function showSolution() {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('solutionArea').innerHTML = '<p>Finding solution...</p>';
    
    fetch('/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            user_result: null, 
            target: target, 
            numbers: numbers 
        }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('solutionArea').innerHTML = `
            <p><strong>Solution:</strong> ${data.hint}</p>
        `;
    })
    .catch(error => {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('solutionArea').innerHTML = `
            <p style="color: var(--danger)">Error loading solution. Please try again.</p>
        `;
        console.error('Error:', error);
    });
}

function showHint() {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('solutionArea').innerHTML = '<p>Getting hint...</p>';
    
    fetch('/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            user_result: null, 
            target: target, 
            numbers: numbers 
        }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('loadingSpinner').style.display = 'none';
        // Show a partial hint instead of full solution
        const hint = data.hint.split('=')[0] + "= ?";
        document.getElementById('solutionArea').innerHTML = `
            <p><strong>Hint:</strong> Try something like: ${hint}</p>
        `;
    })
    .catch(error => {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('solutionArea').innerHTML = `
            <p style="color: var(--danger)">Error getting hint. Please try again.</p>
        `;
        console.error('Error:', error);
    });
}

// Drag and drop functionality
function initDragAndDrop() {
    document.querySelectorAll('.draggable').forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        });
        
        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        });
    });
    
    document.getElementById('equationBuilder').addEventListener('dragover', e => {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            const value = draggable.getAttribute('data-value');
            if (!equationParts.includes(value)) {
                equationParts.push(value);
                updateEquationBuilder();
            }
        }
    });
}

function updateEquationBuilder() {
    const builder = document.getElementById('equationBuilder');
    builder.innerHTML = '';
    equationParts.forEach(part => {
        const element = document.createElement('div');
        element.className = 'equation-part';
        element.textContent = part;
        element.draggable = true;
        element.addEventListener('dragstart', () => {
            element.classList.add('dragging');
        });
        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
        });
        element.addEventListener('click', () => {
            const index = equationParts.indexOf(part);
            if (index > -1) {
                equationParts.splice(index, 1);
                updateEquationBuilder();
            }
        });
        builder.appendChild(element);
    });
}

function clearEquation() {
    equationParts = [];
    updateEquationBuilder();
    document.getElementById('resultSection').style.display = 'none';
}

function newNumbers() {
    window.location.reload();
}

// Solution checking
async function checkSolution() {
    const equation = equationParts.join(' ');
    try {
        const result = eval(equation);
        
        document.getElementById('userResult').textContent = result;
        const difference = Math.abs(result - target);
        document.getElementById('difference').textContent = difference;
        document.getElementById('resultSection').style.display = 'block';
        
        // Show loading spinner
        document.getElementById('loadingSpinner').style.display = 'block';
        document.getElementById('solutionArea').innerHTML = '<p>Finding solutions...</p>';
        
        // Get solution from server
        const response = await fetch('/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user_result: result, 
                target: target, 
                numbers: numbers 
            }),
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('solutionArea').innerHTML = `
            <p><strong>Solution:</strong> ${data.hint}</p>
        `;
        
        // Show congratulations if exact match
        if (difference === 0) {
            document.getElementById('congratsModal').style.display = 'block';
            clearInterval(timerInterval); // Stop timer when solved
        }
        
    } catch (error) {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('solutionArea').innerHTML = `
            <p style="color: var(--danger)">Invalid equation! Please try again.</p>
        `;
        console.error('Error:', error);
    }
}

function closeCongratsModal() {
    document.getElementById('congratsModal').style.display = 'none';
}

// Expose functions to the global scope for HTML onclick handlers
window.clearEquation = clearEquation;
window.newNumbers = newNumbers;
window.checkSolution = checkSolution;
window.closeCongratsModal = closeCongratsModal;