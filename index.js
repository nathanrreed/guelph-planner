// JavaScript Document
var dataTable = [[],[],[],[],[],[],[],[]];
var missing = [];
var currSem = 'aa', numSem = 0, add = 0, overload = 0, courseCalender = '';

function updateTable() {
	for (var x = 0; x < (8 + add); x++) {
		for (var y = 0; y < (5 + overload); y++) {
			var cell = document.getElementById(getLetter(y) + x);
			while(cell.firstChild != null){
				cell.removeChild(cell.firstChild);
			}
			if (dataTable[x] != null && dataTable[x][y] != null) {
				var a = document.createElement('a');
				var link = document.createTextNode(dataTable[x][y].program + '*' + dataTable[x][y].code);
				a.appendChild(link);
				a.href = 'https://www.uoguelph.ca/registrar/calendars/undergraduate/current/courses/' + dataTable[x][y].program.toLowerCase() + dataTable[x][y].code + '.shtml';
				a.setAttribute('target', '_blank');
				a.setAttribute('rel', 'help');
				cell.appendChild(a);
				a.style.color = 'black'; //REMOVE LINK COLORING AND UNDERLINE
				a.style.textDecoration = "none";
				
				if(dataTable[x][y].passed == 1){ //CURRENTLY TAKING DENODED
					cell.style.borderColor = '#003b6f';
					cell.style.borderWidth = '2px';
					cell.style.background = 'rgba(195, 209, 221, 0.7)';
				}else if(dataTable[x][y].passed == 2){ //COMPLETED COURSES DENODED
					cell.style.background = 'rgba(195, 209, 221, 0.7)';
				}else if(dataTable[x][y].passed == -1){ //COMPLETED COURSES DENODED
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

function wipeTable(){
	dataTable = [[],[],[],[],[],[],[],[]];
	updateTable();
	
	while(add > 0){
		var header = document.getElementById('S' + (8 + add));
		header.remove();
		for (var y = 0; y < (5 + overload); y++) {
			var cell = document.getElementById(getLetter(y) + (7 + add));
			cell.remove();
		}
		add--;
	}
	currSem = 'aa';
	numSem = 0;
	
}

function importInfo() {
	if(currSem != 'aa'){ //First run
		alert("Will Clear Table");
		wipeTable();
	}
	
	var input = document.getElementById("importField").value;
	var inputLines = input.split('\n');
	inputLines = inputLines.filter(line => line != null && line != "" && line != "\t" && line.indexOf('.') == -1 ).reverse(); //SEMESTER -> GRADE -> COURSE
	currSem = inputLines[0];
	courseCalender = getCalender(currSem);

	for (var i = 0; i < inputLines.length; i += 2) {
		var grade = inputLines[i + 2];
		if(grade != null && grade.indexOf('*') != -1){
			getInfo(inputLines[i], inputLines[i + 2], inputLines[i + 1]);
			i++;
		}else{
			getInfo(inputLines[i], inputLines[i + 1], "CURR");
		}
	}

	updateTable();
}

function getCalender(currSem){
	var year = parseInt(currSem.substring(1,3));
	
	return '20' + year + '-20' + (year + 1);
}

/*function getNextSem(curr){
	if(curr.indexOf('F') == 0){
		return 'W' + (parseInt(curr.substring(1,3)) + 1);
	}else if(curr.indexOf('W')){
		return 'S' + curr.substring(1,3);
	}else if(curr.indexOf('S')){
		return 'F' + curr.substring(1,3);
	}
}*/

function course(a, b, p) {
	this.program = a;
	this.code = b;
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
	this.course = courseCode;
}

function getInfo(sem, str, grade) {
	var a = str.substring(0, str.indexOf('*'));
	var b = str.substring(str.indexOf('*') + 1, str.indexOf('*') + 5);
	var c = getSemester(sem);
	var p = 0;
	
	if(grade == "CURR"){
		p = 1;
	}else if(grade != "" && grade >= 50){ //CHECK FOR FAILED COURSES
		p = 2;
	}else if(grade != "" && grade < 50){ //CHECK FOR FAILED COURSES
		p = -1;
	}
	
	dataTable[c].push(new course(a, b, p));
}


function getSemester(sem) {
	if (sem == currSem) {
		return numSem;
	}else if(Number.isInteger(sem)){
		return sem;
	}

	if(sem.indexOf('S') != -1){
		add++;
		dataTable.push([]);
		addColumn();
	}
	currSem = sem;
	numSem++;
	return numSem;
}

function addColumn(){
	var tr = document.getElementById('sem');
	var td = document.createElement('td');
	td.appendChild(document.createTextNode('Semester ' + (8 + add)));
	td.id = 'S' + (8 + add);
	td.setAttribute("scope", "col");
	td.style.fontWeight = "900";
	td.style.textAlign = "center"; 
	tr.appendChild(td);
	for(var y = 0; y < dataTable[0].length; y++){
		var tr = document.getElementById(getLetter(y));
		var td = document.createElement('td');
		td.id = getLetter(y) + (dataTable.length - 1);
		tr.appendChild(td);
	}
}

function addRow(){
	var tr = document.createElement('tr');
	tr.id = getLetter(dataTable.length + 1);
	for(var x = 0; x < (8 + add); x++){
		var td = document.createElement('td');
		td.id = getLetter(dataTable.length) + (8 + add);
        td.appendChild(document.createTextNode('\xa0'));
		tr.appendChild(td);
	}
	document.getElementById('tbody').appendChild(tr);
	
}

function getLetter(num) {
	return String.fromCharCode(97 + num);
}

function importVis() { //CLICK BUTTON
	var element = document.getElementById("overlay");
	var imp = document.getElementById("importField");
	element.style.visibility = "visible";
	imp.style.visibility = "visible";
	imp.removeAttribute("readonly");
	imp.focus()
}

function checkEnter(event) { //HIT ENTER
	if (event.keyCode === 13) {
		event.preventDefault();
		var over = document.getElementById("overlay");
		over.style.visibility = "hidden";
		var imp = document.getElementById("importField");
		imp.style.visibility = "hidden";
		imp.setAttribute("readonly", "true");
		importInfo();
	}
}

function multiMinor() {
	console.log(document.getElementById("Minor").parentElement.childElementCount);
	if (document.getElementById("Minor").parentElement.childElementCount < 7) {
		var itm = document.getElementById("Minor").parentElement;
		var cln = document.getElementById("Minor").cloneNode(true);
		itm.appendChild(cln);
	}
}

function checkCalc(){
	var major = document.getElementById("Major");
	var minor = document.getElementById("Minor"); //ADD MULTI MINORS

	if(major.value == 'select'){
		alert("Please select your Major")
	}
}

function checkGen(){
	var major = document.getElementById("Major");
	
	if(major.value == 'select'){
		alert("Please select your Major")
		return -1;
	}
	
	addMajor();
}

function search(){
	if (event.keyCode === 13) {
		event.preventDefault();
		var list = [];
		let requestURL = ('https://raw.githubusercontent.com/nathanrreed/guelph-planner/master/courseCalenders/' + courseCalender + '%20Undergraduate%20Calendar.json');
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
}

function results(c){
	var search = document.getElementById("courses");
	search.innerHTML = search.innerHTML + c.code + ' ';
	//console.log(c.code);
}
function findMajor(){ //TEMP
	var CISmajor = [new major(0, 'CIS*1300'), new major(0, 'CIS*1910'), new major(0, 'MATH*1200'), new major(1, 'CIS*2500'), new major(1, 'CIS*2910'), new major(1, 'MATH*1160'), new major(2, 'CIS*2030'), new major(2, 'CIS*2430'), new major(2, 'CIS*2520'), new major(3, 'CIS*2750'), new major(3, 'CIS*3110'), new major(3, 'CIS*3490'), new major(4, 'CIS*3150'), new major(4, 'CIS*3750'), new major(4, 'STAT*2040'), new major(5, 'CIS*3760'), new major(7, 'CIS*4650'), new major(5, 'CIS*3'), new major(6, 'CIS*3'), new major(6, 'CIS*4'), new major(6, 'CIS*4'), new major(7, 'CIS*3'), new major(7, 'CIS*4')]; //Add cis electives
	return CISmajor;
}

function addMajor(){
	var currMajor = findMajor();
	
	missing = currMajor.filter(c => findMiss(c.course));
	missing = missing.filter(c => findElect(c));
	
	updateTable();
}

function findElect(c){
	if(c.course.substring(c.course.indexOf('*') + 1, c.course.length).length  == 4){
		getInfo(c.sem + add, c.course, "");
		return false;
	}
	return true;
}

function findMiss(c){
	for (var x = 0; x < (8 + add); x++) {
		for (var y = 0; y < (5 + overload); y++) {
			if (dataTable[x] != null && dataTable[x][y] != null && (dataTable[x][y].program + '*' + dataTable[x][y].code) == c) {
				return false;
			}
		}
	}
	return true;
}

function sortCourses(a, b){
	var courseA = a.toLowerCase().substring(0, a.indexOf('*') - 1);
	var courseB = b.toLowerCase().substring(0, b.indexOf('*') - 1);
	var codeA = a.substring(a.indexOf('*') + 1, a.length);
	var codeB = b.substring(b.indexOf('*') + 1, a.length);
	
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
	var miss = document.getElementById('missing');
	miss.innerHTML = "Missing:";
	var currMajor = findMajor();
	var taken, element;
	
	if(missing[0] == null){
		missing = currMajor.filter(c => findMiss(c.course));
	}
	
	missing.sort((a, b) => sortCourses(a.course, b.course));
	missing.forEach(mCourse=> miss.innerHTML = miss.innerHTML + '\n' + mCourse.course);
	missing = [];
}
