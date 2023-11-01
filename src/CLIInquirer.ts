import { Answer, Question } from "./interfaces"
import path from "path"
import { CliOptions } from "./interfaces"
import { CURRENT_DIR } from "./constants"
import inquirer from "inquirer"

export class CLIInquirer{

    public inquire = async(questions: Question[]) =>{
        return await inquirer.prompt(questions)
    }
    public getCLIOptions = (cliArgs: Answer): CliOptions =>{
        const projectCHoice = cliArgs['template']
        const projectName = cliArgs['name']
        const templatePath = path.join(__dirname, 'templates', projectCHoice)
        const targetPath = path.join(CURRENT_DIR, projectName)

        const options: CliOptions = {
            projectName,
            templateName: projectCHoice,
            templatePath,
            targetPath
        }

        return options
    }
}

export const cliInquirer = new CLIInquirer()