# Horarios-do-BSI-UNIRIO-Server

## Servidor MCP para disponibilização de horários das disciplinas de BSI do período vigente

Repositório de servidor MCP que disponibiliza a planilha de horários do período vigente do curso de BSI da UNIRIO, e também permite a criação de uma tabela com matérias especificadas pelo usuário (em html)

É utilizada a biblioteca Puppeteer para buscar a versão mais atual da planilha de horários do curso de Bacharelado de Sistemas de Informação da UNIRIO diretamente do site do curso e salvá-la no computador do usuário. 

A partir desse arquivo o servidor converte a tabela para um JSON salvo em memória que pode ser disponibilizada para qualquer agente de IA, sem que o mesmo precise de permissão para acessar as pastas do computador do usuário.

O servidor também auxilia na criação de uma tabela customizada com os horários das matérias que o usuário definir, função pensada para o estudante de BSI montar sua tabela com as matérias que irá cursar no período

## Tools 🔧

### 1. Horarios BSI

Expõe a planilha com informações sobre os horários das aulas do curso de BSI como um objeto JSON através da tool

### 2. Tabela de matérias BSI

auxilia o modelo de Inteligência Artificial na geração de uma tabela em HTML de disciplinas definidas pelo usuário do curso de BSI da UNIRIO, com os dias, horários e salas em que as disciplinas vão ser lecionadas.

* Sampling : realiza a requisição ao cliente MCP pedindo a utilização do modelo de Inteligência Artificial para geração do código html da tabela com o horário das disciplinas definidas pelo usuário.

## Instalação 💾 

para instalar clone o repositório e adicione o servidor nas configurações do seu agente de IA.

Por exemplo, no Claude Desktop basta seguir o caminho "arquivo -> configurações -> desenvolvedor -> editar Config" e adicionar o servidor como no código abaixo, ajustando o caminho da pasta em que ele foi baixado. É necessário o [bun](https://bun.com/) para rodar o projeto.

````
{ "servers": {
	"Busca-Cep-Server": {
		"type": "stdio",
		"command": "bun",
		"args": [ "run",   "C:/User/MCP/Horarios-do-BSI-UNIRIO-Server/index.ts"]
	}
 },
	"inputs": []
}

````

## Tecnologias Utilizadas 🛠️
* TypeScript
* Bun
* Model Context Protocol (MCP)
* Puppeteer

## Ambiente de Desenvolvimento 🧰

* MCP TypeScript SDK
* Visual Studio Code

