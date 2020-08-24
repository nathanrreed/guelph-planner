// JavaScript Document
var dataTable = [[],[],[],[],[],[],[],[]];
var missing = [];
var list = [];
var currMajor = [];
var semesters = [];
var currSem = 'aa', numSem = 0, add = 0, overload = 0;
var remove = false;
var dropLocation = null;

var startSem = new semester('F20'); //NEEDS TO UPDATE AUTOMATICALLY
const current = '2020-2021' //FIX!

function course(c, p) {
	this.code = c;
	this.passed = p;
}

function courseList(a, b){
	this.code = a;
	this.sem = b;
	
	this.required;
	this.restricted;
}

function major(semester, courseCode){
	this.sem = semester;
	this.code = courseCode;
}

function semester(sem, next){
    this.sem = sem;
    this.next = next;
}

function setUp(){
	for(let i = 0; i < 5; i++){
		addRow(i);
	}
}

function updateTable() {
	for (let x = 0; x < (8 + add); x++) {
		for (let y = 0; y < (5 + overload); y++) {
			let cell = document.getElementById(getLetter(y) + x);
			while(cell.firstChild != null){
				cell.removeChild(cell.firstChild);
				cell.style.background = '#EAf0f6';
				cell.style.borderColor = null;
				cell.style.borderWidth = '1px';
			} 
			
			if (dataTable[x] != null && dataTable[x][y] != null) {
				let a = document.createElement('a');
				let link = document.createTextNode(dataTable[x][y].code);
				a.appendChild(link);
				cell.appendChild(a);
				
				cell.onmouseenter = function(){if(dataTable[x][y] != null){changeView(dataTable[x][y].code)}}; //Updates iframe

				if(remove){
					cell.onclick = function() {removeCell(this)};
					cell.style.cursor = "not-allowed"; 
				}
                
                let obj = findList(dataTable[x][y].code);
				if (obj != null && obj.required != null) {
				    a.title = obj.required; //GET HIGHLIGHTS
			     }			
				
				if(dataTable[x][y].passed == 1){ //CURRENTLY TAKING DENODED
					cell.style.borderColor = '#003b6f';
					cell.style.borderWidth = '2px';
					cell.style.background = 'rgba(195, 209, 221, 0.7)';
					cell.draggable = true;
					cell.style.cursor = "grab"; 
				}else if(dataTable[x][y].passed == 2){ //COMPLETED COURSES DENODED
					cell.style.background = 'rgba(195, 209, 221, 0.7)';
				}else if(dataTable[x][y].passed == -1){ //FAILED COURSES DENODED
					cell.style.background = 'rgba(255, 170, 170, 0.3)';
					cell.style.borderColor = 'rgba(255, 170, 170, 0.8)';
				}else if(dataTable[x][y].passed == 0){
					cell.draggable = true;
					cell.style.cursor = "grab"; 
				}
				
				if(x > findCurrSem() && !correctSem(x + 1, obj)){
					cell.style.background = 'rgba(255, 50, 50, 0.3)';
				}
				
                if(!prereqChecker(dataTable[x][y].code, x)){
					cell.style.color = 'rgba(50, 50, 255, 0.7)';
				}else{
					cell.style.color = 'rgba(0, 0, 0, 1)';
				}
				
			}else{
				cell.appendChild(document.createTextNode('\xa0')); //MAKES AN EMPTY CELL
			}
			
			//DRAG AND DROP COURSES
			cell.ondragstart = function(){let overlay = document.getElementById("overlay"); overlay.style.visibility = "visible"; overlay.style.opacity = 0.0; overlay.style.zIndex = 3};
			cell.ondragover = function(){dropLocation = getLetter(y) + x};
			cell.ondragend = function(){var element = document.getElementById("overlay").style.visibility = "hidden"; drop(cell)};
		}
	}
	
	updateMissing();
}

function drop(cell) {
	if(dropLocation != null){
		cell.draggable = false;
		cell.style.cursor = "auto"; 
		cell.style.color = 'rgba(0, 0, 0, 1)';
		
		let old = document.getElementById(cell);
		
		let nx = dropLocation.charAt(1);
		let ny = getNumber(dropLocation.charAt(0));
		
		if(dataTable[nx][ny] != null && !(dataTable[nx][ny].passed == 0 || dataTable[nx][ny].passed == 1)){ //Cant reorder taken classes
			return;
		}
		
		dropLocation = null;
		
		
		let ox = cell.id.charAt(1);
		let oy = getNumber(cell.id.charAt(0));
		
		let replace = dataTable[ox][oy];
		dataTable[ox][oy] = null;
		if(dataTable[nx][ny] !== null){
			checkForNext(dataTable[nx][ny], nx, ox, oy);
		}

		dataTable[nx][ny] = replace;
		
		if(nx > findCurrSem()){
			dataTable[nx][ny].passed = 0;
		}else{
			dataTable[nx][ny].passed = 1;
		}
		
		updateTable();
	}
}

function checkForNext(ptr, x, ox, oy, cell){
	for (let y = 0; y < (5 + overload); y++) {
		if(dataTable[x][y] == null){
			dataTable[x][y] = ptr;
			return 0;
		}
	}
	dataTable[ox][oy] = ptr;
	dataTable[ox][oy].passed = 0;
}

function updateSem(){ //SEMESTER HEADER UPDATES
	let s = startSem;
	
	if(semesters.length > 0){
		s = new semester(getNextSem(semesters[semesters.length - 1]));
	}
	
	for(let i = 1; i <= (8 + add); i++){
		let sem = document.getElementById('S' + i);
		sem.style.background = '#EAf0f6';
		sem.style.borderWidth = '1px';
		
		sem.onclick = function() {changeSem(this)};
		
        if(i < semesters.length){ //Already Happened
           sem.innerHTML = 'Semester ' + i + ' ' + semesters[i].sem; //ADD SEMESTER 
        }else{
           sem.innerHTML = 'Semester ' + i + ' ' + s.sem; //ADD SEMESTER 
           s = new semester(getNextSem(s));
        }
	}
	let current = document.getElementById('S' + (numSem + 1));
	if(current != null){
		current.style.borderWidth = '2px';
		current.style.background = 'rgba(252, 230, 230, 0.7)'; //CHANGE COLOUR!!
	}
}

function wipeTable(){
	dataTable = [[],[],[],[],[],[],[],[]];
	semesters = [];
	updateTable();
	updateSem();
	
	while(add > 0){
		let header = document.getElementById('S' + (8 + add));
		header.remove();
		for (let y = 0; y < (5 + overload); y++) {
			let cell = document.getElementById(getLetter(y) + (7 + add));
			cell.remove();
		}
		add--;
	}
    
	currSem = 'aa';
	numSem = 0;
}

function checkEmpty(){
    for (let x = 0; x < (8 + add); x++) {
		for (let y = 0; y < (5 + overload); y++) {
            if(dataTable[x] != null && dataTable[x][y] != null){
                return true;
            }
        }
    }
	return false;
}

function importInfo() {
	numSem = 0;
	if(currSem != 'aa' || checkEmpty()){ //First run
		if(confirm("Will Clear Table")){
			wipeTable();
		}else{
			return -1;
		}
	}
	
	while(overload < 3){ //ADD ROWS TO MAX
		addRow(overload + 5);
		overload++;
	}
	
	let input = document.getElementById("importField").value;
	let inputLines = input.split('\n');
	inputLines = inputLines.filter(line => (line != null && line != "" && line != "\t" && line.indexOf('.') == -1)).reverse(); //SEMESTER -> GRADE -> COURSE
	currSem = inputLines[0];
    semesters[1] = new semester(currSem);
    
	
	let count = 0, tempCount = 0;
	let currCheck = "";
	for (let i = 0; i < inputLines.length; i += 2) {
		if(inputLines[i] != currCheck){ //FINDS THE MAX ROWS USED PREVIOUSLY
			if(tempCount > count){
				count = tempCount;
			}
			tempCount = 0;
			currCheck = inputLines[i];
		}else{
			tempCount++;
		}
		
		let grade = inputLines[i + 2];
		if(grade != null && grade.indexOf('*') != -1){
			getInfo(inputLines[i], inputLines[i + 2], inputLines[i + 1]);
			i++;
		}else{
			getInfo(inputLines[i], inputLines[i + 1], "CURR");
		}
	}
    
	if(tempCount > count){
		count = tempCount;
	}
	
	while(overload > count - 4){ //REMOVE UNNEEDED ROWS
		removeRow(overload + 5, true);
		overload--;
	}
	
	document.getElementById('coursesPer').value = overload + 5;
	
    numSem++;
    currSem = getNextSem(new semester(semesters[semesters.length - 1].sem));
	
    findMajor(); //REMOVE NEEDS TO BE CHECKED
	updateSem();
    updateTable();
}

function changeSem(sem){
	let clicked = sem.id.charAt(1) - 1;
	if(dataTable[clicked].length < (5 + overload) && clicked >= findCurrSem()){
		numSem = clicked;
		updateSem();
	}else{
		//ALERT?? CANT ADD TO FULL SEMESTER
	}
}

function findCurrSem(){
	 for(let i = 1; i <= (8 + add); i++){
		 if(document.getElementById('S' + i).innerHTML.includes(startSem.sem)){
			 return i - 1;
		 }
	 }
}

function correctSem(num, obj){ //NEEDS PREQU CHECK!!!
	if(document.getElementById('S' + num) == null){
		if (confirm("Not enough space. Would you like to add another semester?")) {
				addColumn();
				updateSem();
		  	}else {
				return true; //FIX!! CREATES ERROR
		  	}
	}
	let semTag = document.getElementById('S' + num).innerHTML.split(' ');
	semTag = semTag[2].charAt(0);
	if(obj != null && obj.sem.includes(semTag)){
		return true;
	}
	
	return false;
}

function findNextSem(c, current){
	let num = 0, sem = current;
	while(!correctSem(sem + num + 1, c) || !prereqChecker(c.code, current + num)){
		
		num++;
	}
	
	return num;
}

function getNextSem(curr){
	if(curr.sem.indexOf('F') == 0){
		return 'W' + (parseInt(curr.sem.substring(1,3)) + 1);
	}else if(curr.sem.indexOf('W') != -1){
		return 'F' + curr.sem.substring(1,3);
	}else if(curr.sem.indexOf('W') != -1 && curr.next == null){ //NEEDS SECOND TO CHECK FOR SUMMER
		return 'S' + curr.substring(1,3);
	}else if(curr.sem.indexOf('S') != -1){
		return 'F' + curr.sem.substring(1,3);
	}
}

function getInfo(sem, str, grade) { //ADDS A COURSE TO THE TABLE
	if(str.indexOf(' ') != -1){
		str = str.substring(0, str.indexOf(' '));
	}
	
	let c = getSemester(sem);
	let p = 0;
	
	if(grade == "CURR"){
		p = 1;
	}else if(grade != "" && grade >= 50){ //CHECK FOR PASSED COURSES
		p = 2;
	}else if(grade != "" && grade < 50){ //CHECK FOR FAILED COURSES
		p = -1;
	}else{
		c += findNextSem(findList(str), c); //NEXT AVAILABLE SEM
	}	
	
	dataTable[c][findEmptySpace(c)] = new course(str, p);
}

function findEmptySpace(x){
	for (let y = 0; y < (5 + overload); y++) {
		if(dataTable[x][y] == null){
			return y;
		}
	}
	return (5 + overload);
}

function nextSemester(sem){
    let next = null;
	if(sem.indexOf('S') != -1){
		//addColumn();
        next = 'S'; 
	}
    
    semesters.push(new semester(sem, next));
	currSem = sem;
	numSem++;
}

function getSemester(sem) {
	if (sem == currSem) {
		return numSem;
	}else if(Number.isInteger(sem)){
		return sem;
	}
    nextSemester(sem);
	return numSem;
}

function prereqChecker(c, index){
	c = findList(c);
	let req = c.required;
	if(c.required != null){
		return recursive(req, index);		
	}
	return true;
}

function firstOccurrence(string){
	let indexof = 1000000000000;
	let choice = -1;
	
	if(string.indexOf('[') != -1 && string.indexOf('[') < indexof){
		indexof = string.indexOf('[');
		choice = 0;
	}
	if(string.indexOf('(') != -1 && string.indexOf('(') < indexof){
		indexof = string.indexOf('(');
		choice = 1;
	}
	if(string.indexOf('1 of') != -1 && string.indexOf('1 of') < indexof){
		indexof = string.indexOf('1 of');
		choice = 2;
	}
	if(string.indexOf(' or ') != -1 && string.indexOf(' or ') < indexof){
		indexof = string.indexOf(' or ');
		choice = 3;
	}
	if(string.indexOf(' and ') != -1 && string.indexOf(' and ') < indexof){
		indexof = string.indexOf(' and ');
		choice = 4;
	}
	
	return choice;
}

function recursive(string, index){
	let choice = firstOccurrence(string);
	if(string == ""){
		return true;
	}else if(string.includes(' 4U ')){ //ASSUMES YOU DID HIGHSCHOOL RIGHT
		return true;
	}else if(choice == 0){ //[
		let c = string.split(',');
		let r = true;
		for(let i = 0; i < c.length; i++){
			c[i] = c[i].replace('[', '').trim();
			c[i] = c[i].replace(']', '').trim();
			r = r && recursive(c[i], index);
		}
		return r;
	}else if(choice == 1){ //(
		let c = string.split('(');
		let r = true;
		for(let i = 0; i < c.length; i++){
			c[i] = c[i].replace('),', '').trim();
			c[i] = c[i].replace(')', '').trim();
			r = r && recursive(c[i], index);
		}
		return r;
	}else if(choice == 2){
		string = string.slice(5, string.length).trim();
		return oneOf(string.split(','), index);
	}else if(string.includes('credits including')){
		return true;
	}else if(string.includes('credits in')){
		return true;
	}else if(choice == 3){
		let c = string.split(' or ');
		let r = false;
		c.forEach(s => {
			r = r || recursive(s, index);
		});
		return r;
	}else if(choice == 4){
		let c = string.split(' and ');
		let r = true;
		c.forEach(s => {
			r = r && recursive(s, index);
		});
		return r;
	}else if(string.includes(',')){
		return allOf(string.split(','), index);
	}else{
		return findInTable(string, index);
	}
}

function commaSplit(string){
	string = string.split(',');
	forEach(c => {
		return recursive(c);
	});
}

function allOf(c, index){
	let count = 0;
	c.forEach(p => {
		if( findInTable(p.trim().replace(/[.]/ig, ''), index)){
			count++;
		}else if(p == ""){
			count ++;
		}
	});
	
	if(count == c.length){
		return true;
	}
	return false;
}

function oneOf(c, index){
	let r = false;
		c.forEach(s => {
			r = r ||  findInTable(s.replace(/[.]/ig, '').trim(), index);
		});
	return r;
}

function findInTable(check, index){
	for (let x = 0; x < index; x++) {
		for (let y = 0; y < (5 + overload); y++) {
			if(dataTable[x][y] != null && dataTable[x][y].code == check){
				return true;
			}
		}
	}
	return false;
}

function addColumn(){
	dataTable.push([]);
	add++;
	let tr = document.getElementById('sem');
	let td = document.createElement('td');
	td.appendChild(document.createTextNode('Semester ' + (8 + add)));
	td.id = 'S' + (8 + add);
	td.setAttribute("scope", "col");
	td.style.fontWeight = "900";
	td.style.textAlign = "center"; 
	tr.appendChild(td);
	for(let y = 0; y < dataTable[0].length; y++){
		let tr = document.getElementById(getLetter(y));
		let td = document.createElement('td');
		td.id = getLetter(y) + (dataTable.length - 1);
		tr.appendChild(td);
	}
}

function addRow(num){
	let tr = document.createElement('tr');
	tr.id = getLetter(num);
	for(let x = 0; x < (8 + add); x++){
		let td = document.createElement('td');
		td.id = getLetter(num) + x;
        td.appendChild(document.createTextNode('\xa0'));
		tr.appendChild(td);
	}
	document.getElementById('tbody').appendChild(tr);
	
}

function removeRow(old, wipe){
	if(!wipe){
		overload++;
		wipeTable();
		overload--;
	}
	
	document.getElementById('tbody').removeChild(document.getElementById('tbody').lastChild);
}

function addCourse(el){
	hideSearch();
	document.getElementById("myInput").value = '';
	let split = el.innerHTML.split('\u200C');
	addCell(split[0].trim());
}

function addMajor(){
	findMajor();
	missing = currMajor.filter(c => findMiss(c.code)); //FIND WHAT ARE MISSING
	missing = missing.filter(c => findElect(c)); //ADDS MISSING COURSES

	updateTable();
	updateSem();
}

function getLetter(num) {
	return String.fromCharCode(97 + num);
}

function getNumber(letter){
	return letter.charCodeAt(0) - 97;
}

function importVis() { //CLICK BUTTON
	let element = document.getElementById("overlay");
	let imp = document.getElementById("importField");
	element.style.visibility = "visible";
	element.style.zIndex = 5;
	element.style.opacity = 0.5;
	imp.style.visibility = "visible";
	imp.removeAttribute("readonly");
	imp.focus();
}

function checkEnter(event) { //HIT ENTER
	if (event.keyCode === 13) {
		event.preventDefault();
		let over = document.getElementById("overlay");
		over.style.visibility = "hidden";
		let imp = document.getElementById("importField");
		imp.style.visibility = "hidden";
		imp.setAttribute("readonly", "true");
		importInfo();
	}
}

function multiMinor() {
	console.log(document.getElementById("Minor").parentElement.childElementCount);
	if (document.getElementById("Minor").parentElement.childElementCount < 7) {
		let itm = document.getElementById("Minor").parentElement;
		let cln = document.getElementById("Minor").cloneNode(true);
		itm.appendChild(cln);
	}
}

function checkCalc(){
	let major = document.getElementById("Major");
	let minor = document.getElementById("Minor"); //ADD MULTI MINORS

	if(major.value == 'select'){
		alert("Please select your Major")
	}
}

function removeMode(){
	if(remove){
		remove = false;
	}else{
		remove = true;
	}
	
	updateTable();
}

function loadJSON(){
    let requestURL = ('https://raw.githubusercontent.com/nathanrreed/guelph-planner/master/courseCalenders/' + current + '%20Undergraduate%20Calendar.json'); //MAKE RELATIVE?
    let request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();
    request.onreadystatechange = function() {
        list = request.response;
        
        if(list != null){
            list.forEach(c => results(c));
        }
    }
}

function results(c){
	let search = document.getElementById("searchList");
	let ul = document.createElement('ul');
	let a = document.createElement('a');
	ul.appendChild(a);
	a.id = "#";
	a.innerText = c.code + ' \u200C' + c.name + ' (' + c.sem + ')';
	a.onclick = function() {addCourse(this)};
	
	search.appendChild(ul);
	ul.style.display = "none";
}

function findList(id){
	return list.find(element => element.code == id);
}

function addCell(id){
	let info = findList(id);
	
	for (let x = numSem; x < (8 + add); x++) {
		for (let y = 0; y < (5 + overload); y++) {
			if(dataTable[x][y] == null){//ADD A SEMESTER CHECK
				dataTable[x][y] = (new course(info.code, 0));
				
				if(x == 0){ //CREATE BETTER CHECK FOR CURR SEM!!!
					dataTable[x][y].passed = 1;
				}else if(x > numSem){
					numSem++;
					updateSem();
				}
				
				updateTable();
				return 0;
			}
		}
	}
}

function hideSearch(){
	let array = document.getElementById("searchList").getElementsByTagName("ul");
	for (let i = 0; i < array.length; i++) {
		array[i].style.display = "none"; //REMOVE?? DELETES THE SEARCH
	}
	
	let element = document.getElementById("overlay");
	element.style.visibility = "hidden";
	element.style.opacity = 0.5;
	element.style.zIndex = 3;
	
	document.getElementById('searchList').style.visibility = "hidden";
	let input = document.getElementById("myInput");
	input.style.zIndex = 2;
	input.focus();
}

function removeCell(cell){
	let x = cell.id.charAt(1);
	let y = getNumber(cell.id.charAt(0));
	if(dataTable[x][y].passed != 2 && dataTable[x][y].passed != -1){ //CHECKS IF THE COURSE IS OVER
		dataTable[x].splice(y, 1);
		updateTable();
	}
}

function overlayProcessing(){
	var imp = document.getElementById("importField");
	
	if(imp.style.visibility == "visible"){
		var element = document.getElementById("overlay");
		element.style.zIndex = 3;
		element.style.visibility = "hidden";
		imp.style.visibility = "hidden";
		imp.setAttribute("readonly", "true");
	}else if(document.getElementById('searchList').style.visibility == "visible"){
		hideSearch();
	}
}


function search() {
    let input, ul, a, txtValue;
    input = document.getElementById("myInput");
    let usrIn = input.value.toUpperCase();
	
	//MAKE OVERLAY!
	let element = document.getElementById("overlay");
	element.style.visibility = "visible";
	element.style.opacity = 0.1;
	element.style.zIndex = 5;
	input.style.zIndex = 5;	
	
    ul = document.getElementById("searchList");
	let array = ul.getElementsByTagName("ul");
	
	for (let i = 0; i < array.length; i++) {
		let split = array[i].getElementsByTagName("a")[0].innerText.split('\u200C');
		array[i].onmouseover = function(){changeView(split[0])};
	}
	
	let countArray = Array.prototype.slice.call(array);
	countArray.sort((a, b) => sortSearch(a.getElementsByTagName("a")[0], b.getElementsByTagName("a")[0], usrIn));
	countArray.reverse();
	let num = 0;
	for (let i = 0; i < countArray.length; i++) {
		if (num < 8 && narrowSearch(countArray[i], usrIn, true)) {
			countArray[i].style.display = "";
			num++;
		} else {
			countArray[i].style.display = "none";
		}
	}
	
	document.getElementById('searchList').style.visibility = "visible";
}

function changeView(id){
	var iframe = document.getElementById('courseDetails');
	//iframe.textContent = "Privacy Badger or other blocker is preventing course details from being displayed";
	let url = 'https://www.uoguelph.ca/registrar/calendars/undergraduate/current/courses/' + id.replace('*','').toLowerCase().trim() + '.shtml';
	if(iframe.src !== url){
		iframe.src = url;
	}
}

function narrowSearch(txt, input, mod){
	txt = txt.innerText;
	let split = txt.split('\u200C');
	
	//COURSE CODE
	let code = input.replace(/[^0-9]/g, '');
	let code1 = split[0].replace(/[^0-9]/g, '');
	//PROGRAM ID
	let letter = input.replace(/[^a-z ]/ig, '');
	let course1 = split[0].replace(/[^a-z]/ig, '');
	
	let letters = course1.includes(letter.trim());
	let nums = code1.includes(code);
	
	if (nums && letters && letter.length > 0 && code.length > 0) { //NEEDS A REWORK?
		return true;
	}else if (nums && letter.length == 0) {
		return true;
	}else if((letters && code.length == 0) ){
		return true;
	}else if(((mod) || letter.length > course1.length) && code.length == 0){
		let inputs = letter.toLowerCase().split(' ');
		let numFound = 0;
			for(let i = 0; i < inputs.length; i++){
				if(split[1].toLowerCase().includes(inputs[i])){
					numFound++;
				}
			}
		
		if(numFound > ((inputs.length * 2) / 3)){
			return true;
		}
	}
	
	return false;
}

function sortSearch(txt, txt2, input){ //USED TO SORT COURSE ORDER
	if (narrowSearch(txt, input, false)) { //NEEDS A REWORK!!
		return 1;
	}else if (narrowSearch(txt2, input, false)) {
		return -1;
	}
	return 0;
}

function findMajor(){ //TEMP
	currMajor = [new major(0, 'CIS*1300'), new major(0, 'CIS*1910'), new major(0, 'MATH*1200'), new major(1, 'CIS*2500'), new major(1, 'CIS*2910'), new major(1, 'MATH*1160'), new major(2, 'CIS*2030'), new major(2, 'CIS*2430'), new major(2, 'CIS*2520'), new major(3, 'CIS*2750'), new major(3, 'CIS*3110'), new major(3, 'CIS*3490'), new major(4, 'CIS*3150'), new major(4, 'CIS*3750'), new major(4, 'STAT*2040'), new major(5, 'CIS*3760'), new major(7, 'CIS*4650'), new major(5, 'CIS*3_'), new major(6, 'CIS*3_'), new major(6, 'CIS*4'), new major(6, 'CIS*4'), new major(7, 'CIS*3_'), new major(7, 'CIS*4')]; //Add cis electives
}

function checkGen(){
	let major = document.getElementById("Major");
	
	if(major.value == 'select'){
		alert("Please select your Major")
		return -1;
	}
	
	addMajor();
}

function findElect(c){ //CHECKS IF THE COURSE CODE IS FULL (not a level)
	if(c.code.replace(/[^0-9/]/g, '').length == 4){
		getInfo(c.sem + add, c.code, ""); //ADDS THE COURSE
		return false;
	}
    
	return true;
}

function findCourseOfLevel(c){ //BROKEN?
    if(c.code.replace(/[^0-9/]/g, '').length == 4){
        return true;
    }
    
    let out = true;

    dataTable.forEach(dt => dt.forEach(el => {
		if(el != null){
			let found = currMajor.find(f => f.code == el.code);
			if(found == null && (el.code.startsWith(c.code) || levelAbove(el.code, c.code))){
				found = currMajor.findIndex(f => f == c);
				currMajor[found] = new major(c.sem, el.code);
				out = false;
				return false;
			}
		}
    }));
    
    return out;
}

function levelAbove(el, c){
    let level = parseInt(c.replace(/[^0-9/]/g, ''));
    
    while(level < 4){
        level++;
        if(el.startsWith(c.replace(/[0-9/]/g, level))){
            return checkAbove(c.replace(/[0-9/]/g, level));
        }
    }
    return false;
}

function checkAbove(level){
    if(currMajor.find(f => f.code == level)){
        return false;   
    }
    return true;
}

function findMiss(c){ //CHECKS IF A COURSE IS NOT IN THE TABLE
	for (let x = 0; x < (8 + add); x++) {
		for (let y = 0; y < (5 + overload); y++) {
			if (dataTable[x] != null && dataTable[x][y] != null && (dataTable[x][y].code) == c) {
				return false;
			}
		}
	}
	return true;
}

function sortMissingCourses(a, b){
	let courseA = a.toLowerCase().substring(0, a.indexOf('*') - 1);
	let courseB = b.toLowerCase().substring(0, b.indexOf('*') - 1);
	let codeA = a.substring(a.indexOf('*') + 1, a.length);
	let codeB = b.substring(b.indexOf('*') + 1, a.length);
	
	if (courseA < courseB && codeA.length == 4) {
		return -1;
	}else if (courseA > courseB && codeB.length == 4) {
		return 1;
	}
	
	if(codeA.length < 4){
		codeA = codeA * 1000;
	}
	
	if(codeB.length < 4){
		codeB = codeB * 1000;
	}
	
	return codeA - codeB;
}

function changeMajor(){
	findMajor();
	updateMissing();
}

function updateMissing(){
	let miss = document.getElementById('missing');
	miss.innerHTML = "";
	//let taken, element;
	
	if(missing[0] == null){
		missing = currMajor.filter(c => findMiss(c.code));
        missing = missing.filter(c => findCourseOfLevel(c));
	}
	
	missing.sort((a, b) => sortMissingCourses(a.code, b.code));
	missing.forEach(mCourse=> {
		if(miss.innerHTML == ""){
			miss.innerHTML = mCourse.code + addSpaces(mCourse.code) + 'q';
		}else{
			miss.innerHTML = miss.innerHTML + '\n' + mCourse.code + addSpaces(mCourse.code) + 'q';
		}
	
	});
	missing = [];
}

function addSpaces(string){
	let numSpaces = 9 - string.length;
	let spaces = '          ';
	
	while(numSpaces > 0){
		spaces = spaces.concat(' ');
		numSpaces--;
	}
	
	return spaces;
}

function changePer(){
	let per = document.getElementById('coursesPer').value;
	let old = overload;
	if(per > 2 && per < 9){
		overload = per - 5;
		if(overload > old){
			for(let i = per - 1; i  > old + 4; i--){
				addRow(i);
			}
		}else{
			let wipe = checkRowEmpty(overload + 5);
			if(!checkEmpty() || wipe || confirm("Will Clear Table")){
				for(let i = per - 1; i  < old + 4; i++){
					removeRow(old, wipe);
				}
			}else{
				overload = old;
				document.getElementById('coursesPer').value = old + 5;
			}
		}
		updateTable();
	}else{
		document.getElementById('coursesPer').value = old + 5;
	}
}

function checkRowEmpty(row){
	for (let x = 0; x < (8 + add); x++) {
		if (dataTable[x] != null && dataTable[x][row] != null) {
			return false;
		}
	}
	
	return true;
}