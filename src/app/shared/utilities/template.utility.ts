import { ResourceView, CollectionView, DisplayView } from '../../core/model/view';

import { compileTemplate, getTemplateFunction, getParsedTemplateFunction, initializeTemplateHelpers } from 'scholars-embed-utilities';

import { environment } from '../../../environments/environment';

const additionalContext = {
    vivoUrl: environment.vivoUrl,
    serviceUrl: environment.serviceUrl
};

const getParsedResourceViewTemplateFunction = (view: ResourceView, template: string) => {
    compileTemplate(template);
    return (resource: any) => {
        resource.collection = view.collection;
        const templateFunction = getTemplateFunction(template, additionalContext);
        return templateFunction(resource);
    };
};

const augmentCollectionViewTemplates = (view: CollectionView) => {
    view.templateFunctions = {};
    for (const k in view.templates) {
        if (view.templates.hasOwnProperty(k)) {
            view.templateFunctions[k] = getParsedResourceViewTemplateFunction(view, view.templates[k]);
        }
    }
};

const augmentDisplayViewTemplates = (view: DisplayView) => {
    view.mainContentTemplateFunction = getParsedTemplateFunction(view.mainContentTemplate, additionalContext);
    view.leftScanTemplateFunction = getParsedTemplateFunction(view.leftScanTemplate, additionalContext);
    view.rightScanTemplateFunction = getParsedTemplateFunction(view.rightScanTemplate, additionalContext);
    view.asideTemplateFunction = getParsedTemplateFunction(view.asideTemplate, additionalContext);
    view.tabs.forEach(tab => {
        tab.sections.forEach(section => {
            section.templateFunction = getParsedTemplateFunction(section.template, additionalContext);
            section.subsections.forEach(subsection => {
                subsection.templateFunction = getParsedTemplateFunction(subsection.template, additionalContext);
            });
        });
    });
    view.metaTemplateFunctions = {};
    for (const k in view.metaTemplates) {
        if (view.metaTemplates.hasOwnProperty(k)) {
            view.metaTemplateFunctions[k] = getParsedTemplateFunction(view.metaTemplates[k], additionalContext);
        }
    }
};

export {
    augmentCollectionViewTemplates,
    augmentDisplayViewTemplates,
    initializeTemplateHelpers
};
