import { View, CollectionView, DisplayView } from '../../core/model/view';

import { compileTemplate, getTemplateFunction, getParsedTemplateFunction, initializeTemplateHelpers } from 'scholars-embed-utilities';

const getParsedResourceViewTemplateFunction = (template: string, additionalContext: any) => {
    compileTemplate(template);
    return (resource: any) => {
        resource.collection = 'individuals';
        const templateFunction = getTemplateFunction(template, additionalContext);
        return templateFunction(resource);
    };
};

const augmentCollectionViewTemplates = (view: CollectionView, additionalContext: any) => {
    view.templateFunctions = {};
    for (const k in view.templates) {
        if (view.templates.hasOwnProperty(k)) {
            view.templateFunctions[k] = getParsedResourceViewTemplateFunction(view.templates[k], additionalContext);
        }
    }
};

const augmentDisplayViewTemplates = (view: DisplayView, additionalContext: any) => {
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
