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
      return num.slice(0,1) == "-" ? num.toString().slice(0,6) + "m" : num.toString().slice(0,5) + "m";
    } else if (Math.abs(num)>0.000001) {
        num = num*1000000
        num = num.toString()
        return num.slice(0,1) == "-" ? num.toString().slice(0,6) + "u" : num.toString().slice(0,5) + "u";
    } else if (Math.abs(num)>0.000000001){
      num = num*1000000000
      num = num.toString()
      return num.slice(0,1) == "-" ? num.toString().slice(0,6) + "n" : num.toString().slice(0,5) + "n";
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
    arr[i].push(TableCsv.reverseRegex(TableCsv.regex(arr[i][0]) / devicesize))
    arr[i][0] == 0 ? 0 : arr[i][0] = arr[i][0].toString().slice(1,-1);
    arr[i][1] == 0 ? 0 : arr[i][1] = arr[i][1].toString().slice(1,-1);
  }

  arr[0].splice(1,1);
  arr[0].splice(2,1);
  arr[0].splice(0,0,"Time");
  var time = 0.0;
  for(var i = 1; i <arr.length; i++){
    arr[i].splice(1,1);
    arr[i].splice(2,1);
    arr[i].splice(0,0,time);
    time += 0.5;
  }

  return arr
}

static formatArrShortTime(arr,gateWidth,numFingers){
  const devicesize = (gateWidth*numFingers)/1000;
  arr[0].splice(0,2)
  arr[0].splice(0,0,"Time")
  arr[0].push("JD")
  var time = 0;
  for(var i = 1; i<arr.length; i++){
    arr[i].splice(0,2);
    arr[i].splice(0,0,time);
    arr[i][2] = parseFloat(arr[i][2]).toPrecision(5);
    arr[i].push(arr[i][2]/devicesize);
    time += 1;
  }

  return arr
}

static regexArrShortTime(arr){
  for(var i = 1; i < arr.length; i++){
    arr[i][1] = arr[i][1].toString().slice(0,4); //VD
    arr[i][2] = TableCsv.reverseRegex(arr[i][2]); //ID
    arr[i][3] = TableCsv.reverseRegex(arr[i][3]);//JD
  }
  return arr
}

static getSecondFive(arr,index){
  var seen40 = false;
  for(var i=0;i<arr.length;i++){
    if(Number(arr[i][index])>30){
      seen40 = true;
    } else if ((seen40) && Number((arr[i][index])<10)){
      return i;
    }
  }
}

}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

function updateChartsLong() {
  const tableCsvLong = new TableCsv(document.querySelector("#csvRootLong"));
  tableCsvLong.clear();
  const fr = new FileReader();
  fr.onloadend=e=>{
    let r = fr.result.split("\n").
    map(e=>{
      return e.split(",")
    });
    var gateWidth = document.querySelector('#gateWidthLong').value;
    var numFingers = document.querySelector('#numFingersLong').value;
    var zeroPoint = document.querySelector('#zeroPointLong').value;
    var newtable = TableCsv.formatArrLongTime(r,gateWidth,numFingers)
    //need to rev regex values first
    tableCsvLong.update(newtable);
    timeValues = [];
    JDValues = [];
    VDValues = [];


    //placing values in arrays for first chart
    for (var i=1; i<newtable.length;i++){
      timeValues.push(Number(newtable[i][0]));
      JDValues.push(TableCsv.regex("'" + newtable[i][3] + "'"));
      VDValues.push(Number(newtable[i][2]));
    }

    var trace1 = {
      x: timeValues,
      y: JDValues,
      name: 'JD', //displacemenet current density
      type: 'scatter'
    }

    var trace2 ={
      x: timeValues,
      y: VDValues,
      name: 'VD', //drain voltage
      type: 'scatter',
      yaxis: 'y2'
    }

    var layout1 = {
      xaxis: {title: 'Time [s]'},
      yaxis: {title: 'Current Density [A/m^2]'},
      yaxis2: {
        title: 'Drain Voltage [V]',
        overlaying: 'y',
        side: 'right'
      }
    }

    //placing values in arr for second chart
    var start = TableCsv.getSecondFive(newtable,2)-2;
    if (zeroPoint!=""){
      var start = (Number(document.querySelector('#zeroPointLong').value) * 2)-1;
    } else {
      document.querySelector('#zeroPointLong').value = (start/2 + 0.5).toString();
    }
    var time = 0;
    timeValues2 = [];
    JDValues2 = [];
    newtable = newtable.slice(start);
    for(var i = 1; i<newtable.length; i++){
      timeValues2.push(time);
      JDValues2.push(TableCsv.regex("'" + newtable[i][3] + "'"));
      time += 0.5;
    }

    var trace3 = {
      x: timeValues2,
      y: JDValues2,
      name: 'JD', //displacemenet current density
      type: 'scatter'
    }

    var layout2 = {
      xaxis: {
        type: 'log',
        title: 'Time[s]'
      },
      yaxis: {
        title: 'Current Density [A/m^2]',
        rangemode: 'tozero'
      }
    };

    data1 = [trace1, trace2]
    data2 = [trace3]
    Plotly.newPlot('longPlot', data1, layout1);
    Plotly.newPlot('longPlot2', data2, layout2);
  }
  fr.readAsText(document.querySelector("#csvFileInputLong").files[0]);
} 
//////////////////////////////////////////////////////////////////////////////////////////////////////
function updateChartsShort() {
  const tableCsvLong = new TableCsv(document.querySelector("#csvRootShort"));
  tableCsvLong.clear();
  const fr = new FileReader();
  fr.onloadend=e=>{
    let r = fr.result.split("\n").
    map(e=>{
      return e.split(",")
    });
    var gateWidth = document.querySelector('#gateWidthShort').value;
    var numFingers = document.querySelector('#numFingersShort').value;
    var zeroPoint = document.querySelector('#zeroPointShort').value;
    var newtable = TableCsv.formatArrShortTime(r,gateWidth,numFingers)
    tableCsvLong.update(TableCsv.regexArrShortTime(newtable));

    //placing values in arr for second chart
    var start = TableCsv.getSecondFive(newtable,1)-2;
    if (zeroPoint!=""){
      var start = (Number(document.querySelector('#zeroPointShort').value)) -1;
    } else {
      document.querySelector('#zeroPointShort').value = (start + 1).toString();
    }
    var time = 0;
    timeValues = [];
    JDValues = [];
    newtable = newtable.slice(start);
    for(var i = 1; i<newtable.length; i++){
      timeValues.push(time);
      JDValues.push(TableCsv.regex("'" + newtable[i][3] + "'"));
      time += 1;
    }

    var trace1 = {
      x: timeValues,
      y: JDValues,
      name: 'JD', //displacemenet current density
      type: 'scatter'
    }

    var layout1 = {
      xaxis: {
        type: 'log',
        title: 'Time[s]'
      },
      yaxis: {
        title: 'Current Density [A/m^2]',
        rangemode: 'tozero'
      }
    };

    data1 = [trace1]
    Plotly.newPlot('shortPlot', data1, layout1);
  }
  fr.readAsText(document.querySelector("#csvFileInputShort").files[0]);
} 

function showTableShort() {
  const tableCsvLong = new TableCsv(document.querySelector("#csvRootDualShort"));
  tableCsvLong.clear();
  const fr = new FileReader();
  fr.onloadend=e=>{
    let r = fr.result.split("\n").
    map(e=>{
      return e.split(",")
    });
    var gateWidth = document.querySelector('#gateWidthDual').value;
    var numFingers = document.querySelector('#numFingersDual').value;
    var newtable = TableCsv.formatArrShortTime(r,gateWidth,numFingers)
    tableCsvLong.update(TableCsv.regexArrShortTime(newtable));
  }
  fr.readAsText(document.querySelector("#csvFileInputDualShort").files[0]);
} 

function showTableLong() {
  const tableCsvLong = new TableCsv(document.querySelector("#csvRootDualLong"));
  tableCsvLong.clear();
  const fr = new FileReader();
  fr.onloadend=e=>{
    let r = fr.result.split("\n").
    map(e=>{
      return e.split(",")
    });
    var gateWidth = document.querySelector('#gateWidthDual').value;
    var numFingers = document.querySelector('#numFingersDual').value;
    var newtable = TableCsv.formatArrLongTime(r,gateWidth,numFingers)
    tableCsvLong.update(newtable);
  }
  fr.readAsText(document.querySelector("#csvFileInputDualLong").files[0]);
} 

function showVDLong() {
  Plotly.restyle(document.getElementById("longPlot"), {"visible": 'true'}, [1]);
} 

function ignoreVDLong() {
  Plotly.restyle(document.getElementById("longPlot"), {"visible": 'legendonly'}, [1]);
} 

function getDataDualLong() {
  const fr = new FileReader();
  fr.onloadend=e=>{
    let r = fr.result.split("\n").
    map(e=>{
      return e.split(",")
    });
    var gateWidth = document.querySelector('#gateWidthDual').value;
    var numFingers = document.querySelector('#numFingersDual').value;
    var zeroPoint = document.querySelector('#zeroPointDualLong').value;
    var newtable = TableCsv.formatArrLongTime(r,gateWidth,numFingers)

    //placing values in arr for second chart
    var start = TableCsv.getSecondFive(newtable,2)-2;
    if (zeroPoint!=""){
      start = (Number(document.querySelector('#zeroPointDualLong').value) * 2)-1;
    } else {
      document.querySelector('#zeroPointDualLong').value = (start/2 + 0.5).toString();
    }
    var time = 0;
    timeValues = [];
    JDValues = [];
    newtable = newtable.slice(start);
    for(var i = 1; i<newtable.length; i++){
      timeValues.push(time);
      JDValues.push(TableCsv.regex("'" + newtable[i][3] + "'"));
      time += 500000;
    }

    /*
    var trace1 = {
      x: timeValues,
      y: JDValues,
      name: 'JD', //displacemenet current density
      type: 'scatter'
    }
    */
  }
  fr.readAsText(document.querySelector("#csvFileInputDualLong").files[0]);
  return [timeValues,JDValues]
}

function getDataDualShort() {
  const fr = new FileReader();
  fr.onloadend=e=>{
    let r = fr.result.split("\n").
    map(e=>{
      return e.split(",")
    });
    var gateWidth = document.querySelector('#gateWidthDual').value;
    var numFingers = document.querySelector('#numFingersDual').value;
    var zeroPoint = document.querySelector('#zeroPointDualShort').value;
    var newtable = TableCsv.formatArrShortTime(r,gateWidth,numFingers)

    //placing values in arr for second chart
    var start = TableCsv.getSecondFive(newtable,1)-2;
    if (zeroPoint!=""){
      var start = (Number(document.querySelector('#zeroPointDualShort').value)) -1;
    } else {
      document.querySelector('#zeroPointDualShort').value = (start + 1).toString();
    }
    var time = 0;
    timeValues = [];
    JDValues = [];
    newtable = newtable.slice(start);
    for(var i = 1; i<newtable.length; i++){
      timeValues.push(time);
      JDValues.push(TableCsv.regex("'" + newtable[i][3] + "'"));
      time += 1;
    }

    /*
    var trace1 = {
      x: timeValues,
      y: JDValues,
      name: 'JD', //displacemenet current density
      type: 'scatter'
    }
    */
  }
  fr.readAsText(document.querySelector("#csvFileInputDualShort").files[0]);
  return [timeValues,JDValues]
}

function plotDual(){
  short = getDataDualShort();
  long = getDataDualLong();

  var trace1 = {
    x: short[0],
    y: short[1],
    type: 'scatter'
  }

  var trace2 = {
    x: long[0],
    y: long[1],
    type: 'scatter'
  }


  var layout = {
    xaxis: {
      type: 'log',
      title: 'Time[s]'
    },
    yaxis: {
      title: 'Current Density [A/m^2]',
      rangemode: 'tozero'
    }
  };

  data = [trace1, trace2]
  Plotly.newPlot('dualPlot', data, layout);
}

function calcDrainlag(){
  var min = document.querySelector('#minJD').value;
  var max = document.querySelector('#maxJD').value;

  return (max-min)/max;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

document.querySelector("#csvFileInputLong")?.addEventListener("change", () => {
  updateChartsLong();
});

document.querySelector("#csvFileInputShort")?.addEventListener("change", () => {
  updateChartsShort();
});

document.querySelector("#csvFileInputDualShort")?.addEventListener("change", () => {
  showTableShort();
});

document.querySelector("#csvFileInputDualLong")?.addEventListener("change", () => {
  showTableLong();
});

