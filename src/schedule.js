class Schedule {
	constructor(classesArr) {
		this.classesArr = classesArr;		// all the classes to be put in schedule
		this.scheduleArr = [];				// Array of schedules
		this.overlappedClasses = new Map();

		this.sortClasses();
		this.checkOverlapOfAllClasses();
	}

	/*
	*	Makes initial call to the recursive loop & sets the current schedule
	*  to empty
	*/
	sortClasses() {
		var schedule = [];
		if(this.classesArr.length > 0) {
			this.sortClassesSub(this.classesArr, schedule, true)
		}

	}

	/*
	*	Recursive sorting method of classes that takes each class and compares
	*	times and days to check overlap and places into a schedule
	*/
 	sortClassesSub(subClassArr, schedule) {
 		if (subClassArr.length > 1) {
 			var newSubClassArr = [];
 			for (let j = 1; j < subClassArr.length; j++) {
 				newSubClassArr[j-1] = subClassArr[j];
 			}
 		}

 		var curClass = [];
 		for (var i = 0; i < subClassArr[0].times.length; i++) {
 			curClass = [subClassArr[0].classAbbr, subClassArr[0].sections[i],
 				subClassArr[0].times[i], subClassArr[0].days[i]];

 			var newSched = [];
 			for (let j = 0; j < schedule.length; j++) {
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
	*	returns true if overlap
	*/
	static checkOverlap(currentClass, schedule) {
		for (var i = 0; i < schedule.length; ++i) {
			if (schedule[i][0] !== currentClass[0]) {
				if ((/\n/).test(schedule[i][2]) && (/\n/).test(schedule[i][3]) && (/\n/).test(currentClass[2]) && (/\n/).test(currentClass[3])) {
					let times1 = schedule[i][2].split(/\n/);
					let days1 = schedule[i][3].split(/\n/);
					let times2 = currentClass[2].split(/\n/);
					let days2 = currentClass[3].split(/\n/);

					for(let j = 0; j < days1.length; ++j) {
						for (let k = 0; k < days2.length; ++k) {
							if(!Class_.compareDays(days1[j], days2[k])) {
								if(!Class_.compareTimes(times1[j], times2[k])) {
									return true;
								}
							}
						}
					}

				} else if ((/\n/).test(schedule[i][2]) && (/\n/).test(schedule[i][3])) {
					let times = schedule[i][2].split(/\n/);
					let days = schedule[i][3].split(/\n/);
					for (let j = 0; j < days.length; ++j) {
						if(!Class_.compareDays(days[j], currentClass[3])) {
							if(!Class_.compareTimes(times[j], currentClass[2])) {
								return true;
							}
						}
					}
				} else if ((/\n/).test(currentClass[2]) && (/\n/).test(currentClass[3])) {
					let times = currentClass[2].split(/\n/);
					let days = currentClass[3].split(/\n/);
					for (let j = 0; j < days.length; ++j) {
						if(!Class_.compareDays(days[j], schedule[i][3])) {
							if(!Class_.compareTimes(times[j], schedule[i][2])) {
								return true;
							}
						}
					}
				} else {
					if(!Class_.compareDays(schedule[i][3],currentClass[3])) {
						if(!Class_.compareTimes(schedule[i][2], currentClass[2])) {
									return true; // times are equal
						}		// days are equal
					}
				}
			}
		}

		return false;		// no overlap
	}


	checkOverlapOfAllClasses() {
		this.classesArr.forEach(_class => {
			_class.sections.forEach((section, i) => {

					this.overlappedClasses.set(_class.classAbbr + "-" + section,
						this.classesArr.map(c => {
							let overlap = 0;
							if (c.classAbbr !== _class.classAbbr) {
								c.times.forEach((time, ind) => {
									if (Schedule.checkOverlap([_class.classAbbr, section, _class.times[i], _class.days[i]], [[c.classAbbr, c.sections[ind], time, c.days[ind]]])) {
										++overlap;
									}
								});
							}
							return overlap;
						}).reduce((accum, current) => accum + current));
			});
		});
	}

}
