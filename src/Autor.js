import React, { Component } from 'react';
import InputCustom from './components/InputCustom'
import ButtonCustom from './components/ButtonCustom'
import '../css/pure-min.css'
import '../css/side-menu.css'
import './App.css';
import $ from 'jquery';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioAutor extends Component {
  constructor() {
    super();
    this.state = {nome:'', email:'', senha:''};
    this.enviaForm = this.enviaForm.bind(this);
    this.setNome = this.setNome.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setSenha = this.setSenha.bind(this);

  }

  setNome(event){
    this.setState({nome: event.target.value});
  }

  setEmail(event){
    this.setState({email: event.target.value});
  }

  setSenha(event){
    this.setState({senha: event.target.value});
  }

  enviaForm(event) {
    event.preventDefault();
    console.log('dados sendo enviados');
    $.ajax({
      url:'http://viacep.com.br/ws/'+09861160+'/json/?callback=callback_name',
      //url: 'https://cdc-react.herokuapp.com/api/autores',
      contentType: 'application/json',
      dataType: 'jsonp',
      type: 'post',
      data: JSON.stringify({nome:this.state.nome, email:this.state.email, senha:this.state.senha}),
      success: function(novaListagem){
        console.log('enviado com sucesso');
        PubSub.publish('atualiza-listagem-autores', novaListagem)
        this.setState({nome:'',email:'',senha:''});
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




  render() {
    return(


      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned"
              onSubmit={this.enviaForm(09861160)}>
          <InputCustom label="Nome"
                       id="nome"
                       type="text"
                       name="nome"
                       value={this.state.nome}
                       onChange={this.setNome}
          />
          <InputCustom label="Email"
                       id="email"
                       type="email"
                       name="email"
                       value={this.state.email}
                       onChange={this.setEmail}
          />

          <InputCustom label="Senha"
                       id="senha"
                       type="password"
                       name="senha"
                       value={this.state.senha}
                       onChange={this.setSenha}
          />
          <ButtonCustom value="Gravar"/>
        </form>
      </div>
    );
  }

}

class TabelaAutores extends Component {

  render() {
    return(
      <div>
        <table className="pure-table">
          <thead>
          <tr>
            <th>Nome</th>
            <th>email</th>
          </tr>
          </thead>
          <tbody>
          {
            this.props.lista.map(function (autor) {
              return (
                <tr key={autor.id}>
                  <td>{autor.nome}</td>
                  <td>{autor.email}</td>
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
export default class AutorBox extends Component{

  constructor() {
    super();
    this.state = {lista : []};
  }

  componentDidMount() {
    $.ajax({
      url:'http://localhost:8080/api/autores',
      //url: 'https://cdc-react.herokuapp.com/api/autores',
        dataType: 'json',
        success: function (resposta) {
          this.setState({lista: resposta});
        }.bind(this)
      }
    );
    PubSub.subscribe('atualiza-listagem-autores',function(topico,novaLista){
      this.setState({lista:novaLista});
    }.bind(this));
  }

  render() {
    return(
      <div>
        <div className="header">
          <h1>Cadastro de autores</h1>
        </div>
        <div className="content" id="content">
          <FormularioAutor/>
          <TabelaAutores lista={this.state.lista}/>
        </div>
      </div>
    );
  }
}
