//перевірка на рівність a, b, в тому числі якщо це обє'кти
function deepEqual(a, b) {
	if (a === b) {
		return true;
	}

	if (a == null || typeof(a) != "object" ||
		b == null || typeof(b) != "object")
	{
		return false;
	}

	var propertiesInA = 0, propertiesInB = 0;
	for (var property in a) {
		propertiesInA += 1;
	}
	for (var property in b) {
		propertiesInB += 1;
		if (!(property in a) || !deepEqual(a[property], b[property])) {
			return false;
		}
	}
	return propertiesInA == propertiesInB;
}
/* Examples
 var obj = {here: {is: "an"}, object: 2};
 console.log(deepEqual(obj, obj));
 // -> true
 console.log(deepEqual(obj, {here: 1, object: 2}));
 // -> false
 console.log(deepEqual(obj, {here: {is: "an"}, object: 2}));
 // -> true
 */


//повертає кількість стовпців у двовимірному масиві
function colsInMatrix(matrix){
	var max = matrix[0].length;
	for(var i = 1; i< matrix.length; i++){
		if(matrix[i].length > max)
			max = matrix[i].length;
	}
	return max;
}
/* Examples
 var a = [
	 ["T1", "T2", "T3", "C1", "C2"],
	 ["T2", "T3", "C1"],
	 ["T4", "T5", "T3", "C3"],
	 ["T2", "T5", "F1"],
	 ["T3", "C1", "C2"]
 ];
 colsInMatrix(a);	// 5
 */


// повертає масив унікальних елементів із переданого масиву будь-якої розмірності
// елементи масиву - прості типи, або масиви
function getArrOfUniqueVals(arr) {
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
/* Examples
 var a = [
 	 [1, [1, 6, [1, 3, [5, 7]]], 3],
	 [2, 3, 4],
	 [2, 2, 3],
	 [5, 4, 3]
 ];
 getArrOfUniqueVals(a);		// ["1", "2", "3", "4", "5", "6", "7"]
 */


/** Функція що видаляє повтори в одновимірному масиві об'єктів
 *
 * @param arr{Array} - 1-dimensional array of Ojects
 * @returns {Array}
 */
function delRepeats(arr) {
	return arr.reduce( (newArr, currentItem) =>  {
		//якщо в новому(перетвореному) масиві ще нема такого елементу
		if(newArr.findIndex(el => deepEqual(el, currentItem)) < 0)
			newArr.push(currentItem);
		return newArr;
	}, []);
}
/* Examples
 var arr = [
	 {a: 1, b: 1},
	 1,
	 {a: 2, b: 1},
	 2,
	 {a: 1, b: 1},
	 "1",
	 {a: 1, b: {c: 1}},
	 {a: 1, b: 1},
	 1,
	 {a: true, b: true},
 ];
 delRepeats(arr);
//Результат:
 [
	 {a: 1, b: 1},
	 1,
	 {a: 2, b: 1},
	 2,
	 "1",
	 {a: 1, b: {c: 1}},
	 {a: true, b: true}
 ]
 */


//клонує переданий об'єкт
function deepClone(obj) {
	var O = Object;
	if (obj instanceof Array) {
		var out = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			var value = obj[i];
			out[i] = (value instanceof O) ? deepClone(value) : value;
		}
	}
	else {
		var out = {};
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				var value = obj[key];
				out[key] = (value instanceof O) ? deepClone(value) : value;
			}
		}
	}
	return out;
}

let U = {
	deepEqual,
	colsInMatrix,
	getArrOfUniqueVals,
	delRepeats,
	deepClone
};

export default U;