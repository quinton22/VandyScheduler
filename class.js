class Class_ {

	constructor(classAbbr, classDesc, sections, prof, hours, days, times, numOnCartPage) {
		// Class Abbreviation
		// Type: String
		//	Ex: "CS 1101"
		this.classAbbr = classAbbr;
		
		// Class Description
		//	Type: String
		// Ex:
		this.classDesc = classDesc;
		
		// Class Section
		// Type: String
		// Ex: "01" or "02"
		this.sections = sections;
		
		// Credit Hours
		// Type: String
		// Ex: "1.0hrs"
		this.hours = hours;
		
		// Class Times
		// Type: array of Strings
		// Ex: ["10:00-11:00", "9:35-10:50"]
		this.times = times;
		
		// Meeting Days
		// Type: array of Strings
		// Ex: ["MWF", "MWF", "TR"]
		this.days = days;
		
		this.numOnCartPage = numOnCartPage;
		this.prof = prof;
	}
	
	getClassAbbr() {
		return this.classAbbr;
	}
	
	getClassDesc() {
		return this.classDesc;
	}
	
	getSections() {
		return this.sections;
	}
	
	setSections(sections) {
		this.sections = sections;
	}
	
	getHour() {
		return this.hours;
	}
	
	setHour(hours) {
		this.hours = hours;
	}
	
	getTimes() {
		return this.times;
	}
	
	setTimes(times) {
		this.times = times;
	}
	
	getDays() {
		return this.days;
	}
	
	setDays(days) {
		this.days = days;
	}
	
	getNumOnCartPage() {
		return this.numOnCartPage;
	}
	

	getProf() {
		return this.prof;
	}
	
	
	
	static compareTimes(t1, t2) {
		while (t1.indexOf("p") !== -1) {
			if (t1.substring(t1.indexOf("p") - 5, t1.indexOf("p") - 3) !== "12") {
				t1 = t1.substring(0, t1.indexOf("p") - 5) + 
					(~~t1.substring(t1.indexOf("p") - 5, t1.indexOf("p") - 3) + 12).toString()
					+ t1.substring(t1.indexOf("p") - 3, t1.indexOf("p")) +
					t1.substring(t1.indexOf("p") + 1);
			} else {
				t1 = t1.substring(0, t1.indexOf("p")) + t1.substring(t1.indexOf("p") + 1);
			}

		}
		while (t2.indexOf("p") !== -1) {
			if (t2.substring(t2.indexOf("p") - 5, t2.indexOf("p") - 3) !== "12") {
				t2 = t2.substring(0, t2.indexOf("p") - 5) + 
					(~~t2.substring(t2.indexOf("p") - 5, t2.indexOf("p") - 3) + 12).toString()
					+ t2.substring(t2.indexOf("p") - 3, t2.indexOf("p")) +
					t2.substring(t2.indexOf("p") + 1);
			} else {
				t2 = t2.substring(0, t2.indexOf("p")) + t2.substring(t2.indexOf("p") + 1);
			}

		}
		
		var t11 = t1.substring(0, t1.indexOf("-"));
		var t12 = t1.substring(t1.indexOf("-") + 1);
		var t21 = t2.substring(0, t2.indexOf("-"));
		var t22 = t2.substring(t2.indexOf("-") + 1);
		
		if ((t21 >= t11 && t21 <= t12) || (t22 >= t11 && t22 <= t12)) {
			return false;
		} else {
			return true;
		}		
	}
	
	static compareDays(d1, d2) {
		var d = true;
		for (var i = 0; i < d1.length; i++) {
			if (d2.indexOf(d1[i]) !== -1) {
				d = false;	// d1 and d2 overlap
			}
		}
		
		return d;
	}
	
	static lengthOfClass(t1) {
		var hour1 = ~~t1.substring(t1.indexOf(":")-2, t1.indexOf(":"));
		if (t1.indexOf("p") > 0 && t1.indexOf("p") < 7) {
			hour1 = hour1 !== 12 ? hour1 + 12 : hour1;
		}
		
		var minute1 = ~~t1.substring(t1.indexOf(":")+1, t1.indexOf(":")+3);
		minute1 /= 60;
		t1 = t1.substring(t1.indexOf("-")+1);
		var hour2 = ~~t1.substring(t1.indexOf(":")-2, t1.indexOf(":"));
		if (t1.indexOf("p") !== -1) {
			hour2 = hour2 !== 12 ? hour2 + 12 : hour2;
		}
		var minute2 = ~~t1.substring(t1.indexOf(":")+1, t1.indexOf(":")+3);
		minute2 /= 60;
		
		var len = hour2 + minute2 - hour1 - minute1;
		return len;
		
		
	}
	
	printClass() {
		var str = this.classAbbr + " (" + this.classDesc + "):\n";
		for (var i = 0; i < this.sections.length; i++) {
			str += "Section " + this.sections[i] + ": " + this.hours[i] + "\t" + this.days[i] + "\t" + this.times[i] + "\n";
		}
		return str;
	}
	
	
}