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
    'Tabela_de_materias_BSI',
    {
        title: 'horarios das matérias do curso de Bacharelado de Sistemas de Informação da universidade UNIRIO que estão em curso pelo usuário',
        description: 'ferramenta para auxílio na geração de imagem de tabela dos horarios do curso de BSI das matérias definidas pelo usuário',
        inputSchema: {
        materias: z4.string().array()
        .describe("matérias definidas pelo usuário do curso de BSI"),
    },
    },
    async ({ materias }, extra: RequestHandlerExtra<any, any>) => {
        
       const response = await extra.sendRequest(
        {
          method: "sampling/createMessage",
          params: {
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `por favor crie e salve uma tabela em html com as matérias de Bacharelado de
                  Sistemas de Informação da UNIRIO listadas a seguir: ${materias}.
                  A tabela deve ser construída da seguinte forma: a primeira linha deve ser os dias da semana,
                   e a primeira coluna deve ser os horários das matérias. Deve ser registrado na tabela o nome por extenso das matérias 
                   (exemplo: "técnicas de programação", "Arquitetura de Computadores"),
                    o nome da turma em que ela será ministrada (geralmente o nome simplificado sem vogais, como "ALGPROG", "ARQCOMP"),
                    e a sala em que a aula ocorrerá. A cor das células da primeira linha deve ser azul, e a cor das células com os horários também devem ser azul. 
                    As demais linhas devem alternar entre verde claro e branco. As informações nas células devem ficar na cor preta. 
                    Utilize as informações contidas nesta planilha do horários de BSI convertida em JSON para encontrar as informações sobre as matérias: ${JSON.stringify(horarioBsiJSON)}`,
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
                    text:  response.content.type === 'text' ? response.content.text : 'não foi possível printar a tabela'
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
