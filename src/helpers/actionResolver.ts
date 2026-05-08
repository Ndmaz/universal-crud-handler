//
export function resolveHandlerFunction(
  module: any,
  action: string,
  model: string
) {
  //the action gets capitalized   
  const capitalized =
    action.charAt(0).toUpperCase() + action.slice(1);
//the module gets capitalized
  const modelCapitalized =
    model.charAt(0).toUpperCase() + model.slice(1);
//returns module 
  return (
    module[action] ||
    module[`${action}${modelCapitalized}`] ||
    module[`${capitalized}${modelCapitalized}`]
  );
}
