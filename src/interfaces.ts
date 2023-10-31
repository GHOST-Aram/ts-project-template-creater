export interface CliOptions{
    projectName: string,
    templateName: string,
    templatePath: string,
    targetPath: string
}

export interface TemplateData{
    projectName: string
}

export interface Question{
    name: string,
    type: string,
    message: string,
    choices?: string[],
}

export interface Answer{
    template: string, 
    name: string
}

 