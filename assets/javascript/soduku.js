// (function() {
    var rows = [],
    columns = [];
    $('.sudoku-row').each(
        function(i,item) {
            rows.push(item);
            $(item).find("td").each(
                function(i,item) {
                    var column = columns[i];
                    if (column) {
                        columns[i].push(item);
                    } else {
                        columns[i] = [item];
                    }
                }
            );
        });
    
// })();
