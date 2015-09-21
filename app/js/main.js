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
            var i, j, k,                                     //ітератори
                temp_i,temp_j,                               //тимчасові значення ітераторів
                q,                                           //стільки рядків будемо перестрибувати
                count,                                       //кількість співпадінь
                rows = inpMatrix.length,                     //максимальна кількість рядків
                cols = inpMatrix[0].length,                  //максимальна кількість стовпців
                resultArr = new Array( inpMatrix.length),
                numOfUniq = app.numOfuniqueInArr(inpMatrix); //кількість унікальних елементів матриці

            //Алгоритм обрахунку матриці співпадінь
            for(i = 0;i < rows; i++){
                temp_i=i;
                q = 1;
                count = 0;
                resultArr[i] = new Array(cols);
                while (i+q<rows){
                    for(j=0;j<cols;j++){
                        temp_j=j;
                        for(k=0;k<cols;k++){
                            if(( inpMatrix[temp_i][temp_j] === inpMatrix[temp_i+q][k] )&&(inpMatrix[temp_i][temp_j]!=''))
                               break;
                            else if((k+1==cols)&&(inpMatrix[temp_i][temp_j]!=''))
                                count++;
                        }
                        for(k=0;k<cols;k++){
                            if(( inpMatrix[temp_i+q][temp_j] === inpMatrix[temp_i][k] )&&(inpMatrix[temp_i+q][temp_j]!=''))
                                break;
                            else if((k+1==cols)&&(inpMatrix[temp_i+q][temp_j]!=''))
                                count++;
                        }
                    }
                    resultArr[temp_i][temp_i+q] = numOfuniqueInArr - count;
                    count=0;
                    q++;
                }
            }

            //дозаповнення матриці потрібними значеннями
            for(i=0; i < rows; i++ ){
                for(j=0; j < cols; j++ ){
                    if( i === j) resultArr[i][j] = "-";
                    if( resultArr[i][j] === undefined ) resultArr[i][j] = " ";
                }
            }
            return resultArr;
        },
        // кількість унікальних елементів у масиві будь-якої розмірності
        numOfuniqueInArr: function unique(arr) {
            var obj = {};   //допоміжний об'єкт, куди записуються елементи масиву як унікальні ключі

            (function writeInObjUniqueVal(arr){
                if(arr.length === 0) return 0;

                arr.forEach(function(item, i, arr){
                    if(item instanceof Array){
                        writeInObjUniqueVal(item);
                        return 0;   //коли пройдемо по всіх елементах масива, щоб сам цей масив не записало як ключ
                    }

                    var str = item.toString();  //на випадок якщо це функція, дата, тощо
                    if (str !== '')
                        obj[str] = true; // запомнить строку в виде свойства объекта
                });
            }(arr));

            return Object.keys(obj).length;
        },

        //метод для валідації форми поки не використовується
        validateForm: function(form) {
            return true;
        }
    };

    app.initialize();
}() );