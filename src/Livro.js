import React, { Component } from 'react';
import InputCustom from './components/InputCustom'
import ButtonCustom from './components/ButtonCustom'
import '../css/pure-min.css'
import '../css/side-menu.css'
import './App.css';
import $ from 'jquery';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';



class FormularioLivro extends Component {

  constructor() {
    super();
    this.state = {titulo:'', preco:'', autorId:''};
    this.enviaForm = this.enviaForm.bind(this);
    this.setTitulo = this.setTitulo.bind(this);
    this.setPreco = this.setPreco.bind(this);
    this.setAutorId = this.setAutorId.bind(this);

  }

  setTitulo(event){
    this.setState({titulo: event.target.value});
  }

  setPreco(event){
    this.setState({preco: event.target.value});
  }

  setAutorId(event){
    this.setState({autorId: event.target.value});
  }

  enviaForm(event) {
    event.preventDefault();
    console.log('dados sendo enviados');
    $.ajax({
      //url:'http://localhost:8080/api/livros',
      url: 'https://cdc-react.herokuapp.com/api/livros',
      contentType: 'application/json',
      dataType: 'json',
      type: 'post',
      data: JSON.stringify({titulo: this.state.titulo, preco: this.state.preco, autorId:this.state.autorId}),
      success: function(novaListagem){
        console.log('enviado com sucesso');
        PubSub.publish('atualiza-listagem-livros', novaListagem)
        this.setState({titulo:'',preco:'',autorId:''});
      }.bind(this),
      error: function(response){
        if(response.status === 400) {
          new TratadorErros().publicaErros(response.responseJSON);
        }
      },
      beforeSend: function(){
        PubSub.publish("limpa-erros",{});
      }
    })
  }


  render(){
    return(
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned"
              onSubmit={this.enviaForm}>
          <InputCustom label="Título"
                       id="titulo"
                       type="text"
                       name="titulo"
                       value={this.state.titulo}
                       onChange={this.setTitulo}
          />

          <InputCustom label="Preço"
                       id="preco"
                       type="text"
                       name="preco"
                       value={this.state.preco}
                       onChange={this.setPreco}
          />
          <div className="pure-control-group">
            <label htmlFor="autorId">Autor</label>
            <select value={this.state.autorId} name="autorId" id="autorID" onChange={this.setAutorId}>
              <option value="">Selecione autor</option>
              {
                this.props.autores.map(function(autor){
                  return <option key={autor.id} value={autor.id}>{autor.nome}</option>;
                })
              }
            </select>
            </div>

          <ButtonCustom value="Gravar"/>

        </form>
      </div>
    );
  }
}

class TabelaLivros extends Component {

  render() {
    return(
      <div>
        <table className="pure-table">
          <thead>
          <tr>
            <th>Título</th>
            <th>Preço</th>
            <th>Autor</th>
          </tr>
          </thead>
          <tbody>
          {
            this.props.lista.map(function (livro) {
              return (
                <tr key={livro.id}>
                  <td>{livro.titulo}</td>
                  <td>{livro.preco}</td>
                  <td>{livro.autor.nome}</td>
                </tr>
              );
            })
          }
          </tbody>
        </table>
      </div>
    );
  }

}

export default class LivroBox extends Component {
  constructor() {
    super();
    this.state = {lista : [], autores: []};
  }

  componentDidMount() {
    $.ajax({
        //url:'http://localhost:8080/api/livros',
        url: 'https://cdc-react.herokuapp.com/api/livros',
        dataType: 'json',
        success: function (resposta) {
          this.setState({lista: resposta});
        }.bind(this)
      }
    );
    $.ajax({
      url: 'https://cdc-react.herokuapp.com/api/autores',
        dataType: 'json',
        success:function(resposta){

          this.setState({autores:resposta});
        }.bind(this)
      }
    );

    PubSub.subscribe('atualiza-listagem-livros',function(topico,novaLista){
      this.setState({lista:novaLista});
    }.bind(this));


  }

  render() {
    return(
      <div>
        <div className="header">
          <h1>Cadastro de livros</h1>
        </div>
        <div className="content" id="content">
          <FormularioLivro autores={this.state.autores}/>
          <TabelaLivros lista={this.state.lista}/>
        </div>
      </div>
    );
  }

}

