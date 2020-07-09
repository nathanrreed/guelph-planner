// JavaScript Document
var dataTable = [[],[],[],[],[],[],[],[]];
var missing = [];
var list = [];
var currMajor = [];
var semesters = [];
var currSem = 'aa', numSem = 0, add = 0, overload = 0;
var remove = false;

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
				cell.onmouseenter = function(){changeView(dataTable[x][y].code)}; //onmouseover??
				
				if(remove){
					cell.onclick = function() {removeCell(this)};
				}
                
                let obj = findList(dataTable[x][y].code);
				if (obj != null && obj.required != null) {
				    a.title = obj.required; //GET HIGHLIGHTS
			     }
                
				if(dataTable[x][y].passed == 1){ //CURRENTLY TAKING DENODED
					cell.style.borderColor = '#003b6f';
					cell.style.borderWidth = '2px';
					cell.style.background = 'rgba(195, 209, 221, 0.7)';
				}else if(dataTable[x][y].passed == 2){ //COMPLETED COURSES DENODED
					cell.style.background = 'rgba(195, 209, 221, 0.7)';
				}else if(dataTable[x][y].passed == -1){ //FAILED COURSES DENODED
					cell.style.background = 'rgba(255, 170, 170, 0.3)';
					cell.style.borderColor = 'rgba(255, 170, 170, 0.8)';
				}
                
			}else{
				cell.appendChild(document.createTextNode('\xa0')); //MAKES AN EMPTY CELL
			}
		}
	}
	
	updateMissing();
}

function updateSem(){ //SEMESTER HEADER UPDATES
	let s = startSem;
	for(let i = 1; i <= (8 + add); i++){
		let sem = document.getElementById('S' + i);
		sem.style.background = '#EAf0f6';
		sem.style.borderWidth = '1px';
		
		sem.onclick = function() {changeSem(this)};
		
        if(i < semesters.length){
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
	
	let input = document.getElementById("importField").value;
	let inputLines = input.split('\n');
	inputLines = inputLines.filter(line => (line != null && line != "" && line != "\t" && line.indexOf('.') == -1)).reverse(); //SEMESTER -> GRADE -> COURSE
	currSem = inputLines[0];
    semesters[1] = new semester(currSem); //CANT START IN SUMMER?
    
	for (let i = 0; i < inputLines.length; i += 2) {
		let grade = inputLines[i + 2];
		if(grade != null && grade.indexOf('*') != -1){
			getInfo(inputLines[i], inputLines[i + 2], inputLines[i + 1]);
			i++;
		}else{
			getInfo(inputLines[i], inputLines[i + 1], "CURR");
		}
	}
    
    numSem++;
    currSem = currSem = getNextSem(new semester(semesters[semesters.length - 1].sem));
    findMajor(); //REMOVE NEEDS TO BE CHECKED
    updateTable();
	updateSem();
}

function changeSem(sem){
	let clicked = sem.id.charAt(1) - 1;
	if(dataTable[clicked].length < (5 + overload)){
		numSem = clicked;
		updateSem();
	}else{
		//ALERT?? CANT ADD TO FULL SEMESTER
	}
}

function findNextSem(c){
	let num = 0, curr = c.sem;
	
	while(currSem.indexOf(curr) == -1 || num == 0){
		if(curr.indexOf('F') != -1){
			curr = 'W';
			num++;
		}else if(curr.indexOf('W') != -1){
			curr = 'S';
			num++;
		}else if(curr.indexOf('S') != -1){
			curr = 'F';
			num++;
		}
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
	
    //SET UP SEMESTER
	let c = getSemester(sem);
	
	
	//console.log(c + " " + str);
	if(dataTable[c].length >= (5 + overload)){
		//console.log(c);
		c += findNextSem(findList(str)); //NEXT AVAILABLE SEM
		//console.log(c);
		while(c >= (8 + add)){
			if (confirm("Not enough space. Would you like to add another semester?")) {
				addColumn();
		  	}else {
				missing.push(findList(str));
				return 0;
		  	}
		}
	}
	let p = 0;
	
	if(grade == "CURR"){
		p = 1;
	}else if(grade != "" && grade >= 50){ //CHECK FOR FAILED COURSES
		p = 2;
	}else if(grade != "" && grade < 50){ //CHECK FOR FAILED COURSES
		p = -1;
	}
	
	dataTable[c].push(new course(str, p));
}

function nextSemester(sem){
    let next = null;
	if(sem.indexOf('S') != -1){
		addColumn();
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

function removeRow(old){
	overload++;
	wipeTable();
	overload--;
	document.getElementById('tbody').removeChild(document.getElementById('tbody').lastChild);
}

function addCourse(el){
	let array = document.getElementById("searchList").getElementsByTagName("li");
	for (let i = 0; i < array.length; i++) {
		array[i].style.display = "none"; //REMOVE?? DELETES THE SEARCH
	}
	document.getElementById("myInput").value = '';
	document.getElementById("myInput").focus();
	let split = el.innerHTML.split('\u200C');
	addCell(split[0].trim());
}

function addMajor(){
	findMajor();
	missing = currMajor.filter(c => findMiss(c.code));
	missing = missing.filter(c => findElect(c)); 

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
	let li = document.createElement('li');
	let a = document.createElement('a');
	li.appendChild(a);
	a.id = "#";
	a.innerText = c.code + ' \u200C' + c.name;
	a.onclick = function() {addCourse(this)};
	search.appendChild(li);
	li.style.display = "none";
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

function removeCell(cell){
	let x = cell.id.charAt(1);
	let y = getNumber(cell.id.charAt(0));
	if(dataTable[x][y].passed != 2 && dataTable[x][y].passed != -1){ //CHECKS IF THE COURSE IS OVER
		dataTable[x].splice(y, 1);
		updateTable();
	}
}

function search() {
    let input, ul, a, txtValue;
    input = document.getElementById("myInput");
    let usrIn = input.value.toUpperCase();
	
    ul = document.getElementById("searchList");
	let array = ul.getElementsByTagName("li");
	
	for (let i = 0; i < array.length; i++) {
		let split = array[i].getElementsByTagName("a")[0].innerText.split('\u200C');
		array[i].onmouseover = function(){changeView(split[0])};
	}
	
	let countArray = Array.prototype.slice.call(array);
	countArray.sort((a, b) => sortSearch(a.getElementsByTagName("a")[0], b.getElementsByTagName("a")[0], usrIn));
	countArray.reverse();
	let num = 0;
	for (let i = 0; i < countArray.length; i++) {
		if (num < 40 && narrowSearch(countArray[i], usrIn, true)) {
			countArray[i].style.display = "";
			num++;
		} else {
			countArray[i].style.display = "none";
		}
	}
}

function changeView(id){
	var iframe = document.getElementById('courseDetails');
	iframe.src = 'https://www.uoguelph.ca/registrar/calendars/undergraduate/current/courses/' + id.replace('*','').toLowerCase().trim() + '.shtml';
	iframe.innerHTML = "Privacy Badger or other blocker is preventing course details from being displayed";
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
	currMajor = [new major(0, 'CIS*1300'), new major(0, 'CIS*1910'), new major(0, 'MATH*1200'), new major(1, 'CIS*2500'), new major(1, 'CIS*2910'), new major(1, 'MATH*1160'), new major(2, 'CIS*2030'), new major(2, 'CIS*2430'), new major(2, 'CIS*2520'), new major(3, 'CIS*2750'), new major(3, 'CIS*3110'), new major(3, 'CIS*3490'), new major(4, 'CIS*3150'), new major(4, 'CIS*3750'), new major(4, 'STAT*2040'), new major(5, 'CIS*3760'), new major(7, 'CIS*4650'), new major(5, 'CIS*3'), new major(6, 'CIS*3'), new major(6, 'CIS*4'), new major(6, 'CIS*4'), new major(7, 'CIS*3'), new major(7, 'CIS*4')]; //Add cis electives
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

function findCourseOfLevel(c){
    if(c.code.replace(/[^0-9/]/g, '').length == 4){
        return true;
    }
    
    let out = true;

    dataTable.forEach(dt => dt.forEach(el => {
        let found = currMajor.find(f => f.code == el.code);
        if(found == null && (el.code.startsWith(c.code) || levelAbove(el.code, c.code))){
            found = currMajor.findIndex(f => f == c);
            currMajor[found] = new major(c.sem, el.code);
            out = false;
            return false;
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
	
	if(codeA.length == 1){
		codeA = codeA * 1000;
	}
	
	if(codeB.length == 1){
		codeB = codeB * 1000;
	}
	
	if (courseA < courseB) {
		return -1;
	}else if (courseA > courseB) {
		return 1;
	}
	return codeA - codeB;
}

function updateMissing(){
	let miss = document.getElementById('missing');
	miss.innerHTML = "Missing:";
	let taken, element;
	
	if(missing[0] == null){
		missing = currMajor.filter(c => findMiss(c.code));
        missing = missing.filter(c => findCourseOfLevel(c));
	}
	
	missing.sort((a, b) => sortMissingCourses(a.code, b.code));
	missing.forEach(mCourse=> miss.innerHTML = miss.innerHTML + '\n' + mCourse.code);
	missing = [];
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
			if(!checkEmpty() || confirm("Will Clear Table")){
				for(let i = per - 1; i  < old + 4; i++){
						removeRow(old);
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