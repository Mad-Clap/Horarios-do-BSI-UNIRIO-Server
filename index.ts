import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/spec.types.js';
import { extrairHorariosBsi } from "./lib";
import z4 from 'zod/v4';
import { CreateMessageResultSchema } from '@modelcontextprotocol/sdk/types.js';
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';



let horarioBsiJSON: Record<string, object> = await extrairHorariosBsi()
    .catch(error => {
        console.error('Server error:', error.cause);
        process.exit(1);
    })
;

// Criando o servidor MCP
const app = new McpServer({
        name: "Horarios do BSI UNIRIO Server",
        version: "1.0.0",
    },
);

app.registerTool(
    'Horarios_BSI',
    {
        title: 'horarios do curso de Bacharelado de Sistemas de Informação da universidade UNIRIO',
        description: 'Planilha convertida em json dos horarios do curso de Bacharelado de Sistemas de Informação da universidade UNIRIO'
    },
    async (): Promise<CallToolResult> => {
        
        return { content: [{ type: "text", text: JSON.stringify(horarioBsiJSON) }] };
    }
);


app.registerTool(
    'Tabela_de_disciplinas_BSI',
    {
        title: 'horarios das disciplinas do curso de Bacharelado de Sistemas de Informação da universidade UNIRIO que estão em curso pelo usuário',
        description: 'ferramenta para auxílio na geração de imagem de tabela dos horarios do curso de BSI das disciplinas definidas pelo usuário',
        inputSchema: {
        disciplinas: z4.string().array()
        .describe("disciplinas definidas pelo usuário do curso de BSI"),
    },
    },
    async ({ disciplinas }, extra: RequestHandlerExtra<any, any>) => {
        
       const response = await extra.sendRequest(
        {
          method: "sampling/createMessage",
          params: {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text:
                `
                por favor crie uma tabela em html com as disciplinas de Bacharelado de Sistemas de Informação da UNIRIO listadas a seguir: ${disciplinas}.
                 A tabela deve ser construída da seguinte forma: a primeira linha deve ser os dias da semana
                 (de segunda a sexta, escrito por extenso "Segunda", "Terça", "Quarta", "Quinta", "Sexta", e "Sábado" apenas se houver disciplina no Sábado),
                 e a primeira coluna deve ser os horários em que as disciplinas ocorrerão (o nome da coluna deve ser "Horário"); os horários devem ser exibidos do mais cedo ao mais tarde
                 (a segunda linha deve conter o horário de aulas mais cedo possível, a terceira linha deve conter o horário de aulas mais cedo possível 
                 após o horário da segunda linha e assim por diante). Deve ser registrado na tabela o nome por extenso das disciplinas
                 (exemplo: "técnicas de programação", "Arquitetura de Computadores"), com o texto na cor hexadecimal #7c7715 e em negrito (font-weight: bold),
                 o nome da turma em que ela será ministrada (geralmente o nome simplificado sem vogais, como "ALGPROG", "ARQCOMP"),
                 também com o texto na cor hexadecimal #7c7715 e com tamanho de fonte (font-size) de de 1.1em,
                 e a sala em que a aula ocorrerá com o texto na cor hexadecimal #4b4b4b e com tamanho de fonte (font-size) de 1.2em.
                 O texto nas células deve ser centralizado (text-align: center e vertical-align: middle;)
                 A cor das células da primeira linha e das células com os horários devem ser na cor hexadecimal #0066cc (azul) e com a cor do texto em branco (white). 
                 As demais linhas devem alternar entre a cor hexadecimal #e8f5e9 (verde claro) e branco (white).
                 Utilize as informações contidas nesta planilha do horários de BSI convertida em JSON para encontrar as informações sobre as disciplinas: ${JSON.stringify(horarioBsiJSON)}
                 Observações: Caso haja mais de uma disciplina no mesmo horário, divida a célula na linha em duas e coloque as duas disciplinas na mesma linha. 
                 Não gere uma linha com um horário mais cedo que o da linha  anterior.

                 `,
                },
              },
            ],
            maxTokens: 200
          },
        },
        CreateMessageResultSchema
      );

        return {
            content: [
                {
                    type: 'text',
                    text:  response.content.type === 'text' ? response.content.text : 'não foi possível criar a tabela'
                }
            ]
        };
    }
);


//inicializando o servidor MCP
async function main() {
    const transport = new StdioServerTransport();
    await app.connect(transport);
}

main().catch(error => {
    console.error('Server error:', error);
    process.exit(1);
});
