//написати віджет matrix
(function() {
    var app = {

        initialize: function () {
            this.form1 = document.forms["lab1-inp-form"];
            this.setUpListeners();
            this.updateResult();
        },

        setUpListeners: function () {
            document.getElementById("inp-num-of-rows").addEventListener("change", this.updateInpMatrix);
            document.getElementById("inp-num-of-cols").addEventListener("change", this.updateInpMatrix);
            this.form1.addEventListener("submit", app.submitForm);
        },
        updateInpMatrix: function() {

            var rows = document.getElementById("inp-num-of-rows").value,
                cols = document.getElementById("inp-num-of-cols").value,
                table = app.form1.getElementsByTagName("table")[0],
                i, j,
                str = "";

            table.innerHTML = "";

            for (i = 0; i < rows; i++) {
                str += "<tr>";
                for (j = 0; j < cols; j++) {
                    str += '<td class="input-cell"> <input type="text" pattern="[a-z,A-Z,0-9,а-я,А-Я]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів">  </td>';
                }
                str += "</tr>";
            }

            table.innerHTML = str;

        },
        updateResult: function (opts) {
            // setting default values
            if(!opts){
                var resultsBlockArr = document.getElementsByClassName("results-block");
                for(var i=0; i< resultsBlockArr.length; i++){
                    resultsBlockArr[i].classList.add('hidden');
                }
                return;
            }

            var rows = document.getElementById("inp-num-of-rows").value,
                cols = document.getElementById("inp-num-of-cols").value,
                table = opts.resultsBlock.getElementsByTagName("table")[0],
                i, j,
                str = "";

            table.innerHTML = "";
            opts.resultsBlock.classList.remove('hidden');
            for (i = 0; i < opts.resMatrix.length; i++) {
                str += "<tr>";
                for (j = 0; j < opts.resMatrix[i].length; j++) {
                    str += '<td><span class="matrix-result-cell">'+ opts.resMatrix[i][j] +'</span></td>';
                }
                str += "</tr>";
            }
            table.innerHTML = str;
        },

        submitForm: function (e) {
            var form = e.target;
            e.preventDefault();

            //if( !app.validate(form) ) return;

            app.updateResult({
                resultsBlock: document.getElementsByClassName("results-block")[0],  ///!!!!! переробити на form.parentNode... сусідній results-block
                resMatrix: app.solveForm1(  app.getForm1Inp(form)  )
            });
        },
        getForm1Inp: function(form){
            var resultsSrtArr = [ ],
                table = form.getElementsByTagName("table")[0],
                i, j;

            for( i=0; i< table.rows.length; i++){
                resultsSrtArr.push( [ ] );
                for( j=0; j< table.rows[i].childElementCount; j++){
                    var inpVal = table.rows[i].cells[j].getElementsByTagName("input")[0].value;
                    resultsSrtArr[i].push( inpVal );
                }
            }

            return resultsSrtArr;
        },

        /**
         * На вході матриця рядків
         * Повертає матрицю чисел
         */
        solveForm1: function(inpMatrix){
            //ти заповниш цей массив під час обчислень, тому у присвоєння напишеш  = [[]];
            var resultArr = [[ ]];

            //тут буде алгоритм

            return inpMatrix; //resultArr;
        },

        //метод для валідації форми поки не використовується
        validateForm: function(form) {
            return true;
        }
    };

    app.initialize();
}() );