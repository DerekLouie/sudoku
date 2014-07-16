(function() {
    var rows = [],
    columns = [],
    blocks = [],
    lastHighlighted,
    selectedValue,
    lastInput,
    currentInput,
    numberSelector = $('.number-selector'),
    numberSelectorArrow = $('.arrow-up'),
    numberSelectorOpen = false,
    cleaningUp = false,
    inputs,
    spread = [1,2,3,4,5,6,7,8,9],
    arrowFunctions = {
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
        //i item bad var names
        var column, block, blockNumber = 0, blockRow = 0;
        $('.sudoku-row').each( function(rowNumber,rowInputs) {
            inputs = $(rowInputs).find('input');
            rows.push(inputs);
            blockRow = Math.floor(rowNumber/3)*3;
            inputs.each( function(columnNumber,input) {
                column = columns[columnNumber];
                blockNumber = Math.floor(columnNumber/3)+blockRow;
                block = blocks[blockNumber];

                if (block) {
                    blocks[blockNumber].push(input);
                } else {
                    blocks[blockNumber] = [input];
                }

                if (column) {
                    columns[columnNumber].push(input);
                } else {
                    columns[columnNumber] = [input];
                }

                input = $(input);
                input.data('row', rowNumber);
                input.data('column', columnNumber);
                input.data('block', blockNumber);

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
                var currentThird, currentColumn;
                currentInput = $(e.target);
                if( currentInput.prop('tagName') === 'INPUT' && (!numberSelectorOpen || lastInput !== e.target) && !cleaningUp ) {
                        cleanupHighlight();
                        numberSelectorOpen = true;
                        lastInput = e.target;
                        currentColumn = parseColumn(lastInput);
                        currentRow = parseRow(lastInput);
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
                        lastHighlighted = $(lastInput).addClass("highlighted");
                        numberSelectorArrow.css({left: (3.225+((currentColumn%3)*9))+'rem'});
                        numberSelector.css({top: topOffset+'rem', left: leftOffset+'rem', display: 'inline'});
                    } else {
                        cleanupNumberSelector();
                    }
            });

            numberSelector.on('vclick', function(e) {
                selectedValue = parseInt($(e.target).html());
                $(lastInput).val(selectedValue);
                cleanupNumberSelector();
                // Make sure if number selector is over the buttons at the bottom
                // the buttons aren't activated
                e.preventDefault();
            });
        }

        // Mask for inputs to stop users from putting in invalid
        // values and also handlers for arrow navigation

        $('.sudoku-row').on('keydown', 'input', function(e) {
            var keyCode = e.which;
            move = arrowFunctions[keyCode];

            if(move) {
                move(e);
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
                        e.preventDefault();
                }
            }
        });

        $('.clear').on('click', confirmClear);

        $('.check-answer').on('click', checkAnswer);

    }

    function cleanupHighlight() {
        if (lastHighlighted) {
            $('.highlighted').removeClass('highlighted');
        }
    }

    function cleanupNumberSelector() {
        selectedValue = '';
        numberSelector.css({display:'none'});
        cleanupHighlight();

        if (!cleaningUp) {
            cleaningUp = true;
            // We debounce touch events so users tapping very quickly
            // do not get strange behavior
            setTimeout(function() {numberSelectorOpen = false; cleaningUp = false;}, 500);
        }
    }

    function parseRow(node) {
        return $(node).data('row');
    }

    function parseColumn(node) {
        return $(node).data('column');
    }

    function moveLeft(e) {
        var row = parseRow(e.target),
            column = parseColumn(e.target),
            leftNeighbor = columns[column-1];

        if (leftNeighbor) {
            $(columns[column-1][row]).focus();
        }
    }

    function moveRight(e) {
        var row = parseRow(e.target),
            column = parseColumn(e.target),
            rightNeighbor = columns[column+1];

        if (rightNeighbor) {
            $(columns[column+1][row]).focus();
        }
    }

    function moveUp(e) {
        var row = parseRow(e.target),
            column = parseColumn(e.target),
            topNeighbor = rows[row-1];

        if (topNeighbor) {
            $(columns[column][row-1]).focus();
        }
    }

    function moveDown(e) {
        var row = parseRow(e.target),
            column = parseColumn(e.target),
            bottomNeighbor = rows[row+1];

        if (bottomNeighbor) {
            $(columns[column][row+1]).focus();
        }
    }

    function checkHasRangeOneToTen(l) {
        var inputValues,
            val,
            answer = false,
            len;

        $.each(l, function(i, item) {

            inputValues = $.map(item, function(input) {
                return input.value;
            });

            inputValues.sort();
            len = inputValues.length;

            while(len--) {
                if (parseInt(inputValues[len]) !== len+1) {
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
            alertContinue();
        }
    }

    function alertContinue() {
        window.alert("It looks like you aren't quite done yet!");
        $('.error').removeClass('error');
    }

    function confirmClear() {
        if (window.confirm('Do you really want to clear your game?')) {
            fillRandom();
        }
    }

    function clearGrid() {
        // clean up error classes
        $('.error').removeClass('error');
        $('input').val('');
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
})();
