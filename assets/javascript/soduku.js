// clear button?
// (function() {
    var rows = [],
    columns = [],
    lastHighlighted,
    highlightedValue,
    inputTarget,
    currentTarget,
    numberSelector = $('.number-selector'),
    numberSelectorArrow = $('.arrow-up'),
    dialog = $('.dialog'),
    numberSelectorOpen = false,
    cleaningUp = false,
    inputs,
    spread = [1,2,3,4,5,6,7,8,9],
    aarowFunctions = {
        37: moveLeft,
        38: moveUp,
        39: moveRight,
        40: moveDown
    };

    function initGrid() {
        $('.sudoku-row').each(
                function(i,item) {
                    inputs = $(item).find('input');
                    rows.push(inputs);
                    inputs.each(
                        function(i,item) {
                            var column = columns[i];
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
            // if mobile disable keyboard from popping up
            $('input').prop('disabled', true);

            $('.main').on('vclick', function(e) {
                currentTarget = $(e.target);
                if( currentTarget.prop('tagName') === 'INPUT' &&
                    (!numberSelectorOpen || inputTarget !== e.target) &&
                    !cleaningUp) {
                        cleanupHighlight();
                        numberSelectorOpen = true;
                        inputTarget = e.target;
                        leftOffset = (((parseColumn(inputTarget)*9)+3.125));
                        topOffset = ((parseRow(inputTarget)+1 * 9)+7);
                        lastHighlighted = $(inputTarget).addClass("highlighted");
                        numberSelectorArrow.css({left: leftOffset+'rem'});
                        numberSelector.css({top: topOffset+'rem', left: '2rem'});
                } else {
                    cleanupNumberSelector();
                }
            });

            $('.number-selector').on('vclick', function(e) {
                highlightedValue = $(e.target).data('value');
                $(inputTarget).val(highlightedValue);
                cleanupNumberSelector();
            });
        }


        $('.sudoku-row').delegate('input', 'keydown', function(ev) {
            var keyCode = window.event ? ev.keyCode : ev.which,
            move;
            move = aarowFunctions[keyCode];
            if(move) {
                move(ev);
            }
            if (keyCode < 48 || keyCode > 57) {
                if (keyCode !== 0 && keyCode !== 8 && keyCode !== 13 && keyCode !== 9 && !ev.ctrlKey) {
                    ev.preventDefault();
                }
            }
        });

        $('.clear').on('click', promptClear);
        $('.checkAnswer').on('click', checkAnswer);


    }

    function cleanupHighlight() {
        if (lastHighlighted) {
            $('.highlighted').removeClass('highlighted');
        }
    }

    function cleanupNumberSelector() {
        highlightedValue = '';
        numberSelector.css({left:'-10000px'});
        cleanupHighlight();
        if (!cleaningUp) {
            cleaningUp = true;
            setTimeout(function() {numberSelectorOpen = false; cleaningUp = false;}, 400);
        }
    }

    function parseRow(node) {
        return ~~($(node.parentNode.parentNode.parentNode).data('row'));
    }

    function parseColumn(node) {
        return ~~($(node).data('column'));
    }

    function moveLeft(ev) {
        var row = parseRow(ev.target),
            column = parseColumn(ev.target),
            leftNeighbor;
            leftNeighbor = columns[column-1];
            if (leftNeighbor) {
                $(columns[column-1][row]).focus();
            }
    }

    function moveRight(ev) {
        var row = parseRow(ev.target),
            column = parseColumn(ev.target),
            rightNeighbor;
            rightNeighbor = columns[column+1];
            if (rightNeighbor) {
                $(columns[column+1][row]).focus();
            }
    }

    function moveUp(ev) {
        var row = parseRow(ev.target),
            column = parseColumn(ev.target),
            topNeighbor;
            topNeighbor = rows[row-1];
            if (topNeighbor) {
                $(columns[column][row-1]).focus();
            }
    }

    function moveDown(ev) {
        var row = parseRow(ev.target),
            column = parseColumn(ev.target),
            bottomNeighbor;
            bottomNeighbor = rows[row+1];
            if (bottomNeighbor) {
                $(columns[column][row+1]).focus();
            }
    }

    function checkHasRangeOneToTen(l) {
        var inputValues, answer = false;
        $.each(l, function(i, item) {
            inputValues = $.map(item, function(input) {
                return input.value;
            });

            inputValues.sort();
            len = inputValues.length; 
            val = 9;

            while(len--) {
                if(~~inputValues[len] !== val--) {
                    $(item).addClass('error');
                    answer = false;
                    // break out early
                    return answer;
                } else {
                    answer = true;
                }
            }
        });
        return answer;
    }

    function checkAnswer() {
        if (checkHasRangeOneToTen(rows) || checkHasRangeOneToTen(columns)) {
            // show victory overlay + play again button
        } else {
            promptRestart();
        }
    }

    function promptRestart() {
        if(window.confirm("It looks like you aren't quite done yet!")) {
        } else {
        }
        $('.error').removeClass('error');
    }

    function promptClear() {
        if(window.confirm('Do you really want to clear your game?')) {
            fillRandom();
        }
    }

    function clearGrid() {
        $('.error').removeClass('error');
        $.each(rows, function(i,item) {
            $.each(item, function(i,cell) {
                cell.value = '';
            });
        });
    }

    function fillRandom() {
        clearGrid();
        var temp = [],rand,shuffled;
        $.each(rows, function(i,row) {
            rand = Math.floor(Math.random()*9);
            row[rand].value = spread[i];
            temp.push(rand);
        });
        $.each(temp, function(i,item) {
            spread.push(spread.splice(item,1)[0]);
        });
    }

    initGrid();
    bindUI();
// })();

