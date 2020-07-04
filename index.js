// JavaScript Document
var dataTable = [[],[],[],[],[],[],[],[]];
var missing = [];
var list = [];
var currMajor = [];
var semesters = [];
var currSem = 'aa', numSem = 0, add = 0, overload = 0;

var startSem = new semester('F20'); //NEEDS TO UPDATE AUTOMATICALLY
const current = '2019-2020' //FIX!

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

function updateTable() {
	for (var x = 0; x < (8 + add); x++) {
		for (var y = 0; y < (5 + overload); y++) {
			var cell = document.getElementById(getLetter(y) + x);
			while(cell.firstChild != null){
				cell.removeChild(cell.firstChild);
			}
			if (dataTable[x] != null && dataTable[x][y] != null) {
				var a = document.createElement('a');
				var link = document.createTextNode(dataTable[x][y].code);
				a.appendChild(link);
				a.href = 'https://www.uoguelph.ca/registrar/calendars/undergraduate/current/courses/' + dataTable[x][y].code.replace('*','').toLowerCase() + '.shtml';
				a.setAttribute('target', '_blank');
				a.setAttribute('rel', 'help');
				cell.appendChild(a);
				a.style.color = 'black'; //REMOVE LINK COLORING AND UNDERLINE
				a.style.textDecoration = "none";
                
                var obj = findList(dataTable[x][y].code);
				if (obj != null && obj.required != null) {
				    a.title = obj.required; //GET HIGHLIGHTS
			     }
                
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
	
    let s = startSem;
	for(var i = 1; i <= (8 + add); i++){
		var sem = document.getElementById('S' + i);
        if(i < semesters.length){
           sem.innerHTML = 'Semester ' + i + ' ' + semesters[i].sem; //ADD SEMESTER 
        }else{
           sem.innerHTML = 'Semester ' + i + ' ' + s.sem; //ADD SEMESTER 
           s = new semester(getNextSem(s));
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

function checkEmpty(){
    for (var x = 0; x < (8 + add); x++) {
		for (var y = 0; y < (5 + overload); y++) {
            if(dataTable[x] != null && dataTable[x][y] != null){
                return true;
            }
        }
    }
}

function importInfo() {
	if(currSem != 'aa' || checkEmpty()){ //First run
		alert("Will Clear Table");
		wipeTable();
	}
	
	var input = document.getElementById("importField").value;
	var inputLines = input.split('\n');
	inputLines = inputLines.filter(line => (line != null && line != "" && line != "\t" && line.indexOf('.') == -1)).reverse(); //SEMESTER -> GRADE -> COURSE
	currSem = inputLines[0];
    semesters[1] = new semester(currSem); //CANT START IN SUMMER?
    
	//courseCalenderourseCalender = getCalender(currSem);
    
	for (var i = 0; i < inputLines.length; i += 2) {
		var grade = inputLines[i + 2];
		if(grade != null && grade.indexOf('*') != -1){
			getInfo(inputLines[i], inputLines[i + 2], inputLines[i + 1]);
			i++;
		}else{
			getInfo(inputLines[i], inputLines[i + 1], "CURR");
		}
	}
    
    numSem++;
    currSem = semesters[semesters.length - 1].sem;
    findMajor(); //REMOVE NEEDS TO BE CHECKED
    updateTable();
}

/*function getCalender(currSem){ 
	var year = parseInt(currSem.substring(1,3));
	
	return '20' + year + '-20' + (year + 1);
}*/

function findNextSem(c){
	var num = 0, curr = c.sem;
	
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

function getInfo(sem, str, grade) {
	/*var a = str.substring(0, str.indexOf('*'));
	var b = str.substring(str.indexOf('*') + 1, str.indexOf('*') + 5);*/
	if(str.indexOf(' ') != -1){
		str = str.substring(0, str.indexOf(' '));
	}
	
    //SET UP SEMESTER
	let c = getSemester(sem);
	
	if(dataTable[c].length >= (5 + overload)){
		c += findNextSem(findList(str)); //NEXT AVAILABLE SEM
		while(c >= (8 + add)){
			if (confirm("Not enough space. Would you like to add another semester?")) {
				addColumn();
		  	}else {
				missing.push(findList(str));
				return 0;
		  	}
		}
	}
	var p = 0;
	
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

function addCourse(el){
	var array = document.getElementById("searchList").getElementsByTagName("li");
	for (var i = 0; i < array.length; i++) {
		array[i].style.display = "none"; //REMOVE?? DELETES THE SEARCH
	}
	document.getElementById("myInput").value = '';
	document.getElementById("myInput").focus();
	addCell(el.innerHTML);
	//console.log(el.innerHTML);
}

function addMajor(){
	missing = currMajor.filter(c => findMiss(c.code));
	missing = missing.filter(c => findElect(c)); 
	
	updateTable();
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
	imp.focus();
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
	var search = document.getElementById("searchList");
	var li = document.createElement('li');
	var a = document.createElement('a');
	li.appendChild(a);
	a.id = "#";
	a.innerText = c.code; // + ' ' + c.name
	a.onclick = function() {addCourse(this)};
	search.appendChild(li);
	li.style.display = "none";
}

function findList(id){
	return list.find(element => element.code == id);
}

function addCell(id){
	var info = findList(id);
	
	for (var x = numSem; x < (8 + add); x++) {
		for (var y = 0; y < (5 + overload); y++) {
			if(dataTable[x][y] == null){//ADD A SEMESTER CHECK
				dataTable[x][y] = (new course(info.code, 0));
				
				updateTable();
				return 0;
			}
		}
	}
}

function search() {
    var input, ul, a, txtValue;
    input = document.getElementById("myInput");
    var usrIn = input.value.toUpperCase();
	
    ul = document.getElementById("searchList");
	var array = ul.getElementsByTagName("li");
	/*for (var i = 0; i < array.length; i++) {
		a = array[i].getElementsByTagName("a")[0];
		txtValue = a;
		countArray[i] = getSorted(narrowSearch(txtValue.toUpperCase(), usrIn), array[i]);
		countArray[i].arr.style.display = "";
	}*/
	
	var countArray = Array.prototype.slice.call(array);
	countArray.sort((a, b) => narrowSearch(a.getElementsByTagName("a")[0], b.getElementsByTagName("a")[0], usrIn));
	countArray.reverse();
	for (var i = 0; i < countArray.length; i++) {
		if (i < 20) { //usrIn.includes((countArray[i].getElementsByTagName("a")[0]).substring(0, (countArray[i].getElementsByTagName("a")[0]).indexOf('*')))
			countArray[i].style.display = "";
		} else {
			countArray[i].style.display = "none";
		}
	}
}

function narrowSearch(txt, txt2, input){ //USED TO SORT COURSE ORDER
	txt = txt.innerText;
	txt2 = txt2.innerText;	

	//COURSE CODE
	var code = input.replace(/[^0-9/]/g, '').padEnd(4, 0);
	var code1 = txt.replace(/[^0-9/]/g, '');
	var code2 = txt.replace(/[^0-9/]/g, '');
	//PROGRAM ID
	var letters = input.replace(/[^a-z/]/ig, '').padEnd(4, ' ');
	var a = txt.replace(/[^a-z/]/ig, '');
	var b = txt2.replace(/[^a-z/]/ig, '');
	

	if (code1.indexOf(code) != -1 && a.indexOf(letters) != -1) {
		return 10;
	}else if (code2.indexOf(code) != -1 && b.indexOf(letters) != -1) {
		return -10;
	}else if (code1.indexOf(code) != -1) {
		return 5;
	}else if (code2.indexOf(code) != -1) {
		return -5;
	}else if(a.indexOf(letters) != -1){
		 return 1;
	}else if(b.indexOf(letters) != -1){
		return -1; 
	}
	

	//CHECK COURSE NAME


	/*if(a.indexOf(input) != -1){
		count--;
	}else if(txt.indexOf(input.charAt(i)) != -1){
		count++;
	}

	if(b.indexOf(input) != -1){
		count--;
	}else if(txt2.indexOf(input.charAt(i)) != -1){
		count2++;
	}
	}
	
	return count - count2;*/
	return 0;
}

function findMajor(){ //TEMP
	currMajor = [new major(0, 'CIS*1300'), new major(0, 'CIS*1910'), new major(0, 'MATH*1200'), new major(1, 'CIS*2500'), new major(1, 'CIS*2910'), new major(1, 'MATH*1160'), new major(2, 'CIS*2030'), new major(2, 'CIS*2430'), new major(2, 'CIS*2520'), new major(3, 'CIS*2750'), new major(3, 'CIS*3110'), new major(3, 'CIS*3490'), new major(4, 'CIS*3150'), new major(4, 'CIS*3750'), new major(4, 'STAT*2040'), new major(5, 'CIS*3760'), new major(7, 'CIS*4650'), new major(5, 'CIS*3'), new major(6, 'CIS*3'), new major(6, 'CIS*4'), new major(6, 'CIS*4'), new major(7, 'CIS*3'), new major(7, 'CIS*4')]; //Add cis electives
}

function checkGen(){
	var major = document.getElementById("Major");
	
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
    
    var out = true;

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
	for (var x = 0; x < (8 + add); x++) {
		for (var y = 0; y < (5 + overload); y++) {
			if (dataTable[x] != null && dataTable[x][y] != null && (dataTable[x][y].code) == c) {
				return false;
			}
		}
	}
	return true;
}

function sortMissingCourses(a, b){
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
	var taken, element;
	
	if(missing[0] == null){
		missing = currMajor.filter(c => findMiss(c.code));
        missing = missing.filter(c => findCourseOfLevel(c));
	}
	
	missing.sort((a, b) => sortMissingCourses(a.code, b.code));
	missing.forEach(mCourse=> miss.innerHTML = miss.innerHTML + '\n' + mCourse.code);
	missing = [];
}

/*function courseReq(){ //CHECKS DATATABLE FOR MISSING REQUIREMENTS
    for (var x = 0; x < (8 + add); x++) {
		for (var y = 0; y < (5 + overload); y++) {
			if (dataTable[x] != null && dataTable[x][y] != null && dataTable[x][y].required != null) {
				document.getElementById(getLetter(y) + x).title = dataTable[x][y].required;
			}
		}
	}
}*/