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
        },

        submitForm: function (e) {
            var form = e.target,
                inpArrOfStr = app.getForm1Inp(form);
            e.preventDefault();

            //if( !app.validate(form) ) return;

			var resMatrix1 = app.solveForm1( inpArrOfStr ),
				numOfUnique = app.getArrOfUniqueVals(inpArrOfStr).length;

            app.updateResult({
                initialMatrix: resMatrix1,
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
        }
    };

    app.initialize();
}() );