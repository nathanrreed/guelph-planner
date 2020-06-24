// JavaScript Document
var dataTable = [[],[],[],[],[],[],[],[]];
var completed = [[],[],[],[],[],[],[],[]];
var missing = [];
var currSem = 'aa', numSem = 0, add = 0, overload = 0;

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
				a.style.color = 'black';
				a.style.textDecoration = "none";
			}else{
				cell.appendChild(document.createTextNode('\xa0'));
			}
		}
	}
	updateMissing();
}

function wipeTable(){
	dataTable = [[],[],[],[],[],[],[],[]];
	completed = [[],[],[],[],[],[],[],[]];
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
	var inputLines = input.split("\n").filter(line => line != "" && line != "\t" && (line.indexOf('*') != -1 || line.indexOf('F') != -1 || line.indexOf('W') != -1 || line.indexOf('S') != -1)).reverse();
	currSem = inputLines[0];
	
	//CHECK FOR FAILED COURSES

	for (var i = 0; i < inputLines.length; i += 2) {
		getInfo(inputLines[i], inputLines[i + 1], completed);
		getInfo(inputLines[i], inputLines[i + 1], dataTable);
	}

	updateTable();
}

function course(a, b) {
	this.program = a;
	this.code = b;
}

function major(semester, courseCode){
	this.sem = semester;
	this.course = courseCode;
}

function getInfo(sem, str, array) {
	var a = str.substring(0, str.indexOf('*'));
	var b = str.substring(str.indexOf('*') + 1, str.indexOf('*') + 5);
	var c = getSemester(sem);

	array[c].push(new course(a, b));
}


function getSemester(sem) {
	if (sem == currSem) {
		return numSem;
	}else if(Number.isInteger(sem)){
		return sem;
	}

	if(sem.indexOf('S') != -1){
		add++;
		completed.push([]);
		dataTable.push([]);
		addColumn();
	}
	currSem = sem;
	numSem++;
	return numSem
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
	for(var y = 0; y < completed[0].length; y++){
		var tr = document.getElementById(getLetter(y));
		var td = document.createElement('td');
		td.id = getLetter(y) + (completed.length - 1);
		tr.appendChild(td);
	}
}

function addRow(){
	var tr = document.createElement('tr');
	tr.id = getLetter(completed.length + 1);
	for(var x = 0; x < (8 + add); x++){
		var td = document.createElement('td');
		td.id = getLetter(completed.length) + (8 + add);
        td.appendChild(document.createTextNode('\xa0'));
		tr.appendChild(td);
	}
	document.getElementById('tbody').appendChild(tr);
	
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

function findMajor(){ //TEMP
	var CISmajor = [new major(0, 'CIS*1300'), new major(0, 'CIS*1910'), new major(0, 'MATH*1200'), new major(1, 'CIS*2500'), new major(1, 'CIS*2910'), new major(1, 'MATH*1160'), new major(2, 'CIS*2030'), new major(2, 'CIS*2430'), new major(2, 'CIS*2520'), new major(3, 'CIS*2750'), new major(3, 'CIS*3110'), new major(3, 'CIS*3490'), new major(4, 'CIS*3150'), new major(4, 'CIS*3750'), new major(4, 'STAT*2040'), new major(5, 'CIS*3760'), new major(7, 'CIS*4650'), new major(5, 'CIS*3'), new major(6, 'CIS*3'), new major(6, 'CIS*4'), new major(6, 'CIS*4'), new major(7, 'CIS*3'), new major(7, 'CIS*4')]; //Add cis electives
	return CISmajor;
}

function addMajor(){
	var currMajor = findMajor();
	
	missing = currMajor.filter(c => findMiss(c.course, dataTable));
	missing = missing.filter(c => findElect(c));
	
	updateTable();
}

function findElect(c){
	if(c.course.substring(c.course.indexOf('*') + 1, c.course.length).length  == 4){
		getInfo(c.sem + add, c.course, dataTable);
		return false;
	}
	return true;
}

function findMiss(c, array){
	for (var x = 0; x < (8 + add); x++) {
		for (var y = 0; y < (5 + overload); y++) {
			if (array[x][y] != null && (array[x][y].program + '*' + array[x][y].code) == c) {
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
		missing = currMajor.filter(c => findMiss(c.course, completed));
	}
	
	missing.sort((a, b) => sortCourses(a.course, b.course));
	missing.forEach(mCourse=> miss.innerHTML = miss.innerHTML + '\n' + mCourse.course);
	missing = [];
}
