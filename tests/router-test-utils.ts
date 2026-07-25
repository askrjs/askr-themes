import {
  createRouteRegistry,
  group as defineGroup,
  route as defineRoute,
  type RouteHandler,
  type RouteOptions,
  type RouteRegistry,
} from "@askrjs/askr/router";

type TestRouteDefinition = {
  path: string;
  handler: RouteHandler;
  options?: RouteOptions;
  groups: Array<Parameters<typeof defineGroup>[0]>;
};

let definitions: TestRouteDefinition[] = [];
let groupStack: Array<Parameters<typeof defineGroup>[0]> = [];

export function resetTestRoutes(): void {
  definitions = [];
  groupStack = [];
}

export function testGroup(
  options: Parameters<typeof defineGroup>[0],
  definition: () => void,
): void {
  groupStack.push(options);
  try {
    definition();
  } finally {
    groupStack.pop();
  }
}

export function testRoute(path: string, handler: RouteHandler, options?: RouteOptions): void {
  definitions.push({ path, handler, options, groups: [...groupStack] });
}

export function createTestRegistry(): RouteRegistry {
  const currentDefinitions = definitions;
  return createRouteRegistry(() => {
    for (const definition of currentDefinitions) {
      const define = (groupIndex: number): void => {
        const group = definition.groups[groupIndex];
        if (group) {
          defineGroup(group, () => define(groupIndex + 1));
          return;
        }
        defineRoute(definition.path, definition.handler, definition.options);
      };
      define(0);
    }
  });
}
