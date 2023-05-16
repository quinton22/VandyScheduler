// IDEA: sidebar instead of preferences button
// in manifest: sidebar_action
// IDEA: somehow find a way to show which classes you should take
// TODO: make this a react app :)

// IDEA: show the number of ratings along side rateMyProf scores.
// IDEA: make the professor's name a link that goes directly to the rmp page


var classArr = []; // contains classes to construct schedule with
var scheduleArr = []; // contains all the schedules
var modal, modalChild;
var preferences = {
	breakTime: null,
	noPrefMet: false
};
var includePreferences = new Map();
var includeClassesInRemoval = false;

createModal(); // creates modal and appends to doc
var ready = false; // allows modal to load

// creates button
var addClassButton = document.createElement("span");
addClassButton.setAttribute("width", "auto");
var btn = document.createElement("button");
btn.setAttribute("class", "myButton");
btn.innerHTML = "Add to Schedule";
addClassButton.appendChild(btn);

// sets parent node to course titles on either class search page or class cart page
var parent = document.getElementById("classSearchResultsCarousel") !== null ? document.getElementById(
	"classSearchResultsCarousel").getElementsByClassName("left") : null;
var parent2 = document.getElementById("studentCart") !== null ? document.getElementById(
	"studentCart").getElementsByClassName("left") : null;

// necessary for timeout
var timeout = null;
var t = null;

// gets current page
var page = "";
var focusPage = document.getElementsByClassName("yui-carousel-item yui-carousel-item-selected");
if (focusPage.length !== 0) {
	page = focusPage[0].getElementsByTagName("h1")[0].innerHTML;
}

// constant font
let font = $(".classAbbreviation").css('font-family');

// updates class and adds buttons if the DOM subtree is changed
var observer = new MutationObserver(() => {
	if (parent !== null && parent2 !== null) {
		if (parent.length !== 0 || parent2.length !== 0) {
			if (timeout) {
				clearTimeout(timeout);
			}
			page = focusPage[0].getElementsByTagName("h1")[0].innerHTML;
			ready = false;
			if (page === "Class Cart") {
				updateClassArr();
			}

			timeout = setTimeout(addBtn, 100);

		}
	}
});
observer.observe(document, {
	childList: true,
	subtree: true
});


/*
 *	Creates the modal with the default to display an error message
 */
function createModal() {
	modal = document.createElement("div");
	$('body').eq(0).append($(modal).attr({
		class: 'modal',
		id: 'scheduleView'
	}) // modal
		.append($('<div></div>').attr({
			class: 'modal-content',
			id: 'modalChild'
		}) // modalChild
			.append($('<div></div>').attr({
				class: 'modal-header'
			}) // modal-header
				.append($('<div></div>').html('&times;').attr({
					class: 'close'
				}) // close button
					.click(() => {
						modal.style.display = "none";
						$('#modalBody').html("");
					}),
					$('<h2></h2>').html("<p>Error creating schedule!<p>").css({
						'color': 'red',
						'font-weight': 'bold',
						'font-size': '1.5em',
						'margin': 'auto'
					})), // modalHeaderText
				$('<div></div>').attr({
					class: 'modal-body',
					id: 'modalBody'
				}), // modal body
				$('<div></div>').attr('class', 'modal-footer')))); // modal footer

	let prefModal = createPrefModal();

	// exit if clicked not on modal
	window.onclick = (event) => {
		if (event.target === modal) {
			modal.style.display = "none";
			$('#modalBody').html("");
		} else if (event.target === prefModal) {
			prefModal.style.display = "none";
			updatePreferences();
		}
	};
}

function createPrefModal() {
	let prefModal = document.createElement("div");

	chrome.storage.sync.get("pref", (obj) => {
		if (obj !== undefined && obj !== null && !$.isEmptyObject(obj)) {
			preferences = obj.pref;
		} else {
			chrome.storage.sync.set({
				"pref": preferences
			});
		}

		getFromStorageAndCreateModal(prefModal)
	});

	// creates preference modal
	prefModal.className = "modal";
	prefModal.id = "pref-modal";

	let divOuter = $(`
		<div class="modal-content preference-modal">
			<div class="pref-modal-body">
				<span class="close" style="position: sticky; top: 0; padding-top: 5px;">&times;</span>
				<h1 class="pref-title">Preferences</h1>
				<div id='include-pref' class="pref-subcontent">
					<div id='include-pref-text'>
						<h3 class="pref-subtitle">Include Classes</h3>
						<p class="pref-modal-text">Choose which classes are included in making the schedule.</p>
					</div>
					<div>
						<form id="remove-classes-pref-form" action="javascript:void(0)">
							<fieldset class="preferences-fieldset">
								<legend class="preferences-legend">Keep unselected classes in cart if a schedule is chosen?</legend>
								<div class="radio-container">
									<input type="radio" class="preferences-radio" id="include-classes-input-keep" name="include-pref" value="true" checked="true"><label for="include-classes-input-keep">Keep</label>
								</div>
								<div class="radio-container">
									<input type="radio" class="preferences-radio" id="include-classes-input-remove" name="include-pref" value="false"><label for="include-classes-input-remove">Remove</label>
								</div>
							</fieldset>
						</form>
					</div>
				</div>
				<div class="pref-divider"></div>
				<div id='break-pref' class="pref-subcontent">
					<div id='break-pref-text'>
						<h3 class="pref-subtitle">Breaks</h3>
						<p class="pref-modal-text">
							Select the time(s) you do <strong><i>not</i></strong> want class below. Your schedules will be sorted based on this.
						</p>
					</div>
				</div>
				<div id='pref-button-container' class="pref-subcontent">
				</div>
			</div>
		</div>
	`);

	$($(divOuter).find('#remove-classes-pref-form')[0]).find('input').each((_, el) => {
		el.onchange = () => includeClassesInRemoval = !JSON.parse(el.value);
	});

	$($(divOuter).find('span.close')[0]).click(() => {
		document.getElementById('pref-modal').style.display = 'none';
		updatePreferences();
	});

	$(prefModal).append(divOuter);

	return prefModal;
}

/*
 *	Creates preferences modal and gets information from storage
 */
function getFromStorageAndCreateModal(prefModal) {
	let firstTime = preferences.breakTime === null ? true : false;
	preferences.breakTime = firstTime ? {} : preferences.breakTime;
	firstTime ? $('#break-pref-text').append($(`<p class="pref-modal-text">
			Lunch break defaults to 12 p.m. and Saturdays and Sundays are default breaks. If you do not want this click "Clear Preferences."
		</p>`)) : null;

	$('#break-pref-text').append($(`<p class="pref-modal-text">
			To select a break time for all of MWF, TR, or SU, double click on that time on any of those days.
		</p>`));

	// settings:
	let breakFormCont = document.createElement("div");
	breakFormCont.className = "form-container";

	let breakForm = document.createElement("div");
	breakForm.className = "inner-form-container";
	breakFormCont.appendChild(breakForm);


	let breakDay = []; // [M, T, W, R, F, Sa, Su]
	let dayVec = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
	for (let i = 0; i < 7; ++i) {
		breakDay[i] = document.createElement("div");
		breakDay[i].className = "break-day";

		let day = document.createElement("div");
		let cname;
		if (i !== 6 && i % 2 === 0) {
			cname = "MWF";
		} else if (i !== 5 && i % 2 === 1) {
			cname = "TR";
		} else {
			cname = "SU";
		}
		day.className = "break-day-title " + cname;

		day.id = dayVec[i];
		day.innerHTML = dayVec[i];
		breakDay[i].appendChild(day);

		let selectAll = document.createElement("div");
		let saspan = document.createElement("span");
		selectAll.className = "break-select 7";
		selectAll.id = "select-all";
		selectAll.appendChild(saspan);
		saspan.innerHTML = "Select All"
		selectAll.ondblclick = (event) => {
			preferenceDblClickHandler(event.target);
		};

		selectAll.onclick = () => {
			let key = $(selectAll).siblings(".break-day-title").attr('id');
			if (preferences.breakTime[key].length < 12) {
				preferences.breakTime[key] = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
				$(selectAll).parent().find(".break-select").removeClass("one-chosen").addClass("one-chosen");
			} else {
				preferences.breakTime[key] = [];
				$(selectAll).parent().find('.break-select').removeClass("one-chosen");
			}
		};

		breakDay[i].appendChild(selectAll);
		breakForm.appendChild(breakDay[i]);

		for (let j = 8; j <= 18; ++j) {

			let time = j % 12;
			let timeStr = "";
			if (time === 0) {
				time = 12;
			}
			if (time >= 8 && time < 11) {
				timeStr = time.toString() + "am - " + (time + 1).toString() + "am";
			} else if (time === 11) {
				timeStr = time.toString() + "am - " + (time + 1).toString() + "pm";
			} else if (time === 12) {
				timeStr = time.toString() + "pm - " + (1).toString() + "pm";
			} else {
				timeStr = time.toString() + "pm - " + (time + 1).toString() + "pm";
			}

			let breakSelect = document.createElement("div");
			let bsspan = document.createElement("span");
			breakSelect.appendChild(bsspan);
			breakSelect.className = "break-select " + j;
			bsspan.innerHTML = timeStr;
			breakSelect.onclick = () => {
				let k = $(breakSelect).siblings(".break-day-title").attr('id');
				preferences.breakTime[k].includes(j) ? preferences.breakTime[k].splice(preferences.breakTime[k]
					.indexOf(j), 1) : preferences.breakTime[k].push(j);
				$(breakSelect).toggleClass("one-chosen");

				// handles checking and unchecking of select all based on
				// if the rest of the items are full
				if ($(selectAll).hasClass("one-chosen")) {
					$(selectAll).removeClass("one-chosen");
					preferences.breakTime[k].splice(preferences.breakTime[k].indexOf(7), 1);
				} else if ($(selectAll).hasClass("saved-preference")) {
					$(selectAll).removeClass("saved-preference");
					preferences.breakTime[k].splice(preferences.breakTime[k].indexOf(7), 1);
				} else {
					if (preferences.breakTime[k].length === 11) {
						$(selectAll).trigger('click');
					}
				}
			};
			breakSelect.ondblclick = (event) => {
				preferenceDblClickHandler(event.target);
			};
			breakDay[i].appendChild(breakSelect);
		}

		firstTime ? (preferences.breakTime[dayVec[i]] = (dayVec[i] === "Saturday" || dayVec[i] ===
			"Sunday") ? [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] : [12]) : null;
		//div2.appendChild(breakDay[i]);
	}

	document.body.appendChild(prefModal)
	$('#break-pref').append(breakFormCont);

	// hide / show schedules that do not meet pref option
	let checkBoxDiv = $(`
		<div class="checkbox-div">
			<form id="pref-not-met-form" action="javascript:void(0)">
				<fieldset class="preferences-fieldset">
					<legend class="preferences-legend">Show schedules that do not meet preferences?</legend>
					<div class="radio-container">
						<input type="radio" class="preferences-radio" id="break-pref-input-show" name="break-pref" value="true"><label for="break-pref-input-show">Show</label>
					</div>
					<div class="radio-container">
						<input type="radio" class="preferences-radio" id="break-pref-input-hide" name="break-pref" value="false"><label for="break-pref-input-hide">Hide</label>
					</div>
				</fieldset>
			</form>
		</div>
	`);

	$(checkBoxDiv).find('input').each((_, el) => {
		el.checked = JSON.parse(el.value) !== preferences.noPrefMet;
		el.onchange = () => {preferences.noPrefMet = !JSON.parse(el.value)};
	});

	$('#break-pref').append(checkBoxDiv);

	$('.radio-container').each((_, el) => el.onclick = () => $(el).find('input')[0].click());


	for (let day in preferences.breakTime) {
		preferences.breakTime[day].map((time) => {
			$("#" + day).siblings("." + time.toString()).removeClass("one-chosen").addClass("one-chosen");
		});
	}

	let prefBtnCont = document.getElementById('pref-button-container');

	let clearBtn = document.createElement("button");
	clearBtn.className = "myButton modalButton2 pref-clear";
	clearBtn.innerHTML = "Clear Preferences";
	prefBtnCont.appendChild(clearBtn);
	clearBtn.onclick = () => {
		$('#break-pref-input-show').trigger('click');
		$('.break-select').removeClass("one-chosen");
		for (let day in preferences.breakTime) {
			preferences.breakTime[day] = [];
		}
	};
}

/*
 *	handles the double click on Preferences times
 */
function preferenceDblClickHandler(t) {
	$(t).attr('class') ? null : t = $(t).parent();
	let time = $(t).attr('class').match(/[0-9]+/)[0];
	let day = $(t).siblings('.break-day-title').attr('class').match(/\s(\w+)/)[1];
	let parent = $(t).parent().parent();
	let click_flag = $(t).hasClass('one-chosen') ? false : true;
	triggerDblClick(parent, day, time, click_flag);
}

/*
 *	Triggers the click event on the proper days/times in the preferences modal
 */
function triggerDblClick(parent, days, time, click) {
	if (click) {
		$.each(parent.find('.' + days), (ind, el) => {
			if (!$(el).siblings('.' + time).hasClass('one-chosen')) {
				$(el).siblings('.' + time).trigger('click');
			}
		});
	} else {
		$.each(parent.find('.' + days), (ind, el) => {
			if ($(el).siblings('.' + time).hasClass('one-chosen')) {
				$(el).siblings('.' + time).trigger('click');
			}
		});
	}
}

/*
 *	Updates the HTML view for preferences and updates prefMat
 */
function updatePreferences() {
	chrome.storage.sync.set({
		"pref": preferences
	}, () => {
		if (chrome.runtime.lastError) {
			console.error("Could not save preferences");
			window.alert("Preferences not saved. Check internet connection.");
		}
	});
}

/*
 *	Clears class array and puts classes in cart in class arr
 */
function updateClassArr() {
	oldclassArr = classArr.slice();
	classArr = [];

	// adds classes in cart to class arr
	if (t) {
		clearTimeout(t);
	}
	t = setTimeout(() => {
		for (var i = 0; i < parent2.length; i++) {
			var children = parent2[i].children;
			if (children !== null) {
				addClass(parent2[i], i);
			}
		}
		ready = true;


		// do nothing if classes array has not changed
		if (oldclassArr.length === classArr.length && oldclassArr.every((c,i) => c.equal(classArr[i]))) {
			return;
		}
		updatePrefClassesToInclude();

	}, 100);
}

function updatePrefClassesToInclude() {
	if (classArr && classArr.length !== 0) {
		try {
			Array.from(document.getElementById('include-pref').getElementsByTagName('ul')).forEach(el => el.remove());
			$(`<ul class="include-pref-list">${classArr.map((c, j) => {
				return `<li style="padding: 10px; background-color:${j % 2 === 0 ? '#eee' : '#f9f9f9'}">
					<input id="${c.classAbbr.replace(' ', '_')}" class="include-class-checkbox" type="checkbox"/> <label class="class-abbr-label">${c.classAbbr}: ${c.classDesc}</label>
					<ul>
						${c.sections.map((s, i) => `<li>
								<div class="class-details-pref">
									<div class="grid-item"><input id="${c.classAbbr.replace(' ', '_')}-${s}" class="include-section-checkbox" type="checkbox"/></div>
									<div class="grid-item">${s}</div>
									<div class="grid-item">${c.days[i]}</div>
									<div class="grid-item">${c.times[i]}</div>
									<div class="grid-item">${c.prof[i]}</div.
								</div>
							</li>`).join('')}
					</ul>
				</li>`
			}).join('')}</ul>`).insertAfter($('#include-pref-text'));

			$('.class-abbr-label').click((ev) => $(ev.delegateTarget).prev().trigger('click'));
			$('.class-details-pref').click((ev) => $(ev.delegateTarget).find('input')[0].click())

			let currentClasses = new Map();

			// this stores all the classes that we do not want to include!
			let sStorage = sessionStorage.getItem('includePreferences');
			// convert the string to a map if not undefined / null
			let storedClasses = sStorage ? new Map(JSON.parse(sStorage)) : sStorage;

			classArr.forEach((c) => currentClasses.set(c.classAbbr.replace(' ', '_'), c.sections));

			if (storedClasses) {
				// set the session storage to be the intersection of the current classes and what is already in storage
				let intersection = [];
				currentClasses.forEach((v, k) => storedClasses.has(k) ? intersection.push(k) : null);
				for (const [k, v] of storedClasses) {
					if (!intersection.includes(k))
						storedClasses.delete(k);
					else
						v.forEach((sec, i) => {
						if (!currentClasses.get(k).includes(sec)) {
							let sc = storedClasses.get(k);
							sc.splice(i, 1);
							storedClasses.set(k, sc);
							if (storedClasses.get(k).length === 0) {
								storedClasses.delete(k);
							}
						}
					});

				}
				// update storage
				sessionStorage.setItem('includePreferences', JSON.stringify([...storedClasses]));
			} else {
				// set session storage to have preferences for classes included in making schedule
				storedClasses = new Map();
				sessionStorage.setItem('includePreferences', JSON.stringify([...storedClasses]));
			}

			includePreferences = new Map(storedClasses);

			// check everything
			$('.include-pref-list input').each((_, el) => el.checked = true);

			// remove checks of stored classes
			storedClasses.forEach((v, k) => {
				$('.include-class-checkbox').filter((_, el) => el.id === k.replace(' ', '_'))[0].checked = false;
				v.forEach((s) => $('.include-section-checkbox').filter((_, el) => k.replace(' ', '_') + '-' + s === el.id)[0].checked = false);
			});

			$('.include-section-checkbox').change((ev) => {
				let el = ev.target
				if (el.checked) {
					// remove from stored
					let match = el.id.match(/(.*)-(.*)/);
					let k = match[1];
					let k2 = match[2];
					storedClasses.set(k, storedClasses.get(k).filter(e => e !== k2));

					// check if every item in this list is true
					if ($(el).closest('ul').find('input').filter((_, element) => element.checked === false).length === 0) {
						$(el).parents('li').find('.include-class-checkbox').get(0).checked = true;
						storedClasses.delete(k);
					}

					// update storage
					sessionStorage.setItem('includePreferences', JSON.stringify([...storedClasses]));

				} else {
					// add to stored
					let match = el.id.match(/(.*)-(.*)/);
					let k = match[1];
					let k2 = match[2];
					storedClasses.has(k) ? storedClasses.set(k, storedClasses.get(k).concat(k2)) : storedClasses.set(k, [k2]);

					let x = $(el).parents('li').find('.include-class-checkbox').get(0);
					if (x.checked) {
						x.checked = false;
					}
				}

				// update the session storage
				sessionStorage.setItem('includePreferences', JSON.stringify([...storedClasses]));
				includePreferences = new Map(storedClasses);
			});

			$('.include-class-checkbox').change((ev) => {
				let el = ev.target;
				if (el.checked) {
					// remove items from storedClasses
					$(el).parent().find('.include-section-checkbox').filter((_, element) => !element.checked).each((_, element) => {
						storedClasses.delete(element.id.match(/(.*)-.*/)[1]);
						element.checked = true;
					});
				} else {
					storedClasses.set(el.id, Array.from($(el).parent().find('.include-section-checkbox').map((_, element) => {
						element.checked = false;
						return element.id.match(/-(.*)/)[1];
					})));

				}

				// update the session storage
				sessionStorage.setItem('includePreferences', JSON.stringify([...storedClasses]));
				includePreferences = new Map(storedClasses);
			});
		} catch(e) {
			console.error('DOM not loaded.')
		}
	}
}


/*
 *	Adds a button to each unique class
 */
function addBtn() {
	font = $(".classAbbreviation").css('font-family');

	if (page === "Class Cart") {
		makeScheduleButton(focusPage[0].children[0]);
	}

	btn.style.fontFamily = font;
	$(".left").css("width", "100%");

	var clone = null;

	// adds buttons to class search page
	for (var i = 0; i < parent.length; i++) {

		var children = parent[i].children;

		// adds buttons to the page
		if (children !== null && !children[children.length - 1].id.includes("Btn")) {
			clone = addClassButton.cloneNode(true);
			addClassButton.setAttribute("id", "Btn" + i.toString());
			parent[i].appendChild(addClassButton);
			var button = addClassButton.firstChild;
			addEL(addClassButton.children[0]);
			addClassButton = clone;
		}
	}

	// adds button to class cart page
	for (var j = 0; j < parent2.length; j++) {

		var children = parent2[j].children;

		// adds buttons to the page
		if (children !== null && !children[children.length - 1].id.includes("RemoveBtn")) {

			clone = addClassButton.cloneNode(true);
			addClassButton.id = "RemoveBtn" + j.toString();
			parent2[j].appendChild(addClassButton);
			var button = addClassButton.firstChild;
			button.className = "myButton remove";
			button.innerHTML = "Remove Class";
			addEL(button);
			addClassButton = clone;
		}
	}

}


/*
 *	Adds event listener to add class buttons and remove class buttons so that when clicked
 *	all the sections of a class are added/removed
 */
function addEL(button) {
	$(button).click(() => {
		$.each($(button).parents('tbody').find('.classActionButtons a'), (ind, el) => {
			if (el.title === "Remove Class From Cart" || el.title === "Add this class to your cart") {
				el.click();
			}
		});
		return false;
	});
}
/*
 *	Makes a class "Class" and adds to an array containing all classes in the
 *	schedule
 */
function addClass(_class, classNumOnPage) {

	let classAbbr = _class.children[0].innerHTML;
	classAbbr = classAbbr.replace(/:/g, "");
	let classDesc = _class.children[1].innerHTML;
	let specificClass = document.getElementById("cartDiv").getElementsByClassName("classTable")[
		classNumOnPage];
	let sectionsList = specificClass.getElementsByClassName("classSection");
	let profsList = specificClass.getElementsByClassName("classInstructor");
	let typeList = specificClass.getElementsByClassName("classType");
	let hoursList = specificClass.getElementsByClassName("classHours");
	let daysList = specificClass.getElementsByClassName("classMeetingDays");
	let timesList = specificClass.getElementsByClassName("classMeetingTimes");
	let classBuildingList = specificClass.getElementsByClassName("classBuilding");
	let sections = [];
	let profs = [];
	let types = [];
	let hours = [];
	let days = [];
	let times = [];
	let location = [];

	// Refines content
	for (let num = 0; num < sectionsList.length; ++num) {
		sections[num] = sectionsList[num].innerText.trim();
		profs[num] = profsList[num].innerText.trim();
		types[num] = typeList[num].innerText.trim();
		hours[num] = hoursList[num].innerText.replace(/\s+/g, "");
		days[num] = daysList[num].innerText.trim();
		times[num] = timesList[num].innerText.trim().replace(/ - /g, "-");
		location[num] = classBuildingList[num].innerText.trim();

	}

	let bigArr = [sections, types, profs, hours, days, times, location];
	let distinctTypes = new Set(types);
	distinctTypes.forEach((type) => {
		let typeIndices = types.map((t, i) => t === type ? i : -1).filter((index) => index !== -1);
		let bigArr2 = bigArr.map((littleArr) => littleArr.filter((_, index) => typeIndices.includes(index)));
		let newClass = new Class_(classAbbr, classDesc, ...bigArr2)
		classArr.push(newClass);
	})
}


/*
 *	Adds class added img and adds a remove button -- currently unfunctional
 */
function classAdded(button) {
	button.setAttribute('class', 'myButton disabled');
	button.disabled = true;
	setTimeout(function () {
		button.innerHTML = "Added";
	}, 200);
}


/*
 *	Creates the make schedule button
 */
function makeScheduleButton(parent) {
	// add make schedule button if it doesn't exist
	if (!parent.querySelector("button")) {

		$('#yui-gen9').css('height', 'auto');
		var btnContainer = document.createElement("table");
		var contR = document.createElement("tr");
		var contD = [];
		for (let i = 0; i < 3; ++i) {
			contD[i] = document.createElement("td"); // 3 table cells
			contR.appendChild(contD[i]);
			contD[i].style.width = "33.333%"
		}
		btnContainer.appendChild(contR);
		contR.style.width = "100%";
		btnContainer.style.width = "97.5%";
		var button = document.createElement("button");
		contD[1].appendChild(button);

		var prefBtn = document.createElement("button");
		prefBtn.id = "preferenceBtn";
		prefBtn.innerHTML = "Preferences";
		prefBtn.className = "myButton myButton2";
		prefBtn.addEventListener("click", showPreferences);
		contD[contD.length - 1].appendChild(prefBtn);
		prefBtn.style.fontFamily = font;

		button.id = 'makeSchedBtn';
		button.className = 'myButton myButton2';
		button.style.fontFamily = font;
		button.innerHTML = "Make Schedule";
		parent.appendChild(btnContainer);
		button.addEventListener("click", makeSchedClicked);

	}

	// add one click enroll if doesn't exist
	if (!document.querySelector('#oneClickEnrollButton')) {
		let oneClickEnrollDiv = document.createElement("div");
		let oneClickEnroll = document.createElement("button");
		$(oneClickEnroll).attr('id', 'oneClickEnrollButton').addClass(
			'myButton').addClass('myButton2');
		oneClickEnroll.style.fontFamily = font;
		oneClickEnroll.innerHTML = 'One Click Enroll';
		oneClickEnroll.addEventListener('click', enroll);
		$(oneClickEnrollDiv).append(oneClickEnroll);

		if (document.querySelector('#enrollButton-button'))
			$('#cartDiv').append(oneClickEnrollDiv);
	}

}


/*
 *	When make schedule button is clicked, creates a
 *	schedule array using all the classes in the cart.
 *	Puts schedules into viewable modal
 */
function makeSchedClicked() {
	if (ready) {
		let tbaClasses = [];
		classArr = classArr.filter(c => {
			if (c.times.includes("TBA")) {
				tbaClasses.push(c);
			}
			return !c.times.includes("TBA");
		});
		let includeClasses = classArr.map(c => c.copy());
		let doNotIncludeString = sessionStorage.getItem('includePreferences');
		if (doNotIncludeString) {
			let doNotIncludeClasses = new Map(JSON.parse(doNotIncludeString));
			includeClasses.forEach(c => {
				// want to remove sections from what we are looking at
				let k = c.classAbbr.replace(' ', '_');
				if (doNotIncludeClasses.has(k)) {
					doNotIncludeClasses.get(k).forEach(section => c.removeSection(section));
				}
			});
			// remove all classes with no sections
			includeClasses = includeClasses.filter(c => c.sections.length > 0);
		}

		var sched = new Schedule(includeClasses);
		let overlappedC = sched.overlappedClasses;
		scheduleArr = sched.scheduleArr;
		scheduleArr = sortBasedOnPreferences(scheduleArr);
		createViewableContent(scheduleArr, tbaClasses, overlappedC);

	} else {
		setTimeout(makeSchedClicked, 50);
	}
}

/*
 *	Shows the preferences for user to choose
 */
function showPreferences() {
	document.getElementById("pref-modal").style.display = "block";
	let width = $('#Wednesday.break-day-title').width();
	$('.break-select').css({
		'min-width': width
	});
}


/*
 * Uses code courtesy of Samuel Lijin to enroll in every class in your cart with one click
 */
function enroll() {
	cart = document.getElementById("StudentCartList_div");
	classes = cart.getElementsByClassName("classTable");
	//There are multiple classTables within the page; specifying those within the StudentCartList_div
	//restricts $classes to those tables corresponding to actual classes.
	//console.log(classes);
	//console.log(cart.childNodes);

	for (i = 0; i < classes.length; i++) {
		//Log the iteration step.
		//console.log(i);

		classInfo = classes[i].getElementsByClassName("left")[0].childNodes;
		className = classInfo[1].innerText + " " + classInfo[3].innerText;
		//console.log(className);
		//Voodoo magic to grab the contents of the <div> containing the class name.

		classSelection = classes[i].getElementsByClassName("classSelection")[0];
		//console.log(classSelection);
		//Grabs the classSelection <td> associated with the class.
		//Note that if registered for multiple /sections/ of the same class, this only grabs the first section.
		//The Class Cart page is formatted to give each class its own classTable <table>, but different sections
		//of the SAME class are placed as classSelection <td>s within a single classTable <table>.

		sub = classSelection.childNodes;
		//console.log(sub);
		//This grabs the childNode tree of the accessed TableData element, which contains 7 elements:
		//0: text ; 1: input ; 2: text ; 3: input.waitListHidden ; 4: text ; 5: div.enrollmentMenuDiv ; 6: text
		//The only relevant elements are [1], [3], [5].
		//[1] and [3] are inputs to enroll and/or waitList in the class; 5 is the 3rd parent of the ▼ dropdown text.
		//Not 100% sure why there are two associated inputs, but the following behavior is known:
		//    Clicking E▼ removes the "disabled" attribute from both, but does NOT toggle the waitListHidden input true.
		//    Clicking W▼ does the same, but DOES toggle the waitListHidden input true.
		//    Registering for a full class WITHOUT toggling the waitListHidden input true does NOT give a waitlist message.
		//    Registering for a full class WHEN toggling the waitListHidden input true DOES give a waitlist message.
		//    * In both attempts, an error of failure to enroll in the class is thrown, as would be expected.
		//Thus HIGHLY LIKELY that [1] and [3] are enrollment and waitlist inputs, e.g.:
		//    try {register-for-class(this) if [1]} catch {waitlist-for-class(this) if [3]}
		//The first code revision, however, was perfectly functional and only enabled the first input. Its ability to
		//handle waitlisting was not specifically tested.

		try {
			sub[1].removeAttribute("disabled");
			sub[3].removeAttribute("disabled");
			sub[3].value = "true";

			buttonText = sub[5].firstChild.firstChild.firstChild;
			buttonText.textContent = "W▼";
			//This accesses and modifies the dropdown text. While not necessary for this script to be
			//functional, that its it serves as
			//visual confirmation that the function has executed properly.
			//firstChild returns a read-only element; textContent references the actual string in the CSS
			//console.log(buttonText.textContent);

			//console.log("Trying to enrollwaitlist for: " + className);
		} catch (TypeError) {
			console.log("Error during " + i + "-th iteration:");
			console.log(TypeError);
		}
		//This enables the inputs.
		//console.log(sub[1]);
		//console.log(sub[3]);


		//console.log(buttonText);
	}

	document.getElementById("enrollButton-button").click();
}


/*
 *	Sorts the array based on the preferences and returns the array
 */
function sortBasedOnPreferences(arr) {
	let prefNotMetCount; // number of preferences broken
	let breakArr = [];
	let t;
	let d;
	for (let day in preferences.breakTime) {
		d = day[0];
		if (d === "T") {
			d = day[1] === "h" ? d = "R" : d = "T";
		} else if (d === "S") {
			d = day[1] === "u" ? d = "U" : d = "S";
		}

		preferences.breakTime[day].forEach((time) => {
			if (time !== 7 && time < 10) {
				t = "0" + time.toString() + ":01-0" + time.toString() + ":59";
			} else {
				t = time.toString() + ":01-" + time.toString() + ":59";
			}
			breakArr.push(["CLASS ABBRV", "00", t, d]);
		});
	}
	if (preferences.noPrefMet) { // do not show if no pref met
		console.log('here')
		arr = arr.filter((sched) => {
			let flag = true;
			breakArr.forEach((c) => {
				if (Schedule.checkOverlap(c, sched))
					flag = false;
			});
			return flag;
		});
	} else {
		arr.sort((a, b) => {
			prefNotMetCount = 0;
			// a - b: negative then a is before b, 0  then same, pos then b before a
			breakArr.forEach((c) => {
				if (Schedule.checkOverlap(c, a)) {
					++prefNotMetCount; // positive: more pref not met by a so a comes after b
				}
				if (Schedule.checkOverlap(c, b)) {
					--prefNotMetCount; // negative: more pref not met by b so b comes after a
				}
			});
			return prefNotMetCount;
		});
	}
	return arr;
}


/*
 *	Creates modal with different schedules and tables
 */
function createViewableContent(arr, tbaClasses, overlappedClasses) {
	var scheduleDiv;
	if (arr.length > 0) {
		schedArr = convertToDetailed(arr);
		let bigSchedDiv = document.createElement("div");
		if (tbaClasses.length > 0) {
			let tbaClassesP = document.createElement("p");
			let is_are = tbaClasses.length > 1 ? " are" : " is";
			tbaClassesP.innerHTML = "**" + tbaClasses.map(c => c.classAbbr).toString().replace(/,/g, ", ") +
				is_are + " not shown because the" + (tbaClasses.length > 1 ? " times" : " time") + is_are +
				" TBA.";
			bigSchedDiv.appendChild(tbaClassesP);
			$(tbaClassesP).addClass('tba-classes');
		}

		// creates schedule table
		schedArr.forEach(function (schedule, idx) {
			scheduleDiv = document.createElement("div");
			idx % 2 === 0 ? $(scheduleDiv).addClass('schedule-div') : $(scheduleDiv).addClass(
				'schedule-div')
				.css('background-color', '#dedede');

			var table = document.createElement("table");
			$(table).addClass('schedule-table');
			scheduleDiv.appendChild(table);
			var caption = table.createCaption();
			var capSpan = document.createElement("span");
			var capButtonSpan = document.createElement("span");
			var pickSchedBtn = document.createElement("button");
			caption.appendChild(capSpan);
			caption.appendChild(capButtonSpan);
			capButtonSpan.appendChild(pickSchedBtn);
			capSpan.innerHTML = "Schedule #" + (idx + 1).toString();
			pickSchedBtn.className = "myButton modalButton";
			pickSchedBtn.innerHTML = "Pick Schedule";

			// Remove classes not in schedule from cart
			pickSchedBtn.addEventListener("click", () => {
				var curSched = schedArr[~~pickSchedBtn.parentNode.previousSibling.innerHTML.match(/[0-9]+/) -
					1];
				var classTab = document.getElementById("studentCart").getElementsByClassName("classTable");

				let inSchedule = new Map();
				curSched.forEach((c) => {
					// gets key for inSchedule which is the index of the overall class (class table)
					let key = Array.from(parent2).findIndex((el) => el.children[0].innerText.includes(c.classAbbr));
					// gets value for key which is index of section in class
					let value = [Array.from(classTab[key].getElementsByClassName("classRow"))
						.findIndex((el) => el.querySelector('.classSection').innerText.trim() === c.sections[0])];
					if (inSchedule.has(key))
						inSchedule.set(key, inSchedule.get(key).concat(value));
					else
						inSchedule.set(key, value);
				});

				// if key & value are not in inSchedule => remove
				Array.from(classTab).forEach((cl, i) =>
					Array.from(cl.getElementsByClassName("classRow")).forEach((el, k) => {
						// If not including class in schedule making via preferences, then i will not be in 'inSchedule'
						// TODO: change the following:
						// In preferences, if a certain section is not included then it will still be deleted
						if (!inSchedule.has(i)) {
							// class not in schedule -- remove or don't remove based on preference
							if (includeClassesInRemoval) {
								el.querySelector('.classActionButtons').querySelector("a[title='Remove Class From Cart']").click();
							}
						} else if (!inSchedule.get(i).includes(k)) {
							let key = $(el).prevAll().find('.classHeader')[0].getElementsByClassName('classAbbreviation')[0].innerText.match(/[^:]+/)[0].replace(' ', '_');
							let value = $(el).find('.classSection')[0].innerText.match(/[\S]+/)[0];
							if (includePreferences.has(key) && includePreferences.get(key).includes(value)) {
								if (includeClassesInRemoval)
									el.querySelector('.classActionButtons').querySelector("a[title='Remove Class From Cart']").click();
							} else {
								el.querySelector('.classActionButtons').querySelector("a[title='Remove Class From Cart']").click();
							}
						}
					}
				));

				modal.style.display = "none";
				$('#modalBody').html("");

				scheduleArr = [];
			});

			// creates table
			$(capSpan).css('font-family', font).addClass('schedule-caption');
			scheduleDiv.id = caption.querySelector('span').innerText;
			var header = table.createTHead();
			var hrow = header.insertRow(0);
			for (var i = 0; i < 8; i++) {
				var hcell = document.createElement("th");
				hrow.appendChild(hcell);
				$(hcell).css('font-family', font).addClass('schedule-th');
				switch (i) {
					case 0:
						hcell.innerHTML = "";
						break;
					case 1:
						hcell.innerHTML = "Mon";
						break;
					case 2:
						hcell.innerHTML = "Tues";
						break;
					case 3:
						hcell.innerHTML = "Wed";
						break;
					case 4:
						hcell.innerHTML = "Thurs";
						break;
					case 5:
						hcell.innerHTML = "Fri";
						break;
					case 6:
						hcell.innerHTML = "Sat";
						break;
					case 7:
						hcell.innerHTML = "Sun";
						break;

				}
			}

			// creates times
			var tBody = table.createTBody();
			for (var i = 0; i < 13; i++) {
				var row = tBody.insertRow(i);
				$(row).addClass('schedule-tr');
				for (var j = 0; j < 8; j++) {
					var cell = row.insertCell(j);
					$(cell).addClass('schedule-td');
					if (j === 0) {
						var timeText = i + 7 <= 12 ? (i + 7).toString() :
							((i + 7) % 13 + 1).toString();
						if ((i + 7) < 12) {
							timeText += " am";
						} else {
							timeText += " pm";
						}
						cell.innerHTML = timeText;
						$(cell).addClass('c1');
					} else {
						$(cell).append($("<div></div>").addClass('schedule-td-div'));
					}
				}
			}
			bigSchedDiv.appendChild(scheduleDiv);
			$(scheduleDiv).css({
				'position': 'relative'
			});
		});

		$("#modalBody").append(bigSchedDiv);
		document.getElementsByClassName("modal-header")[0]
			.getElementsByTagName("h2")[0]
			.innerHTML = "Pick Schedule";
		$('.modal-header h2').css('color', 'black');
		$(".modal-content").css('font-family', font);
		modal.style.display = "block";


		schedArr.forEach((schedule, idx) => {
			// Places class
			scheduleDiv = document.getElementsByClassName("schedule-div")[idx];
			schedule.forEach((c) => {
				if (c.days[0] !== "TBA") {
					for (var k = 0; k < c.days[0].length; k++) {
						var classDiv = document.createElement("div");
						classDiv.className = "class";
						$(classDiv).prop('time', c.times[0]);
						$(classDiv).prop('location', c.location[0]);
						classDiv.id = c.classAbbr.replace(/\s/g, "") + "_" + k;
						var classTextDiv = document.createElement("div");
						classTextDiv.className = "classText";
						classTextDiv.innerHTML = c.classAbbr + "-" + c.sections[0];
						classDiv.appendChild(classTextDiv);
						placeClass(classDiv, scheduleDiv, c.days[0].charAt(k), c.times[0]);
						var height = Class_.lengthOfClass(c.times[0]) * 100 - 200 / $(classDiv).parent().get(0).offsetHeight; // account for border
						$(classDiv).css('height', height.toString() + "%");
					}
				}
			});
		});
	} else {
		let errorText =
			"<div class='errorText'><p>There was no possible schedule that could be created from the classes in your cart.</p>";
		let errorClasses = Array.from(overlappedClasses);
		let nonOverlapped = errorClasses.filter((item) => item[1] === 0).map((item) => item[0].substring(
			0, item[0].indexOf("-")));

		errorClasses = errorClasses.filter((item) => {
			let str = item[0].substring(0, item[0].indexOf("-"));
			return !nonOverlapped.includes(str)
		});
		errorClasses = errorClasses.sort((a, b) => b[1] - a[1]);
		let ec = new Set(errorClasses.map((item) => item[0].substring(0, item[0].indexOf("-"))));
		ec = Array.from(ec);
		if (ec.length !== 0) {

			errorText += "<p>The following classes have conflicts:</p><br/><p style='padding-left: 10px'>" + ec.toString().replace(
				/,/g, ", ") +
				"</p><br/><p>In preferences you can choose to <strong><i>not</i></strong> include the classes when creating a schedule. This will not remove the classes from your cart but will just ignore the classes when creating schedules. If a schedule is chosen, then the ignored classes will be removed from your cart.</p><p>Alternately, try clicking \"show\" for classes that do not meet preferences in preferences.</p></div>";
		} else {
			errorText +=
				"<p>Try clicking \"show\" for classes that do not meet preferences in preferences.</p></div>";
		}
		$('.modal-header h2').html('Error creating schedule!');

		$('.modal-header h2').css('color', 'red');
		$(".modal-content").css('font-family', font);
		$('#modalBody').html(errorText);
		modal.style.display = "block";
	}
}


/*
 *	Creates detailed schedule array from the less detailed array
 */
function convertToDetailed(arr) {
	var ss = [];
	var s = [];
	var classAbbr;
	var section;
	var x, y;
	arr.forEach((sched) => {
		sched.forEach((c) => {
			classAbbr = c[0];
			section = c[1];
			var ind = getClass(classAbbr, section);
			x = ind[0];
			y = ind[1];
			if ((/\n/).test(x.times[y]) && (/\n/).test(x.days[y])) {
				let times = x.times[y].split(/\n/);
				let days = x.days[y].split(/\n/);
				let locations = x.location[y].split(/\n/);
				while (locations.length < days.length) {
					locations.push(locations[locations.length - 1]);
				}
				for (let i = 0; i < times.length; ++i) {
					// TODO:: fix this
					s.push(new Class_(x.classAbbr, x.classDesc, [x.sections[y]], [x.type[y]], [x.prof[y]], [x.hours[y]],
						[days[i]], [times[i]], [locations[i]]));
				}
			} else {
				s.push(new Class_(x.classAbbr, x.classDesc, [x.sections[y]], [x.type[y]], [x.prof[y]], [x.hours[y]], [x.days[
					y]], [x.times[y]], [x.location[y]]));
			}

		});
		ss.push(s);
		s = [];
	});

	return ss;
}


/*
 *	Gets the class with the class abbreviation and section from
 *	the class array. Returns class and index of section
 */
function getClass(classAbbr, section) {
	for (var i = 0; i < classArr.length; i++) {
		if (classAbbr === classArr[i].classAbbr) {
			for (var j = 0; j < classArr[i].sections.length; j++) {
				if (classArr[i].sections[j] === section) {
					return [classArr[i], j];
				}
			}
		}
	}
	return null;
}


/*
 *	Places class on schedule based on time and day
 */
function placeClass(classDiv, scheduleDiv, day, time) {
	var divHeight = scheduleDiv.offsetHeight;
	if (divHeight !== 0) {
		var xDisplace;
		switch (day) {
			case "M":
				xDisplace = 0;
				break;
			case "T":
				xDisplace = 1;
				break;
			case "W":
				xDisplace = 2;
				break;
			case "R":
				xDisplace = 3;
				break;
			case "F":
				xDisplace = 4;
				break;
			case "S":
				xDisplace = 5;
				break;
			case "U":
				xDisplace = 6;
				break;
		}
		time = time.substring(0, time.indexOf("-"));
		var h, m;
		if (time.indexOf("p") >= 0 && time.substring(0, 2) !== "12") {
			h = ~~time.substring(0, 2) + 12;
		} else {
			h = ~~time.substring(0, 2);
		}
		h -= 7; // 7am = 0
		m = ~~time.substring(time.indexOf(":") + 1, time.indexOf(":") + 3);
		m /= 60;
		let cell = $($(scheduleDiv).find('tbody tr').get(h)).find('td .schedule-td-div').get(xDisplace);
		cell.appendChild(classDiv);
		$(classDiv).css('top', (m * 100).toString() + "%");


		// adds detailed comment bubble on hover
		var commentDiv = document.createElement("div");
		commentDiv.className = "comment-div";
		var commentImg = document.createElement("img");
		var iconUrl2 = chrome.extension.getURL("png/comment-pic2.png");
		var iconUrl3 = chrome.extension.getURL("png/comment-pic3.png");
		if ($(scheduleDiv).css('background-color').toString() === "rgb(222, 222, 222)") {
			$(commentImg).attr("src", iconUrl3);
		} else {
			$(commentImg).attr("src", iconUrl2);
		}
		commentImg.className = "comment-img";
		commentDiv.appendChild(commentImg);
		scheduleDiv.appendChild(commentDiv);


		var upperLeftText = document.createElement("div");
		upperLeftText.innerHTML = "Cannot display additional information."
		upperLeftText.className = "comment-text";
		commentDiv.appendChild(upperLeftText);
		$(upperLeftText).css('font-family', font);

		for (var i = 0; i < schedArr.length; i++) {
			if (scheduleDiv.id.includes(i + 1)) {
				for (var j = 0; j < schedArr[i].length; j++) {
					if (classDiv.firstChild.innerHTML.includes(schedArr[i][j].classAbbr + "-" + schedArr[i][j].sections[
						0])) {
						upperLeftText.innerHTML = classDiv.firstChild.innerHTML + "<br/>" + $(classDiv).prop('time') +
							"&emsp;" + $(classDiv).prop('location') + "<br/>" + schedArr[i][j].prof[0];
					}
				}
			}
		}


		// displays when hovered over class div
		classDiv.onmouseover = (event) => {
			commentDiv.style.display = "block";
			var curClassDiv;
			if (event.target.className === "class") {
				curClassDiv = event.target;
			} else {
				curClassDiv = event.target.parentNode;
			}

			let top = $(classDiv).offset().top - $(scheduleDiv).offset().top - $(commentDiv).height();
			let left = $(classDiv).offset().left - $(scheduleDiv).offset().left;

			$(commentDiv).css({
				'top': top,
				'left': left
			});

		};
		classDiv.onmouseout = () => {
			commentDiv.style.display = "none";
		};

	}
	// scheduleDiv.appendChild(classDiv);

}
