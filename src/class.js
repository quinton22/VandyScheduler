class Class_ {

	constructor(classAbbr, classDesc, sections, type, prof, hours, days, times, location) {
		// Class Abbreviation
		// Type: String
		//	Ex: "CS 1101"
		this.classAbbr = classAbbr;

		// Class Description
		//	Type: String
		// Ex: "This is a description"
		this.classDesc = classDesc;

		// Class Section
		// Type: Array of String
		// Ex: "01" or "02"
		this.sections = sections;

		// Class type
		// Type: array of String
		// Ex: "Laboratory" or "Lecture"
		this.type = type;

		// Credit Hours
		// Type: array of String
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

		// Professor
		// Type: array of Strings
		// Ex: ["Prof1", "Prof2", "Prof3"]
		this.prof = prof;

		// Location of class
		//	Type: array of Strings
		// Ex: ["Location1", "Location2", "Location3"]
		this.location = location;
	}

	/*
	*	Compares 2 times to determine if they overlap. Returns false if overlap
	*/
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

		if ((t21 >= t11 && t21 <= t12) || (t22 >= t11 && t22 <= t12) || (t11 >= t21 && t11 <= t22)) {
			return false;
		} else {
			return true;
		}
	}


	/*
	*	Compares days to see if days overlap. Returns false if overlap
	*/
	static compareDays(d1, d2) {
		var d = true;
		for (var i = 0; i < d1.length; i++) {
			if (d2.indexOf(d1[i]) !== -1) {
				d = false;	// d1 and d2 overlap
			}
		}

		return d;
	}


	/*
	*	Returns the length of a class in the form [hours].[min/60]
	*/
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

	toString() {
		return JSON.stringify(this);
	}

	equal(other) {
		return this.toString() === other.toString();
	}

	copy() {
		return new Class_(this.classAbbr, this.classDesc, this.sections.slice(), this.type.slice(), this.prof.slice(), this.hours.slice(), this.days.slice(), this.times.slice(), this.location.slice());
	}

	removeSection(sectionString) {
		let index = this.sections.indexOf(sectionString);
		this.sections = this.sections.filter((_, i) => i !== index);
		this.type = this.type.filter((_, i) => i !== index);
		this.prof = this.prof.filter((_, i) => i !== index);
		this.hours = this.hours.filter((_, i) => i !== index);
		this.days = this.days.filter((_, i) => i !== index);
		this.times = this.times.filter((_, i) => i !== index);
		this.location = this.location.filter((_, i) => i !== index);
	}
}
