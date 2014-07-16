// (function() {
    var rows = [],
    columns = [],
    blocks = [],
    lastHighlighted,
    selectedValue,
    inputTarget,
    currentTarget,
    numberSelector = $('.number-selector'),
    numberSelectorArrow = $('.arrow-up'),
    numberSelectorOpen = false,
    cleaningUp = false,
    inputs,
    spread = [1,2,3,4,5,6,7,8,9],
    aarowFunctions = {
        37: moveLeft,
        38: moveUp,
        39: moveRight,
        40: moveDown
    },
    keyCodes = {
        'BACKSPACE': 8,
        'ENTER': 13,
        'TAB': 9,
        'LEFTWINDOW': 91,
        'RIGHTWINDOW': 93,
        'ALT': 18,
        'CTRL': 17,
        'ZERO': 48,
        'NINE': 57
    };
    
    function initGrid() {
        var column, block, blockNumber = 0, blockRow = 0;
        $('.sudoku-row').each( function(i,item) {
            inputs = $(item).find('input');
            rows.push(inputs);
            blockRow = Math.floor(i/3)*3;
            inputs.each( function(i,item) {
                column = columns[i];
                blockNumber = Math.floor(i/3)+blockRow;
                block = blocks[blockNumber];

                if (block) {
                    blocks[blockNumber].push(item);
                } else {
                    blocks[blockNumber] = [item];
                }

                if (column) {
                    columns[i].push(item);
                } else {
                    columns[i] = [item];
                }

            });
        });
        fillRandom();
    }
    
    function bindUI() {
        if (Modernizr.touch) {
            // If mobile disable keyboard from popping up and
            // taking up precious game space
            $('input').prop('disabled', true);
            // todo: to many random numbers here 
            $('.main').on('vclick', function(e) {
                var currentThird, currentColumn, aarowCss;
                currentTarget = $(e.target);
                if( currentTarget.prop('tagName') === 'INPUT' && (!numberSelectorOpen || inputTarget !== e.target) && !cleaningUp ) {
                        cleanupHighlight();
                        numberSelectorOpen = true;
                        inputTarget = e.target;
                        currentColumn = parseColumn(inputTarget);
                        currentRow = parseRow(inputTarget);
                        currentThird = Math.floor(currentColumn/3);
                        leftOffset = (-53.6 + (currentThird*54.8));
                        // We want to keep the page from expanding past the viewport
                        // so if we get close to the bottom the number selector displays above the cell
                        if (currentRow > 5) {
                            topOffset = (((currentRow-3) * 9)+2);
                            numberSelectorArrow.addClass('flip-arrow-down');
                        } else {
                            numberSelectorArrow.removeClass('flip-arrow-down');
                            topOffset = (((currentRow+1) * 9)+7);
                        }
                        lastHighlighted = $(inputTarget).addClass("highlighted");
                        numberSelectorArrow.css({left: (3.225+((currentColumn%3)*9))+'rem'});
                        numberSelector.css({top: topOffset+'rem', left: leftOffset+'rem'});
                    } else {
                        cleanupNumberSelector();
                    }
            });
    
            numberSelector.on('vclick', function(e) {
                selectedValue = $(e.target).data('value');
                $(inputTarget).val(selectedValue);
                cleanupNumberSelector();
                // Make sure if number selector is over the buttons at the bottom
                // the buttons aren't activated
                e.preventDefault();
            });
        }
    
        // Mask for inputs to stop users from putting in invalid
        // values and also handlers for aarow navigation
    
        $('.sudoku-row').delegate('input', 'keydown', function(ev) {
            var keyCode = window.event ? ev.keyCode : ev.which,
            move = aarowFunctions[keyCode];
    
            if(move) {
                move(ev);
            }
            
            // Only let through 0-9 through
            if (keyCode < keyCodes.ZERO || keyCode > keyCodes.NINE) {

                // If the keycode is a special key, we let it pass
                switch (keyCode)  {
                    case (0):
                    case (keyCodes.BACKSPACE):
                    case (keyCodes.ENTER):
                    case (keyCodes.TAB):
                    case (keyCodes.LEFTWINDOW):
                    case (keyCodes.RIGHTWINDOW):
                    case (keyCodes.ALT):
                    case (keyCodes.CTRL):
                        break;
                    // Otherwise we make sure it doesn't get through
                    default:
                        ev.preventDefault();
                }
            }
        });
    
        $('.clear').on('click', promptClear);
    
        $('.check-answer').on('click', checkAnswer);
    
    }
    
    function cleanupHighlight() {
        if (lastHighlighted) {
            $('.highlighted').removeClass('highlighted');
        }
    }
    
    function cleanupNumberSelector() {
        selectedValue = '';
        numberSelector.css({left:'-10000px'});
        cleanupHighlight();
    
        if (!cleaningUp) {
            cleaningUp = true;
            // We debounce touch events so users tapping very quickly
            // do not get strange behavior
            setTimeout(function() {numberSelectorOpen = false; cleaningUp = false;}, 500);
        }
    }
    
    function parseRow(node) {
        return Math.floor($(node.parentNode.parentNode.parentNode).data('row'));
    }
    
    function parseColumn(node) {
        return Math.floor($(node).data('column'));
    }
    
    function moveLeft(ev) {
        var row = parseRow(ev.target),
            column = parseColumn(ev.target),
            leftNeighbor = columns[column-1];
    
        if (leftNeighbor) {
            $(columns[column-1][row]).focus();
        }
    }
    
    function moveRight(ev) {
        var row = parseRow(ev.target),
            column = parseColumn(ev.target),
            rightNeighbor = columns[column+1];
    
        if (rightNeighbor) {
            $(columns[column+1][row]).focus();
        }
    }
    
    function moveUp(ev) {
        var row = parseRow(ev.target),
            column = parseColumn(ev.target),
            topNeighbor = rows[row-1];
    
        if (topNeighbor) {
            $(columns[column][row-1]).focus();
        }
    }
    
    function moveDown(ev) {
        var row = parseRow(ev.target),
            column = parseColumn(ev.target),
            bottomNeighbor = rows[row+1];
    
        if (bottomNeighbor) {
            $(columns[column][row+1]).focus();
        }
    }
    
    function checkHasRangeOneToTen(l) {
        var inputValues, 
            val,
            answer = false;
    
        $.each(l, function(i, item) {
    
            inputValues = $.map(item, function(input) {
                return input.value;
            });
    
            inputValues.sort();
            len = inputValues.length; 
            val = 9;
    
            while(len--) {
                if (Math.floor(inputValues[len]) !== val--) {
                    $(item).addClass('error');
                    answer = false;
                    // Break out early
                    return answer;
                } else {
                    answer = true;
                }
            }
        });
    
        return answer;
    }
    
    function checkAnswer() {
        if (checkHasRangeOneToTen(rows) && checkHasRangeOneToTen(columns) && checkHasRangeOneToTen(blocks)) {
            if (window.confirm('Great job you won! Would you like to play again?')) {
                fillRandom(); 
            }
        } else {
            promptContinue(); 
        }
    } 
    
    function promptContinue() {
        window.alert("It looks like you aren't quite done yet!");
        $('.error').removeClass('error');
    }
    
    function promptClear() {
        if (window.confirm('Do you really want to clear your game?')) {
            fillRandom();
        }
    }
    
    function clearGrid() {
        // clean up error classes
        $('.error').removeClass('error');
    
        $.each(rows, function(i,item) {
            $.each(item, function(i,cell) {
                cell.value = '';
            });
        });
    }
    
    function fillRandom() {
        clearGrid();
    
        var temp = [],
            rand,
            shuffled;
    
        // Insert the numbers 1-9 into the grid
        $.each(rows, function(i,row) {
            rand = Math.floor(Math.random()*9);
            row[rand].value = spread[i];
            temp.push(rand);
        });
    
        // Shuffle our numbers so the next grid generated
        // is more random
        $.each(temp, function(i,item) {
            spread.push(spread.splice(item,1)[0]);
        });
    }
    
    initGrid();
    bindUI();
// })();
