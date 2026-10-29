import { requisicao } from './api'

export function buscarPerfil() {
  return requisicao('/usuarios/perfil')
}

export function atualizarPerfil(nome) {
  return requisicao('/usuarios/perfil', { metodo: 'PUT', corpo: { nome } })
}

export function alterarSenha(senhaAtual, senhaNova) {
  return requisicao('/usuarios/senha', {
    metodo: 'PUT',
    corpo: { senha_atual: senhaAtual, senha_nova: senhaNova },
  })
}