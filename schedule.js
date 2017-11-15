class Schedule {
	constructor(classesArr) {
		this.classesArr = classesArr;
		this.scheduleArr = [];
	}
	
	getScheduleArr() {
		return this.scheduleArr;
	}
	
	sortClasses() {
		var schedule = [];
		if(this.classesArr.length > 0) {
			this.sortClassesSub(this.classesArr, schedule)
		}
		
	}
	
	sortClassesSub(subClassArr, schedule) {
		if (subClassArr.length > 1) {
			var newSubClassArr = [];
			for (var j = 1; j < subClassArr.length; j++) {
				newSubClassArr[j-1] = subClassArr[j];
			}
		}
		
		console.log("newsubclassarr");
		console.log(newSubClassArr);
		console.log("subClassArr");
		console.log(subClassArr);
		
		var currentClass = [];
		for (var i = 0; i < subClassArr[0].getTimes().length; i++) {
			var schedule1 = schedule.slice(0);
			console.log("current schedule");
			console.log(schedule1);
			
			currentClass = [subClassArr[0].getClassAbbr(), 
			subClassArr[0].getSections()[i], subClassArr[0].getTimes()[i],
			subClassArr[0].getDays()[i]];
			
//			console.log("currentClass");
//			console.log(currentClass);
			
			if(!Schedule.checkOverlap(currentClass, schedule1)) {
				if (subClassArr.length > 1) {
					schedule1.push(currentClass);
					this.sortClassesSub(newSubClassArr, schedule1);
				} else {
					schedule1.push(currentClass);
					this.scheduleArr.push(schedule1);
				}
			}
			if (i === subClassArr[0].getTimes().length - 1) {
				schedule = [];
			}
		}
	}
	
	static checkOverlap(currentClass, schedule) {
		var t = false;
		var d = false;
		for (var i = 0; i < schedule.length; i++) {
			t = false;
			d = false;
			if (schedule[i][0] !== currentClass[0] || (schedule[i][0] === currentClass[0] && schedule[i][1] !== currentClass[1])) {
				if(!Class_.compareTimes(schedule[i][2], currentClass[2])) {
					t = true;		// times are equal
				}
				if(!Class_.compareDays(schedule[i][3],currentClass[3])) {
					d = true;		// days are equal
				}
				if(t && d) {
					return true;
				}
			}
		}
		
		return false;		// no overlap
	}

}