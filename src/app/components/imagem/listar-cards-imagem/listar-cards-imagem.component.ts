import { Component, OnInit, Input, OnDestroy, AfterContentInit } from "@angular/core";
import { Router } from "@angular/router";

import { Subscription } from "rxjs";

import { HttpStatusCode } from "src/app/utils/tratamento_erro/Http_Status_Code";

import { ArmazenamentoBrowser } from "src/app/utils/browser_storage/browser_storage";
import { ChavesArmazenamentoBrowser } from "src/app/utils/chaves_armazenamento_browser";
import { IObjetoSessaoModel } from "src/app/models/autenticacao/objeto_sessao.model";

import { ICelulaClassificadaModelResultado } from "src/app/models/classificacao/celula_classificada.model";
import { IImagemModelResultado } from "src/app/models/imagem/imagem.model";
import { ILesaoModelResultado } from "src/app/models/imagem/lesao.model";

import { ImagemService } from "src/app/services/imagens.service";
import { InjuriesService } from "src/app/services/injuries.service";

import { ObjetoErro } from "src/app/utils/tratamento_erro/ObjetoErro";

import { PaginaImagemEntidade } from "./pagina_imagem.entidede";

@Component({
    selector: "cr-listar-cards-imagem",
    templateUrl: "./listar-cards-imagem.component.html",
    styleUrls: ["./listar-cards-imagem.component.scss"]
})

export class ListarCardsImagemComponent implements OnInit, OnDestroy, AfterContentInit {

    @Input() todasImagens: IImagemModelResultado[];
    public filteredImages: Array<PaginaImagemEntidade>;
    public paginaDeImagens: Array<PaginaImagemEntidade>;
    @Input() segmentationDatabase = false;
    @Input() classificationDatabase = false;
    @Input() carregando: boolean;
    private armazenamentoBrowser: ArmazenamentoBrowser;
    public objetoSessao: IObjetoSessaoModel;
    public Imagem: IImagemModelResultado;
    private paginaSelecionada: number;
    private limiteInferiorIndice: number;
    private numeroImagensPorPagina: number; // Determina a quantidade de registros que cada pagina ira conter
    public totalPaginas: number;
    public desabilitarAvancarPagina: boolean;
    public desabilitarVoltarPagina: boolean;
    public paginacaoSuave: boolean;
    public tamanhoArrayImagens: number;
    public being_filtered: boolean;
    public filter_slide: string;
    public filter_doi: string;
    public filter_injury: number;
    private objetoErro: ObjetoErro;
    private listarTodasDescricoesSubscription: Subscription;
    private listarTodasLesoesSubscription: Subscription;
    public todasClassificacoes: ICelulaClassificadaModelResultado[];
    public todasLesoes: ILesaoModelResultado[];

    constructor(private router: Router, private imagemService: ImagemService, private injuriesService: InjuriesService) {
        this.paginaSelecionada = 1;
        this.limiteInferiorIndice = 1;
        this.numeroImagensPorPagina = 12;  /* due Bootstrap grid layout */
        this.tamanhoArrayImagens = 0;
        this.desabilitarAvancarPagina = true;
        this.desabilitarVoltarPagina = true;
        this.filteredImages = new Array<PaginaImagemEntidade>();
        this.paginaDeImagens = new Array<PaginaImagemEntidade>();
        this.being_filtered = false;
        this.filter_slide = undefined;
        this.filter_doi = undefined;
        this.filter_injury = undefined;
    }

    ngOnInit() {
        this.armazenamentoBrowser = new ArmazenamentoBrowser();
        this.objetoSessao = JSON.parse(this.armazenamentoBrowser.obterDadoSessao(ChavesArmazenamentoBrowser.CHAVE_USUARIO_LOGADO));
        this.listarTodasLesoes();
    }

    ngAfterContentInit(): void {
        setTimeout(
            () => {
                this.criarPagina(this.paginaSelecionada);
            },
            250
        );
    }

    ngOnDestroy() {
        if (this.listarTodasLesoesSubscription) {
            this.listarTodasLesoesSubscription.unsubscribe();
        }
    }

    listarTodasLesoes() {

        this.carregando = true;
        this.listarTodasLesoesSubscription =
        this.injuriesService.listarLesoes()
            .subscribe(
                (retorno) => {
                    this.todasLesoes = retorno;
                    this.carregando = false;
                },
                (erro) => {
                    this.carregando = false;
                    this.objetoErro = erro.error;

                    switch(this.objetoErro.status) {

                    case HttpStatusCode.UNAUTHORIZED:
                    case HttpStatusCode.NOT_FOUND:
                    case HttpStatusCode.INTERNAL_SERVER_ERROR: {
                        console.log(this.objetoErro.mensagem);
                        break;
                    }

                    default: {
                        console.log(erro);
                        break;
                    }
                    }
                }
            );
    }

    detalheDeUmaImagem(event, img) {
        if (event.view.getSelection().type !== "Range") {
            event.preventDefault();

            this.router.navigate(
                [
                    this.detalheDeUmaImagemURL(img)
                ]
            ).then(
                ()=>{
                    window.location.hash="#dashboard";
                }
            );
        }
    }

    detalheDeUmaImagemURL(img) {
        this.Imagem = img;
        let route;
        if (this.classificationDatabase) {
            route = "classification/image/";
        }
        if (this.segmentationDatabase) {
            route = "segmentation/image/";
        }

        return `${route}${this.Imagem.id}`;
    }

    proximaPagina(evento) {

        evento.preventDefault();
        if(this.paginaSelecionada < this.totalPaginas) {
            this.paginaSelecionada = this.paginaSelecionada + 1;

            this.criarPagina(this.paginaSelecionada);
        }
    }

    paginaAnterior(evento) {

        evento.preventDefault();
        if (this.paginaSelecionada > this.limiteInferiorIndice) {
            this.paginaSelecionada = this.paginaSelecionada - 1;

            this.criarPagina(this.paginaSelecionada);
        }
    }

    criarPagina(paginaSelecionada: number) {
        let set_of_images;
        if (this.being_filtered) {
            set_of_images = this.filteredImages;
        }
        else {
            set_of_images = this.todasImagens;
        }

        if (set_of_images) {
            this.paginaSelecionada = paginaSelecionada;

            this.tamanhoArrayImagens = set_of_images.length;
            this.removerElementosDaPagina();

            if (this.tamanhoArrayImagens === 0) {
                this.totalPaginas = 1;
            }
            else {
                this.totalPaginas = Math.ceil(this.tamanhoArrayImagens / this.numeroImagensPorPagina);
            }

            const inicio = (this.paginaSelecionada - 1) * this.numeroImagensPorPagina;
            let limite;
            if (this.totalPaginas === this.paginaSelecionada) {
                limite = this.tamanhoArrayImagens;
            }
            else {
                limite = this.paginaSelecionada * this.numeroImagensPorPagina;
            }

            for (let i = inicio, j = 0; i < limite; i++, j++) {
                this.paginaDeImagens.push(set_of_images[i]);
            }

            if (this.paginaSelecionada > this.limiteInferiorIndice) {
                this.desabilitarVoltarPagina = false;
            }
            else {
                this.desabilitarVoltarPagina = true;
            }

            if(this.paginaSelecionada < this.totalPaginas) {
                this.desabilitarAvancarPagina = false;
            }
            else {
                this.desabilitarAvancarPagina = true;
            }
        }
        else {
            setTimeout(() => {
                this.criarPagina(this.paginaSelecionada);
            }, 200);
        }
    }

    filterImages() {
        this.being_filtered = true;

        this.filteredImages.splice(0, this.filteredImages.length);

        const filter_injury = Number(this.filter_injury);

        for (const image of this.todasImagens) {
            if (this.filter_slide != undefined && image.codigo_lamina.includes(this.filter_slide)) {
                this.filteredImages.push(
                    image
                );
                continue;
            }

            if (this.filter_doi != undefined && image.doi != undefined && image.doi.includes(this.filter_doi)) {
                this.filteredImages.push(
                    image
                );
                continue;
            }

            if (filter_injury != NaN && filter_injury === image.lesao.id) {
                this.filteredImages.push(
                    image
                );
                continue;
            }
        }
        this.criarPagina(1);
    }

    resetFilterImages() {
        this.being_filtered = false;

        this.filter_slide = undefined;
        this.filter_doi = undefined;
        this.filter_injury = undefined;

        this.criarPagina(1);
    }

    removerElementosDaPagina() {
        if (this.paginaDeImagens) {
            this.paginaDeImagens.splice(0, this.paginaDeImagens.length);
        }
    }

    atualizarPagina() {
        if(this.todasImagens && this.tamanhoArrayImagens != this.todasImagens.length) {
            this.criarPagina(this.paginaSelecionada);
        }
        else{
            setTimeout(() => {
                this.atualizarPagina();
            }, 200);
        }
    }
}
