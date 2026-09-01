import { useDocumentTitle } from '@shared/hooks/useDocumentTitle';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useState } from 'react';
import {
  RiArrowLeftRightLine,
  RiBookOpenLine,
  RiCodeSSlashLine,
  RiCpuLine,
  RiDatabase2Line,
  RiFolderLine,
  RiGlobalLine,
  RiStackLine,
} from 'react-icons/ri';
import type { DocTopicId, DocTopicItem } from '../types/docs.types';

const DOC_TOPICS: DocTopicItem[] = [
  {
    id: 'mvvm',
    title: '1. MVVM Architecture',
    icon: <RiStackLine className="text-base" />,
    summary: 'Model-View-ViewModel structure and clean separation of concerns in React.',
    content: `
### Model-View-ViewModel (MVVM) in React

- **Model (\`features/<feature>/models/\` & \`types/\`)**: Clean TypeScript interfaces, DTOs, and Zod validation schemas in dedicated type files.
- **ViewModel (\`features/<feature>/viewmodels/\`)**: Custom React hooks (e.g. \`useProductListViewModel\`) encapsulating all UI state, derived computations, handlers, and React Query hooks.
- **View (\`features/<feature>/views/\`)**: Pure presentational JSX components that bind to ViewModel state and trigger action callbacks. No direct API calls or complex logic.
- **Service (\`features/<feature>/services/\`)**: Centralized HTTP client (Axios) methods and endpoint definitions.
    `,
  },
  {
    id: 'folders',
    title: '2. Folder & File Naming',
    icon: <RiFolderLine className="text-base" />,
    summary: 'Strict naming rules across directories, components, models, and hooks.',
    content: `
### File & Directory Casing Standards

- **Folders**: \`kebab-case\` (e.g., \`product-detail\`, \`shared-components\`)
- **Components & Views**: \`PascalCase.tsx\` (e.g., \`ProductCard.tsx\`, \`ProductListPage.tsx\`)
- **ViewModels & Hooks**: \`camelCase.ts\` prefixed with \`use\` (e.g., \`useProductListViewModel.ts\`, \`useDebounce.ts\`)
- **Types**: \`[domain].types.ts\` (e.g., \`product.types.ts\`, \`auth.types.ts\`)
- **Models & Schemas**: \`*.model.ts\`, \`*.schema.ts\`
- **Services & Stores**: \`*.service.ts\`, \`*.store.ts\`
    `,
  },
  {
    id: 'coding-standards',
    title: '3. Coding & Variable Standards',
    icon: <RiCodeSSlashLine className="text-base" />,
    summary: 'Boolean prefixes, event handlers, constants, and immutability.',
    content: `
### Coding Conventions

- **Variables & Functions**: \`camelCase\`
- **Booleans**: Always prefix with \`is\`, \`has\`, \`can\`, \`should\` (e.g., \`isLoading\`, \`hasPermission\`)
- **Event Handlers**:
  - Functions in ViewModel: \`handle[Action]\` (e.g., \`handleSubmit\`, \`handleDeleteProduct\`)
  - Callback props in Components: \`on[Action]\` (e.g., \`onClick\`, \`onSubmitSuccess\`)
- **Constants**: \`UPPER_SNAKE_CASE\`
- **Types & Interfaces**: \`PascalCase\` in dedicated type files (no \`I\` or \`T\` prefixes, no inline types)
    `,
  },
  {
    id: 'imports',
    title: '4. Path Aliases & Imports',
    icon: <RiArrowLeftRightLine className="text-base" />,
    summary: 'Clean path aliases (@/*, @core/*, @shared/*, @features/*) and grouping.',
    content: `
### Configured Path Aliases

- \`@/*\` -> \`src/*\`
- \`@app/*\` -> \`src/app/*\`
- \`@core/*\` -> \`src/core/*\`
- \`@shared/*\` -> \`src/shared/*\`
- \`@features/*\` -> \`src/features/*\`
- \`@assets/*\` -> \`src/assets/*\`

### Import Ordering Groups:
1. Third-party packages (React, Query, Zustand, React Icons)
2. Core infrastructure (\`@core/...\`)
3. Shared modules (\`@shared/...\`)
4. Feature modules (\`@features/...\`)
5. Relative components & styles
    `,
  },
  {
    id: 'state',
    title: '5. State Management Matrix',
    icon: <RiDatabase2Line className="text-base" />,
    summary: 'Dividing state across Server (Query), Global Client (Zustand), URL, and Local.',
    content: `
### State Hierarchy

1. **Server State**: Managed via \`@tanstack/react-query\` (caching, background revalidation, mutations).
2. **Global Client State**: Managed via \`zustand\` (auth tokens, toast notifications, global modal stack).
3. **URL State**: Managed via React Router query params (filters, active tab, page number).
4. **Local State**: Managed via \`useState\` / \`useReducer\` in ViewModels.
    `,
  },
  {
    id: 'api',
    title: '6. API & Error Handling',
    icon: <RiGlobalLine className="text-base" />,
    summary: 'Axios interceptors, unified error normalization, and Zod contracts.',
    content: `
### Centralized API Client

- **Base URL**: Validated via \`@core/config/env\`.
- **Request Interceptors**: Injects Bearer token automatically.
- **Response Interceptors**: Catches 401s, transforms errors into normalized \`StandardApiError\`.
- **Zod Validation**: Validates inputs before sending to network.
    `,
  },
  {
    id: 'performance',
    title: '7. Rendering & Performance',
    icon: <RiCpuLine className="text-base" />,
    summary: 'State colocation, list keys, smart memoization, and lazy loading.',
    content: `
### Key Performance Rules

1. **Colocate State**: Keep state as close as possible to the component tree where it is consumed.
2. **Unique List Keys**: Always use stable IDs (e.g. \`key={product.id}\`), never array index.
3. **Selective Memoization**: Use \`useMemo\` and \`useCallback\` intentionally for expensive work or stable reference dependencies.
4. **Lazy Routes**: Dynamic imports with \`React.lazy\` and \`Suspense\` for optimal initial bundle size.
    `,
  },
];

export default function DocsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t('docs.title'));
  const [activeTopicId, setActiveTopicId] = useState<DocTopicId>(DOC_TOPICS[0].id);
  const activeTopic = DOC_TOPICS.find((t) => t.id === activeTopicId) || DOC_TOPICS[0];

  return (
    <div className="space-y-6 animate-fadeIn font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-zinc-950 text-white">
            <RiBookOpenLine className="text-2xl" />
          </div>
          <span>{t('docs.title')}</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-500 font-mono">{t('docs.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          {DOC_TOPICS.map((topic) => {
            const isActive = topic.id === activeTopicId;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setActiveTopicId(topic.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                  isActive
                    ? 'border-zinc-950 bg-zinc-950 text-white shadow-tactile'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5 font-bold text-xs">
                  <span className={isActive ? 'text-white' : 'text-zinc-500'}>
                    {topic.icon}
                  </span>
                  <span>{topic.title}</span>
                </div>
                <p className={`mt-1 text-xs line-clamp-2 leading-relaxed ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  {topic.summary}
                </p>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <div className="studio-card p-6 sm:p-8 bg-white border border-zinc-200/90 shadow-tactile rounded-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
              <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-900 border border-zinc-200">
                {activeTopic.icon}
              </div>
              <h2 className="text-lg font-bold text-zinc-950">{activeTopic.title}</h2>
            </div>

            <div className="mt-6 prose prose-zinc max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono bg-zinc-50/80 p-5 sm:p-6 rounded-xl border border-zinc-200 text-zinc-800">
              {activeTopic.content.trim()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
