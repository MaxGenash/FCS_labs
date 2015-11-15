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
                /*["T1", "T2", "T3", "C3"]*/["T3", "C1"]/*["T4", "T5", "T3", "C3"]*//*["T4", "T2", "T3"]*/,
                /*["T2", "T3", "C1"]*//*["T2"]*/["T2", "T5", "F1"]/*["T2", "T3"]*//*["T2", "T5", "C1"]*/,
                ["T3", "C1", "C2"],
                    /*["1","2","3","4","5","6","7"],
                ["1","4","6","7","8","9"],
                ["2","4","5","9","12"],
                ["2","5","7","9"],
                ["4","6","7","10","11"],*/
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
                i, j;

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
            let groupsBlock1 = document.getElementById("groups-block-1"),
                str = `<table class='table table-bordered groups'>
                           <tr>
                               <th> № </th>
                               <th> Елементи групи </th>
                           </tr>`;
            for(i=0; i< opts.groups.length; i++){
                j=0;
                str += `<tr> <th>${ i+1 }</th><td>`;
                opts.groups[i].forEach(function (value){
                    if(j === (opts.groups[i].size-1)){
                        str += (value + 1);  //value+1 бо нумерація з 0, а для користувача це не зручно
                    } else {
                        str += ((value + 1) + ", ");
                    }
                    j++;
                });
                str += `</td></tr>`;
            }
            str += "</table>";
            groupsBlock1.innerHTML = str;

            //Виводимо треті результати
            let ordGrpsBlock1 = document.getElementById("connected-groups-block-1"),
                str3 = `<table class='table table-bordered'>
                           <tr>
                               <th> № </th>
                               <th> Елементи групи </th>
                               <th> Відповідні операції </th>
                           </tr>`;
            opts.ordGrps.forEach( function(item, i){
                let grps = [...item.gr],    //перетворюємо множину у масив
                    opts = [...item.op];
                grps.forEach((rowNum, i) => grps[i]++);   //інкрементуємо значення, бо нумерація з 0
                str3 += `<tr>
                            <th>${ i+1 }</th>
                            <td>
                                ${ grps }
                            </td>
                            <td>
                                ${ opts }
                            </td>
                        </tr>`;
            });
            str3 += `</table>`;
            ordGrpsBlock1.innerHTML = str3;

        },

        submitForm: function (e) {
            var form = e.target,
                inpArrOfStr = app.getForm1Inp(form);
            e.preventDefault();

            //if( !app.validate(form) ) return;

            var resMatrix1 = app.solveForm1( inpArrOfStr ),
                groups1 = app.calcMatrix2( resMatrix1 ),
                numOfUnique = app.getArrOfUniqueVals( inpArrOfStr ).length,
                orderedGroups = app.calcOrderedGroups(groups1, inpArrOfStr);

            app.updateResult({
                numOfUnique: numOfUnique,
                initialMatrix: resMatrix1,
                groups: groups1,
                ordGrps: orderedGroups
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

        colsInMatrix: function(matrix){
            var max = matrix[0].length;
            for(var i = 1; i< matrix.length; i++){
                if(matrix[i].length > max)
                    max = matrix[i].length;
                }
            return max;

            //   return matrix.reduce(function(max, current, index, arr){
            //		if(index === 0) return current.length;
            //        return (current.length > max) ? current.length : max;
            //    });
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
        },

        calcOrderedGroups: function(initialGrps, initialOps) {
            var resultsArr = [] /*[     //так виглядає приклад масиву результатів
             {
             gr: new Set([2,4,3]),
             op: new Set(["T1", "T2", "T3", "C1", "C2"])
             },                {
             gr: new Set([1,5,6]),
             op: new Set(["T2", "T3", "C3"])
             },
             {
             gr: new Set([7]),
             op: new Set(["T4", "T5"])
             }
             ]

             resultsArr[0].gr - множина груп
             resultsArr[0].op - множина операцій

             УВАГА!!! нумерація груп з 0

             ЛАЙФХАК:
             Для тестування можеш перевизначити введні initialGrps та initialOps
             initialGrps =       ;
             initialOps =        ;
             */;

            //Початкове заповнення упорядкованого масиву "груп з відповідними їм операціями":
            //
            //пробігаємо по переданому масиву груп і додаємо кожну групу в відповідний елемент
            //масиву результатів

            initialGrps.forEach(function (group, i) {
                //додаємо в масив новий об'єкт
                resultsArr.push({
                    gr: group, //додаємо групи, аналогічно  resultsArr[i].gr = group;
                    op: new Set()
                });
                /*
                 //додаємо відповідні кожному елементу групи операції в множину resultsArr[i].op
                 //resultsArr[i].op - це множина, тому повтори автоматично виключатимуться
                 for(let opsRow of group){
                 // оператор spread (...) (див learn.javascript.ru/es-function#оператор-spread-вместо-arguments)
                 // перетворить масив initialOps в окремі елементи і додасть їх почерзі
                 resultsArr[i].op.add(...(initialOps[opsRow]));
                 }*/

            });
            function sortBubble(data) {
                var tmp;

                for (var i = data.length - 1; i > 0; i--) {
                    for (var j = 0; j < i; j++) {
                        if (data[j][0] < data[j + 1][0]) {
                            tmp = data[j];
                            data[j] = data[j + 1];
                            data[j + 1] = tmp;
                        }
                    }
                }
                return data;
            }

            function createSetLen(arr) {                        //create our array of lengths
                var setLen = new Array(arr.length);
                for (i = 0; i < arr.length; i++)
                    setLen[i] = new Array(2);
                for (i = 0; i < arr.length; i++) {
                    setLen[i][0] = arr[i].op.size;
                    setLen[i][1] = i;
                }
                return setLen;
            }

            function sortGroup(setLen, mySet) {
                let tempGr = [];
                /*for(i=0;i<setLen.length-1;i++) {
                 z=1;
                 do {
                 if (mySet[setLen[i + z][0]].op.size <= mySet[setLen[i][0]].op.size) {
                 temp = mySet[setLen[i + z][1]].op;
                 mySet[setLen[i + z][1]].op = mySet[setLen[i][1]].op;
                 mySet[setLen[i][1]].op = temp;
                 */

                var tempArr1 = [];
                for (i = 0; i < setLen.length; i++) {
                    tempArr1[i] = new Set();
                    tempGr[i]=new Set();
                }
                for (i = 0; i < setLen.length; i++) {
                    tempArr1[i] = resultsArr[setLen[i][1]].op;
                    tempGr[i] = resultsArr[setLen[i][1]].gr;
                }
                for (i = 0; i < setLen.length; i++) {
                    mySet[i].op = tempArr1[i];
                    mySet[i].gr = tempGr[i];
                }
            }
            var i, j, k, z, count;  //counters
            var setLength, tempLenSetLen;
            for (i = 0; i < initialGrps.length; i++) {
                for (j = 0; j < initialOps.length; j++)
                    if (initialGrps[i].has(j)) {
                        for (k = 0; k < initialOps[j].length; k++) {                   //define length of initOps
                            if (/*!resultsArr[i].op.has(initialOps[j][k]) &&*/ initialOps[j][k] != "")
                                resultsArr[i].op.add(initialOps[j][k])
                        }
                    }
            }



            setLength = createSetLen(resultsArr);
            sortBubble(setLength);
            sortGroup(setLength, resultsArr);
            tempLenSetLen = setLength.length;


            var myArray = [];
            for (i = 0; i < resultsArr.length; i++) {
                myArray[i] = [];
                myArray[i] = Array.from(resultsArr[i].op);
            }
            var myArrGrp = [];
            for (i = 0; i < resultsArr.length; i++) {
                myArrGrp[i] = [];
                myArrGrp[i] = Array.from(resultsArr[i].gr);
            }
            //=====================================1 check=====================================
            //=================================================================================
            do {
                i = 0;
                do {
                    for (k = 1; k < setLength.length - i; k++) {
                        count = 0;
                        if (myArray[i + k] == undefined)
                            break;
                        for (j = 0; j < myArray[i].length; j++)
                            for (z = 0; z < myArray[i + k].length; z++)
                                if (myArray[i][j] === myArray[i + k][z]) {
                                    count++;
                                    break;
                                }
                        if (count == myArray[i + k].length) {
                            //myArray[i + k].splice(0, myArray[i + k].length);
                            for (j = 0; j < myArrGrp[i + k].length; j++)
                                myArrGrp[i].push(myArrGrp[i + k][j]);
                            myArray.splice(i + k, 1);
                            myArrGrp.splice(i + k, 1);
                        }
                    }
                    i++;
                    if (myArray[i + 1] == undefined)
                        break;
                } while (true);
                setLength = createSetLen(resultsArr);
                sortBubble(setLength);
                sortGroup(setLength, resultsArr);
                if (tempLenSetLen == setLength.length)
                    break;
                tempLenSetLen = setLength.length;
            } while (true);
            //====================================================================================
            //====================================================================================
            for (i = 0; i < resultsArr.length; i++) {
                resultsArr[i].op = new Set(myArray[i]);
                resultsArr[i].gr = new Set(myArrGrp[i]);
            }
            var tempArr = [];
            var tempInd = [], p = 0, l = 0;
            let tempSet = new Set();
            for (i = 0; i < resultsArr.length; i++) {
                myArray[i] = Array.from(resultsArr[i].op);
            }
            for (i = 0; i < resultsArr.length; i++) {
                myArrGrp[i] = Array.from(resultsArr[i].gr);
            }
            //==========================================2 check===================================
            //====================================================================================
                do {
                    i = 0;
                    do {
                        for (k = 1; k < setLength.length - i; k++) {

                            if (myArray[i + k] == undefined)
                                break;
                            for (l = 0; l < myArrGrp[i + k].length; l++) {
                                count = 0;
                                tempInd = [];
                                tempArr = Array.from(initialOps[myArrGrp[i + k][l]]);
                                for (j = 0; j < myArray[i].length; j++)
                                    if (tempArr[j] == "")
                                        tempArr.splice(j, tempArr.length);
                                for (j = 0; j < myArray[i].length; j++)
                                    for (z = 0; z < tempArr.length; z++) {
                                        if ((myArray[i][j] == tempArr[z]) && (tempArr[z] != undefined)) {
                                            count++;
                                            tempInd.push(z);
                                            break;
                                        }
                                    }

                                if (count == tempArr.length) {
                                    for (p = 0; p < tempInd.length; p++)
                                        myArray[i + k].splice(tempInd[p], 1);
                                    myArrGrp[i].push(myArrGrp[i + k][l]);
                                    myArrGrp[i + k].splice(l, 1);
                                    for (p = 0; p < myArrGrp[i + k].length; p++)
                                        myArray[i + k] = Array.from(initialOps[myArrGrp[i + k][p]]);

                                }
                            }
                            /*myArray[i+k]=Array.from(initialOps[myArrGrp[i+k]]);
                             for (j = 0; j < myArray[i+k].length; j++)
                             if(myArray[i+k][j]=="")
                             myArray[i+k].splice(j,myArray[i+k].length);*/
                        }
                        i++;
                        if (myArray[i + 1] == undefined)
                            break;
                    } while (true);

                    setLength = createSetLen(resultsArr);
                    sortBubble(setLength);
                    sortGroup(setLength, resultsArr);
                    if (tempLenSetLen == setLength.length)
                        break;
                    tempLenSetLen = setLength.length;
                }while(true);
            setLength = createSetLen(resultsArr);
            sortBubble(setLength);
            sortGroup(setLength, resultsArr);
            tempLenSetLen = setLength.length;
            //=====================================================================================
            //=====================================================================================
            for(i=0;i<resultsArr.length;i++) {
                resultsArr[i].op =new Set(myArray[i]);
                resultsArr[i].gr =new Set(myArrGrp[i]);
            }

            //обробляєш масив resultsArr
            //обробляєш масив resultsArr
            //обробляєш масив resultsArr


            return resultsArr;
        }
    };

    app.initialize();
/*  Тести для 2 лаби
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
*/
}() );