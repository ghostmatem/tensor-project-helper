"use strict";
class HTMLWorker {
    static changeCssClass(element, current, target) {
        element.classList.remove(current);
        element.classList.add(target);
    }
    static findElementByParent(element, targetClass, parentClass) {
        targetClass = HTMLWorker.getClassName(targetClass);
        let current = element.parentElement;
        while (current && !current.classList.contains(parentClass)) {
            current = current.parentElement;
        }
        return current === null || current === void 0 ? void 0 : current.querySelector(targetClass);
    }
    static getClassName(classString) {
        classString = classString.trim();
        if (classString[0] != '.')
            return '.' + classString;
        return classString;
    }
}
;
class FormRepository {
    isValidData(data) {
        return data.commitMessage != '' &&
            data.gitLogin != '' &&
            data.ownerName != '' &&
            data.projectName != '';
    }
}
class HTMLFormRepository extends FormRepository {
    constructor(form) {
        super();
        this.form = form;
    }
    readData() {
        if (this.forms == undefined) {
            this.initForms();
        }
        const data = {
            gitLogin: HTMLFormRepository.getValueInputForm(this.forms.login),
            ownerName: HTMLFormRepository.getValueInputForm(this.forms.name),
            commitMessage: HTMLFormRepository.getValueInputForm(this.forms.message),
            projectName: HTMLFormRepository.getValueInputForm(this.forms.project),
        };
        this.lastQueryData = data;
        return this.lastQueryData;
    }
    saveData(data) {
        if (this.forms == undefined || !this.isValidData(data))
            return false;
        this.forms.login.value = data.gitLogin;
        this.forms.name.value = data.ownerName;
        this.forms.message.value = data.commitMessage;
        this.forms.project.value = data.projectName;
        return true;
    }
    initForms() {
        this.forms = {
            login: HTMLFormRepository.getInputFormAtName(this.form, 'login'),
            name: HTMLFormRepository.getInputFormAtName(this.form, 'name'),
            message: HTMLFormRepository.getInputFormAtName(this.form, 'message'),
            project: HTMLFormRepository.getInputFormAtName(this.form, 'project'),
        };
    }
    static getInputFormAtName(parentForm, name) {
        return parentForm.elements.namedItem(name);
    }
    static getValueInputForm(inputForm) {
        return inputForm.value.trim();
    }
}
class HTMLCommandResultRepository {
    constructor(cloneField, pushField, errorMessage) {
        this.cloneField = cloneField;
        this.pushField = pushField;
        this.errorMessage = errorMessage !== null && errorMessage !== void 0 ? errorMessage : 'Команда будет собрана, когда все поля будут заполнены';
    }
    getDataOfForm(formRepository) {
        const data = formRepository.readData();
        const success = formRepository.isValidData(data);
        const result = success ? this.getCommandResult(data) : this.getErrorData();
        return result;
    }
    readData() {
        var _a, _b;
        return {
            clone: (_a = this.cloneField.textContent) === null || _a === void 0 ? void 0 : _a.trim(),
            push: (_b = this.pushField.textContent) === null || _b === void 0 ? void 0 : _b.trim(),
        };
    }
    saveData(data) {
        this.cloneField.textContent = data.clone.trim();
        this.pushField.textContent = data.push.trim();
        return this.isValidData(data);
    }
    getCommandResult(data) {
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
    getErrorData() {
        return {
            clone: this.errorMessage,
            push: this.errorMessage
        };
    }
    isValidData(data) {
        return data.clone != this.errorMessage;
    }
}
function main() {
    const form = document.forms[0];
    const results = document.querySelector('.result-wrapper__body');
    results.addEventListener('click', buttonHandler);
    const pushField = results.querySelector('.result-push');
    const cloneField = results.querySelector('.result-clone');
    const htmlFormRepository = new HTMLFormRepository(form);
    const htmlResultRepository = new HTMLCommandResultRepository(cloneField, pushField);
    updateFields(htmlFormRepository, htmlResultRepository);
    form.addEventListener('change', (ev) => updateFields(htmlFormRepository, htmlResultRepository));
}
function updateFields(formModel, fieldModel) {
    const data = fieldModel.getDataOfForm(formModel);
    const isValid = fieldModel.saveData(data);
}
function buttonHandler(ev) {
    var _a;
    const target = ev.target;
    const buttonClass = 'copy-button';
    const contentClass = 'result-card__text';
    const parentClass = 'result-card';
    if (!(target && target.classList.contains(buttonClass))) {
        return;
    }
    const text = (_a = HTMLWorker.findElementByParent(target, contentClass, parentClass)) === null || _a === void 0 ? void 0 : _a.textContent;
    navigator.clipboard.writeText(text);
    const successButtonClass = buttonClass + '_g';
    HTMLWorker.changeCssClass(target, buttonClass, successButtonClass);
    setTimeout(() => HTMLWorker.changeCssClass(target, successButtonClass, buttonClass), 2000);
}
main();
