class Schedule {
	constructor(classesArr) {
		this.classesArr = classesArr;		// all the classes to be put in schedule
		this.scheduleArr = [];				// Array of schedules
	}

	/*
	*	Makes initial call to the recursive loop & sets the current schedule
	*  to empty
	*/
	sortClasses() {
		var schedule = [];
		if(this.classesArr.length > 0) {
			this.sortClassesSub(this.classesArr, schedule)
		}

	}

	/*
	*	Recursive sorting method of classes that takes each class and compares
	*	times and days to check overlap and places into a schedule
	*/
 	sortClassesSub(subClassArr, schedule) {
 		if (subClassArr.length > 1) {
 			var newSubClassArr = [];
 			for (var j = 1; j < subClassArr.length; j++) {
 				newSubClassArr[j-1] = subClassArr[j];
 			}
 		}

 		var curClass = [];
 		for (var i = 0; i < subClassArr[0].times.length; i++) {
 			curClass = [subClassArr[0].classAbbr, subClassArr[0].sections[i],
 				subClassArr[0].times[i], subClassArr[0].days[i]];

 			var newSched = [];
 			for (var j = 0; j < schedule.length; j++) {
 				newSched.push(schedule[j]);
 			}

			if(!Schedule.checkOverlap(curClass, newSched)) {
				if (subClassArr.length > 1) {
					newSched.push(curClass);
					this.sortClassesSub(newSubClassArr, newSched);
				} else {
					newSched.push(curClass);
					this.scheduleArr.push(newSched);
				}
			}
 		}
 	}


	/*
	*	Checks the overlap of a class with the schedule it is in
	*/
	static checkOverlap(currentClass, schedule) {
		var t = false;
		var d = false;
		for (var i = 0; i < schedule.length; i++) {
			t = false;
			d = false;
			if (schedule[i][0] !== currentClass[0]) {
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
