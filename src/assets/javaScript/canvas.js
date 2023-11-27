function obterLarguraAlturaAtualCanvas() {
    var canvas = document.getElementById('canvas');
    return {
        altura: canvas.offsetHeight,
        largura: canvas.offsetWidth
    };
}

function draw(event, coord_click_x, coord_click_y) { // Método de classificação

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    let novoX = (coord_click_x * canvas.width) / canvas.offsetWidth;
    let novoY = (coord_click_y * canvas.height) / canvas.offsetHeight;

    const largura = 100;
    const altura = 100;
    const inicio_desenho_x = novoX - Math.round(largura / 2);
    const inicio_desenho_y = novoY - Math.round(altura / 2);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(inicio_desenho_x, inicio_desenho_y, largura, altura);
    ctx.stroke();
}

function draw_classification(
    ctx,
    classication,
    draw_label
) {
    const largura = 100;
    const altura = 100;
    const color = obterCorDaLesao(classication.lesao.id);

    ctx.beginPath();

    ctx.strokeStyle = color;

    inicio_desenho_x = Math.round(classication.coord_centro_nucleo_x) - Math.round(largura / 2);
    inicio_desenho_y = Math.round(classication.coord_centro_nucleo_y) - Math.round(altura / 2);

    if (draw_label) {
        ctx.font = "30px Arial";
        ctx.fillStyle = color;
        ctx.fillText(
            classication.id,
            classication.coord_centro_nucleo_x,
            classication.coord_centro_nucleo_y
        );
    }

    ctx.strokeRect(inicio_desenho_x, inicio_desenho_y, largura, altura);
    ctx.stroke();
}

function exibirClassificacoes(classificacoes, indice = -1, draw_label) {
    var canvas = document.getElementById('canvas');
    const rect = canvas.getBoundingClientRect();
    var ctx = canvas.getContext('2d');

    ctx.lineWidth = 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add scale to canvas
    // TODO: Get scale from database
    ctx.fillStyle = 'black';
    ctx.fillRect(  // places its top-left corner at (10, 10), and gives it a size of 10 units wide by 100 tall
        10,
        10,
        300,
        10
    );
    ctx.font = '24px serif';
    ctx.textAlign="center";
    ctx.fillText(
        "2 inch",
        10 + (300 / 2),  // mid of scale bar
        10 + 10 + 24  // bellow scale bar
    );

    const largura = 100;
    const altura = 100;

    var i, j, inicio_desenho_x, inicio_desenho_y;

    if (indice !== null) {
        if (indice === -1) {
            for (const cell of classificacoes) {
                draw_classification(
                    ctx,
                    cell,
                    draw_label
                );
            }
        }
        else {
            draw_classification(
                ctx,
                classificacoes[indice],
                draw_label
            );
        }
    }
}

var canvas; // Guarda a referência do container do canvas no html
var ctx; // Guarda a referência do contexto 2D que o canvas usa para manipular os atributos e métodos do canvas
var x, y; // Armazena a posição corrente do mouse enquanto desenha, após o término do desenho a posição final fica armazenada
var color = 'red'; // Armazena a cor de acordo com o tipo de classificação
var segmentos = []; // Armazena todos os pontos, cordenadas X e Y de cada ponto
var pontosDesenhados = []; // Armazena os pontos do desenho desde o clique até o usuário soltar o mouse

var xInicio, yInicio; // Armazena a coordenada de início do desenho da segmentação

var modal = false;


function editColor(cor) {
    color = cor;
}

function initCanvas(imagem) {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    var desenhando;

    canvas.onmousedown = function (e) {
        var rect = canvas.getBoundingClientRect();

        xInicio = Math.round(e.clientX - rect.left);
        yInicio = Math.round(e.clientY - rect.top);

        let novoX = Math.round((xInicio * canvas.width) / canvas.offsetWidth);
        let novoY = Math.round((yInicio * canvas.height) / canvas.offsetHeight);

        pontosDesenhados.push({ coord_x: novoX, coord_y: novoY });
        ctx.lineWidth = 1;
        desenhando = true;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(novoX, novoY);
    };

    canvas.onmousemove = function (e) {
        var rect = canvas.getBoundingClientRect();
        if (desenhando) {
            x = Math.round(e.clientX - rect.left);
            y = Math.round(e.clientY - rect.top);

            let novoX = Math.round((x * canvas.width) / canvas.offsetWidth);
            let novoY = Math.round((y * canvas.height) / canvas.offsetHeight);

            ctx.lineTo(novoX, novoY);

            ctx.stroke();
            pontosDesenhados.push({ coord_x: novoX, coord_y: novoY });
        }
    };

    canvas.onmouseup = function (e) {
        desenhando = false;

        let novoX = Math.round((xInicio * canvas.width) / canvas.offsetWidth);
        let novoY = Math.round((yInicio * canvas.height) / canvas.offsetHeight);

        let XFinal = Math.round((x * canvas.width) / canvas.offsetWidth);
        let YFinal = Math.round((y * canvas.height) / canvas.offsetHeight);

        ctx.lineTo(novoX, novoY);


        if (pontosDesenhados.length > 10) {

            calculoPontosDentroDeReta(XFinal, YFinal, novoX, novoY);
            ctx.stroke();
            ctx = canvas.getContext('2d');
            segmentos.push(pontosDesenhados);
            modal = true;
        }
        pontosDesenhados = [];
    };
};

function calculoPontosDentroDeReta(x0, y0, x1, y1) {
    var dx = Math.abs(x1 - x0),
        sx = x0 < x1 ? 1 : -1;
    var dy = Math.abs(y1 - y0),
        sy = y0 < y1 ? 1 : -1;
    var err = (dx > dy ? dx : -dy) / 2;
    while (true) {
        pontosDesenhados.push({ coord_x: x0, coord_y: y0 });

        if (x0 === x1 && y0 === y1) break;
        var e2 = err;
        if (e2 > -dx) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dy) {
            err += dx;
            y0 += sy;
        }
    }
}

function getModal() {
    return modal;
}

function setModal(estado) {
    modal = estado;
}

function getPontos() {
    return segmentos;
}

function setPontos(ponto) {
    segmentos = ponto;
}

function limparSegmentacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function limparVetorSegmentos() {
    segmentos = [];
}

function draw_segmentation(
    ctx,
    cell,
    label = true
) {
    
    if(label) {
        ctx.beginPath();
        ctx.font = "30px Arial";
        ctx.fillText(
            String(cell.id),
            cell.segmentos_citoplasma[0].coord_x,
            cell.segmentos_citoplasma[0].coord_y
        );
    }

    ctx.beginPath();
    for (const point of cell.segmentos_citoplasma) {
        ctx.lineTo(
            point.coord_x,
            point.coord_y
        );
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    for (const point of cell.segmentos_nucleo) {
        ctx.lineTo(
            point.coord_x,
            point.coord_y
        );
    }
    ctx.closePath();
    ctx.stroke();
}

function exibirSegmentacoes(segmentacoes, indice = -1, label = true) {

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0000ff';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";

    if (indice == -1) {

        for (const cell of  segmentacoes.celulas) {
            draw_segmentation(
                ctx,
                cell,
                label
            )
        }
    }
    else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw_segmentation(
            ctx,
            segmentacoes.celulas[indice],
            label
        )
    }
}

function obterCorDaLesao(seed) {
    const seed_hash = seed % 10;

    switch(seed_hash) {
    case 0:
        return "#023eff";
    case 1:
        return "#ff7c00";
    case 2:
        return "#1ac938";
    case 3:
        return "#e8000b";
    case 4:
        return "#8b2be2";
    case 5:
        return "#9f4800";
    case 6:
        return "#f14cc1";
    case 7:
        return "#a3a3a3";
    case 8:
        return "#ffc400";
    case 9:
        return "#00d7ff";
    }
}

function canvas2file(filename){
    /* Based on https://stackoverflow.com/a/6957155/1802726 */
    var canvas = document.getElementById("canvas");
    var tmp_canvas = document.createElement('canvas');
    var img = document.createElement('img');
    var anchor = document.createElement('a');

    var ctx = tmp_canvas.getContext ? tmp_canvas.getContext('2d') : null;

    tmp_canvas.width = canvas.width;
    tmp_canvas.height = canvas.height;

    img.onload = function () {
        ctx.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.drawImage(
            canvas,
            0,
            0,
            canvas.width,
            canvas.height
        );

        anchor.setAttribute('href', tmp_canvas.toDataURL(
            "image/png"
        ));
        anchor.setAttribute(
            'download',
            filename
        );
        anchor.click()
    };

    img.src = canvas.style.backgroundImage.substr(
        5,  /* start, after url(" */
        canvas.style.backgroundImage.length - 7
    );
}
