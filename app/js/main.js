'use strict';

import InpMatrix from './InpMatrix.class.js';
import ResMatrix from './ResMatrix.class.js';
import drawGraph from './drawGraph.js';
import U from './U.js';                    //different utilities, hacks and helpers

(function() {
    var app = {

        initialize: function () {
            let initialMatrixOfOp = [
                ["T1", "T2", "T3", "F1", "C1", "C2", "P2"],
                ["T1", "C1", "C2", "P2", "T4"],
                ["T1", "C3", "T2", "T3", "C1", "C2", "P2"],
                ["T2", "T3", "C1", "C2", "P2", "F1", "F2"],
                ["T3", "C1", "C2", "P2", "F1", "T4"],
                ["T2", "C3", "F1", "F2", "C1", "C2", "P2", "T4"],
                ["T1", "C3", "T3", "C1", "C2", "P2", "F1", "F2"],

                ["T1", "F1", "F2", "T2", "C1", "C2", "F3"],
                ["T3", "T2", "C1", "C2", "F1", "P2"],
                ["T4", "T3", "T2", "C1", "C2", "F1"],
                ["T2", "C1", "C2", "F1", "F2", "P2"],
                ["T2", "C1", "C2", "T3", "T4"],
                ["T3", "T4", "F2", "P2", "T2", "C1", "C2"],
                ["T2", "C1", "C2", "T4"]
                /*["T1","T2","T3","T4"],
                ["T5","T2","T1","T3"],
                ["T5","T6","T9","T7"],
                ["F1","T1","G5","R2"],
                ["T1","T2","T3"],
                ["T2","T3"],
                ["T4","G5","R2","R1"],
                ["R2"],
                ["G5","R2","T1"]*/
            ];

            this.form1 = document.forms["lab1-inp-form"];

            //дані якими оперує програма
            this.dataState = {
                matrixOfOperations: initialMatrixOfOp,     //введена матриця з операціями
                /*get matrixOfOperations() {                //якщо треба подія onchange
                 return this.matrixOfOperations;
                 },

                 set matrixOfOperations(val) {
                 this.matrixOfOperations = val;
                 app.updateResult({matrixOfOperations});
                 },  */
                numOfUniqueOp: null,                        //кількість унікальних операцій
                matrixOfUniqueOp: null,                     //матриця унікальних операцій
                groups: null,                               //групи із рядків з операціями
                orderedGroups: null,                        //упорядковані групи
                groupsWithModules: null,                    //групи з модулями операцій
                orderedModules: null,                       //упорядковані модулі
                technologicalStructure: null                //технологічна структура
            };

            this.setUpListeners();
            this.updateResult();
            this.updateInpMatrix( this.dataState.matrixOfOperations );
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
            let matrixOfUniqueOp1 = new ResMatrix({
                items: opts.matrixOfUniqueOp,
                rows: rows,
                cols: rows      //важливо, бо матриця кваджратна
            });

            document.getElementById("num-of-unique").innerText = opts.numOfUniqueOp;
            document.getElementById("res-matrix-1").innerHTML =  matrixOfUniqueOp1.getElem().innerHTML;

            //Виводимо другі результати
            let groupsBlock1 = document.getElementById("groups-block-1"),
                str = `<table class='table table-bordered groups'>
                           <tr>
                               <th> № групи </th>
                               <th> Елементи групи </th>
                               <th> Координати елементів групи </th>
                               <th> Відповідні операції </th>
                           </tr>`;
            opts.groups.forEach( function(item, i){
                let grSet = [...item.grSet],    //перетворюємо Set в Array
                    grArrCoords = [...item.grArrCoords],
                    ops = [...item.ops];
                grSet = grSet.map(el => ++el);    //інкрементуємо значення кожного елемента, бо нумерація з 0
                str += `
                           <tr>
                               <td> ${ i+1 } </td>
                               <td> ${ grSet.join(', ') } </td>
                               <td> ${ grArrCoords.join(', ') } </td>
                               <td> ${ ops.sort().join(', ') } </td>
                           </tr>`;
            });
            str += `</table>`;
            groupsBlock1.innerHTML = str;

            //Виводимо треті результати
            let ordGrpsBlock1 = document.getElementById("connected-groups-block-1"),
                str3 = `<table class='table table-bordered'>
                           <tr>
                               <th> № групи </th>
                               <th> Елементи групи </th>
                               <th> Відповідні операції </th>
                           </tr>`;
            opts.ordGrps.forEach( function(item, i){
                let grps = [...item.gr],    //перетворюємо множину у масив
                    opts = [...item.op];
                grps.forEach((rowNum, i) => grps[i]++);   //інкрементуємо значення, бо нумерація з 0
                str3 += `<tr>
                            <td>${ i+1 }</td>
                            <td>
                                ${ grps.join(', ') }
                            </td>
                            <td>
                                ${ opts.join(', ') }
                            </td>
                        </tr>`;
            });
            str3 += `</table>`;
            ordGrpsBlock1.innerHTML = str3;

            //Виводимо четверті результати
            let grpsWithModulesBlock1 = document.getElementById("groups-with-modules-block-1"),
                str4 =
                    `<table class="table table-bordered">
                         <tr>
                             <th> № групи </th>
                             <th> № модуля </th>
                             <th> Відповідні операції </th>
                         </tr>`;
            opts.grpsWithMod.forEach( (gr, i) => {
                gr.modules.forEach( (mod, j) => {
                    str4 +=
                        `<tr>`;
                    if(j === 0){    //
                        str4 +=
                            `<td rowspan="${gr.modules.length}">
								<span class="group-num"> ${ i+1 } </span>
								<button type="button" class="btn btn-default btn-show-graph" data-toggle="modal" data-group-num="${ i }"
										data-target="#graphCorouselModal" aria-label="ShowGraph" title="Показати граф для цієї групи">
									<span class="glyphicon glyphicon-blackboard" aria-hidden="true"></span>
								</button>
							 </td>`;
                    }
                    str4 += `<td> ${ j+1 } </td>
                             <td> ${ [...mod].join(", ") } </td>
						 </tr>`;
                });
            });
            str4 += `</table>`;
            grpsWithModulesBlock1.innerHTML = str4;

            //Генеруємо слайди для групи, що відповідає натисненій кнопці
            grpsWithModulesBlock1.addEventListener("click", function(e){
                //визначаємо на яку кнопку натиснули
                let btn = e.target.closest(".btn-show-graph");
                if( !btn ) return;

                let groupNum = btn.dataset.groupNum,
                    carousel = document.getElementById("carousel-with-graph-states"),
                    modalTitle = document.getElementById("myModalTitle"),
                    carouselIndicators = carousel.getElementsByClassName("carousel-indicators")[0],
                    carouselSlidesWrap = carousel.getElementsByClassName("carousel-inner")[0],
                    techStrGraphBlock = document.getElementById("tech-structure-graph-block");

                //заголовок модального вікна
                modalTitle.innerText = "Граф групи №" + groupNum;

                //ховаємо блок для технологічної структури, показуємо слайдер для графів
                carousel.classList.remove('hidden');
                techStrGraphBlock.classList.add('hidden');

                //очищаємо вміст блоків
                while (carouselSlidesWrap.firstChild) {
                    carouselSlidesWrap.removeChild(carouselSlidesWrap.firstChild);
                }
                while (carouselIndicators.firstChild) {
                    carouselIndicators.removeChild(carouselIndicators.firstChild);
                }

                //генеруємо вміст слайдера із графів
                opts.grpsWithMod[groupNum].transformingStates.forEach( (graph, i ) => {
                    //додаємо кніпочку для переходу до певного слайду
                    carouselIndicators.insertAdjacentHTML("beforeEnd",
                        `<li data-target="#carousel-with-graph-states" data-slide-to="${i}"></li>`
                    );

                    //додаємо слайд
                    carouselSlidesWrap.insertAdjacentHTML("beforeEnd",
                        `<div class="item">
                                <div class="graph-wrapper">

                                </div>
                                <div class="carousel-caption"> ${ graph.graphInfo } </div>
                            </div>`
                    );
                    drawGraph({
                        graphContainer: carouselSlidesWrap.getElementsByClassName("graph-wrapper")[i],   //Якщо не працюватиме - переробити щоб зверху ставило відповідний data-set, а тут рядок з css селектором "[data-slideNum=4]"
                        nodesArr: graph.nodes.map( ( item )=> {
                            if(item instanceof Array)
                                item = item.join(", ");
                            return {name: item};
                        }),
                        edgesArr: U.deepClone(graph.edges),
                        drawNodeLabels: true
                    });
                });

                //робимо активним перший слайд
                carouselIndicators.firstChild.classList.add("active");
                carouselSlidesWrap.firstChild.classList.add("active");
            });

            //Виводимо п'яті результати
            let ordModulesBlock1 = document.getElementById("ordered-modules-block-1"),
                str5 = `<table class='table table-bordered groups'>
                           <tr>
                               <th> № модуля </th>
                               <th> Відповідні операції </th>
                           </tr>`;
            opts.ordModules.forEach( function(item, i){
                str5 += `
                           <tr>
                               <td> ${ i+1 } </td>
                               <td> ${ [...item].join(', ') } </td>
                           </tr>`;
            });
            str5 += `</table>`;
            ordModulesBlock1.innerHTML = str5;

            //Виводимо шості результати
            //Кількість зворотніх зв'язків
            document.getElementById("num-of-inverse-connections").innerText = opts.techStructure.inverseNum;

            //виводимо табличку з порядком модулів
            let techStructureModulesBlock1 = document.getElementById("tech-structure-modules-block-1"),
                str6 = `<table class='table table-bordered groups'>
                           <tr>
                               <th> № модуля - Відповідні операції </th>
                           </tr>
                           <tr>
                               <td> Start </td>
                           </tr>
                           `;
            for(let i = 1, nodes = opts.techStructure.nodes; i < nodes.length -1; i++) {
                str6 += `  <tr>
                               <td> ${ nodes[i].name } </td>
                           </tr>`;
            }
            str6 += `      <tr>
                               <td> Finish </td>
                           </tr>
                        </table>`;
            techStructureModulesBlock1.innerHTML = str6;

            //виводимо табличку із шляхами проходу по модулям
            let techStructureWaysBlock1 = document.getElementById("tech-structure-ways-block-1"),
                str7 = `<table class='table table-bordered groups'>
                           <tr>
                               <th>№ рядка операцій </th>
                               <th>Шляхи проходження по модулям </th>
                           </tr>`;
            opts.techStructure.ways.forEach( function(way, i){
                str7 += `
                           <tr>
                               <td> ${ i+1 } </td>
                               <td> ${ way } </td>
                           </tr>`;
            });
            str7 += `</table>`;
            techStructureWaysBlock1.innerHTML = str7;

            //Малюємо граф усієї технологічної структури при натисненні на відповідну кнопку
            let drawTechStrGraphBtn = document.getElementById("btn-draw-tech-structure-graph");
            drawTechStrGraphBtn.addEventListener("click", function(e){
                let techStrGraphBlock = document.getElementById("tech-structure-graph-block"),
                    graphWrapper = techStrGraphBlock.getElementsByClassName("graph-wrapper")[0],
                    carouselBlock = document.getElementById("carousel-with-graph-states"),
                    modalTitle = document.getElementById("myModalTitle");

                //заголовок модального вікна
                modalTitle.innerText = "Граф технологічної структури зі шляхами всіх рядків операцій";

                //ховаємо слайдер для графів, показуємо блок для технологічної структури
                carouselBlock.classList.add('hidden');
                techStrGraphBlock.classList.remove('hidden');

                graphWrapper.innerHTML = "";

                drawGraph({
                    graphContainer: graphWrapper,
                    nodesArr: opts.techStructure.nodes,
                    edgesArr: U.deepClone(opts.techStructure.edges),
                    drawNodeLabels: true,
                    drawEdgeLabels: true,
                    curvedEdges: true
                });
            });

            //Додати Label на стрілочки
            //Додати можливість підсвітити весь шлях для кожного рядка операцій(всі стрілочки із однаковим Label)
            //Додати можливість показати всі зв'язки для кожної вершини
            //додати прямокутники для вершин і налаштувати правильне розташування стрілочок для них
        },

        submitForm: function (e) {
            //коротші назви(записуємо адреси, а не значення)
            let matrixOfOperations = app.dataState.matrixOfOperations,
                numOfUniqueOp = app.dataState.numOfUniqueOp,
                matrixOfUniqueOp = app.dataState.matrixOfUniqueOp,
                groups = app.dataState.groups,
                orderedGroups = app.dataState.orderedGroups,
                groupsWithModules = app.dataState.groupsWithModules,
                orderedModules = app.dataState.orderedModules,
                techStructure = app.dataState.technologicalStructure,

                form = e.target;

            e.preventDefault();

            matrixOfOperations = app.getForm1Inp(form);

            //if( !app.validate(form) ) return;

            numOfUniqueOp = U.getArrOfUniqueVals( matrixOfOperations ).length;
            matrixOfUniqueOp = app.calcMatrixOfUniqueOp( matrixOfOperations );
            groups = app.calcGroups( matrixOfUniqueOp, matrixOfOperations);
            let grSet = groups.map(el => el.grSet);
            orderedGroups = app.calcOrderedGroups(grSet, matrixOfOperations);
            groupsWithModules = app.calcGrpsWithModules(orderedGroups, matrixOfOperations);
            orderedModules = app.calcOrderedModules(groupsWithModules);
            techStructure = app.calcTechStructure(orderedModules, matrixOfOperations);
            //викликаємо функцію що перетворить дані в зручний для відображення вигляд
            let techStrForView = app.transformTechStrForView(techStructure);

            app.updateResult({
                numOfUniqueOp: numOfUniqueOp,
                matrixOfUniqueOp: matrixOfUniqueOp,
                groups: groups,
                ordGrps: orderedGroups,
                grpsWithMod: groupsWithModules,
                ordModules: orderedModules,
                techStructure: techStrForView
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
                    if(inpVal)
                        resultsSrtArr[i-1].push( inpVal );
                }
            }

            return resultsSrtArr;
        },

        /**
         * На вході матриця рядків
         * Повертає матрицю чисел
         */
        calcMatrixOfUniqueOp: function(inpMatrix){
            var i, j, k,                                     //ітератори
                temp_i,temp_j,                               //тимчасові значення ітераторів
                q,                                           //стільки рядків будемо перестрибувати
                count,                                       //кількість співпадінь
                rows = inpMatrix.length,                     //максимальна кількість рядків
                cols = U.colsInMatrix(inpMatrix),                  //максимальна кількість стовпців
                resultArr = new Array( rows ),
                numOfUniq = U.getArrOfUniqueVals(inpMatrix).length ; //кількість унікальних елементів матриці

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
                            if(( inpMatrix[temp_i][temp_j] === inpMatrix[temp_i+q][k] ) && inpMatrix[temp_i][temp_j])
                                break;
                            else if((k+1==cols) && inpMatrix[temp_i][temp_j])
                                count++;
                        }
                        for(k=0;k<cols;k++){
                            if(( inpMatrix[temp_i+q][temp_j] === inpMatrix[temp_i][k] ) && inpMatrix[temp_i+q][temp_j])
                                break;
                            else if((k+1==cols) && inpMatrix[temp_i+q][temp_j])
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

        calcGroups: function(arr, ops){
            let fullSet = new Set(),	//множина з усіма елементами в усіх вже заповнених групах(треба щоб запобігати повторів у кожній групі)
                resultsArr = [],
                maxSize = arr.length,   //скільки може бути елементів в групах
                arrMarked = [];

            //заповнюємо чергу із елементів у нижньому трикутнику та їх індексів
            let sortedQueue = [];
            for(let i = 0; i < arr.length; i++){
                arrMarked[i] = new Array( arr[i].length );
                for(let j = 0; j < arr[i].length; j++){
                    arrMarked[i][j] = false;
                    //якщо це верхній трикутник, не додаємо елементи в чергу для уникнення дублікатів
                    if(i >= j)	continue;
                    sortedQueue.push({
                        val: arr[i][j],                 //val - значення елемента
                        x:i,    y:j                     //координати у масиві arr
                    });
                }
            }
            //сортуємо щоб потім перебирати із найбільших елементів до найменших
            sortedQueue.sort(function(a, b){
                if(a.val !== b.val)
                    return a.val - b.val;
                if( (a.x < b.x) || ((a.x == b.x) && (a.y < b.y)) )
                    return +1;
                if(a.val === b.val && a.x === b.x && a.y === b.y)
                    return 0;
                return -1;
            });

            //ділимо на групи поки ще є елементи в черзі і не додали в групи всі рядки у матриці операцій
            while((fullSet.size < maxSize) && sortedQueue.length){
                let el = sortedQueue.pop(),		            //дістаємо останній максимальний елемент з черги
                    newGroup = {
                        grSet: new Set(),       //елементи групи
                        grArrCoords: [],        //координати елементів групи
                        ops: new Set()          //операції для цієї групи
                    },
                    currentGroup = buildGroup(el, newGroup, fullSet, arr, arrMarked);
                //якщо вдалося побудувати групу для цього елемента черги(його x або y нема в множині fullSet)
                if(currentGroup.grSet.size > 0) {
                    currentGroup.ops = calcOps(currentGroup.grSet, ops);
                    resultsArr.push(currentGroup);
                }
            }

            return resultsArr;

            function calcOps(grSet, ops){
                var result = new Set();
                grSet.forEach( (row) => {
                    ops[row].forEach( op => result.add(op) );
                });
                return result;
            }

            function buildGroup(el, currentGroup, fullSet, arr, arrMarked){
                //позначаємо що цей елемент вже розглядали щоб не було зациклення рекурсії
                arrMarked[el.x][el.y] = true;

                //...інакше додаємо в поточну групу і в загальну множину № рядка і/або стовпця
                if(!fullSet.has(el.x)){
                    currentGroup.grSet.add(el.x);
                    currentGroup.grArrCoords.push("(" + (+el.x+1) + "," + (+el.y+1) + ")");
                    fullSet.add(el.x);
                }
                if(!fullSet.has(el.y)){
                    currentGroup.grSet.add(el.y);
                    currentGroup.grArrCoords.push("(" + (+el.x+1) + "," + (+el.y+1) + ")");
                    fullSet.add(el.y);
                }

                //пробігаємо по Рядку, додаючи № стовпців елементів, що дорівнюють поточному, в групу
                for(let i = 0; i < arr[el.x].length; i++){
                    let x = el.x,    y = i,
                        item = {    val: arr[el.x][i],    x,    y    };
                    if( item.val === el.val && (item.y !== el.y) && !arrMarked[item.x][item.y] /*&& !fullSet.has(item.y) */){
                        currentGroup = buildGroup(item, currentGroup, fullSet, arr, arrMarked);
                    }
                }
                //пробігаємо по Стовпцю, додаючи № рядків елементів, що дорівнюють поточному, в групу
                for(let i = 0; i < arr.length; i++){
                    let x = i,    y = el.y,
                        item = {    val: arr[i][el.y],    x,    y    };
                    if( item.val === el.val && (item.x !== el.x) && !arrMarked[item.x][item.y] /* && !fullSet.has(item.x) */){
                        currentGroup = buildGroup(item, currentGroup, fullSet, arr, arrMarked);
                    }
                }

                return currentGroup;
            }
        },

        /**
         * Функція для впорядкування груп
         *
         * @param initialGrps
         * @param initialOps
         * @returns resultsArr[0].gr - множина груп
         * @returns resultsArr[0].op - множина операцій
         */
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
             */;

            initialGrps.forEach(function (group, i) {
                //додаємо в масив новий об'єкт
                resultsArr.push({
                    gr: group, //додаємо групи, аналогічно  resultsArr[i].gr = group;
                    op: new Set()
                });
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
            var CountOfCheck;
            for (i = 0; i < initialGrps.length; i++) {
                for (j = 0; j < initialOps.length; j++)
                    if (initialGrps[i].has(j)) {
                        for (k = 0; k < initialOps[j].length; k++) {                   //define length of initOps
                            if (/*!resultsArr[i].op.has(initialOps[j][k]) &&*/ initialOps[j][k])
                                resultsArr[i].op.add(initialOps[j][k])
                        }
                    }
            }
            do {
                CountOfCheck=0;
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
                    CountOfCheck++;
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
                                CountOfCheck=0;
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
                    CountOfCheck++;
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
                                        if ((myArray[i][j] == tempArr[z]) && (tempArr[z] !== undefined)) {
                                            count++;
                                            tempInd.push(z);
                                            break;
                                        }
                                    }

                                if (count == tempArr.length) {
                                    CountOfCheck=0;
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
                        if (myArray[i + 1] === undefined)
                            break;
                    } while (true);

                    setLength = createSetLen(resultsArr);
                    sortBubble(setLength);
                    sortGroup(setLength, resultsArr);
                    if (tempLenSetLen == setLength.length)
                        break;
                    tempLenSetLen = setLength.length;
                } while (true);
                setLength = createSetLen(resultsArr);
                sortBubble(setLength);
                sortGroup(setLength, resultsArr);
                tempLenSetLen = setLength.length;
                //=====================================================================================
                //=====================================================================================
                for (i = 0; i < resultsArr.length; i++) {
                    resultsArr[i].op = new Set(myArray[i]);
                    resultsArr[i].gr = new Set(myArrGrp[i]);
                }

                //видаляєми пусті елементи з масиву
                for (i = 0; i < resultsArr.length; i++) {
                    if (/*  !resultsArr[i].op.size && */ !resultsArr[i].gr.size) {
                        resultsArr.splice(i, 1);
                        --i;
                    }
                }
                //======================================3 check=========================================
                //======================================================================================
                /*var CountOfInsertedGroup = new Array(setLength.length);
                for (i = 0; i < setLength.length; i++)
                    CountOfInsertedGroup[i] = new Array(3);
                var ArrEqualLength = new Array(setLength.length);
                for (i = 0; i < setLength.length; i++)
                    ArrEqualLength[i] = new Array(2);
                for (i = 0; i < ArrEqualLength.length; i++)
                    for (i = 0; i < ArrEqualLength.length; i++)
                        ArrEqualLength[i][j]=setLength[i][j];
                var q,e;
                for (i = 0; i < CountOfInsertedGroup.length; i++)
                    for(j=0;j<CountOfInsertedGroup[i].length;j++) {
                        CountOfInsertedGroup[i][j]=0;
                    }
                sortBubble(ArrEqualLength);
                for(q=0;q<ArrEqualLength.length;q++){
                    e=1;
                    if (ArrEqualLength[q + e] == undefined)
                        break;
                    while(ArrEqualLength[q]==ArrEqualLength[i+e]){
                        i = e;
                        do {
                            k=1;
                            for (l = 0; l < myArrGrp[i + k].length; l++) {
                                count = 0;
                                tempInd = [];
                                tempArr = Array.from(initialOps[myArrGrp[i + k][l]]);
                                for (j = 0; j < myArray[i].length; j++)
                                    if (tempArr[j] == "")
                                        tempArr.splice(j, tempArr.length);
                                for (j = 0; j < myArray[i].length; j++)
                                    for (z = 0; z < tempArr.length; z++) {
                                        if ((myArray[i][j] == tempArr[z]) && (tempArr[z] !== undefined)) {
                                            count++;
                                            tempInd.push(z);
                                            break;
                                        }
                                    }
                                if (count == tempArr.length) {
                                    CountOfInsertedGroup[q][0]++;
                                    CountOfInsertedGroup[q][1]=initialOps[myArrGrp[i + k][l]];
                                    CountOfInsertedGroup[q][2]=e;
                                    /!*for (p = 0; p < tempInd.length; p++)
                                        myArray[i + k].splice(tempInd[p], 1);
                                    myArrGrp[i].push(myArrGrp[i + k][l]);
                                    myArrGrp[i + k].splice(l, 1);
                                    for (p = 0; p < myArrGrp[i + k].length; p++)
                                        myArray[i + k] = Array.from(initialOps[myArrGrp[i + k][p]]);*!/
                                }
                            }
                            if (ArrEqualLength[q + k] == undefined)
                                break;
                        } while (true);
                        e++;
                        /!*setLength = createSetLen(resultsArr);
                        sortBubble(setLength);
                        sortGroup(setLength, resultsArr);
                        if (tempLenSetLen == setLength.length)
                            break;
                        tempLenSetLen = setLength.length;*!/
                    }
                    sortBubble(CountOfInsertedGroup);
                    sortGroup(CountOfInsertedGroup,myArray)
                }*/
                if(CountOfCheck==2){                //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!не забыть поменять на 3 после реализации 3 проверки
                    break;
                }
            }while(true);
            /*for (i = 0; i < resultsArr.length; i++) {
                resultsArr[i].op = new Set(myArray[i]);
                resultsArr[i].gr = new Set(myArrGrp[i]);
            }*/


            return resultsArr;
        },

        calcGrpsWithModules: function(orderedGroups, matrixOfOps){
    /*        orderedGroups = [
                {
                    gr: new Set([0,4,5])//,
             //       op: new Set(["T1", "T2", "T3", "C1", "C2"])
                },
                {
                    gr: new Set([0,1,2,3,4,5,6])//,
              //     op: new Set(["T2", "T3", "C3"])
                }
            ];
*/
            var resultsArr = [];
/*          //Приклад структури даних результау
            [
                {   //група 1
                    modules: [  //модулі які треба для наступної обробки
                        new Set(["T1", "T2", "F2", "C1"]),
                        new Set(["P2"]),
                        new Set(["T3", "T4", "F1"])
                    ],
                    transformingStates: [   //стани перетворення графа
                        {
                            nodes: [    //вершини графа
                                [name: "T1"],   [name: "T2"],   [name: "T3"],
                                [name: "T3"],   [name: "T4"],   [name: "F1"],
                                [name: "F2"],   [name: "C1"],   [name: "P2"]
                            ],
                            edges: [    //дуги графа
                                {source: 0, target: 1},  {source: 0, target: 2},
                                {source: 0, target: 3},  {source: 0, target: 4},
                                {source: 1, target: 5},  {source: 2, target: 5},
                                {source: 5, target: 2},  {source: 3, target: 4},
                                {source: 5, target: 8},  {source: 6, target: 7},
                                {source: 7, target: 8},  {source: 0, target: 8}
                            ],
                            graphInfo: "Початковий стан"
                         },
                        //... інші стани
                        {
                            nodes: [
                                [T1, T2, F2, C1],
                                [P2],
                                [T3, T4, F1]
                            ],
                            edges: [
                                {source: 0, target: 1},
                                {source: 0, target: 2}
                            ]
                            graphInfo: "Спрощено щось там за якимось правилом"
                         }
                    ],
                },
                {   //група 2
                    modules: [  //модулі які треба для наступної обробки
                        new Set([ "T1", "T2", "T3", "C1" ]),
                        new Set([ "C2" ])
                    ],
                    transformingStates: [   //стани перетворення графа
                        {
                            nodes: [    //вершини графа
                                [name: "T1"],   [name: "T2"],   [name: "T3"],
                                [name: "T3"],   [name: "T4"],   [name: "F1"],
                                [name: "C2"],   [name: "C1"]
                            ],
                            edges: [    //дуги графа
                                {source: 0, target: 1},  {source: 0, target: 2},
                                {source: 0, target: 3},  {source: 0, target: 4},
                                {source: 3, target: 0},  {source: 2, target: 5},
                                {source: 2, target: 5},  {source: 3, target: 4},
                                {source: 5, target: 2},  {source: 6, target: 7}
                            ],
                            graphInfo: "Початковий стан"
                        },
                        {
                            nodes: [
                                ["T1, T2, T3, C1"],
                                [name: "C2"]
                            ],
                            edges: [
                                {source: 0, target: 1}
                            ],
                            graphInfo: "Спрощено щось там за якимось правилом"
                         }
                    ]
                }
            ];
*/
             //обробляємо кожну групу
            orderedGroups.forEach( ( group ) => {
                resultsArr.push(
                    processGroup( group.gr, matrixOfOps)  //group.gr - бо кожен елемент orderedGroups має множину груп і множину операцій
                );
            });

            return resultsArr;

            //функція обробки групи
            function processGroup(group, matrixOfOps){
                let resGroup = {    //рузультат обробки групи
                        modules: [],
                        transformingStates: []
                    },
                    performingRules = [rule5, rule4, rule3];    // масив правил обробки, що складається з обробляючих функцій(див нижче)

                //ініціалізуємо стан графа
                var initialState = createInitialState(matrixOfOps, group);
                resGroup.transformingStates.push( initialState );

                //спрощуємо граф за правилами
                let graphState = initialState,
                    finished;
                do{
                    finished = true;   //чи закінчено спрощення
                    //спрощуємо граф за кожним правилом
                    performingRules.forEach(function(rule, ruleNum) {
                        let ruleResult = rule(graphState);   //обробляємо граф за правилом
                        //якщо ми щось спростили
                        if(ruleResult) {
                            graphState = ruleResult;
                            resGroup.transformingStates.push(graphState);
                            finished = false;
                        }
                    });
                }while(!finished);

                //будуємо модулі за останнім станом графа
                let lastState = resGroup.transformingStates[resGroup.transformingStates.length - 1];
                resGroup.modules = lastState.nodes.map( (node) => {
                    return new Set(node/*.name*/);
                });

                return resGroup;

                function createInitialState(matrixOfOps, group){
                    let initialState = {
                            nodes: [],                  //вершини графа
                            edges: [],                  //дуги графа
                            graphInfo: "Початковий стан"
                        };     //тимчасова множина для уникнення повторів дуг

                    //створюємо масив вершин
                    initialState.nodes = U.getArrOfUniqueVals(matrixOfOps);   //отримаємо масив рядків

                    //створюємо масив дуг
                    group.forEach( (row) => {   //кожен елемент групи - рядок операцій
                        for(let i = 1, arr = matrixOfOps[row]; i < arr.length; i++){
                            initialState.edges.push( {
                                source: initialState.nodes.indexOf(arr[i-1]),
                                target: initialState.nodes.indexOf(arr[i])
                            } );
                        }
                    });

                    // initialState.nodes = initialState.nodes.map( item => { return {name: item}; });  //перетворюємо щоб був масив об'єктів
                    //перетворюємо щоб кожна вершина була масивом
                    initialState.nodes = initialState.nodes.map( item => { return [item]; });

                    //видаляємо повтори із масиву дуг
                    initialState.edges = U.delRepeats(initialState.edges);

                    //initialState.edges.sort((el1, el2) => el1.source - el2.source)    //for debugging
                    return initialState;
                }

                //elements - масив номерів вершин які стреба об'єднати
                //graph - граф у якому об'єднуємо вершини
                function concatElements(elements, graph){
                    //сортуємо у обратному порядку, бо інакше видалятиме вершини неправильно
                    // (при видаленні вершини в масиві здвигаються)
                    elements.sort( (a,b) => b-a );

                    let resGr = U.deepClone(graph),           //результуючий граф
                        resNode = [],                               //результуюча вершина
                        resNodeNum = elements[elements.length-1];   //номер результуючої вершини

                    ////Об'єднуємо вершини
                    //копіюємо всі елементи, що відповідають об'єднуваним вершинам в тимчасовий resNode
                    for(let i=0; i < elements.length; i++){
                        resNode.push( ...resGr.nodes[ elements[i] ] );
                    }
                    //видаляємо елементи, що відповідають об'єднуваним вершинам
                    //останню вершину не видаляємо - в неї запишемо результат злиття
                    for(let i=0; i < elements.length-1; i++){
                        resGr.nodes.splice(elements[i], 1);
                    }
                    resGr.nodes[resNodeNum] = resNode;

                    ////Об'єднуємо дуги
                    resGr.edges = resGr.edges.reduce( (newArr, edge, i, resGrEdges) => {
                        //чи є edge.source(edge.target) в масиві елементів які треба об'єднати
                        let sInConcEls = !!~elements.indexOf(edge.source),
                            tInConcEls = !!~elements.indexOf(edge.target);
                        //якщо це ребро між вершинами які об'єднуємо, то не включаємо його в newArr
                        if(tInConcEls && sInConcEls)
                            return newArr;
                        //якщо це ребро веде до 1 з вершин які об'єднуємо,
                        // то змінюємо щоб воно вело до результуючої(об'єднаної) вершини
                        if(sInConcEls)
                            edge.source = resNodeNum;
                        if(tInConcEls)
                            edge.target = resNodeNum;
                        newArr.push(edge);
                        return newArr;
                    }, []);

                    //видаляємо повтори із масиву дуг
                    resGr.edges = U.delRepeats(resGr.edges);

                    //зменшуємо номери вершин в деяких дугах, бо вершин стало менше
                    resGr.edges.forEach( (edge, i, resGrEdges) => {
                        for(let j=0; j < elements.length-1; j++){
                            if(edge.source > elements[j])
                                --edge.source;
                            if(edge.target > elements[j])
                                --edge.target;
                        }
                    });

                    return resGr;
                }

                function rule3(graphState){
                    for(let i = 0, arr = graphState.edges; i < arr.length; i++  ){
                        for(let j = i+1; j < arr.length; j++  ){
                            //якщо це у нас 2 взаємозв'язаних елементи - об'єднуємо їх в модуль
                            //наприклад arr[i]= {source: 3, target: 0}, arr[j] {source: 0, target: 3},
                            if(arr[i].source === arr[j].target && arr[j].source === arr[i].target){
                                //УВАГА! Спрощуємо тільки 1 зв'язок, а не всі, щоб зберегти кожну зміну в transformingStates
                                let concatArr = [arr[i].source, arr[i].target],                 //масив номерів вершин які об'єднуємо
                                    nodesArr = getNodesArrByNum(graphState.nodes, concatArr),   //масив самих вершин які об'єднуємо
                                    numOfOpInNode = U.getArrOfUniqueVals(nodesArr).length;      //кількість операцій у вершині яка буде після об'єднання
                                if(numOfOpInNode < 6) {     //Ставимо обмеження на максимальну кількість операцій у вузлі = 5
                                    let resGraph = concatElements(concatArr, graphState );
                                    resGraph.graphInfo = "Об'єднано за 3 правилом елементи: "
                                                       + getNodesArrByNum(graphState.nodes, concatArr).join(" - ");
                                    return resGraph;
                                }
                            }
                        }
                    }

                    //якщо нічого не спростили
                    return null;
                }

                function rule4(graphState) {
                    let V = graphState.nodes,
                        E = graphState.edges,
                        catalogCycles = [],             //масив знайдених циклів
                        color = new Array(V.length);    //масив помічених вершин, color[i] == 1 якщо вершина ще не розглянута, якщо розглянута == 2

                    //шукаємо цикли
                    for(let i = 0; i < V.length; i++) {
                        for(let k = 0; k < V.length; k++)
                            color[k] = 1;
                        let cycle = [];
                        cycle.push(i);
                        DFScycle(i, i, E, color, -1, cycle);
                    }

                    //сортуємо щоб спочатку спрощувало більші цикли(тоді не вилізе баг із спрощенням 2-стороннього зв'язку типу 1-2-1)
                    catalogCycles.sort( (c1 ,c2) => c2.length - c1.length);

                    //обираємо підходящий цикл із знайдених
                    for(let cycle of catalogCycles){
                        let nodesArr = getNodesArrByNum(graphState.nodes, cycle),
                            numOfOpInNode = U.getArrOfUniqueVals(nodesArr).length;
                        //Ставимо обмеження на максимальну кількість операцій у вузлі = 5
                        if(numOfOpInNode < 6) {
                            let resGraph = concatElements(cycle, graphState);
                            resGraph.graphInfo = "Об'єднано за 4 правилом елементи: " + nodesArr.join(" - ");
                            return resGraph;
                        }
                    }

                    //якщо нічого не спростили
                    return null;

                    function DFScycle(u, endV, E, color, unavailableEdge, cycle) {
                        //если u == endV, то эту вершину перекрашивать не нужно, иначе мы в нее не вернемся, а вернуться необходимо
                        if ( u !== endV )
                            color[u] = 2;
                        else if (cycle.length >= 2) {
                            cycle.pop();                              //останню вершину видаляємо, бо вона == першій (Напр. 1-5-3-1)
                            if (!checkCycleIsFound(cycle, catalogCycles)) {
                                catalogCycles.push(cycle);
                            }
                            return;
                        }
                        for (let w = 0; w < E.length; w++) {
                            if (w == unavailableEdge)
                                continue;
                            if (color[E[w].target] === 1 && E[w].source === u) {
                                let cycleNEW = U.deepClone(cycle);
                                cycleNEW.push(E[w].target);
                                DFScycle(E[w].target, endV, E, color, w, cycleNEW);
                                color[E[w].target] = 1;
                            }
                        }
                    }

                    function checkCycleIsFound(cycle, catalogCycles) {
                        for (let i = 0; i < catalogCycles.length; i++)
                            for (let j = 0; j < cycle.length; j++){                    //проходимо по всім можливим здвигам елементів
                                cycle.unshift(cycle.pop());                            //здвигаємо масив на 1 елемент
                                if ( catalogCycles[i].join("") === cycle.join("") ) {  //перетворюємо масиви у рядки щоб порівняти їх
                                    return true;
                                }
                            }
                        return false;
                    }
                }

                function rule5(graphState){
                    let V = graphState.nodes,
                        E = graphState.edges,
                        arrWays = [],             //масив знайдених циклів
                        color = new Array(V.length);    //масив помічених вершин, color[i] == 1 якщо вершина ще не розглянута, якщо розглянута == 2

                    //шукаємо усі шляхи на графі
                    for(let i = 0; i < V.length - 1; i++)
                        for(let j = 0; j < V.length; j++) {
                            for(let k = 0; k < V.length; k++)
                                color[k] = 1;
                            let way = [i];
                            DFSways(i, j, E, color, way);
                        }

                    //обираємо підходящий цикл із знайдених
                    for(let way of arrWays){
                        let nodesArr = getNodesArrByNum(graphState.nodes, way),
                            numOfOpInNode = U.getArrOfUniqueVals(nodesArr).length;
                        //Ставимо обмеження на максимальну кількість операцій у вузлі = 5
                        if(numOfOpInNode < 6) {
                            let resGraph = concatElements(way, graphState);
                            resGraph.graphInfo = "Об'єднано за 5 правилом елементи: " + nodesArr.join(" - ");
                            return resGraph;
                        }
                    }

                    //якщо нічого не спростили
                    return null;


                    function DFSways(u, endV, E, color, way){
                        //вершину не следует перекрашивать, если u == endV (возможно в endV есть несколько путей)
                        if (u != endV)
                            color[u] = 2;
                        else{
                            if ( checkRule5Way(way, E) ) {
                                arrWays.push(way);
                            }
                            return;
                        }
                        for (let w = 0; w < E.length; w++){
                            if (color[E[w].target] == 1 && E[w].source == u) {
                                let wayNEW = U.deepClone(way);
                                wayNEW.push(E[w].target);
                                DFSways(E[w].target, endV, E, color, wayNEW);
                                color[E[w].target] = 1;
                            }
                        }
                    }

                    function checkRule5Way(way, E) {
                        let start = way[0],                 //номери початкової
                            finish = way[way.length-1];     //  та кінцевої вершин графа
                        if(way.length < 3)
                            return false;
                        //якщо жодна стрілка не йде з першої вершини до останньої
                        if ( !E.find( edge => edge.source === start && edge.target === finish) )
                            return false;
                        //якщо є стрілка що йде з останньої вершини до першиї
                        if ( E.find( edge => edge.source === finish && edge.target === start) )
                            return false;
                        //пробігаємо по вершинам в середині шляху (не включаючи першої та останньої)
                        for(let i = 1; i < way.length - 1; i++){
                            //рахуємо кількість стрілок цієї вершини що ідуть, або виходять в неї з інших вершин
                            let numOfArrows = E.reduce( (sum, edge) => {
                                if(edge.target === way[i] ) ++sum;
                                if(edge.source === way[i] ) ++sum;
                                return sum;
                            }, 0);
                            if( numOfArrows > 2 )
                                return false;
                        }

                        return true;
                    }
                }

                function getNodesArrByNum(nodes, concatArr){
                    return concatArr.reduce( (resArr, nodeNum) => {
                        resArr.push( nodes[nodeNum] );
                        return resArr;
                    }, []);
                }
            }
        },

        calcOrderedModules(groupsWithModules){
            let modulesArr = fetchModulesArr(groupsWithModules);

            //відсортувати модулі
            modulesArr.sort( (a, b) => a.size - b.size );

            //повидаляти усі модулі всі елементи яких є в більших модулях
            modulesArr = modulesArr.filter((item, i, arr) => {
                let numOfOwnEl = item.size;     //скільки у модуля елементів, яких нема в наступних модулях
                arr.slice(i+1).forEach( (item2) => {
                    for(let el of item){
                        if( item2.has(el) )
                            --numOfOwnEl;
                    }
                });
                //якщо в модулі є унікальні елементи, вираз поверне true і мадуль додасться в новий масив
                return numOfOwnEl > 0;
            });

            //повидаляти повтори елементів з більших модулів
            let wasOverlap; //чи знайшовся спільний елемент в 2 модулях
            do{
                wasOverlap = false;
                for(let i = modulesArr.length-1; i >=0 && !wasOverlap; i--){
                    for(let j = i-1; j >=0 && !wasOverlap; j--){
                        //чи має якийсь із менших модулів елмент із більшого модуля
                        for( let el of modulesArr[i] ){
                            if( modulesArr[j].has(el) ){
                                modulesArr[i].delete(el);
                                wasOverlap = true;
                                break;
                            }
                        }
                    }
                }
                //якщо знайшовся спільний елемент в 2 модулях то ми видалили із більшого модуля 1 елемент і тепер
                // цей більший модуль зменшився, тому всі модулі треба пересортувати
                if(wasOverlap){
                    modulesArr.sort( (a, b) => a.size - b.size );
                }
            }while(wasOverlap);

            return modulesArr;


            //дістаємо із отриманої структури даних потрібний масив
            function fetchModulesArr(groupsWithModules){
                return groupsWithModules.reduce( (resArr, gr, i) => {
                    resArr.push(...gr.modules);
                    return resArr;
                }, []);
            }
        },

        calcTechStructure(modules, matrOp){
            /*  Приклад структури даних результату
            let result = {
                modules: [
                    new Set(["F1", "F2", "T4"]),
                    new Set(["C1", "C2", "P2"]),
                    new Set(["T1", "T2", "T3"]),
                    new Set(["C3"])
                ],
                ways: [
                    [ 1,2,3,0 ], //шлях(масив зв'язків для 1 рядка операцій)
                    [ 1,3,2,0 ],
                    [ 1,2,3 ],
                    [ 1,3,0 ],
                    [ 1,2,3,0 ],
                    [ 0,3 ],
                    [ 0,1,2,3,0 ]
                ],
                inverseNum: 5
            };  */
            /*
            modules = [
                new Set(["T1"]),
                new Set(["F1", "P2", "F2", "T4", "T3"]),
                new Set(["T2"]),
                new Set(["C1", "C2", "P2", "F1", "F2"]),
                new Set(["C2"]),
                new Set(["F3"]),
                new Set(["C3"])
            ];

            modules = [
                new Set(["T1"]),
                new Set(["C3"]),
                new Set(["F3"]),
                new Set(["C1", "C2", "P2", "F1", "F2"]),
                new Set(["T3", "T4", "T2"])
            ];
*/
            //знаходимо початковий вигляд технологічної структури
            let bestModules = modules.slice(0);
            let [ bestWays, minInverseNum ] = formulateTechStr(bestModules, matrOp);

            //робимо усі n! перестановок в пошуку найкращої комбінації
            for(let tmpModules of U.findAllPermutations(modules)){
                let [ tmpWays, tmpInverseNum ] = formulateTechStr(tmpModules, matrOp);
                if(tmpInverseNum < minInverseNum){
                    bestModules = tmpModules;
                    bestWays = tmpWays;
                    minInverseNum = tmpInverseNum;
                }
            }

            return {
                modules: bestModules,
                ways: bestWays,
                inverseNum: minInverseNum
            };


            function formulateTechStr(modules, matrOp){
                let ways = [],
                    inverseConnections = [];

                //Пробігаємо по рядкам операцій, рахуючи для кожного рядка шлях по модулям
                for(let i=0; i < matrOp.length; i++){
                    //додаємо у масив шляхів, шлях для цього рядка операцій із початковим елементом шляху
                    // (номером першого модуля в який входть перша операція)
                    ways.push(
                        Array.of(   modules.findIndex(m => m.has( matrOp[i][0] ))   )
                    );
                    for(let j=1; j < matrOp[i].length; j++){
                        let modNum = modules.findIndex(m => m.has( matrOp[i][j] )),
                            prevModNum = ways[i][ ways[i].length-1 ];
                        if( prevModNum !== modNum){    //якщо операція[i][j] виконується вже в іншому модулі
                            if(prevModNum > modNum)    //якщо це зворотній зв'язок, інкрементуємо лічильник
                                inverseConnections.push(prevModNum + "," + modNum);
                            ways[i].push(modNum);
                        }
                    }
                }

                let inverseNum = U.getArrOfUniqueVals(inverseConnections).length;

                return [ways, inverseNum];
            }
        },

        //трансформувати обраховані дані в зручний для відображення вигляд
        transformTechStrForView(techStr){
            /*приклад структури даних
            res = {
                edges: [
                    //від старта
                    {source: 0, target: 1, label: "1", inverse: false  },   //label - номер шляху(рядка операцій)
                    {source: 0, target: 1, label: "2", inverse: false  },
                    {source: 0, target: 1, label: "7", inverse: false  },
                    {source: 0, target: 1, label: "4", inverse: false  },
                    {source: 0, target: 2, label: "3", inverse: false  },
                    {source: 0, target: 3, label: "6", inverse: false  },
                    {source: 0, target: 4, label: "5", inverse: false  },
                    //між модулями
                    {source: 1, target: 2, label: "1", inverse: false },
                    {source: 2, target: 3, label: "1", inverse: false },
                    {source: 3, target: 4, label: "1", inverse: false },
                    //до фініша
                    {source: 1, target: 5, label: "1", inverse: false },
                    {source: 2, target: 5, label: "3", inverse: false },
                    {source: 3, target: 5, label: "2", inverse: false },
                    {source: 4, target: 5, label: "4", inverse: false },
                    {source: 4, target: 5, label: "5", inverse: false },
                    {source: 4, target: 5, label: "7", inverse: false },
                    {source: 4, target: 5, label: "6", inverse: false }
                ],
                nodes: [
                    "Start",
                    "F1, F2, T4",
                    "C1, C2, P2",
                    "T1, T2, T3",
                    "C3",
                    "Finish"
                ],
                inverseNum: 5,
                ways: [
                    [ 1,2,3,0 ], //шлях(масив зв'язків для 1 рядка операцій)
                    [ 1,3,2,0 ],
                    [ 1,2,3 ],
                    [ 1,3,0 ],
                    [ 1,2,3,0 ],
                    [ 0,3 ],
                    [ 0,1,2,3,0 ]
                ]
            };*/

            let res = {
                nodes: [],
                edges: [],
                inverseNum: techStr.inverseNum,
                ways: []
            };

            //перетворити modules на nodes, перетворивши множини на рядки і додавши вершини start та finish
            res.nodes.push( {name: "Start"} );
            let modulesStrings = techStr.modules.map( (mod, i) => {
                return {name: (i+1) + " - " + [...mod].join(", ") };
            });
            res.nodes.push(...modulesStrings);
            res.nodes.push( {name: "Finish"} );

            //створюємо масив дуг, перетворюючи двомірний масив ways у одномірний масив ребер і враховуючи нові вершини Start та Finish
            techStr.ways.forEach( (way, index) => {
                //ребро від вершини Start до першого модуля
                res.edges.push( {
                    source: 0,
                    target: way[0] + 1,  //+1, бо додали вершину Start на початок
                    label: index+1,      //+1 бо користувачу зручніша нумерація рядків з 1 а не з 0
                    inverse: false
                } );
                //ребра між модулями всередині технологічної структури
                for(let i = 1; i < way.length; i++){
                    res.edges.push( {
                        source: way[i-1] + 1,
                        target: way[i] + 1,
                        label: index+1,
                        inverse: way[i-1] > way[i]
                    } );
                }
                //ребро від останнього модуля до вершини Finish
                res.edges.push( {
                    source: way[way.length-1] + 1,
                    target: res.nodes.length-1,     //№ вершини Finish
                    label: index+1,
                    inverse: false
                } );
            });

            //видаляємо повтори, зклеюємо лейбли для однакових шляхів різних рядків
            res.edges = res.edges.reduce( (newArr, edge, i) => {
                let edgeIndex = newArr.findIndex(el => (el.source === edge.source) && (el.target === edge.target) );
                //якщо в новому(перетвореному) масиві ще нема такого ребра
                if( edgeIndex < 0)
                    newArr.push(edge);
                //якщо в новому масиві є ребро з таким source і target але іншим label
                else if( edgeIndex >= 0 && newArr[edgeIndex].label !== edge.label)
                    newArr[edgeIndex].label += (", " + edge.label);
                return newArr;
            }, []);

            //Перетворюємо масив шляхів у зручний для користувача вигляд
            res.ways = techStr.ways.map( (way, i) => {
                return "Start → " + way.map( el => el+1 ).join(" → ") + " → Finish";
            });

            return res;
        }
    };

    app.initialize();
}() );