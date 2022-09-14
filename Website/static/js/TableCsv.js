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

function scollDualShort(){
  var zeroPointShort = document.querySelector('#zeroPointDualShort').value;
  var rowsShort = document.querySelectorAll('#csvRootDualShort tr');
    rowsShort[zeroPointShort].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
}

function scollDualLong(){
  var zeroPointLong = document.querySelector('#zeroPointDualLong').value;
  var rowsLong = document.querySelectorAll('#csvRootDualLong tr');
    rowsLong[zeroPointLong*2].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
}

function scollLong(){
  var zeroPointLong = document.querySelector('#zeroPointLong').value;
  var rowsLong = document.querySelectorAll('#csvRootLong tr');
    rowsLong[zeroPointLong*2].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
}

function scollShort(){
  var zeroPointShort = document.querySelector('#zeroPointShort').value;
  var rowsShort = document.querySelectorAll('#csvRootShort tr');
    rowsShort[zeroPointShort].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
}

function plotDual(){
  var readyShort = false;
  var readyLong = false;

  var check = function() {
    if (readyShort === true && readyLong ===true) {

      document.querySelector('#minJD').value = min;
      document.querySelector('#maxJD').value = max;

      calcDrainlag()
    
      var trace1 = {
        x: timeValuesShort,
        y: JDValuesShort,
        type: 'scatter'
      }
    
      var trace2 = {
        x: timeValuesLong,
        y: JDValuesLong,
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
        },
        showlegend: false
      };
    
      data = [trace1, trace2]
      Plotly.newPlot('dualPlot', data, layout);
      return;
    }
    setTimeout(check, 500);
  }

  check();

  var gateWidth = document.querySelector('#gateWidthDual').value;
  var numFingers = document.querySelector('#numFingersDual').value;

  //LONG
  var max = 0;
  const frLong = new FileReader();
  frLong.onloadend=e=>{
    let r = frLong.result.split("\n").
    map(e=>{
      return e.split(",")
    });
    var zeroPointLong = document.querySelector('#zeroPointDualLong').value;
    var newtableLong = TableCsv.formatArrLongTime(r,gateWidth,numFingers)

    //placing values in arr for second chart
    var startLong = TableCsv.getSecondFive(newtableLong,2)-2;
    if (zeroPointLong!=""){
      startLong = (Number(document.querySelector('#zeroPointDualLong').value) * 2)-1;
    } else {
      document.querySelector('#zeroPointDualLong').value = (startLong/2 + 0.5).toString();
    }

    var timeLong = 500000;
    timeValuesLong = [];
    JDValuesLong = [];
    newtableLong = newtableLong.slice(startLong+1);
    for(var i = 1; i<newtableLong.length; i++){
      if(TableCsv.regex("'" + newtableLong[i][3] + "'")>max && i>1){
        max = TableCsv.regex("'" + newtableLong[i][3] + "'")
      }
      timeValuesLong.push(timeLong);
      JDValuesLong.push(TableCsv.regex("'" + newtableLong[i][3] + "'"));
      timeLong += 500000;
    }
    readyLong = true;
  }
  frLong.readAsText(document.querySelector("#csvFileInputDualLong").files[0]);

  //short section
  var min = 10;
  const frShort = new FileReader();
  frShort.onloadend=e=>{
    let r = frShort.result.split("\n").
    map(e=>{
      return e.split(",")
    });
    var zeroPointShort = document.querySelector('#zeroPointDualShort').value;
    var newtableShort = TableCsv.formatArrShortTime(r,gateWidth,numFingers)

    //placing values in arr for second chart
    var startShort = TableCsv.getSecondFive(newtableShort,1)-2;
    if (zeroPointShort!=""){
      startShort = (Number(document.querySelector('#zeroPointDualShort').value)) -1;
    } else {
      document.querySelector('#zeroPointDualShort').value = (startShort + 1).toString();
    } 

    var timeShort = 0;
    timeValuesShort = [];
    JDValuesShort = [];
    newtableShort = newtableShort.slice(startShort);
    for(var i = 1; i<newtableShort.length; i++){
      if(newtableShort[i][3]<min && i>1){
        min = newtableShort[i][3]
      }
      timeValuesShort.push(timeShort);
      JDValuesShort.push(newtableShort[i][3]);
      timeShort += 1;
    }
    readyShort = true;
  }
  frShort.readAsText(document.querySelector("#csvFileInputDualShort").files[0]);

}

function calcDrainlag(){
  var min = document.querySelector('#minJD').value;
  var max = document.querySelector('#maxJD').value;
  
  if(min!="" && max!=''){
  document.querySelector('#drainLag').innerHTML = ((((max-min)/max)*100).toString()).slice(0,4) + "%";
  }
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

