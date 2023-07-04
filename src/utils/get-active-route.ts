export function getActiveRoute(state) {
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRoute(route.state);
  }

  return {
    name: route.name,
    params: route.params,
  };
}

