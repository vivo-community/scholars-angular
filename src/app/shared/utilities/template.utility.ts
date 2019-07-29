import { ResourceView, CollectionView, DisplayView } from '../../core/model/view';

import { compileTemplate, getTemplateFunction, getParsedTemplateFunction, initializeTemplateHelpers } from 'scholars-embed-utilities';

const getParsedResourceViewTemplateFunction = (view: ResourceView, template: string) => {
    compileTemplate(template);
    return (resource: any) => {
        resource.collection = view.collection;
        const templateFunction = getTemplateFunction(template);
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
    view.mainContentTemplateFunction = getParsedTemplateFunction(view.mainContentTemplate);
    view.leftScanTemplateFunction = getParsedTemplateFunction(view.leftScanTemplate);
    view.rightScanTemplateFunction = getParsedTemplateFunction(view.rightScanTemplate);
    view.asideTemplateFunction = getParsedTemplateFunction(view.asideTemplate);
    view.tabs.forEach(tab => {
        tab.sections.forEach(section => {
            section.templateFunction = getParsedTemplateFunction(section.template);
            section.subsections.forEach(subsection => {
                subsection.templateFunction = getParsedTemplateFunction(subsection.template);
            });
        });
    });
    view.metaTemplateFunctions = {};
    for (const k in view.metaTemplates) {
        if (view.metaTemplates.hasOwnProperty(k)) {
            view.metaTemplateFunctions[k] = getParsedTemplateFunction(view.metaTemplates[k]);
        }
    }
};

export {
    augmentCollectionViewTemplates,
    augmentDisplayViewTemplates,
    initializeTemplateHelpers
};
