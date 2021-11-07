const { google } = require("googleapis");
const app = require('./app')


//Puerto de escucha
app.listen(1337, (req, res) => console.log("running on 1337"));

app.get("/", async (req, res) => {

  const auth = new google.auth.GoogleAuth({
    keyFile: "./JSON/acceso.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // AUTENTICACION DEL CLIENTE 
  const client = await auth.getClient();


  // API DE GOOGLE
  const googleSheets = google.sheets({ version: "v4", auth: client });

  //ID DE HOJA DE CALCULO
  const spreadsheetId = "1euJjroC0wV_MyW4aPq31KNzC9jSrn2pQUqGyg2FlnRQ";

  // OBTENGO EL JSON CON LOS DATOS DE LA HOJA DE CALCULO
  const leerColumnas = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "PRUEBA!A2:D", 
  });

  //inyeccion de html para mostrar las graficas por response
  res.send( `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INDEX PRUEBA</title>
</head>

<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://code.highcharts.com/modules/series-label.js"></script>
<script src="https://code.highcharts.com/modules/exporting.js"></script>
<script src="https://code.highcharts.com/modules/export-data.js"></script>
<script src="https://code.highcharts.com/modules/accessibility.js"></script>
<script src="https://code.highcharts.com/modules/data.js"></script>
<script src="https://code.highcharts.com/modules/drilldown.js"></script>


<style type="text/css">

.highcharts-figure, .highcharts-data-table table {
  min-width: 360px; 
  max-width: 800px;
  margin: 1em auto;
}

.highcharts-data-table table {
	font-family: Verdana, sans-serif;
	border-collapse: collapse;
	border: 1px solid #EBEBEB;
	margin: 10px auto;
	text-align: center;
	width: 100%;
	max-width: 500px;
}
.highcharts-data-table caption {
  padding: 1em 0;
  font-size: 1.2em;
  color: #555;
}
.highcharts-data-table th {
	font-weight: 600;
  padding: 0.5em;
}
.highcharts-data-table td, .highcharts-data-table th, .highcharts-data-table caption {
  padding: 0.5em;
}
.highcharts-data-table thead tr, .highcharts-data-table tr:nth-child(even) {
  background: #f8f8f8;
}
.highcharts-data-table tr:hover {
  background: #f1f7ff;
}
</style>

<body>

<figure class="highcharts-figure">
  <div id="container"></div>
  <p class="highcharts-description">
  GRAFICA LINEAL SOLICITADA EN LA PRUEBA
  </p>
</figure>

<figure class="highcharts-figure">
  <div id="container2"></div>
  <p class="highcharts-description">
GRAFICA DE BARRAS SOLICITADA 
  </p>
</figure>

<figure class="highcharts-figure">
  <div id="container3"></div>
  <p class="highcharts-description">
GRAFICA DE AREA SOLICITADA 
  </p>
</figure>


<div> 
<figure class="Figuras-google">
    <div id="container">

       <script> 

       datos = `+JSON.stringify(leerColumnas)+`;
       console.log(datos);

       Highcharts.chart('container', {

        title: {
          text: 'GRAFICA LINEAL'
        },
      
        subtitle: {
          text: 'Impresiones con respecto a la fecha'
        },
      
        yAxis: {
          title: {
            text: 'IMPRESIONES'
          }
        },
      
        xAxis: {
          title: {
            text: 'FECHAS'
          }
        },
      
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle'
        },
      
        series: [
          {
          name: 'FECHAS',
          colorByPoint: true,
          data:  datos.data.values.map(a=>parseInt(a[0]))
        },
        {
          name: 'IMPRESIONES',
          data:  datos.data.values.map(a=>parseInt(a[2]))
        }],

      
        responsive: {
          rules: [{
            condition: {
              maxWidth: 500
            },
            chartOptions: {
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
              }
            }
          }]
        }
      
      });
      </script>
    </div>


</figure>
</div>  

<div>
<figure class="Figuras-google">
      <script>

      Highcharts.chart('container2', {
        chart: {
          type: 'column'
        },
        title: {
          text: 'GRAFICA DE BARRAS'
        },
        subtitle: {
          text: 'Clicks con respecto a las Fechas'
        },

        xAxis: {
        title: {
          text: 'FECHAS'
        },
          type: 'category'
        },
        yAxis: {
          title: {
            text: 'CANTIDAD DE CLICKS'
          }
      
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          series: {
            borderWidth: 0,
            dataLabels: {
            enabled: true
            
              
            }
          }
        },
      
        tooltip: {
          headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
          pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },
      
        series: [
          {
            name: "CLICKS",
            colorByPoint: true,
            data: datos.data.values.map(a=>({
              name:parseInt(a[0]),
              y:parseInt(a[2])
            }))

          }
        ],
      
      });
      </script>
</figure>
</div>

<div>
<figure class="Figuras-google">
      <script>

       var CTR = datos.data.values.map(a=>{
          return ((parseInt(a[3]) / parseInt(a[2]))*100)
        }
        )
      console.log(CTR)



      Highcharts.chart('container3', {
        chart: {
          type: 'area'
        },
        accessibility: {
          description: ''
        },
        title: {
          text: 'GRAFICA DE AREA'
        },

        subtitle: {
          text: 'CTR con respecto a la fecha'
        },

        xAxis: {
          title: {
            text: 'FECHAS'
          },
          allowDecimals: false,
          labels: {
            formatter: function () {
              return this.value; // clean, unformatted number for year
            }
          }
        },
        yAxis: {
          title: {
            text: 'CTR'
          },
          labels: {
            formatter: function () {
              return this.value / 1000 + 'k';
            }
          }
        },
        tooltip: {
          pointFormat: '{series.name} had stockpiled <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
        },
        plotOptions: {
          area: { 
            format: '{point.data:.1f}%',
            marker: {
              enabled: false,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true
                }
              }
            }
          }
        },
        series: [{

          name: 'CTR',
          data:  CTR
        },
        {
          name: 'FECHAS',
          data:  datos.data.values.map(a=>parseInt(a[0]))

        }],
      
      });
      </script>
</figure>
</div>


</body>
</html>`

    );

});  




