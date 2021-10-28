import smoothPlaceholderInput from './smoothPlaceholderInput';


var DatePicker = class extends HTMLElement {
    dayList = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    hideCalendar = e=> {
        if (!this.contains(e.target)) {
            this.calendarShown = false;
        }
    }
  constructor(accentColor, backgroundColor, defaultDate) {
    super();
    this._accentColor = accentColor != null ? accentColor : "black";
    this._backgroundColor = backgroundColor != null ? backgroundColor : "white";
    this.defaultDate = new Date(defaultDate);
    this.attachShadow({mode: "open"});
    if (isNaN(this.defaultDate.valueOf())) {
      this.defaultDate = new Date();
    }
  }
  connectedCallback() {
    var _a, _b, _c, _d;
    this.hasAttribute("default-date") && (this.defaultDate = new Date(this.getAttribute("default-date")));
    if (isNaN(this.defaultDate.valueOf())) {
      this.defaultDate = new Date();
    }
    this._accentColor = (_b = (_a = this.getAttribute("accent-color")) != null ? _a : this.style.color) != null ? _b : "black";
    this._backgroundColor = (_d = (_c = this.getAttribute("background-color")) != null ? _c : this.style.backgroundColor) != null ? _d : "white";
    this._selectedDate = this.defaultDate;
    this._selectedDate.setHours(0, 0, 0, 0);
    this.addStyle();
    this.createInput();
    this.style.position = "relative";
    this.createShowCalendarButton();
    this.renderCalendar();
    this.calendarShown = false;
  }
  set accentColor(color) {
    this._accentColor = color;
    this.styleElem.textContent = this.getStyleText();
  }
  get accentColor() {
    return this._accentColor;
  }
  getStyleText() {
    return `
            
            smooth-placeholder-input {
                position: relative;
                display: inline-block;
                overflow: visible;
                width: 100%;
                top: 0;
                color: ${this._accentColor};
            }
            smooth-placeholder-input::after {
                content: "";
                position: absolute;
                bottom: -5px;
                left: 0;
                width: 100%;
                height: 5px;
                background: ${this._backgroundColor};
                border-radius: 5px;
                transition: clip-path 0.3s ease-in-out;
                clip-path: polygon(0 0, 100% 0, 100% 101%, 0% 100%);
            }
            smooth-placeholder-input.focus::after,
            smooth-placeholder-input.is-filled::after {
                clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
            }
            smooth-placeholder-input.is-filled::before {
                background: ${this._backgroundColor};
            }
            smooth-placeholder-input.focus::before {
                background: ${this._accentColor};
            }
            smooth-placeholder-input.focus .smooth-placeholder-input-placeholder,
            smooth-placeholder-input.is-filled .smooth-placeholder-input-placeholder {
                opacity: .8;
            }
            smooth-placeholder-input::before {
                content: "";
                position: absolute;
                bottom: -5px;
                width: 100%;
                height: 5px;
                background: ${this._accentColor};
                transition: background-color 0.3s ease-out;
                border-radius: 10px;
            }
            smooth-placeholder-input.invalid::before {
                background: red;
            }
        `;
  }
  addStyle() {
    let style = document.createElement("style");
    style.textContent = this.getStyleText();
    this.styleElem = style;
    this.shadowRoot.appendChild(style);
  }
  createShowCalendarButton() {
    let button = document.createElement("button");
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V10h16v11zm0-13H4V5h16v3z"/></svg>`;
    button.addEventListener("click", () => {
      this.calendarShown = !this.calendarShown;
    });
    button.style = `
            position: absolute;
            right: .5em;
            top: .5em;
            height: 2em;
            width: 2em;
            fill: ${this._backgroundColor};
            background: ${this._accentColor};
            border: none;
            padding: .25em;
            border-radius: 5px;
            font-size: 1em;
            cursor: pointer;
        `;
    button.firstChild.style.fill = "inherit";
    this.shadowRoot.appendChild(button);
    this.button = button;
  }
  renderCalendar() {
    if (this.calendarShown) {
      this.renderTwoWeekCalendar();
    }
  }
  renderTwoWeekCalendar(customDate) {
    if (!this.selectedDate || isNaN(this.selectedDate.valueOf())) {
      this.selectedDate = this.defaultDate;
      this.selectedDate.setHours(0, 0, 0, 0);
      return;
    }
    const selectedDate = customDate != null ? customDate : this.selectedDate;
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const dayOfWeek = selectedDate.getDay();
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let nextTwoWeeks = [];
    for (let j = dayOfWeek; j > 0; j--) {
      nextTwoWeeks.push({
        dateObj: new Date(year, month, day - j),
        selectedDate
      });
    }
    for (let j = 0; j < 14 - dayOfWeek; j++) {
      nextTwoWeeks.push({
        dateObj: new Date(year, month, day + j),
        selectedDate
      });
    }
    let weeks = [nextTwoWeeks.slice(0, 7), nextTwoWeeks.slice(7, 14)];
    if (this.calendar) {
      this.shadowRoot.removeChild(this.calendar);
    }
    let calendar = document.createElement("div");
    this.calendar = calendar;
    calendar.style = `
            position: absolute;
            top: 1.75em;
            left: 0;
            width: 100%;
            background: ${this._backgroundColor};
            font-size: 2em;
            border-radius: .5em;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
            z-index: 10;
            padding-bottom: .5em;
            padding-left: .25em;
            padding-right: .25em;
            box-sizing: border-box;
        `;
    let daysRow = document.createElement("div");
    daysRow.style = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: .6em;
            font-weight: bold;
            padding-left: .25em;
            padding-right: .25em;
            color: ${this._accentColor};
        `;
    daysRow.innerHTML = days.map((day2) => `<div style="width: 1.5em; display: flex; align-items: center; justify-content:center;">${day2}</div>`).join("");
    let weeksDiv = document.createElement("div");
    weeksDiv.style = `
            display: grid;
            grid-template-rows: 1fr 1fr;
            grid-gap: .75em;
            position: relative;
            `;
    for (let i = 0; i < weeks.length; i++) {
      let week = weeks[i];
      let weekDiv = document.createElement("div");
      weekDiv.style = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: .25em;
                box-sizing: border-box;
                width: 100%;
                background: ${this._accentColor};
                border-radius: 10px;
                color: ${this._backgroundColor};
                font-size: .75em;
                font-weight: bold;
                text-align: center;
            `;
      for (let j = 0; j < week.length; j++) {
        let day2 = week[j];
        let dayButton = document.createElement("button");
        dayButton.innerHTML = day2.dateObj.getDate();
        dayButton.style = `
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 1.5em;
                    height: 1.5em;
                    background: transparent;
                    border-radius: 100%;
                    color: ${this._backgroundColor};
                    font-size: .75em;
                    font-weight: bold;
                    text-align: center;
                    cursor: pointer;
                    border: none;
                    transition-duration: .5s;
                    transition-property: background, color, filter;
                `;
        if (day2.dateObj.toDateString() === this.selectedDate.toDateString()) {
          dayButton.style.background = this._backgroundColor;
          dayButton.style.color = this._accentColor;
        }
        dayButton.addEventListener("click", () => {
          console.log("day pressed")
          this.button.focus();
          window.setTimeout(() => {
            this.selectedDate = day2.dateObj;
            this.renderCalendar();
            this.calendarShown = false;
          }, 0);
        });
        dayButton.addEventListener("mouseover", () => {
          dayButton.style.background = this._backgroundColor;
          dayButton.style.color = this._accentColor;
          dayButton.style.filter = `drop-shadow(0 0 .1em ${this._backgroundColor})`;
        });
        dayButton.addEventListener("mouseout", () => {
          dayButton.style.filter = `drop-shadow(0 0 0em transparent)`;
          if (day2.dateObj.valueOf() === this.selectedDate.valueOf()) {
            return;
          }
          dayButton.style.background = this._accentColor;
          dayButton.style.color = this._backgroundColor;
        });
        weekDiv.appendChild(dayButton);
      }
      weeksDiv.appendChild(weekDiv);
    }
    let leftArrow = document.createElement("button");
    leftArrow.innerHTML = "◀";
    leftArrow.style = `
            display: flex;
            justify-content: center;
            align-items: center;
            width: 1.5em;
            height: 1.5em;
            background: ${this._backgroundColor};
            border-radius: 100%;
            color: ${this._accentColor};
            font-size: .75em;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            border: none;
            transition-duration: .5s;
            transition-property: background, color, transform;
            position: absolute;
            top: 1.35em;
            left: -.3em;
            transform: scale(1);
            box-shadow: 0 0 .25em ${this._backgroundColor};
        `;
    leftArrow.addEventListener("click", (e) => {
      this.calendar = this.renderTwoWeekCalendar(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 14));
    });
    leftArrow.addEventListener("mouseover", () => {
      leftArrow.style.background = this._accentColor;
      leftArrow.style.color = this._backgroundColor;
      leftArrow.style.transform = `scale(1.1)`;
    });
    leftArrow.addEventListener("mouseout", () => {
      leftArrow.style.transform = `scale(1)`;
      leftArrow.style.background = this._backgroundColor;
      leftArrow.style.color = this._accentColor;
    });
    let rightArrow = document.createElement("button");
    rightArrow.innerHTML = "▶";
    rightArrow.style = `
            display: flex;
            justify-content: center;
            align-items: center;
            width: 1.5em;
            height: 1.5em;
            background: ${this._backgroundColor};
            border-radius: 100%;
            color: ${this._accentColor};
            font-size: .75em;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            border: none;
            transition-duration: .5s;
            transition-property: background, color, transform;
            position: absolute;
            top: 1.35em;
            right: -.3em;
            transform: scale(1);
            box-shadow: 0 0 .25em ${this._backgroundColor};
        `;
    rightArrow.addEventListener("click", (e) => {
      this.calendar = this.renderTwoWeekCalendar(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 14));
    });
    rightArrow.addEventListener("mouseover", () => {
      rightArrow.style.background = this._accentColor;
      rightArrow.style.color = this._backgroundColor;
      rightArrow.style.transform = `scale(1.1)`;
    });
    rightArrow.addEventListener("mouseout", () => {
      rightArrow.style.transform = `scale(1)`;
      rightArrow.style.background = this._backgroundColor;
      rightArrow.style.color = this._accentColor;
    });
    let monthAndYear = document.createElement("div");
    monthAndYear.style = `
            display: flex;
            justify-content: center;
            position: absolute;
            top: 1.4em;
            align-items: center;
            width: 100%;
            height: 1.5em;
            color: ${this._accentColor};
            font-size: .7em;
            font-weight: bold;
            text-align: center;
            border: none;
            `;
    let monthWithMaxDays = -1, leaderCt = 0, risingCt = 0, risingMonth = -1, dayCt = weeks.length * 7;
    for (let i = 0; i < weeks.length; i++) {
      let week = weeks[i];
      for (let j = 0; j < week.length; j++) {
        let day2 = week[j];
        if (day2.dateObj.getMonth() === risingMonth) {
          risingCt++;
        } else {
          risingCt = 1;
          risingMonth = day2.dateObj.getMonth();
        }
        if (risingCt > leaderCt) {
          monthWithMaxDays = risingMonth;
          leaderCt = risingCt;
          if (leaderCt >= dayCt / 2) {
            break;
          }
        }
      }
    }
    monthAndYear.innerHTML = `
            ${months[monthWithMaxDays]} ${selectedDate.getFullYear()}
        `;
    weeksDiv.appendChild(monthAndYear);
    weeksDiv.appendChild(leftArrow);
    weeksDiv.appendChild(rightArrow);
    calendar.appendChild(daysRow);
    calendar.appendChild(weeksDiv);
    this.shadowRoot.appendChild(calendar);
    return calendar;
  }
  createInput() {
    const input = new smoothPlaceholderInput();
    input.setAttribute("placeholder", this.getAttribute("placeholder")??"Date");
    input.type = "text";
    input.addEventListener("change", (e) => {
      let date = new Date(e.target.value);
      if (!isNaN(date.valueOf())) {
        this.selectedDate = date;
        return;
      }
      const inpStr = e.target.value;
      const inpWords = inpStr.split(" ").map((e2) => e2.toLowerCase().replace(/[^a-z0-9]/g, ""));
      if (inpStr.length === 0) {
        this.selectedDate = this.defaultDate;
      }
      for (var i = 0; i < this.dayList.length; i++) {
        if (inpWords.includes(this.dayList[i].toLowerCase())) {
          const date2 = new Date();
          let newDay = i - date2.getDay();
          if (newDay < 0) {
            newDay += 7;
          }
          if (inpWords.includes("following")) {
            newDay += 7;
          }
          date2.setDate(date2.getDate() + newDay);
          this.selectedDate = date2;
          return;
        }
      }
      this.selectedDate = date;
    });
    input.addEventListener("input", () => {
      if (this.calendarShown)
        this.calendarShown = false;
    });
    this.input = input;
    this.shadowRoot.appendChild(input);
  }
  onDateChange(date) {
    function getDateString(date2) {
      return date2.toLocaleDateString("en-US", {weekday: "long", month: "long", day: "numeric", year: "numeric"});
    }
    if (!isNaN(date.valueOf())) {
      this.input.value = getDateString(date);
      this.input.classList.remove("invalid");
      this.button.style.background = "transparent";
      this.button.style.fill = this._accentColor;
      this.button.style.filter = `drop-shadow(0 0 0 ${this._backgroundColor})`;
    } else {
      this.input.value = "";
      this.input.classList.add("invalid");
      this.button.style.background = this._accentColor;
      this.button.style.fill = this._backgroundColor;
    }
    this.renderCalendar();
  }
  set selectedDate(date) {
    this._selectedDate = date;
    this.setAttribute("selected-date", date);
    this.onDateChange(date);
  }
  get selectedDate() {
    return this._selectedDate;
  }
  static get observedAttributes() {
    return ["selected-date"];
  }
  set calendarShown(bool) {
    this._calendarShown = bool;
    this.setAttribute("calendar-shown", bool);
    if (bool) {
      this.renderCalendar();
      window.setTimeout(() => {
        document.addEventListener("click", this.hideCalendar);
      }, 0);
    } else {
      this.calendar && this.shadowRoot.removeChild(this.calendar);
      this.calendar = null;
      document.removeEventListener("click", this.hideCalendar);
    }
  }
  get calendarShown() {
    return this._calendarShown;
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "selected-date") {
      this._selectedDate = new Date(newValue);
      this.onDateChange(this.selectedDate);
    }
  }
  get value() {
    return this.selectedDate;
  }
  set value(date) {
    this.selectedDate = date;
  }
};
customElements.define("date-picker", DatePicker);
