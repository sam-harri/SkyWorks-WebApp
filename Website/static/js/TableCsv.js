class TableCsv {
  /**
   * @param {HTMLTableElement} root The table element which will display the CSV data.
   */
  constructor(root) {
    this.root = root;
  }

  /**
   * Clears existing data in the table and replaces it with new data.
   *
   * @param {string[][]} data A 2D array of data to be used as the table body
   * @param {string[]} headerColumns List of headings to be used
   */
  update(data, headerColumns = []) {
    this.clear();
    this.setHeader(headerColumns);
    this.setBody(data);
  }

  /**
   * Clears all contents of the table (incl. the header).
   */
  clear() {
    this.root.innerHTML = "";
  }

  /**
   * Sets the table header.
   *
   * @param {string[]} headerColumns List of headings to be used
   */
  setHeader(headerColumns) {
    this.root.insertAdjacentHTML(
      "afterbegin",
      `
            <thead class="thead-light">
                <tr>
                    ${headerColumns.map((text) => `<th>${text}</th>`).join("")}
                </tr>
            </thead>
        `
    );
  }

  /**
   * Sets the table body.
   *
   * @param {string[][]} data A 2D array of data to be used as the table body
   */
  setBody(data) {
    const rowsHtml = data.map((row) => {
      return `
                <tr>
                    ${row.map((text) => `<td>${text}</td>`).join("")}
                </tr>
            `;
    });

    this.root.insertAdjacentHTML(
      "beforeend",
      `
            <tbody>
                ${rowsHtml.join("")}
            </tbody>
        `
    );
  }

  static regex(num) {
    num = num.toString()
    if (num === "0") {
      return 0;
    }

    num = num.slice(1, -1);

    if (num.slice(-1)[0] === "u") {
      return Number.parseFloat(num.slice(0, -1)) * 1e-06;
    } else {
      if (num.slice(-1)[0] === "m") {
        return Number.parseFloat(num.slice(0, -1)) * 0.001;
      }
    }
  }

  static reverseRegex(num){
    if (Math.abs(num)>0.001) {
      num = num*1000;
      num = num.toString()
      return num.slice(0,1) == "-" ? num.toString().slice(0,4) + "m" : num.toString().slice(0,3) + "m";
    } else {
      if (Math.abs(num)>0.00001) {
        num = num*1000000
        num = num.toString()
        return num.slice(0,1) == "-" ? num.toString().slice(0,4) + "u" : num.toString().slice(0,3) + "u";
      }
    }
  }



/**
 * 
 * @param {string[][]} arr 2D array from CSV
 * @param {int} gateWidth Gate Width
 * @param {int} numFingers Number of Fingers
 */
 static formatArrLongTime(arr,gateWidth,numFingers){
  arr[0].push("JD");
  const devicesize = (gateWidth*numFingers)/1000;
  for (var i = arr.length-1; i > 0; i--){
    if (arr[i][2] < 1) {
      arr.splice(i,1)
    } else {
    arr[i].push(TableCsv.reverseRegex(TableCsv.regex(arr[i][0]) / devicesize))
    arr[i][0] == 0 ? 0 : arr[i][0] = arr[i][0].toString().slice(1,-1);
    arr[i][1] == 0 ? 0 : arr[i][1] = arr[i][1].toString().slice(1,-1);
    }
  }

  arr[0].splice(3,1);
  arr[0].splice(0,0,"Time");
  var time = 0.0;
  for(var i = 1; i <arr.length; i++){
    arr[i].splice(3,1);
    arr[i].splice(0,0,time);
    time += 0.5;
  }

  return arr
}
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
const tableRoot = document.querySelector("#csvRootLong");
const csvFileInput = document.querySelector("#csvFileInputLong");
const tableCsv = new TableCsv(tableRoot);

csvFileInput.addEventListener("change", (e) => {
  tableCsv.clear();
  const fr = new FileReader();
  fr.onloadend=e=>{
    let r = fr.result.split("\n").
    map(e=>{
      return e.split(",")
    });
    var gateWidth = document.querySelector('#gateWidthLong').value;
    var numFingers = document.querySelector('#numFingersLong').value;
    var newtable = TableCsv.formatArrLongTime(r,gateWidth,numFingers)
    tableCsv.update(newtable);
    timeValues = [];
    JDValues = [];

    for (var i=1; i<newtable.length;i++){
      timeValues.push(Number(newtable[i][0]));
      newtable[i][4] = "'" + newtable[i][4] + "'"
      JDValues.push(TableCsv.regex(newtable[i][4]));
    }

    var trace1 = {
      x: timeValues,
      y: JDValues,
      type: 'scatter'
    }
  
    var layout = {
      xaxis: {range: [0, 500], title: "time [s]"},
      yaxis: {range: [0, 0.35], title: "voltage [V]"},
    };

    data = [trace1];
    Plotly.newPlot('longPlot', data, layout);
  }
  //document.querySelector('#longTimeImage').src="static/img/MatPlotLibChart.png";
  fr.readAsText(csvFileInput.files[0]);
});
