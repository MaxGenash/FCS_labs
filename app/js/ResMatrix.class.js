"use strict";

import Matrix from './Matrix.class.js';

export default class ResMatrix extends Matrix{
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
                    str += `<td><span class="matrix-result-cell"> ${items[i-1][j-1]} </span></td>`;
            }
            str += `</tr>`;
        }
        str += `</table> </div>`;
        DOMitems.innerHTML = str;

        return DOMitems;
    }
}




/*
// Створити об'єкт ResMatrix із даным опціями
let resMatrix = new ResMatrix({
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
let DOMelem2 = resMatrix.getElem();

// вставити матрицю в потрібне місце сторінки
//document.body.appendChild(resMatrix.getElem());
document.body.appendChild(DOMelem2);
*/