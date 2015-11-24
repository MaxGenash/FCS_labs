'use strict';

import InpMatrix from './InpMatrix.class.js';
import ResMatrix from './ResMatrix.class.js';
import drawGraph from './drawGraph.js';
import U from './U.js';                    //different utilities, hacks and helpers

(function() {
    var app = {

        initialize: function () {
            let initialMatrixOfOp1 = [
                    ["T1", "T2", "T3", "C1", "C2"],
                    ["T2", "T3", "C1"],
                    ["T4", "T5", "T3", "C3"],
                    ["T2", "T5", "F1"],
                    ["T3", "C1", "C2"]
                ],
                initialMatrixOfOp2 = [
                    ["T1", "T2", "C1", "P2", "F1", "T3", "T4"],
                    ["T2", "T1", "C1", "F1"],
                    ["T4", "F1", "T1", "T2", "C1", "F2"],
                    ["T2", "T1", "F2"],
                    ["T4", "T3", "T1", "T2", "C1", "F2"],
                    ["T3", "F2", "T1", "T2", "C1"],
                    ["T4", "T2", "T3", "C1"]
                ];

            this.form1 = document.forms["lab1-inp-form"];

            //дані якими оперує програма
            this.dataState = {
                matrixOfOperations: initialMatrixOfOp2,     //введена матриця з операціями
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
                groupsWithModules: null                     //групи з модулями операцій
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
                           </tr>`;
            opts.groups.forEach( function(item, i){
                let group = [...item];    //перетворюємо Set в Array
                group = group.map(el => ++el);    //інкрементуємо значення кожного елемента, бо нумерація з 0
                str += `
                           <tr>
                               <td> ${ i+1 } </td>
                               <td> ${ group.join(', ') } </td>
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
                    carouselIndicators = carousel.getElementsByClassName("carousel-indicators")[0],
                    carouselSlidesWrap = carousel.getElementsByClassName("carousel-inner")[0];

                //очищаємо вмість блоків
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
                        edgesArr: graph.edges
                    });
                });

                //робимо активним перший слайд
                carouselIndicators.firstChild.classList.add("active");
                carouselSlidesWrap.firstChild.classList.add("active");
            });
        },

        submitForm: function (e) {
            //коротші назви(записуємо адреси, а не значення)
            let matrixOfOperations = app.dataState.matrixOfOperations,
                numOfUniqueOp = app.dataState.numOfUniqueOp,
                matrixOfUniqueOp = app.dataState.matrixOfUniqueOp,
                groups = app.dataState.groups,
                orderedGroups = app.dataState.orderedGroups,
                groupsWithModules = app.dataState.groupsWithModules,

                form = e.target;

            e.preventDefault();

            matrixOfOperations = app.getForm1Inp(form);

            //if( !app.validate(form) ) return;

            numOfUniqueOp = U.getArrOfUniqueVals( matrixOfOperations ).length;
            matrixOfUniqueOp = app.solveForm1( matrixOfOperations );
            groups = app.calcMatrix2( matrixOfUniqueOp );
            orderedGroups = app.calcOrderedGroups(groups, matrixOfOperations);
            groupsWithModules = app.calcGrpsWithModules(orderedGroups, matrixOfOperations);

            app.updateResult({
                numOfUniqueOp: numOfUniqueOp,
                matrixOfUniqueOp: matrixOfUniqueOp,
                groups: groups,
                ordGrps: orderedGroups,
                grpsWithMod: groupsWithModules
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

        calcOrderedGroups: function(initialGrps, initialOps){
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
            initialGrps.forEach(function(group, i){
                //додаємо в масив новий об'єкт
                resultsArr.push({
                    gr: group , //додаємо групи, аналогічно  resultsArr[i].gr = group;
                    op: new Set()
                });

                //додаємо відповідні кожному елементу групи операції в множину resultsArr[i].op
                //resultsArr[i].op - це множина, тому повтори автоматично виключатимуться
                for(let opsRow of group){
                    // оператор spread (...) (див learn.javascript.ru/es-function#оператор-spread-вместо-arguments)
                    // перетворить масив initialOps в окремі елементи і додасть їх почерзі
                    resultsArr[i].op.add(...(initialOps[opsRow]));
                }
            });


            //обробляєш масив resultsArr
            //обробляєш масив resultsArr
            //обробляєш масив resultsArr


            return resultsArr;
        },

        calcGrpsWithModules: function(orderedGroups, matrixOfOps){
            orderedGroups = [
                {
                    gr: new Set([0,4,5])//,
             //       op: new Set(["T1", "T2", "T3", "C1", "C2"])
                },
                {
                    gr: new Set([0,1,2,3,4,5,6])//,
              //     op: new Set(["T2", "T3", "C3"])
                }
            ];

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
/*  Тестовий граф
                let testGraph = {
                    nodes: [    //вершини графа
                        ["v0"],
                        ["v1"],
                        ["v2"],
                        ["v3"],
                        ["v4"],
                        ["v5"],
                        ["v6"]
                    ],
                    edges: [    //дуги графа
                        {source: 0, target: 3},
                        {source: 0, target: 4},
                        {source: 1, target: 0},
                        {source: 1, target: 4},
                        {source: 2, target: 1},
                        {source: 2, target: 5},
                        {source: 3, target: 2},
                        {source: 3, target: 0},
                        {source: 4, target: 3},
                        {source: 5, target: 6},
                        {source: 6, target: 1}
                    ]
                };
                resGroup.transformingStates.push( testGraph );
*/

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