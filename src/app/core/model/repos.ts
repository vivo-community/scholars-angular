import { InjectionToken } from '@angular/core';

import { IndividualRepo } from './discovery/repo/individual.repo';
import { DirectoryViewRepo } from './view/repo/directory-view.repo';
import { DiscoveryViewRepo } from './view/repo/discovery-view.repo';
import { DisplayViewRepo } from './view/repo/display-view.repo';
import { ThemeRepo } from './theme/repo/theme.repo';
import { UserRepo } from './user/repo/user.repo';

// NOTE: the keys must match the property of the Spring Data REST embedded response

export const keys = {
    individual: 'id',
    themes: 'name',
    users: 'email',
    directoryViews: 'name',
    discoveryViews: 'name',
    displayViews: 'name'
};

export const repos = {
    individual: new InjectionToken<string>('IndividualRepo'),
    themes: new InjectionToken<string>('ThemeRepo'),
    users: new InjectionToken<string>('UserRepo'),
    directoryViews: new InjectionToken<string>('DirectoryViewRepo'),
    discoveryViews: new InjectionToken<string>('DiscoveryViewRepo'),
    displayViews: new InjectionToken<string>('DisplayViewRepo')
};

export const injectable = [
    { provide: repos.individual, useExisting: IndividualRepo },
    { provide: repos.themes, useExisting: ThemeRepo },
    { provide: repos.users, useExisting: UserRepo },
    { provide: repos.directoryViews, useExisting: DirectoryViewRepo },
    { provide: repos.discoveryViews, useExisting: DiscoveryViewRepo },
    { provide: repos.displayViews, useExisting: DisplayViewRepo }
];
