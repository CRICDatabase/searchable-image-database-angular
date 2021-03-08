import { Router, ActivatedRoute, ParamMap } from "@angular/router";
import { Component, OnInit, Input, OnDestroy, AfterContentInit, AfterViewInit, AfterViewChecked, ViewChild } from "@angular/core";
import { DatePipe } from "@angular/common";

import { Subscription } from "rxjs";

import { environment } from "src/environments/environment";

import { ImagemService } from "src/app/services/imagens.service";
import { InjuriesService } from "src/app/services/injuries.service";
import { IImagemModelResultado } from "src/app/models/imagem/imagem.model";
import { IUsuarioBaseModel } from "src/app/models/usuario/usuario_base.model";
import { HttpStatusCode } from "src/app/utils/tratamento_erro/Http_Status_Code";
import { ChavesArmazenamentoBrowser } from "src/app/utils/chaves_armazenamento_browser";
import { IObjetoSessaoModel } from "src/app/models/autenticacao/objeto_sessao.model";
import { ILesaoModelResultado } from "src/app/models/imagem/lesao.model";
import { ArmazenamentoBrowser } from "src/app/utils/browser_storage/browser_storage";
import { ICelulaClassificadaModelResultado } from "src/app/models/classificacao/celula_classificada.model";
import { ObjetoErro } from "src/app/utils/tratamento_erro/ObjetoErro";
import { ComunicacaoApi } from "../../api_cric_database/comunicacao_api";
import { CadastrarClassificacaoRequisicao } from "./requisicao";
import { LesaoEntidade } from "./lesao.entidade";
import { Mensagens } from "src/app/utils/mensagens";
import { ImagemEntidade } from "./imagem.entidade";

declare const draw: any;
declare const exibirClassificacoes: any;
declare const obterLarguraAlturaAtualCanvas: any;
declare const canvas2file: any;

@Component({
    selector: "cr-classificar-imagem",
    templateUrl: "./classificar-imagem.component.html",
    styleUrls: ["./classificar-imagem.component.scss"],
    providers: [DatePipe]
})

export class ClassificarImagemComponent implements OnInit, OnDestroy {

    public schema = {
        "@context": "http://schema.org",
        "@type": "WebPage",
        "name": "CRIC Cervix Classification",
        "license": "https://creativecommons.org/licenses/by/4.0/"
    };

    public schema_sample = {
        "@context": "http://bioschemas.org",
        "@type": "Sample",
        "subjectOf": "http://database.cric.com.br/",
        "name": `CRIC Cervix Classification #undefined`
    };

    @ViewChild("delete_image_modal_close", { static: true }) modal_close: any;
    private armazenamentoBrowser: ArmazenamentoBrowser;
    private atualizarDadosImagemSubscription: Subscription;
    private cadastrarClassificacaoSubscription: Subscription;
    private comunicacaoApi: ComunicacaoApi;
    private excluirRegistroDeClassificacaoSubscription: Subscription;
    private listarClassificacoesDeCelulaSubscription: Subscription;
    private listarDescricoesSubscription: Subscription;
    private listarTodasLesoesSubscription: Subscription;
    private objetoErro: ObjetoErro;
    private obterUmaImagemSubscription: Subscription;
    private requisicao: CadastrarClassificacaoRequisicao;
    public atualizarInformacoes: boolean;
    public caminho_imagem: string;
    public carregando: boolean;
    public coord_x: number;
    public coord_y: number;
    public exibirModal: boolean;
    public id_imagem: number;
    public id_lesao: number;
    public imagem: IImagemModelResultado;
    public imagemAtualizacao: ImagemEntidade;
    public indiceSelecionado: number;
    public indiceSelecionadoPadrao: number;
    public lesao: LesaoEntidade;
    public objetoSessao: IObjetoSessaoModel;
    public permitirCadastroClassificacao: boolean;
    public todasClassificacoes: ICelulaClassificadaModelResultado[];
    public todasLesoes: ILesaoModelResultado[];
    public todosUsuarios: IUsuarioBaseModel[];
    public draw_label: boolean;
    public draw_augmentation: boolean;
    public playground: boolean;

    constructor(
        private router: Router,
        private imagemService: ImagemService,
        private injuriesService: InjuriesService,
        private activatedRoute: ActivatedRoute,
        public datepipe: DatePipe
    ) {
        this.playground = environment.playground === "true";
        this.comunicacaoApi = new ComunicacaoApi();
        this.requisicao = new CadastrarClassificacaoRequisicao();
        this.lesao = new LesaoEntidade();
        this.objetoErro = new ObjetoErro();
        this.indiceSelecionadoPadrao = -1;
        this.atualizarInformacoes = false;
        this.carregando = false;
        this.imagemAtualizacao = new ImagemEntidade();
        this.imagemAtualizacao.lesao = new LesaoEntidade();
        this.draw_label = true;
        this.draw_augmentation = true;
    }

    ngOnInit() {
        this.indiceSelecionado = this.indiceSelecionadoPadrao;
        this.exibirModal = false;
        this.permitirCadastroClassificacao = false;
        this.armazenamentoBrowser = new ArmazenamentoBrowser();
        this.objetoSessao = JSON.parse(this.armazenamentoBrowser.obterDadoSessao(ChavesArmazenamentoBrowser.CHAVE_USUARIO_LOGADO));

        this.activatedRoute.paramMap
            .subscribe((params: ParamMap) => {
                this.id_imagem = Number(params.get("id"));
                this.obterUmaImagem(this.id_imagem);

                this.schema_sample.name = `CRIC Cervix Classification #${this.id_imagem}`;
            });

        this.listarTodasLesoes();
    }

    ngOnDestroy() {
        if (this.obterUmaImagemSubscription) {
            this.obterUmaImagemSubscription.unsubscribe();
        }
        if (this.cadastrarClassificacaoSubscription) {
            this.cadastrarClassificacaoSubscription.unsubscribe();
        }
        if (this.listarTodasLesoesSubscription) {
            this.listarTodasLesoesSubscription.unsubscribe();
        }
        if (this.listarClassificacoesDeCelulaSubscription) {
            this.listarClassificacoesDeCelulaSubscription.unsubscribe();
        }
        if(this.excluirRegistroDeClassificacaoSubscription) {
            this.excluirRegistroDeClassificacaoSubscription.unsubscribe();
        }
        if(this.listarDescricoesSubscription) {
            this.listarDescricoesSubscription.unsubscribe();
        }
        if(this.atualizarDadosImagemSubscription) {
            this.atualizarDadosImagemSubscription.unsubscribe();
        }
    }

    registrarPonto($event) {
        this.carregando = true;
        const div = document.getElementById("canvas");
        const rect = div.getBoundingClientRect();
        this.coord_x = Math.round($event.clientX - rect.left);
        this.coord_y = Math.round($event.clientY - rect.top);

        const dimensoesCanvas = obterLarguraAlturaAtualCanvas();
        this.requisicao.coord_centro_nucleo_x = this.coord_x;
        this.requisicao.coord_centro_nucleo_y = this.coord_y;
        this.requisicao.alturaCanvas = dimensoesCanvas.altura;
        this.requisicao.larguraCanvas = dimensoesCanvas.largura;

        draw($event, this.coord_x, this.coord_y);
        this.exibirModal = true;
        this.carregando = false;
    }

    obterUmaImagem(id_imagem: number) {

        this.carregando = true;
        this.obterUmaImagemSubscription =
        this.imagemService.obterImagem(id_imagem)
            .subscribe(
                (retorno) => {
                    this.imagem = retorno;
                    this.caminho_imagem = `${this.comunicacaoApi.getImageURL()}/${this.imagem.nome}`;

                    setTimeout(
                        () => {
                            this.listarClassificacoesDeCelula(this.id_imagem);
                        },
                        500
                    );
                    this.carregando = false;
                },
                (erro) => {
                    this.carregando = false;
                    this.objetoErro = erro.error;

                    switch(this.objetoErro.status) {

                    case HttpStatusCode.UNAUTHORIZED:
                    case HttpStatusCode.BAD_REQUEST:
                    case HttpStatusCode.NOT_FOUND:
                    case HttpStatusCode.FORBIDDEN:
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

    async cadastrarClassificacao() {

        this.carregando = true;
        this.exibirModal = false;
        this.requisicao.id_lesao = Number(this.id_lesao);
        this.requisicao.alturaOriginalImg = this.imagem.altura;
        this.requisicao.larguraOriginalImg = this.imagem.largura;

        this.cadastrarClassificacaoSubscription =
        this.imagemService.cadastrarClassificacao(this.id_imagem, this.objetoSessao.id_usuario, this.requisicao)
            .subscribe(
                (retorno) => {
                    this.indiceSelecionado = -1;
                    this.listarClassificacoesDeCelula(this.imagem.id);
                    this.carregando = false;
                    console.log("Classification saved");
                },
                (erro) => {
                    this.carregando = false;
                    this.objetoErro = erro.error;

                    switch(this.objetoErro.status) {

                        case HttpStatusCode.UNAUTHORIZED:
                        case HttpStatusCode.BAD_REQUEST:
                        case HttpStatusCode.NOT_FOUND:
                        case HttpStatusCode.FORBIDDEN:
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

    listarClassificacoesDeCelula(id_imagem: number) {
        let user_id;

        if(this.objetoSessao){
            user_id = this.objetoSessao.id_usuario;
        }
        else{
            user_id = 1;
        }

        this.carregando = true;

        this.listarClassificacoesDeCelulaSubscription =
        this.imagemService.listarClassificacoesCelula(id_imagem, user_id)
            .subscribe(
                (retorno) => {
                    this.todasClassificacoes = retorno;
                    exibirClassificacoes(this.todasClassificacoes, this.indiceSelecionado, this.draw_label);
                    this.carregando = false;
                },
                (erro) => {
                    this.carregando = false;
                    this.objetoErro = erro.error;

                    switch(this.objetoErro.status) {

                    case HttpStatusCode.UNAUTHORIZED:
                    case HttpStatusCode.BAD_REQUEST:
                    case HttpStatusCode.NOT_FOUND:
                    case HttpStatusCode.FORBIDDEN:
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

    exibirClassificacoesFormaSeletiva() {

        if(this.indiceSelecionado != this.indiceSelecionadoPadrao) {
            this.draw_augmentation = true;
            this.draw_label = true;
            this.lesao.id = this.todasClassificacoes[this.indiceSelecionado].lesao.id;
            this.lesao.nome = this.todasClassificacoes[this.indiceSelecionado].lesao.nome;
            this.lesao.detalhes = this.todasClassificacoes[this.indiceSelecionado].lesao.detalhes;
        }

        exibirClassificacoes(this.todasClassificacoes, Number(this.indiceSelecionado), this.draw_label);
    }

    permitirCadastro(valor: boolean) {
        this.permitirCadastroClassificacao = valor;
    }

    solicitarAtualizacaoDeDados() {

        this.imagemAtualizacao.codigo_lamina = this.imagem.codigo_lamina;
        this.imagemAtualizacao.lesao.nome = this.imagem.lesao.nome;
        this.imagemAtualizacao.lesao.id = this.imagem.lesao.id;
        this.imagemAtualizacao.dt_aquisicao = this.imagem.dt_aquisicao;
        this.atualizarInformacoes = true;
    }

    cancelarAtualizacao() {
        this.atualizarInformacoes = false;
    }

    atualizarClassificacao(indiceSelecionado) {

        this.carregando = true;
        const houveMudanca =
            this.lesao.id != this.todasClassificacoes[indiceSelecionado].lesao.id;

        if(houveMudanca) {
            const requisicao = {
                id_lesao_celula: this.lesao.id,
            };

            this.atualizarDadosImagemSubscription =
                this.imagemService.atualizarClassificacao(
                    this.imagem.id,
                    this.todasClassificacoes[indiceSelecionado].id,
                    requisicao
                )
                .subscribe(
                    (retorno) => {
                        this.listarClassificacoesDeCelula(this.imagem.id);
                        this.carregando = false;
                        this.atualizarInformacoes = false;
                    },
                    (erro) => {
                        this.carregando = false;
                        this.objetoErro = erro.error;

                        switch(this.objetoErro.status) {

                        case HttpStatusCode.UNAUTHORIZED:
                        case HttpStatusCode.BAD_REQUEST:
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
        else{
            this.carregando = false;
            this.atualizarInformacoes = false;
            console.log("No one change made");
        }
    }

    excluitClassificacao(indiceSelecionado: number) {

        this.carregando = true;
        if(confirm(Mensagens.EXCLUIR_CLASSIFICACAO)) {

            const parametrosRequisicao = {
                id_imagem: this.id_imagem,
                id_celula: this.todasClassificacoes[indiceSelecionado].id,
            };

            this.excluirRegistroDeClassificacaoSubscription =
            this.imagemService.excluirRegistroDeClassificacao(parametrosRequisicao)
                .subscribe(
                    (retorno) => {
                        this.listarClassificacoesDeCelula(this.imagem.id);
                        this.indiceSelecionado = -1;
                        exibirClassificacoes(this.todasClassificacoes);
                        this.carregando = false;
                    },
                    (erro) => {
                        this.carregando = false;
                        this.objetoErro = erro.error;

                        switch(this.objetoErro.status) {

                        case HttpStatusCode.UNAUTHORIZED:
                        case HttpStatusCode.BAD_REQUEST:
                        case HttpStatusCode.NOT_FOUND:
                        case HttpStatusCode.FORBIDDEN:
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
        else {
            this.carregando = false;
        }
    }

    save_image() {
        canvas2file(`cric_${this.id_imagem}.png`);  /* see canvas.js */
    }

    save_json() {
        var classifications_array = [];
        
        classifications_array.push({
            image_id: this.imagem.id,
            image_doi: this.imagem.doi,
            image_name: this.imagem.nome,
            classifications: this.todasClassificacoes.map(
                (item) => {
                    return {
                        cell_id: item.id,
                        bethesda_system: item.lesao.nome,
                        nucleus_x: item.coord_centro_nucleo_x,
                        nucleus_y: item.coord_centro_nucleo_y
                    };
                }
            )
        });

        this.save_file(
            JSON.stringify(classifications_array),
            `cric_${this.id_imagem}_classification.json`
        )
    }

    save_csv() {
        var classifications_csv_string = "image_id,image_filename,image_doi,cell_id,bethesda_system,nucleus_x,nucleus_y\n";

        this.todasClassificacoes.forEach(
            (item) => {
                classifications_csv_string = classifications_csv_string + `${this.imagem.id},${this.imagem.nome},${this.imagem.doi},${item.id},${item.lesao.nome},${item.coord_centro_nucleo_x},${item.coord_centro_nucleo_y}\n`;
            }
        );

        this.save_file(
            classifications_csv_string,
            `cric_${this.id_imagem}_classification.csv`
        )
    }

    save_file(data, filename) {
        var file_a = document.createElement('a');
        file_a.setAttribute(
            'href',
            'data:text/plain;charset=utf-8,' + encodeURIComponent(data)
        );
        file_a.setAttribute(
            'download',
            filename
        );

        file_a.style.display = 'none';
        document.body.appendChild(file_a);

        file_a.click();

        document.body.removeChild(file_a);
    }

    delete_image() {
        this.carregando = true;
        
        this.imagemService.delete_image(this.id_imagem)
            .subscribe(
                () => {
                    this.carregando = false;
                    this.modal_close.nativeElement.click();

                    this.router.navigate(
                        [
                            "/classification/"
                        ]
                    );
                },
                (err) => {
                    switch(err.status) {

                    case HttpStatusCode.UNAUTHORIZED:
                    case HttpStatusCode.BAD_REQUEST:
                    case HttpStatusCode.NOT_FOUND:
                    case HttpStatusCode.FORBIDDEN:
                    case HttpStatusCode.INTERNAL_SERVER_ERROR: {
                        console.log(err.message);
                        break;
                    }

                    default: {
                        console.log(err);
                        break;
                    }
                    }

                    this.carregando = false;
                    this.modal_close.nativeElement.click();
                }
            );
    }

    toggle_approve_image() {
        if (this.imagem.classificacao_aprovada) {
            this.imagemService.unapprove_image(this.id_imagem)
                .subscribe(
                    () => {
                        this.imagem.classificacao_aprovada = false;
                    },
                    (err) => {
                        switch(err.status) {

                            case HttpStatusCode.UNAUTHORIZED:
                            case HttpStatusCode.BAD_REQUEST:
                            case HttpStatusCode.NOT_FOUND:
                            case HttpStatusCode.FORBIDDEN:
                            case HttpStatusCode.INTERNAL_SERVER_ERROR: {
                                console.log(err.message);
                                break;
                            }

                            default: {
                                console.log(err);
                                break;
                            }
                        }
                    }
                );
        }
        else {
            this.imagemService.approve_image(this.id_imagem)
                .subscribe(
                    () => {
                        this.imagem.classificacao_aprovada = true;
                    },
                    (err) => {
                        switch(err.status) {

                            case HttpStatusCode.UNAUTHORIZED:
                            case HttpStatusCode.BAD_REQUEST:
                            case HttpStatusCode.NOT_FOUND:
                            case HttpStatusCode.FORBIDDEN:
                            case HttpStatusCode.INTERNAL_SERVER_ERROR: {
                                console.log(err.message);
                                break;
                            }

                            default: {
                                console.log(err);
                                break;
                            }
                        }
                    }
                );
        }
    }

    toggle_augmentation() {
        this.draw_augmentation = !this.draw_augmentation;
        let idx;

        if (this.draw_augmentation) {
            idx = this.indiceSelecionado;
            this.draw_label = true;
        }
        else {
            idx = null;
            this.draw_label = false;

        }
        
        exibirClassificacoes(this.todasClassificacoes, idx, this.draw_label);
    }

    toggle_label() {
        if (this.draw_augmentation) {
            this.draw_label = !this.draw_label;
            exibirClassificacoes(this.todasClassificacoes, this.indiceSelecionado, this.draw_label);
        }
    }
}
