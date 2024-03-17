export const upgradeScripts = [
  function (_context, props) {
    console.log('up-props-111');
    console.log(props);
    let result = {
      updatedConfig: null,
      updatedActions: [],
      updatedFeedbacks: [],
    };
    if (props.config) {
      result.updatedConfig = props.config;
      if (props.config.modelID && !props.config.modelId) {
        result.updatedConfig.modelId = props.config.modelID;
      }
      if (!props.config.presetType) {
        result.updatedConfig.presetType = 'pvw';
      }
    }
    for (const action of props.actions) {
      switch (action.actionId) {
        case 'change_black':
          action.actionId = 'ftb';
          action.options = { ftb: '1' };
          result.updatedActions.push(action);
          break;
        case 'change_freeze':
          action.actionId = 'freeze';
          action.options = { freeze: '1' };
          result.updatedActions.push(action);
          break;
        case 'load_preset':
          action.actionId = 'preset';
          action.options = { preset: '1' };
          result.updatedActions.push(action);
          break;
      }
    }
    return result;
  },
];
