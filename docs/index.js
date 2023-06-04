
//Editor
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "htmlmixed",
  tabSize: 5,
  lineNumbers: true,
  firstLineNumber: 1,
  extraKeys: { "Ctrl-Space": "autocomplete" },
  autoCloseBrackets: true,
  autoCloseTags: true,
});


//Generar árbol
editor.on("change", function () {
  let codigoHTML = editor.getValue();
  generarArbolDOM(codigoHTML);
});

function generarArbolDOM(codigoHTML) {
  let contenedorArbol = d3.select("#treeContainer");

  // Eliminar el contenido anterior del contenedor del árbol
  contenedorArbol.selectAll("*").remove();

  if (codigoHTML.trim() === "") {
    return;
  }

  let width = contenedorArbol.node().getBoundingClientRect().width;
  let height = contenedorArbol.node().getBoundingClientRect().height;

  let svg = contenedorArbol.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(40,0)");

  let treeLayout = d3.tree().size([height, width - 80]);

  let root = d3.hierarchy(parseHTML(codigoHTML), function (d) {
    return d.children;
  });

  treeLayout(root);

  let nodes = root.descendants();
  let links = root.links();

  let node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  node.append("circle")
    .attr("r", 4.5);

  node.append("text")
    .attr("dy", 3)
    .attr("x", function (d) {
      return d.children ? -8 : 8;
    })
    .style("text-anchor", function (d) {
      return d.children ? "end" : "start";
    })
    .text(function (d) {
      return d.data.tag;
    });

  svg.selectAll(".link")
    .data(links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
      .x(function (d) { return d.y; })
      .y(function (d) { return d.x; }));
}

function parseHTML(html) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(html, "text/html");

  function visitNode(node, parent) {
    let data = {
      tag: node.nodeName,
      children: []
    };

    if (parent) {
      parent.children.push(data);
    }

    let childNodes = node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      let child = childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) {
        visitNode(child, data);
      }
    }

    return data;
  }

  return visitNode(doc.documentElement, null);
}

// Ajustar el tamaño del contenedor cuando se redimensiona la ventana
window.addEventListener("resize", function () {
  let codigoHTML = editor.getValue();
  generarArbolDOM(codigoHTML);
});



//mostrar datos
let resultado = document.getElementById("resultado");
editor.on("change", function () {
  resultado.innerHTML = editor.getValue();
});

//Cambio de tema
const option = document.getElementById("selectTema");
option.addEventListener("change", () => {
  if (option.value === "Por defecto") {
    editor.setOption("theme", "3024-day");
  }
  if (option.value === "dracula") {
    editor.setOption("theme", "dracula");
  }
  if (option.value === "monokai") {
    editor.setOption("theme", "monokai");
  }
  if (option.value === "cobalt") {
    editor.setOption("theme", "cobalt");
  }
  if (option.value === "midnight") {
    editor.setOption("theme", "midnight");
  }
});

//Cronometro
window.addEventListener("load", function () {
  const startTime = new Date().getTime();

  setInterval(function () {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;

    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

    const timeString =
      pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);

    document.getElementById("cronometro").textContent = timeString;
  }, 1000);
});

const pad = (num, size) => {
  let paddedNum = num.toString();
  while (paddedNum.length < size) paddedNum = "0" + paddedNum;
  return paddedNum;
};


//Abrir documento
document.addEventListener("DOMContentLoaded", function () {
  let fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", function (e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.addEventListener("load", function () {
      let content = reader.result;

      editor.setValue(content);
    });
    reader.readAsText(file);
  });
});


//Exportar documento
document.addEventListener('DOMContentLoaded', function () {
  let exportButton = document.getElementById('exportButton');
  exportButton.addEventListener('click', function () {
    let content = editor.getValue();
    let link = document.createElement('a');
    link.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(content);
    link.download = 'archivo.html';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});



//Limpiar
let textarea = document.getElementById('editor');
let clearButton = document.getElementById('clearButton');

clearButton.addEventListener('click', function () {
  editor.setValue(''); // Establece el contenido del editor como una cadena vacía
});


function reloadPage() {
  location.reload();
}



//Función boton imprimir
let btnImprimir = document.getElementById("btnImprimir");
btnImprimir.addEventListener("click", function () {
  let contenido = editor.getValue();
  imprimirContenido(contenido);
});

function imprimirContenido(contenido) {
  let contenidoImprimir = "<pre>" + escapeHTML(contenido) + "</pre>";
  let ventanaImpresion = window.open("", "_blank");
  ventanaImpresion.document.write(contenidoImprimir);
  ventanaImpresion.document.close();
  ventanaImpresion.print();
}

function escapeHTML(html) {
  return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

