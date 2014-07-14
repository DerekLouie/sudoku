(function() {
    var rows = [],
    columns = [],
    isMouseDown = false,
    lastHighlighted,
    highlightedValue,
    inputTarget,
    numberSelector = $('.number-selector'),
    inputs,
    aarowFunctions = {
        37: moveLeft,
        38: moveUp,
        39: moveRight,
        40: moveDown
    };

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

    function bindUI() {

        $(document).on('mouseup',function() {
            isMouseDown = false;
            cleanupNumberSelector();
        });

        $('.sudoku-grid').on('mousedown', function(e) {
            isMouseDown = true;
            inputTarget = e.target;
            leftOffset = e.clientX-340;
            topOffset = e.clientY+40;
            numberSelector.css({top: topOffset+'px', left: leftOffset+'px'});
        });

    
        $('.number-selector').on('mouseover', function(e) {
            if(isMouseDown) {
                cleanupHighlight();
                lastHighlighted = $(e.target);
                highlightedValue = lastHighlighted.data('value');
                $(e.target).addClass("highlighted");
            }
        }).on('mouseup',function() {
            isMouseDown = false;
            $(inputTarget).val(highlightedValue);
            cleanupNumberSelector();
        });

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
    }

    function cleanupHighlight() {
        if (lastHighlighted) {
            lastHighlighted.removeClass("highlighted");
        }
    }

    function cleanupNumberSelector() {
        highlightedValue = '';
        numberSelector.css({left:'-10000px'});
        cleanupHighlight();

    }

    function parseRow(node) {
        return ~~($(node.parentNode.parentNode).data('row'));
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
                return $(input).val();
            });
            inputValues.sort();
            len = inputValues.length; 
            val = 9;

            while(len--) {
                if(~~inputValues[len] !== val--) {
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

    bindUI();
})();
