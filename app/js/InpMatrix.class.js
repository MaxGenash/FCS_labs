"use strict";

import Matrix from './Matrix.class.js';

export default class InpMatrix extends Matrix {
   // constructor(options) {
   //     super(options);
   //     this.validate = options.validate || validate;
   // }

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
                else{
                    let inpVal = (items[i-1] && this.items[i-1][j-1]) ? items[i-1][j-1] : "" ;
                    str += (`<td class="input-cell"> <input type="text" pattern="[\\w,а-я,А-Я,і,ї]{0,4}" title="Введіть назви, що складаються з числел та букв довжиною до 4 символів" value="${inpVal}"> </td>`);
                }
            }
            str += `</tr>`;
        }

        str += `</table> </div>`;
        DOMitems.innerHTML = str;

        return DOMitems;
    }

    /**
     *
     * Метод для валідації матриці
     *
     * @param elements {Array|Matrix} [this.items] масив який первіряється
     * @param cb {Function} [notEmpty] функція(правило) що перевіряє масив
     * @param strict {Boolean} [false] чи всі елементи повинні відповідати правилу
     * @returns {Boolean} чи пройшов масив валідацію
     */
    static validate (elements, cb, strict) {
        //масив елементів який будемо перевіряти
        let arr,
        //правило для перевірки
            rules = (cb && cb instanceof Function) ? cb : notEmpty;
        strict = !!strict;  //конвертуємо в булевий вираз

        if(elements && elements instanceof Matrix){
            arr = elements.items;
        } else if(elements && elements instanceof Array){
            arr = elements;
        } else if(elements){
            console.warn("Unexpected parameter in Matrix.validate.\nExpected type Matrix, Array or null.");
            arr = elements;
        } else if(this.items){
            arr = this.items;
        } else {
            console.warn("Nothing to validate in Matrix.validate.\n");
            return false;
        }

        return rules(arr, strict);

        function notEmpty(elem, strict){
            var result = !!strict,
                checkingFinished = false;

            (function checkElem(el){
                if(el instanceof Array){
                    if(el.length === 0)
                        checkElem(el[0]);
                    else
                        el.forEach(checkElem);
                } else {
                    if(checkingFinished)
                        return;
                    if(strict && !el){
                        result = false;
                        checkingFinished = true;
                    }
                    if(!strict && el){
                        result = true;
                        checkingFinished = true;
                    }
                }
            }(elem));

            return result;
        }
    }
}
/*
// Створити об'єкт Matrix із даным опціями
let inpMatrix = new InpMatrix({
    items: [
        ["T1", "T2", "T3", "C1", "C2"],
        ["T2", "T3", "C1"],
        ["T4", "T5", "T3", "C3"],
        ["T2", "T5", "F1"],
        ["T3", "C1", "C2"]
    ],
    rows: 5,
    cols: 5,
    validate(){
        return false;
    }
});

// Отримати згенерований DOM-елемент матриці
let DOMelem3 = inpMatrix.getElem();

// вставити матрицю в потрібне місце сторінки
//document.body.appendChild(inpMatrix.getElem());
document.body.appendChild(DOMelem3);
*/