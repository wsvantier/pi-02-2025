async function listarUsuarios(){

    const tabela = document.getElementById('usuarios')
    tabela.innerHTML = ''

    let req = await fetch('/admin/usuarios')
    const dados = await req.json()

    dados.forEach( e => {
        
        let linha = document.createElement('tr')
        linha.innerHTML = `
        <td> ${e.user} </td>
        <td> ${e.nome} </td>
        <td> ${e.tipo} </td>
        <td> <a href="/admin/delete/${e.id}"> Excluir </a>
 </td>
        `
        tabela.appendChild(linha)

    });
    
    

}