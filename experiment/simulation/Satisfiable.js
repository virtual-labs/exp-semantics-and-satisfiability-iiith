class PropositionalLogic {
    constructor() {
        this.currentFormula = null;
        this.variables = [];
        this.truthTable = [];
        this.userAnswers = {};
        this.correctAnswers = {};
        this.complexity = 'simple';
        this.streak = 0;
        
        // Formula templates for different complexities
        this.formulaTemplates = {
            simple: [
                'p ∧ q',
                'p ∨ q',
                '¬p ∧ q',
                'p ∧ ¬q',
                '¬p ∨ ¬q',
                'p → q',
                '¬(p ∧ q)',
                '¬(p ∨ q)'
            ],
            medium: [
                '(p ∧ q) ∨ r',
                'p ∧ (q ∨ r)',
                '(p ∨ q) ∧ (p ∨ r)',
                '¬(p ∧ q) ∨ r',
                'p → (q ∧ r)',
                '(p → q) ∧ (q → r)',
                '(p ∧ q) → r',
                '¬p ∨ (q ∧ r)'
            ],
            complex: [
                '(p ∧ q) ∨ (r ∧ s)',
                '(p ∨ q) ∧ (r ∨ s)',
                '(p → q) ∧ (r → s)',
                '¬((p ∧ q) ∨ (r ∧ s))',
                '(p ∧ ¬q) ∨ (¬r ∧ s)',
                '((p ∨ q) ∧ r) → s',
                '(p → q) ∨ (r → s)',
                '¬(p ∨ q) ∧ (r ∨ s)'
            ]
        };
        
        this.loadStatistics();
        this.updateStatisticsDisplay();
        this.generateNewFormula();
    }
    
    loadStatistics() {
        const saved = localStorage.getItem('propositionalLogicStreak');
        if (saved) {
            this.streak = parseInt(saved, 10) || 0;
        }
    }
    
    saveStatistics() {
        localStorage.setItem('propositionalLogicStreak', this.streak);
    }
    
    updateStatisticsDisplay() {
        const streakEls = [
            document.getElementById('streakCount'),
            document.getElementById('settingsStreakCount')
        ];
        streakEls.forEach(el => { if (el) el.textContent = this.streak; });
    }
    
    generateNewFormula() {
        const templates = this.formulaTemplates[this.complexity];
        const randomFormula = templates[Math.floor(Math.random() * templates.length)];
        
        this.currentFormula = randomFormula;
        this.extractVariables();
        this.generateTruthTable();
        this.userAnswers = {};
        this.displayFormula();
        this.displayTruthTable();
    }
    
    extractVariables() {
        const varPattern = /[p-z]/g;
        const matches = this.currentFormula.match(varPattern);
        this.variables = [...new Set(matches)].sort();
    }
    
    generateTruthTable() {
        const numVars = this.variables.length;
        const numRows = Math.pow(2, numVars);
        this.truthTable = [];
        this.correctAnswers = {};
        
        for (let i = 0; i < numRows; i++) {
            const row = {};
            
            // Generate variable assignments
            for (let j = 0; j < numVars; j++) {
                const varName = this.variables[j];
                row[varName] = Boolean((i >> (numVars - j - 1)) & 1);
            }
            
            // Calculate the result for this row
            const result = this.evaluateFormula(this.currentFormula, row);
            row.result = result;
            
            this.truthTable.push(row);
            this.correctAnswers[i] = result;
        }
    }
    
    evaluateFormula(formula, assignment) {
        // Replace variables with their truth values
        let expression = formula;
        
        // Replace variables with their truth values (handle word boundaries)
        for (const variable of this.variables) {
            const value = assignment[variable];
            const regex = new RegExp(`\\b${variable}\\b`, 'g');
            expression = expression.replace(regex, value.toString());
        }
        
        // Replace logical operators
        expression = expression.replace(/¬/g, '!');
        expression = expression.replace(/∧/g, '&&');
        expression = expression.replace(/∨/g, '||');
        
        // Handle implication (p → q is equivalent to ¬p ∨ q)
        // Handle nested parentheses properly
        while (expression.includes('→')) {
            // Find and replace implications from inside out
            expression = expression.replace(/\(([^()→]+)\)\s*→\s*\(([^()→]+)\)/g, '((!($1)) || ($2))');
            expression = expression.replace(/([^()→\s]+)\s*→\s*\(([^()→]+)\)/g, '((!$1) || ($2))');
            expression = expression.replace(/\(([^()→]+)\)\s*→\s*([^()→\s]+)/g, '((!($1)) || $2)');
            expression = expression.replace(/([^()→\s]+)\s*→\s*([^()→\s]+)/g, '((!$1) || $2)');
        }
        
        // Handle biconditional (p ↔ q is equivalent to (p → q) ∧ (q → p))
        while (expression.includes('↔')) {
            expression = expression.replace(/\(([^()↔]+)\)\s*↔\s*\(([^()↔]+)\)/g, '(((!($1)) || ($2)) && ((!($2)) || ($1)))');
            expression = expression.replace(/([^()↔\s]+)\s*↔\s*\(([^()↔]+)\)/g, '(((!$1) || ($2)) && ((!($2)) || $1))');
            expression = expression.replace(/\(([^()↔]+)\)\s*↔\s*([^()↔\s]+)/g, '(((!($1)) || $2) && ((!$2) || ($1)))');
            expression = expression.replace(/([^()↔\s]+)\s*↔\s*([^()↔\s]+)/g, '(((!$1) || $2) && ((!$2) || $1))');
        }
        
        try {
            return eval(expression);
        } catch (error) {
            console.error('Error evaluating formula:', error, 'Expression:', expression);
            return false;
        }
    }
    
    displayFormula() {
        const formulaElement = document.getElementById('currentFormula');
        if (formulaElement) {
            formulaElement.textContent = this.currentFormula;
        }
    }
    
    displayTruthTable() {
        const tableContainer = document.getElementById('truthTableContainer');
        if (!tableContainer) return;
        const table = document.createElement('table');
        table.className = 'w-full border-collapse border border-gray-300';
        
        // Create header
        const header = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.className = 'bg-gray-100';
        
        // Variable columns
        this.variables.forEach(variable => {
            const th = document.createElement('th');
            th.className = 'border border-gray-300 px-4 py-2 font-semibold';
            th.textContent = variable;
            headerRow.appendChild(th);
        });
        
        // Formula result column
        const formulaTh = document.createElement('th');
        formulaTh.className = 'border border-gray-300 px-4 py-2 font-semibold bg-blue-50';
        formulaTh.textContent = this.currentFormula;
        headerRow.appendChild(formulaTh);
        
        header.appendChild(headerRow);
        table.appendChild(header);
        
        // Create body
        const tbody = document.createElement('tbody');
        
        this.truthTable.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            
            // Variable value columns
            this.variables.forEach(variable => {
                const td = document.createElement('td');
                td.className = 'border border-gray-300 px-4 py-2 text-center';
                td.textContent = row[variable] ? 'T' : 'F';
                tr.appendChild(td);
            });
            
            // User input column for formula result
            const resultTd = document.createElement('td');
            resultTd.className = 'border border-gray-300 px-4 py-2 text-center bg-blue-50';
            
            // Toggle switch for True/False
            const label = document.createElement('label');
            label.className = 'inline-flex items-center cursor-pointer select-none';
            
            // False label (left)
            const falseLabel = document.createElement('span');
            falseLabel.textContent = 'False';
            falseLabel.className = 'mr-2 text-sm font-semibold transition-colors';
            
            // Switch input
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'sr-only peer';
            input.setAttribute('data-row', index);
            input.addEventListener('change', (e) => this.handleToggleInput(e));
            // Set user's previous answer if it exists
            if (this.userAnswers[index] !== undefined) {
                input.checked = this.userAnswers[index] === true;
            }
            
            // Custom switch styling
            const switchDiv = document.createElement('div');
            switchDiv.className = 'w-12 h-6 bg-gray-200 rounded-full transition relative border border-gray-300';
            
            const knob = document.createElement('div');
            knob.className = 'absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform duration-200';
            // Set initial knob position
            knob.style.transform = input.checked ? 'translateX(24px)' : 'translateX(0)';
            switchDiv.appendChild(knob);
            
            // True label (right)
            const trueLabel = document.createElement('span');
            trueLabel.textContent = 'True';
            trueLabel.className = 'ml-2 text-sm font-semibold transition-colors';
            
            // Set initial label colors
            if (input.checked) {
                trueLabel.classList.add('text-green-600');
                falseLabel.classList.remove('text-red-600');
                falseLabel.classList.add('text-gray-400');
                knob.style.transform = 'translateX(24px)';
            } else {
                falseLabel.classList.add('text-red-600');
                trueLabel.classList.remove('text-green-600');
                trueLabel.classList.add('text-gray-400');
                knob.style.transform = 'translateX(0)';
            }
            // Update label colors and knob position on toggle
            input.addEventListener('change', () => {
                if (input.checked) {
                    trueLabel.classList.add('text-green-600');
                    trueLabel.classList.remove('text-gray-400');
                    falseLabel.classList.remove('text-red-600');
                    falseLabel.classList.add('text-gray-400');
                    knob.style.transform = 'translateX(24px)';
                } else {
                    falseLabel.classList.add('text-red-600');
                    falseLabel.classList.remove('text-gray-400');
                    trueLabel.classList.remove('text-green-600');
                    trueLabel.classList.add('text-gray-400');
                    knob.style.transform = 'translateX(0)';
                }
            });
            
            label.appendChild(falseLabel);
            label.appendChild(input);
            label.appendChild(switchDiv);
            label.appendChild(trueLabel);
            
            resultTd.appendChild(label);
            tr.appendChild(resultTd);
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
        
        this.updateProgress();
    }

    handleToggleInput(event) {
        const input = event.target;
        const row = parseInt(input.getAttribute('data-row'));
        const userAnswer = input.checked;
        this.userAnswers[row] = userAnswer;
        const isCorrect = userAnswer === this.correctAnswers[row];
        // Optionally, you can add feedback or styling here
        // For now, just update progress
        this.updateProgress();
    }
    
    updateProgress() {
        const totalRows = this.truthTable.length;
        const answeredRows = Object.keys(this.userAnswers).length;
        const progressElement = document.getElementById('progress');
        if (progressElement) {
            progressElement.textContent = `${answeredRows}/${totalRows} completed`;
        }
        // No accuracy shown
        if (answeredRows === totalRows) {
            this.checkCompletion();
        }
    }
    
    checkCompletion() {
        const allCorrect = Object.keys(this.userAnswers).every(
            key => this.userAnswers[key] === this.correctAnswers[key]
        );
        if (allCorrect) {
            this.streak++;
            this.showFeedback(true, `Excellent! Streak: ${this.streak}`);
        } else {
            this.streak = 0;
            const incorrectCount = Object.keys(this.userAnswers).filter(
                key => this.userAnswers[key] !== this.correctAnswers[key]
            ).length;
            this.showFeedback(false, `${incorrectCount} incorrect answers. Streak reset.`);
        }
        this.saveStatistics();
        this.updateStatisticsDisplay();
        this.analyzeFormula();
    }
    
    analyzeFormula() {
        const trueCount = Object.values(this.correctAnswers).filter(Boolean).length;
        const totalRows = this.truthTable.length;
        const falseCount = totalRows - trueCount;
        
        let classification;
        if (trueCount === totalRows) {
            classification = 'Tautology (Valid)';
        } else if (trueCount === 0) {
            classification = 'Contradiction (Unsatisfiable)';
        } else {
            classification = 'Contingency (Satisfiable)';
        }
        
        const analysisElement = document.getElementById('formulaAnalysis');
        if (analysisElement) {
            analysisElement.innerHTML = `
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-800 mb-2">Formula Analysis</h4>
                    <p><strong>Classification:</strong> ${classification}</p>
                    <p><strong>True in:</strong> ${trueCount}/${totalRows} cases</p>
                    <p><strong>False in:</strong> ${falseCount}/${totalRows} cases</p>
                    ${trueCount > 0 && trueCount < totalRows ? 
                        `<p class="mt-2 text-sm"><strong>Satisfying assignments:</strong> Row${trueCount > 1 ? 's' : ''} ${
                            Object.keys(this.correctAnswers)
                                .filter(key => this.correctAnswers[key])
                                .map(key => parseInt(key) + 1)
                                .join(', ')
                        }</p>` : ''
                    }
                </div>
            `;
        }
    }
    
    showFeedback(isCorrect, message) {
        const feedbackElement = document.getElementById('feedback');
        if (!feedbackElement) return;
        
        feedbackElement.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'text-green-800', 'text-red-800');
        
        if (isCorrect) {
            feedbackElement.classList.add('bg-green-100', 'text-green-800');
        } else {
            feedbackElement.classList.add('bg-red-100', 'text-red-800');
        }
        
        feedbackElement.textContent = message;
    }
    
    hideFeedback() {
        const feedbackElement = document.getElementById('feedback');
        if (feedbackElement) {
            feedbackElement.classList.add('hidden');
        }
    }
    
    showSolution() {
        // Fill in all correct answers
        this.userAnswers = { ...this.correctAnswers };
        this.displayTruthTable();
        this.analyzeFormula();
        this.showFeedback(false, 'Solution revealed. Generate a new formula to try again.');
    }
    
    clearAnswers() {
        this.userAnswers = {};
        this.displayTruthTable();
        this.hideFeedback();
        
        const analysisElement = document.getElementById('formulaAnalysis');
        if (analysisElement) {
            analysisElement.innerHTML = '';
        }
    }
    
    changeComplexity(newComplexity) {
        this.complexity = newComplexity;
        this.generateNewFormula();
        this.hideFeedback();
        
        const analysisElement = document.getElementById('formulaAnalysis');
        if (analysisElement) {
            analysisElement.innerHTML = '';
        }
    }
    
    resetStreak() {
        this.streak = 0;
        this.saveStatistics();
        this.updateStatisticsDisplay();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.propositionalLogic = new PropositionalLogic();
});

// Control functions
function generateNewFormula() {
    if (propositionalLogic) {
        propositionalLogic.generateNewFormula();
    }
}

function showSolution() {
    if (propositionalLogic) {
        propositionalLogic.showSolution();
    }
}

function clearAnswers() {
    if (propositionalLogic) {
        propositionalLogic.clearAnswers();
    }
}

function changeComplexity(complexity) {
    if (propositionalLogic) {
        propositionalLogic.changeComplexity(complexity);
    }
}

function resetStatistics() {
    if (propositionalLogic) {
        propositionalLogic.resetStatistics();
    }
}

// Add to window for button
window.resetStreak = function() {
    if (window.propositionalLogic) {
        window.propositionalLogic.resetStreak();
    }
};

// Floating Panel Controls (Info and Settings panels)
document.addEventListener('DOMContentLoaded', function() {
    // Info panel
    const infoButton = document.getElementById('infoButton');
    const infoPanel = document.getElementById('infoPanel');
    const infoPanelClose = document.getElementById('infoPanelClose');
    
    // Settings panel
    const settingsButton = document.getElementById('settingsButton');
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsPanelClose = document.getElementById('settingsPanelClose');
    
    // Panel toggle function
    function togglePanel(panel, button) {
        if (!panel || !button) return;
        
        const isActive = panel.classList.contains('active');
        
        // Close all panels first
        document.querySelectorAll('.floating-panel').forEach(p => {
            p.classList.remove('active');
        });
        
        // Toggle current panel
        if (!isActive) {
            panel.classList.add('active');
            button.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                button.style.transform = '';
            }, 300);
        }
    }
    
    // Info panel events
    if (infoButton && infoPanel && infoPanelClose) {
        infoButton.addEventListener('click', function() {
            togglePanel(infoPanel, infoButton);
        });
        infoPanelClose.addEventListener('click', function() {
            infoPanel.classList.remove('active');
        });
    }
    
    // Settings panel events
    if (settingsButton && settingsPanel && settingsPanelClose) {
        settingsButton.addEventListener('click', function() {
            togglePanel(settingsPanel, settingsButton);
        });
        settingsPanelClose.addEventListener('click', function() {
            settingsPanel.classList.remove('active');
        });
    }
    
    // Close panels when clicking outside
    document.addEventListener('click', function(event) {
        const panels = [infoPanel, settingsPanel];
        const buttons = [infoButton, settingsButton];
        
        panels.forEach((panel, index) => {
            if (panel && buttons[index] && 
                !panel.contains(event.target) && 
                !buttons[index].contains(event.target) && 
                panel.classList.contains('active')) {
                panel.classList.remove('active');
            }
        });
    });
});