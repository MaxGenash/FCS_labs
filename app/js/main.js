'use strict';

import InpMatrix from './InpMatrix.class.js';
import ResMatrix from './ResMatrix.class.js';


(function() {
    var app = {

        initialize: function () {
            this.form1 = document.forms["lab1-inp-form"];
            let initialMatrix1 = [
                ["T1", "T2", "T3", "C1", "C2"],
                ["T2", "T3", "C1"],
                ["T4", "T5", "T3", "C3"],
                ["T2", "T5", "F1"],
                ["T3", "C1", "C2"]
            ];
            this.setUpListeners();
            this.updateResult();
            this.updateInpMatrix( initialMatrix1 );
        },

        setUpListeners: function () {
            document.getElementById("inp-num-of-rows").addEventListener("change", this.updateInpMatrix);
            document.getElementById("inp-num-of-cols").addEventListener("change", this.updateInpMatrix);
            this.form1.addEventListener("submit", app.submitForm);
        },

        updateInpMatrix: function(initialMatrix) {
            let inpMatrix;
            if(initialMatrix && initialMatrix instanceof Array){
                inpMatrix = new InpMatrix({
                    items: initialMatrix
                });
                document.getElementById("inp-num-of-rows").value = inpMatrix.rows;
                document.getElementById("inp-num-of-cols").value = inpMatrix.cols;
            } else {
                let rows = document.getElementById("inp-num-of-rows").value;
                let cols = document.getElementById("inp-num-of-cols").value;
                inpMatrix = new InpMatrix({
                    rows: rows,
                    cols: cols
                });
            }

            document.getElementById("inp-matrix-1").innerHTML =  inpMatrix.getElem().innerHTML;
        },

        updateResult: function (opts) {
            var rows, cols,
                i;

            let resultsBlock = document.getElementsByClassName("results-block");
            if(!opts){
                //ховаємо блоки з результатами
                for(i=0; i< resultsBlock.length; i++){
                    resultsBlock[i].classList.add('hidden');
                }
                return;
            } else {
                //Показуємо блоки з результатами
                for(i=0; i< resultsBlock.length; i++){
                    resultsBlock[i].classList.remove('hidden');
                }
                rows = document.getElementById("inp-num-of-rows").value;
                cols = document.getElementById("inp-num-of-cols").value;
            }

            //Виводимо перші результати
            let resMatrix1 = new ResMatrix({
                items: opts.initialMatrix,
                rows: rows,
                cols: rows      //важливо, бо матриця кваджратна
            });

            document.getElementById("num-of-unique").innerText = opts.numOfUnique;
            document.getElementById("res-matrix-1").innerHTML =  resMatrix1.getElem().innerHTML;

            //Виводимо другі результати
            var groupsBlock1 = document.getElementById("groups-block-1"),
                str = "<table class='table table-bordered groups'>";
            for(i=0; i< opts.groups.length; i++){
                str += "<tr> ";
                opts.groups[i].forEach( value => str += (`<td> ${value+1} </td>`) );	//value+1 бо нумерація з 0, а для користувача це не зручно
                str += "<tr>";
            }
            str += "</table>";
            groupsBlock1.innerHTML = str;
        },

        submitForm: function (e) {
            var form = e.target,
                inpArrOfStr = app.getForm1Inp(form);
            e.preventDefault();

            //if( !app.validate(form) ) return;

            var resMatrix1 = app.solveForm1( inpArrOfStr ),
                groups1 = app.calcMatrix2( resMatrix1 ),
                numOfUnique = app.getArrOfUniqueVals(inpArrOfStr).length;

            app.updateResult({
                initialMatrix: resMatrix1,
                groups: groups1,
                numOfUnique: numOfUnique
            });
        },

        getForm1Inp: function(form){
            var resultsSrtArr = [ ],
                table = form.getElementsByTagName("table")[0],
                i, j;

            //нумерація з 1 бо в 0 у нас номери рядків і стовпців збкрігаються
            for( i=1; i < table.rows.length; i++){
                resultsSrtArr.push( [ ] );
                for( j=1; j < table.rows[i].childElementCount; j++){
                    var inpVal = table.rows[i].cells[j].getElementsByTagName("input")[0].value;
                    resultsSrtArr[i-1].push( inpVal );
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
                numOfUniq = app.getArrOfUniqueVals(inpMatrix).length ; //кількість унікальних елементів матриці

            //Алгоритм обрахунку матриці співпадінь
            for(i = 0;i < rows; i++){
                temp_i=i;
                q = 1;
                count = 0;
                resultArr[i] = new Array(rows); //матриця результатів все-одно квадратна
                while (i+q<rows){
                    for(j=0;j<cols;j++){
                        temp_j=j;
                        for(k=0;k<cols;k++){
                            if(( inpMatrix[temp_i][temp_j] === inpMatrix[temp_i+q][k] )&&(inpMatrix[temp_i][temp_j] !== ''))
                                break;
                            else if((k+1==cols)&&(inpMatrix[temp_i][temp_j]!==''))
                                count++;
                        }
                        for(k=0;k<cols;k++){
                            if(( inpMatrix[temp_i+q][temp_j] === inpMatrix[temp_i][k] )&&(inpMatrix[temp_i+q][temp_j]!==''))
                                break;
                            else if((k+1==cols)&&(inpMatrix[temp_i+q][temp_j]!==''))
                                count++;
                        }
                    }
                    resultArr[temp_i][temp_i+q] = numOfUniq - count;
                    count=0;
                    q++;
                }
            }

            //дозаповнення матриці потрібними значеннями
            for(i=0; i < resultArr.length; i++ ){
                for(j=0; j < resultArr[i].length; j++ ){
                    if( i === j)
                        resultArr[i][j] = "0";
                    if( resultArr[i][j] === undefined )
                        resultArr[i][j] = resultArr[j][i] ;
                }
            }
            return resultArr;
        },

        // кількість унікальних елементів у масиві будь-якої розмірності
        getArrOfUniqueVals: function unique(arr) {
            var obj = {};   //допоміжний об'єкт, куди записуються елементи масиву як унікальні ключі

            (function writeInObjUniqueVal(arr){
                if(arr.length === 0) return 0;

                arr.forEach(function(item){
                    if(item instanceof Array){
                        writeInObjUniqueVal(item);
                        return 0;   //коли пройдемо по всіх елементах масива, щоб сам цей масив не записало як ключ
                    }

                    var str = item.toString();  //на випадок якщо це функція, дата, тощо
                    if (str !== '')
                        obj[str] = true; // запомнить строку в виде свойства объекта
                });
            }(arr));

            return Object.keys(obj);
        },

        calcMatrix2: function(arr){
            let fullSet = new Set(),	//множина з усіма елементами в усіх вже заповнених групах(треба щоб запобігати повторів у кожній групі)
                resultsArr = [],
                size = arr.length;		//скільки може бути елементів в групах

            //заповнюємо чергу із елементів у нижньому трикутнику та їх індексів
            let sortedQueue = [];
            for(let i = 0; i < arr.length; i++){
                for(let j = 0; j < arr[i].length; j++){
                    //якщо кінець рядка нижнього трикутника(i == j), переходимо на інший рядок
                    if(i == j)	break;
                    sortedQueue.push({ val:arr[i][j],	x:i,	y:j });
                }
            }
            //сортуємо щоб потім перебирати із найбільших елементів до найменших
            sortedQueue.sort(function(a, b){ return a.val > b.val; });

            //ділимо на групи поки ще є елементи
            while(size){
                if(!sortedQueue.length)	//якщо закінчились елементи в черзі - групи зформовані
                    break;

                let currentGroup = new Set(),	//поточна група
                    x, y, 						//позиція максимального елемента
                    el = sortedQueue.pop();		//дістаємо останній максимальний елемент з черги

                //якщо залишилось 2, або 1 елемент - це вже завжди остання група
                if(size <= 2){
                    for(let i = 0; i < arr.length; i++ ){
                        if(!fullSet.has(i)){
                            currentGroup.add(i);
                            fullSet.add(i);
                            --size;
                        }
                    }
                    resultsArr.push(currentGroup);
                    break;
                }

                //якщо № рядка і стовпця вже є в множині - переходимо до наступної ітерації
                //(переходимо до наступного елемента в черзі sortedQueue)...
                if(fullSet.has(el.x) && fullSet.has(el.y))
                    continue;

                //...інакше додаємо в поточну групу і в загальну множину № рядка і/або стовпця
                if(!fullSet.has(el.x)){
                    currentGroup.add(el.x);
                    fullSet.add(el.x);
                    --size;
                }
                if(!fullSet.has(el.y)){
                    currentGroup.add(el.y);
                    fullSet.add(el.y);
                    --size;
                }

                //пробігаємо по Рядку, додаючи № стовпців елементів, що дорівнюють поточному, в групу
                for(let i = 0; i < arr[el.x].length; i++){
                    let item = arr[el.x][i];
                    if( item === el.val && !fullSet.has(i) && (i !== el.y) ){
                        currentGroup.add(i);
                        fullSet.add(i);
                        --size;
                    }
                }
                //пробігаємо по Стовпцю, додаючи № рядків елементів, що дорівнюють поточному, в групу
                for(let i = 0; i < arr.length; i++){
                    let item = arr[i][el.y];
                    if(item === el.val && !fullSet.has(i) && (i !== el.x) ){
                        currentGroup.add(i);
                        fullSet.add(i);
                        --size;
                    }
                }

                resultsArr.push(currentGroup);
            }

            return resultsArr;
        }
    };

    app.initialize();

    console.log( app.calcMatrix2([
        [0,7,6,4,9,6,7],
        [7,0,7,5,7,5,4],
        [6,7,0,9,7,2,5],
        [4,5,9,0,6,1,3],
        [9,7,7,6,0,3,2],
        [6,5,2,1,3,0,1],
        [7,4,5,3,2,1,0]
    ]));
    console.log( app.calcMatrix2([
        [0,7,6,4,7,6,7],
        [7,0,7,5,7,5,4],
        [6,7,0,7,7,2,5],
        [4,5,7,0,6,1,3],
        [7,7,7,6,0,7,2],
        [6,5,2,1,7,0,1],
        [7,4,5,3,2,1,0]
    ]));

}() );