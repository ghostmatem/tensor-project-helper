class HTMLWorker {
    public static changeCssClass(element: HTMLElement, current: string, target: string) {
        element.classList.remove(current);
        element.classList.add(target);
    }

    public static findElementByParent(element: HTMLElement, targetClass: string, parentClass: string) {
        targetClass = HTMLWorker.getClassName(targetClass);
        
        let current: HTMLElement | null = element.parentElement;
        while(current && !current.classList.contains(parentClass)) {
            current = current.parentElement;
        }
        return current?.querySelector(targetClass);
    }

    private static getClassName(classString: string) {
        classString = classString.trim();
        if (classString[0] != '.') return '.' + classString;
        return classString;
    }
}

interface IFormData {
    gitLogin: string;
    ownerName: string;
    commitMessage: string;
    projectName: string;
}

interface IFormModel {
    readData() : IFormData;
    saveData(data: IFormData): boolean;
    isValidData(data: IFormData) : boolean;
}

interface IFormInputCollection { 
    login: HTMLInputElement;
    name: HTMLInputElement;
    message: HTMLInputElement;
    project: HTMLInputElement;
};

abstract class FormRepository implements IFormModel {

    public abstract readData(): IFormData;
    public abstract saveData(data: IFormData): boolean;

    public isValidData(data: IFormData) : boolean {
        return data.commitMessage != '' && 
            data.gitLogin != '' && 
            data.ownerName != '' && 
            data.projectName!= '';
    }
}

class HTMLFormRepository extends FormRepository {
    constructor(form: HTMLFormElement) {
        super();
        this.form = form;        
    }

    public lastQueryData?: IFormData;

    public readData(): IFormData {
        if (this.forms == undefined) {
            this.initForms();
        }
        const data: IFormData =  {
            gitLogin: HTMLFormRepository.getValueInputForm(this.forms!.login),
            ownerName: HTMLFormRepository.getValueInputForm(this.forms!.name),
            commitMessage: HTMLFormRepository.getValueInputForm(this.forms!.message),
            projectName: HTMLFormRepository.getValueInputForm(this.forms!.project),
        }
        this.lastQueryData = data;
        return this.lastQueryData;
    }

    public saveData(data: IFormData): boolean {
        if (this.forms == undefined || !this.isValidData(data)) return false;

        this.forms!.login.value = data.gitLogin;
        this.forms!.name.value = data.ownerName;
        this.forms!.message.value = data.commitMessage;
        this.forms!.project.value = data.projectName;

        return true;
    }  

    private form: HTMLFormElement;
    private forms?: IFormInputCollection; 
    
    private initForms() {
        this.forms = {
            login: HTMLFormRepository.getInputFormAtName(this.form, 'login'),
            name: HTMLFormRepository.getInputFormAtName(this.form, 'name'),
            message: HTMLFormRepository.getInputFormAtName(this.form, 'message'),
            project: HTMLFormRepository.getInputFormAtName(this.form, 'project'),
        };
    }    

    private static getInputFormAtName(parentForm: HTMLFormElement, name: string) : HTMLInputElement {
        return (parentForm.elements.namedItem(name) as HTMLInputElement);
    }

    private static getValueInputForm(inputForm: HTMLInputElement) {
        return inputForm.value.trim();
    }
}

interface ICommandResult {
    clone: string;
    push: string;
}

interface ICommandResultModel {
    readData() : ICommandResult;
    saveData(data: ICommandResult) : boolean;
    getDataOfForm(formRepository: IFormModel) : ICommandResult;
}

class HTMLCommandResultRepository implements ICommandResultModel {
    constructor(cloneField: HTMLElement, pushField: HTMLElement, errorMessage? : string) {
        this.cloneField = cloneField;
        this.pushField = pushField;
        this.errorMessage = errorMessage ?? 'Команда будет собрана, когда все поля будут заполнены';
    }

    public getDataOfForm(formRepository: IFormModel): ICommandResult {
        const data = formRepository.readData();
        const success = formRepository.isValidData(data);
        const result = success ? this.getCommandResult(data) : this.getErrorData();
        return result;
    }

    public readData(): ICommandResult {
        return {
            clone: this.cloneField.textContent?.trim()!,
            push: this.pushField.textContent?.trim()!,
        }
    }

    public saveData(data: ICommandResult): boolean {
        this.cloneField.textContent = data.clone.trim();
        this.pushField.textContent = data.push.trim();
        return this.isValidData(data);
    }

    private cloneField: HTMLElement;
    private pushField: HTMLElement;
    private errorMessage: string;

    private getCommandResult(data: IFormData) : ICommandResult {
        const branchName = `${data.ownerName}/${data.projectName}`;
        const gitRepository = `https://github.com/${data.gitLogin}/${data.projectName}.git`;
    
        const clone = `cls & git clone ${gitRepository} & cd ${data.projectName} & ` +
            `git checkout -b ${branchName} & npm install`;
    
        const push = `cls & git add . & git commit -m "${data.commitMessage}" ` + 
            `& git push --set-upstream origin ${branchName} & ` +
            `start ${gitRepository} & cd ..`;
    
        return {
            clone: clone,
            push: push
        };
    }

    private getErrorData() : ICommandResult {
        return {
            clone: this.errorMessage,
            push: this.errorMessage
        };
    }

    private isValidData(data: ICommandResult) {
        return data.clone != this.errorMessage;
    }
}

function main() {
    const form = document.forms[0];
    const results = document.querySelector('.result-wrapper__body') as HTMLElement;

    results!.addEventListener('click', buttonHandler);    

    const pushField = results.querySelector('.result-push') as HTMLElement;
    const cloneField = results.querySelector('.result-clone') as HTMLElement;

    const htmlFormRepository: IFormModel = new HTMLFormRepository(form);
    const htmlResultRepository: ICommandResultModel = new HTMLCommandResultRepository(cloneField, pushField); 
    updateFields(htmlFormRepository, htmlResultRepository);

    form!.addEventListener('change', (ev) => updateFields(htmlFormRepository, htmlResultRepository));
}

function updateFields(formModel: IFormModel, fieldModel: ICommandResultModel) {
    const data = fieldModel.getDataOfForm(formModel);
    const isValid = fieldModel.saveData(data);
}

function buttonHandler(ev: Event) {
    const target = ev.target as HTMLElement;
    const buttonClass = 'copy-button';
    const contentClass = 'result-card__text';
    const parentClass = 'result-card';

    if (!(target && target.classList.contains(buttonClass))) {
        return;
    }

    const text = HTMLWorker.findElementByParent(target, contentClass, parentClass)?.textContent;
    navigator.clipboard.writeText(text as string);

    const successButtonClass = buttonClass + '_g';

    HTMLWorker.changeCssClass(target, buttonClass, successButtonClass);
    setTimeout(() => HTMLWorker.changeCssClass(target, successButtonClass, buttonClass), 2000);
}


main();