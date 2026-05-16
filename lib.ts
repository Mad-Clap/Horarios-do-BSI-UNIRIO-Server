import puppeteer from 'puppeteer-core'
import * as xlsx from 'xlsx';
import os from 'node:os'
import path from 'node:path';

export async function extrairHorariosBsi(): Promise<Record<string, object>> {
    
    const horarioBsi: Bun.BunFile = await baixarPlanilhaBSI();

    let workbook = xlsx.readFile(horarioBsi.name!)
    let horariosJson: Record<string, object> = {};
    
    workbook.SheetNames.forEach(name => {
    
        let rangeNumber: number = name.includes("Grade")? 2 : 1;
        let aux = xlsx.utils.sheet_to_json(workbook.Sheets[name]!, {range : rangeNumber });
        horariosJson[name] = aux
    })

    return horariosJson;
}


async function baixarPlanilhaBSI(): Promise<Bun.BunFile>{

    const user = os.homedir();
    const pathPlanilhaBsi = path.join(user, 'Horarios-BSI.xlsx')
    let planilhaBsi = Bun.file(pathPlanilhaBsi,
        {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})

    try {
        const browser = await puppeteer.launch({channel:'chrome'});
        const page = await browser.newPage();

        await page.goto('https://bsi.uniriotec.br/horarios-curriculo-novo/')

        const iframeSelector = 'iframe.iframe-class[src*="://docs.google.com/spreadsheets"]';
        const iframeSrc: string = await page.$eval(iframeSelector, el => el.src);
        let spreadsheetId: string = iframeSrc.match("d\/.+\/")![0];

        const downloadUrl = `https://docs.google.com/spreadsheets/${spreadsheetId}export?format=xlsx`;
        const response = await fetch(downloadUrl);

        await Bun.write(planilhaBsi, response);

        browser.close();

        
    } catch (error) {

        let fileExist: Boolean  = await planilhaBsi.exists();
        if(!fileExist){
            console.error(planilhaBsi)
            throw new Error(
                "impossível acessar planilha com horários do BSI", 
                {cause: "Não foi possível acessar o site de BSI para extrair a planilha atualizada, e não há uma versão salva no servidor"}
            );
        } 
            
    }

    return planilhaBsi;
}
