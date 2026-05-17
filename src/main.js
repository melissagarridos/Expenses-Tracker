import './style.css'
import * as XLSX from "xlsx";

const text = document.getElementById("text")

const btn = document.getElementById("btn")

const input = document.getElementById("excelFile");

btn.addEventListener("click", async ()=> {

  const file = input.files[0];
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
  
    const workbook = XLSX.read(data, {
      type: "array"
    });
  
    // Primera hoja
    const sheetName = workbook.SheetNames[0];
  
    const worksheet = workbook.Sheets[sheetName];
  
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const jsonString = JSON.stringify(jsonData);

    generateReport(jsonString)
  
  };
  
  reader.readAsArrayBuffer(file);
})




input.addEventListener("change", (event) => {
});

async function generateReport(jsonData){
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers : {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "phi3",
      prompt: `
      Analiza estos gastos mensuales:

      ${jsonData}
  
      Genera:
      - resumen financiero
      - recomendaciones
      - categoría con mayor gasto
      `,
      stream: false
    })
  });
  const data = await response.json();
  
  console.log(data.response);
}

