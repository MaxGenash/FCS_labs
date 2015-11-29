'use strict';

import U from "./U.js";

export default class Matrix {
    constructor(options){
        options.rows = parseInt(options.rows);
        options.cols = parseInt(options.cols);
        this._elem = options.elem || null;

        //якщо передали вже готову DOM таблицю елементів
        if(options.DOMitems && options.DOMitems instanceof Document) {
            this.DOMitems = options.DOMitems;

        //якщо передали масив елементів
        } else if(options.items && options.items instanceof Array){
			this.items = options.items;

        //якщо передали тільки розмірність масиву
		} else if (!options.items && options.rows){
			this.items = new Array(options.rows);
            for(let i=0; i< this.items.length; i++){
                this.items[i] = new Array(options.cols);
            }

        //генеруємо матрицю з нуля
		} else {
			this.items = [[]];
		}

        this.rows = options.rows || this.items.length;
        this.cols = options.cols || U.colsInMatrix(this.items);
    }

    getElem() {
        if (!this._elem) this.render();
        return this._elem;
    }

    render() {
        let elem = document.createElement("div");
        elem.classList.add("matrix");

        if(!this.DOMitems){
            this.DOMitems = this.renderItems();
        }

        elem.innerHTML = this.DOMitems.outerHTML;

        return this._elem = elem;
    }

    renderItems() {
        let items = this.items || [[]],
            DOMitems = document.createElement('div'),
            str = `
                <table class="table table-striped table-bordered">
                    <tbody>`,                                           //рядок з HTML текстом
            i, j;                                                       //лічильники
        DOMitems.classList.add("table-responsive");

        for (i = 0; i <= this.rows; i++) {
            str += `<tr>`;
            for (j = 0; j <= this.cols; j++) {
                if(i===0 && j===0)
                    str += (`<th> № </th>`);
                else if(j===0)
                    str += (`<th>${ i }</th>`);
                else if(i===0)
                    str += (`<th>${ j }</th>`);
                else
                    str += `<td><span> ${items[i-1][j-1]} </span></td>`;
            }
            str += `</tr>`;
        }
        str += `</table> </div>`;
        DOMitems.innerHTML = str;

        return DOMitems;
    }
}


/* For testing
console.log("\nin Matrix.class.js:\n");
// Створити об'єкт Matrix із даным опціями
let matrix = new Matrix({
    items: [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25]
    ],
    rows: 5,
    cols: 5
});

// Отримати згенерований DOM-елемент матриці
let DOMelem = matrix.getElem();

// вставити матрицю в потрібне місце сторінки
//document.body.appendChild(matrix.getElem());
//document.body.appendChild(DOMelem);
console.log(DOMelem);


let matrix2 = new Matrix({
    rows: 5,
    cols: 5
});
console.log("martix2:\n", matrix2.getElem());


let matrix3_DOMitems = document.createElement("div");
matrix3_DOMitems.classList.add("table-responsive");
matrix3_DOMitems.innerHTML = `<table class="table table-striped table-bordered"><tbody><tr><th> № </th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr><tr><th>1</th><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T1"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T2"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T3"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="C1"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="C2"> </td></tr><tr><th>2</th><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T2"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T3"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="C1"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value=""> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value=""> </td></tr><tr><th>3</th><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T4"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T5"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T3"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="C3"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value=""> </td></tr><tr><th>4</th><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T2"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T5"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="F1"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value=""> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value=""> </td></tr><tr><th>5</th><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="T3"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="C1"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="C2"> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value=""> </td><td class="input-cell"> <input type="text" pattern="[\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value=""> </td></tr></tbody></table>`;
let matrix3 = new Matrix({
    DOMitems: matrix3_DOMitems
});
console.log("martix3:\n", matrix3.getElem());
*/
